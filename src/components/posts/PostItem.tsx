import { useState } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Heart, Share2, Bookmark, ThumbsUp, MoreHorizontal, Edit, Trash2, User, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth, firestore, database } from "@/lib/firebase";
import { doc, updateDoc, increment, arrayUnion, arrayRemove, deleteDoc, getDoc, collection, addDoc, serverTimestamp, query, where, orderBy, getDocs } from "firebase/firestore";
import { ref as dbRef, push } from "firebase/database";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import MediaComingSoon from "./MediaComingSoon";

interface PostItemProps {
  post: {
    id: string;
    userId: string;
    content: string;
    imageUrl?: string;
    createdAt: any;
    likes: number;
    comments: number;
    shares: number;
    likedBy?: string[];
    author?: {
      displayName: string;
      headline?: string;
      photoURL?: string;
    };
  };
  refreshPosts?: () => void;
}

interface Comment {
  id: string;
  content: string;
  userId: string;
  displayName: string;
  photoURL?: string;
  createdAt: any;
}

const PostItem = ({ post, refreshPosts }: PostItemProps) => {
  const [isLiked, setIsLiked] = useState(
    post.likedBy?.includes(auth.currentUser?.uid || "") || false
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const { toast } = useToast();

  const isAuthor = auth.currentUser?.uid === post.userId;

  const handleLike = async () => {
    if (!auth.currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const postRef = doc(firestore, "posts", post.id);
      const userId = auth.currentUser.uid;
      
      if (isLiked) {
        // Unlike
        await updateDoc(postRef, {
          likes: increment(-1),
          likedBy: arrayRemove(userId)
        });
        setIsLiked(false);
      } else {
        // Like
        await updateDoc(postRef, {
          likes: increment(1),
          likedBy: arrayUnion(userId)
        });
        setIsLiked(true);
        
        // Add notification if not your own post
        if (post.userId !== userId) {
          // Store notification in realtime database
          const notifRef = dbRef(database, `notifications/${post.userId}`);
          await push(notifRef, {
            type: "like",
            postId: post.id,
            from: userId,
            fromName: auth.currentUser.displayName,
            fromPhoto: auth.currentUser.photoURL,
            message: "liked your post",
            isRead: false,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      if (refreshPosts) refreshPosts();
    } catch (error) {
      console.error("Error updating like:", error);
      toast({
        title: "Action failed",
        description: "We couldn't process your like at this time",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const saveEdit = async () => {
    if (!auth.currentUser || !isAuthor) return;
    if (!editedContent.trim()) {
      toast({
        title: "Cannot save empty post",
        description: "Please enter some content",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const postRef = doc(firestore, "posts", post.id);
      
      await updateDoc(postRef, {
        content: editedContent.trim(),
        updatedAt: new Date()
      });
      
      toast({
        title: "Post updated",
        description: "Your changes have been saved",
      });
      
      setIsEditing(false);
      
      if (refreshPosts) refreshPosts();
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Update failed",
        description: "We couldn't save your changes",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!auth.currentUser || !isAuthor) return;
    
    setIsProcessing(true);
    
    try {
      await deleteDoc(doc(firestore, "posts", post.id));
      
      toast({
        title: "Post deleted",
        description: "Your post has been removed",
      });
      
      if (refreshPosts) refreshPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Delete failed",
        description: "We couldn't delete your post",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleComment = async () => {
    if (!showComments) {
      setShowComments(true);
      fetchComments();
    } else {
      setShowComments(false);
    }
  };

  const fetchComments = async () => {
    if (!auth.currentUser) return;
    
    setLoadingComments(true);
    
    try {
      const commentsQuery = query(
        collection(firestore, "comments"),
        where("postId", "==", post.id),
        orderBy("createdAt", "desc")
      );
      
      const commentsSnapshot = await getDocs(commentsQuery);
      
      if (commentsSnapshot.empty) {
        setComments([]);
        setLoadingComments(false);
        return;
      }
      
      const fetchedComments: Comment[] = await Promise.all(
        commentsSnapshot.docs.map(async (commentDoc) => {
          const commentData = commentDoc.data();
          
          // Try to get user data
          let displayName = "User";
          let photoURL = undefined;
          
          try {
            const userDoc = await getDoc(doc(firestore, "users", commentData.userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              displayName = userData.displayName || "User";
              photoURL = userData.photoURL || undefined;
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
          
          return {
            id: commentDoc.id,
            content: commentData.content,
            userId: commentData.userId,
            displayName,
            photoURL,
            createdAt: commentData.createdAt
          };
        })
      );
      
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setLoadingComments(false);
    }
  };

  const submitComment = async () => {
    if (!auth.currentUser || !commentText.trim()) return;
    
    try {
      const commentData = {
        postId: post.id,
        userId: auth.currentUser.uid,
        content: commentText.trim(),
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(firestore, "comments"), commentData);
      
      // Increment comments count on post
      const postRef = doc(firestore, "posts", post.id);
      await updateDoc(postRef, {
        comments: increment(1)
      });
      
      // Add notification if not your own post
      if (post.userId !== auth.currentUser.uid) {
        // Store notification in realtime database
        const notifRef = dbRef(database, `notifications/${post.userId}`);
        await push(notifRef, {
          type: "comment",
          postId: post.id,
          from: auth.currentUser.uid,
          fromName: auth.currentUser.displayName,
          fromPhoto: auth.currentUser.photoURL,
          message: "commented on your post",
          isRead: false,
          timestamp: new Date().toISOString()
        });
      }
      
      setCommentText("");
      fetchComments(); // Refresh comments
      
      if (refreshPosts) refreshPosts();
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: "Failed to submit your comment",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      if (!navigator.share) {
        // Fallback if Web Share API is not available
        toast({
          title: "Share feature",
          description: "Copy the URL to share this post",
        });
        return;
      }
      
      await navigator.share({
        title: `Post by ${post.author?.displayName || "User"}`,
        text: post.content.substring(0, 100) + (post.content.length > 100 ? "..." : ""),
        url: window.location.href
      });
      
      // Update share count
      const postRef = doc(firestore, "posts", post.id);
      await updateDoc(postRef, {
        shares: increment(1)
      });
      
      if (refreshPosts) refreshPosts();
    } catch (error) {
      console.error("Error sharing post:", error);
      // User likely cancelled sharing, so no need for error toast
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save posts",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Add to saved posts in realtime database
      const savedPostRef = dbRef(database, `users/${auth.currentUser.uid}/savedPosts`);
      await push(savedPostRef, {
        postId: post.id,
        savedAt: new Date().toISOString()
      });
      
      toast({
        title: "Post saved",
        description: "This post has been added to your saved items",
      });
    } catch (error) {
      console.error("Error saving post:", error);
      toast({
        title: "Save failed",
        description: "We couldn't save this post",
        variant: "destructive",
      });
    }
  };

  const timeAgo = post.createdAt ? 
    formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 
    "recently";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Link to={`/profile/${post.userId}`}>
            <div className="w-10 h-10 rounded-full bg-sigma-purple/20 flex items-center justify-center text-sigma-purple font-bold">
              {post.author?.photoURL ? (
                <img src={post.author.photoURL} alt={post.author.displayName} className="w-full h-full rounded-full object-cover" />
              ) : (
                post.author?.displayName?.charAt(0) || "U"
              )}
            </div>
          </Link>
          <div>
            <Link to={`/profile/${post.userId}`} className="hover:underline">
              <p className="font-medium">{post.author?.displayName || "User"}</p>
            </Link>
            <p className="text-sm text-muted-foreground">
              {post.author?.headline || ""} • {timeAgo}
            </p>
          </div>
        </div>
        
        {isAuthor && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setDeleteConfirmOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isEditing ? (
        <div className="mb-4">
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full resize-none mb-3"
            rows={5}
          />
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setIsEditing(false);
                setEditedContent(post.content);
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={saveEdit}
              disabled={isProcessing}
              className="bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white"
            >
              {isProcessing ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <p className="whitespace-pre-line">{post.content}</p>
          
          {/* Display "Coming Soon" for media content instead of the actual media */}
          {post.imageUrl && (
            <div className="mt-3">
              <MediaComingSoon type={post.imageUrl.includes('.mp4') ? 'video' : 'image'} />
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between text-sm text-muted-foreground pb-3 border-b">
        <span>{post.likes} likes</span>
        <span>
          {post.comments} comments • {post.shares} shares
        </span>
      </div>

      <div className="flex justify-between pt-3">
        <Button 
          variant="ghost" 
          className="flex items-center space-x-1 text-sm" 
          onClick={handleLike}
        >
          {isLiked ? (
            <Heart className="w-5 h-5 fill-red-500 text-red-500" />
          ) : (
            <Heart className="w-5 h-5" />
          )}
          <span>Like</span>
        </Button>

        <Button 
          variant="ghost" 
          className="flex items-center space-x-1 text-sm"
          onClick={handleComment}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Comment</span>
        </Button>

        <Button 
          variant="ghost" 
          className="flex items-center space-x-1 text-sm"
          onClick={handleShare}
        >
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </Button>

        <Button 
          variant="ghost" 
          className="flex items-center space-x-1 text-sm"
          onClick={handleSave}
        >
          <Bookmark className="w-5 h-5" />
          <span>Save</span>
        </Button>
      </div>
      
      {/* Comments section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t">
          {/* Comment input */}
          <div className="flex items-start space-x-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-sigma-blue/20 flex-shrink-0 flex items-center justify-center text-xs font-medium text-sigma-blue">
              {auth.currentUser?.photoURL ? (
                <img src={auth.currentUser.photoURL} alt={auth.currentUser.displayName || ""} className="w-full h-full rounded-full object-cover" />
              ) : (
                auth.currentUser?.displayName?.charAt(0) || "U"
              )}
            </div>
            <div className="flex-1 flex items-end">
              <Textarea
                placeholder="Write a comment..."
                className="w-full resize-none rounded-2xl text-sm min-h-[40px] py-2"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={1}
              />
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={submitComment} 
                disabled={!commentText.trim()}
                className="ml-2"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Comments list */}
          {loadingComments ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-sigma-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading comments...</p>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-2">
                  <Link to={`/profile/${comment.userId}`} className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-sigma-purple/20 flex items-center justify-center text-xs font-medium text-sigma-purple">
                      {comment.photoURL ? (
                        <img src={comment.photoURL} alt={comment.displayName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                  </Link>
                  <div className="flex-1">
                    <div className="bg-secondary/30 dark:bg-secondary/20 rounded-lg py-2 px-3">
                      <Link to={`/profile/${comment.userId}`} className="font-medium text-sm hover:underline">
                        {comment.displayName}
                      </Link>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {comment.createdAt ? 
                        formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : 
                        "just now"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No comments yet. Be the first to comment.</p>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTitle>Are you sure?</AlertTitle>
            <AlertDescription>
              This action cannot be undone. This will permanently delete your post.
            </AlertDescription>
          </Alert>
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={isProcessing}
            >
              {isProcessing ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default PostItem;
