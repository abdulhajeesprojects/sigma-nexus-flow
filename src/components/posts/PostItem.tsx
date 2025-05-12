
import { useState } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Heart, Share2, Bookmark, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth, firestore } from "@/lib/firebase";
import { doc, updateDoc, increment, arrayUnion, arrayRemove } from "firebase/firestore";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface PostItemProps {
  post: {
    id: string;
    userId: string;
    content: string;
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

const PostItem = ({ post, refreshPosts }: PostItemProps) => {
  const [isLiked, setIsLiked] = useState(
    post.likedBy?.includes(auth.currentUser?.uid || "") || false
  );
  const { toast } = useToast();

  const handleLike = async () => {
    if (!auth.currentUser) return;
    
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
      }
      
      if (refreshPosts) refreshPosts();
    } catch (error) {
      console.error("Error updating like:", error);
      toast({
        title: "Error",
        description: "Failed to update like",
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
      <div className="flex items-center space-x-3 mb-4">
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

      <div className="mb-4">
        <p className="whitespace-pre-line">{post.content}</p>
      </div>

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

        <Button variant="ghost" className="flex items-center space-x-1 text-sm">
          <MessageSquare className="w-5 h-5" />
          <span>Comment</span>
        </Button>

        <Button variant="ghost" className="flex items-center space-x-1 text-sm">
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </Button>

        <Button variant="ghost" className="flex items-center space-x-1 text-sm">
          <Bookmark className="w-5 h-5" />
          <span>Save</span>
        </Button>
      </div>
    </motion.div>
  );
};

export default PostItem;
