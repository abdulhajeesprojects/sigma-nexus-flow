import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Heart, Share2, Bookmark, ThumbsUp, MoreHorizontal, Edit, Trash2, User, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth, firestore, database } from "@/lib/firebase";
import { doc, updateDoc, increment, arrayUnion, arrayRemove, deleteDoc, getDoc, collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, writeBatch } from "firebase/firestore";
import { ref as dbRef, push } from "firebase/database";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarForUser } from '@/services/avatars';
import { cacheService, CacheService } from "@/services/cache";
import debounce from "lodash/debounce";

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

const CACHE_KEYS = {
  POST_LIKES: (postId: string) => `post_likes_${postId}`,
  POST_COMMENTS: (postId: string) => `post_comments_${postId}`,
};

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

  const isAuthor = auth.currentUser?.uid === post.userId;

  // Toast notifications in handleLike
  const debouncedLike = useCallback(
    debounce(async (userId: string) => {
      try {
        const postRef = doc(firestore, "posts", post.id);
        const batch = writeBatch(firestore);
        
        if (isLiked) {
          batch.update(postRef, {
            likes: increment(-1),
            likedBy: arrayRemove(userId)
          });
        } else {
          batch.update(postRef, {
            likes: increment(1),
            likedBy: arrayUnion(userId)
          });
          
          // Add notification if not your own post
          if (post.userId !== userId) {
            const notifRef = dbRef(database, `notifications/${post.userId}`);
            await push(notifRef, {
              type: "like",
              postId: post.id,
              from: userId,
              fromName: auth.currentUser?.displayName,
              fromPhoto: auth.currentUser?.photoURL,
              message: "liked your post",
              isRead: false,
              timestamp: new Date().toISOString()
            });
          }
        }
        
        await batch.commit();
        
        // Update cache
        const cachedLikes = cacheService.get<string[]>(CacheService.keys.postLikes(post.id)) || [];
        if (isLiked) {
          cacheService.set(CacheService.keys.postLikes(post.id), cachedLikes.filter(id => id !== userId));
        } else {
          cacheService.set(CacheService.keys.postLikes(post.id), [...cachedLikes, userId]);
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
    }, 300),
    [post.id, isLiked]
  );

  // Toast notifications in debouncedComment
  const debouncedComment = useCallback(
    debounce(async (content: string) => {
      if (!auth.currentUser || !content.trim()) return;
      
      try {
        const batch = writeBatch(firestore);
        
        // Add comment
        const commentRef = doc(collection(firestore, "comments"));
        batch.set(commentRef, {
          postId: post.id,
          userId: auth.currentUser.uid,
          content: content.trim(),
          createdAt: serverTimestamp()
        });
        
        // Update post comment count
        const postRef = doc(firestore, "posts", post.id);
        batch.update(postRef, {
          comments: increment(1)
        });
        
        await batch.commit();
        
        // Add notification if not your own post
        if (post.userId !== auth.currentUser.uid) {
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
        
        // Update cached comments
        const newComment: Comment = {
          id: commentRef.id,
          content: content.trim(),
          userId: auth.currentUser.uid,
          displayName: auth.currentUser.displayName || "User",
          photoURL: auth.currentUser.photoURL || undefined,
          createdAt: new Date()
        };
        
        const cachedComments = cacheService.get<Comment[]>(CacheService.keys.postComments(post.id)) || [];
        const updatedComments = [newComment, ...cachedComments];
        cacheService.set(CacheService.keys.postComments(post.id), updatedComments);
        
        setComments(updatedComments);
        setCommentText("");
        
        if (refreshPosts) refreshPosts();
        
        toast({
          title: "Comment added",
          description: "Your comment has been posted successfully",
        });
      } catch (error) {
        console.error("Error submitting comment:", error);
        toast({
          title: "Error",
          description: "Failed to submit your comment",
          variant: "destructive",
        });
      }
    }, 300),
    [post.id]
  );

  // ... keep existing code (useEffect hooks)
  useEffect(() => {
    const cachedLikes = cacheService.get<string[]>(CacheService.keys.postLikes(post.id));
    if (cachedLikes) {
      setIsLiked(cachedLikes.includes(auth.currentUser?.uid || ""));
    }
  }, [post.id]);

  useEffect(() => {
    if (showComments) {
      const cachedComments = cacheService.get<Comment[]>(CacheService.keys.postComments(post.id));
      if (cachedComments) {
        setComments(cachedComments);
        setLoadingComments(false);
      } else {
        fetchComments();
      }
    }
  }, [showComments, post.id]);

  const handleLike = () => {
    if (!auth.currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts",
        variant: "destructive",
      });
      return;
    }
    
    setIsLiked(!isLiked);
    debouncedLike(auth.currentUser.uid);
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
      // Cache comments
      cacheService.set(CACHE_KEYS.POST_COMMENTS(post.id), fetchedComments);
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

  const submitComment = () => {
    if (!auth.currentUser || !commentText.trim()) return;
    debouncedComment(commentText);
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
      className="glass-card w-full p-2 sm:p-6 text-left"
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link to={`/profile/${post.userId}`}>
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
              <AvatarImage src={getAvatarForUser(post.userId, 'professional', 'male')} alt={post.author?.displayName || "User"} />
              <AvatarFallback>{post.author?.displayName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="text-left">
            <Link to={`/profile/${post.userId}`} className="hover:underline">
              <p className="font-medium text-sm sm:text-base">{post.author?.displayName || "User"}</p>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {post.author?.headline || ""} • {timeAgo}
            </p>
          </div>
        </div>
        
        {isAuthor && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
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
        <div className="mb-3 sm:mb-4 text-left">
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full resize-none mb-2 sm:mb-3"
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
        <div className="mb-3 sm:mb-4 text-left">
          <p className="whitespace-pre-line text-sm sm:text-base">{post.content}</p>
          
          {/* Display "Coming Soon" for media content instead of the actual media */}
          {post.imageUrl && (
            <div className="mt-2 sm:mt-3">
              <MediaComingSoon type={post.imageUrl.includes('.mp4') ? 'video' : 'image'} />
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between text-xs sm:text-sm text-muted-foreground pb-2 sm:pb-3 border-b">
        <span>{post.likes} likes</span>
        <span>
          {post.comments} comments • {post.shares} shares
        </span>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap justify-between pt-2 sm:pt-3 gap-2 sm:gap-0">
        <Button 
          variant="ghost" 
          className="flex-1 min-w-[70px] flex items-center justify-center space-x-1 text-xs sm:text-sm" 
          onClick={handleLike}
        >
          {isLiked ? (
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-red-500 text-red-500" />
          ) : (
            <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
          <span>Like</span>
        </Button>
        <Button 
          variant="ghost" 
          className="flex-1 min-w-[70px] flex items-center justify-center space-x-1 text-xs sm:text-sm"
          onClick={handleComment}
        >
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Comment</span>
        </Button>
        <Button 
          variant="ghost" 
          className="flex-1 min-w-[70px] flex items-center justify-center space-x-1 text-xs sm:text-sm"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Share</span>
        </Button>
        <Button 
          variant="ghost" 
          className="flex-1 min-w-[70px] flex items-center justify-center space-x-1 text-xs sm:text-sm"
          onClick={handleSave}
        >
          <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Save</span>
        </Button>
      </div>
      
      {/* Comments section */}
      {showComments && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t text-left">
          {/* Comment input */}
          <div className="flex items-start space-x-2 mb-3 sm:mb-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-sigma-blue/20 flex-shrink-0 flex items-center justify-center text-xs font-medium text-sigma-blue">
              {auth.currentUser?.photoURL ? (
                <img src={auth.currentUser.photoURL} alt={auth.currentUser.displayName || ""} className="w-full h-full rounded-full object-cover" />
              ) : (
                auth.currentUser?.displayName?.charAt(0) || "U"
              )}
            </div>
            <div className="flex-1 flex items-end">
              <Textarea
                placeholder="Write a comment..."
                className="w-full resize-none rounded-2xl text-xs sm:text-sm min-h-[32px] sm:min-h-[40px] py-1 sm:py-2"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={1}
              />
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={submitComment} 
                disabled={!commentText.trim()}
                className="ml-2 h-8 w-8 sm:h-10 sm:w-10 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Comments list */}
          {loadingComments ? (
            <div className="text-left py-3 sm:py-4">
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-sigma-purple border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">Loading comments...</p>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-2">
                  <Link to={`/profile/${comment.userId}`} className="flex-shrink-0">
                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                      <AvatarImage src={getAvatarForUser(comment.userId, 'professional', 'male')} alt={comment.displayName} />
                      <AvatarFallback>{comment.displayName[0]}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 text-left">
                    <div className="bg-secondary/30 dark:bg-secondary/20 rounded-lg py-1.5 sm:py-2 px-2 sm:px-3">
                      <Link to={`/profile/${comment.userId}`} className="font-medium text-xs sm:text-sm hover:underline">
                        {comment.displayName}
                      </Link>
                      <p className="text-xs sm:text-sm">{comment.content}</p>
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
            <p className="text-left text-xs sm:text-sm text-muted-foreground py-3 sm:py-4">No comments yet. Be the first to comment.</p>
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
