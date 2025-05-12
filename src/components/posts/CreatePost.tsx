
import { useState } from "react";
import { motion } from "framer-motion";
import { Image, Video, Users, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { auth, firestore, storage, database } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { ref as dbRef, push } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MediaComingSoon from "./MediaComingSoon";

interface CreatePostProps {
  onPostCreated?: () => void;
}

const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showMediaComingSoon, setShowMediaComingSoon] = useState(false);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const { toast } = useToast();

  const handleCreatePost = async () => {
    if (!auth.currentUser) {
      toast({ 
        title: "Authentication required", 
        description: "Please sign in to create a post" 
      });
      return;
    }
    
    if (!content.trim()) {
      toast({ 
        title: "Empty post", 
        description: "Please add some text to your post" 
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {      
      // Create post document
      const postData = {
        userId: auth.currentUser.uid,
        content: content.trim(),
        imageUrl: null,
        likes: 0,
        comments: 0,
        shares: 0,
        likedBy: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await addDoc(collection(firestore, "posts"), postData);
      
      // Clear form
      setContent("");
      setSelectedFile(null);
      setImagePreview(null);
      setIsExpanded(false);
      
      toast({
        title: "Post created",
        description: "Your post has been published",
      });
      
      // Trigger refresh
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Post failed",
        description: "We couldn't publish your post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowMediaDialog = (type: "image" | "video") => {
    setMediaType(type);
    setShowMediaComingSoon(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-4 mb-6"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-sigma-blue/20 flex items-center justify-center text-sigma-blue font-bold">
          {auth.currentUser?.photoURL ? (
            <img src={auth.currentUser.photoURL} alt={auth.currentUser.displayName || ""} className="w-full h-full rounded-full object-cover" />
          ) : (
            auth.currentUser?.displayName?.charAt(0) || "U"
          )}
        </div>
        
        {isExpanded ? (
          <div className="flex-1">
            <Textarea
              placeholder="What's on your mind?"
              className="w-full resize-none mb-3"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
            
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleShowMediaDialog("image")}
                >
                  <Image className="w-4 h-4 mr-2" />
                  <span>Add Media</span>
                </Button>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setIsExpanded(false);
                    setContent("");
                    setSelectedFile(null);
                    setImagePreview(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreatePost}
                  disabled={!content.trim() || isSubmitting}
                  className="bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white"
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="bg-secondary/50 dark:bg-secondary/20 rounded-full py-2 px-4 text-muted-foreground flex-1 cursor-pointer hover:bg-secondary/80 dark:hover:bg-secondary/30 transition-colors"
            onClick={() => setIsExpanded(true)}
          >
            What's on your mind?
          </div>
        )}
      </div>
      
      {!isExpanded && (
        <div className="flex justify-between">
          <button 
            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => handleShowMediaDialog("image")}
          >
            <Image className="w-5 h-5" />
            <span>Photo</span>
          </button>
          <button 
            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => handleShowMediaDialog("video")}
          >
            <Video className="w-5 h-5" />
            <span>Video</span>
          </button>
          <button 
            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsExpanded(true)}
          >
            <Users className="w-5 h-5" />
            <span>Tag</span>
          </button>
          <button 
            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsExpanded(true)}
          >
            <Calendar className="w-5 h-5" />
            <span>Event</span>
          </button>
        </div>
      )}

      {/* Media Coming Soon Dialog */}
      <Dialog open={showMediaComingSoon} onOpenChange={setShowMediaComingSoon}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Media Upload</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <MediaComingSoon type={mediaType} />
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default CreatePost;
