
import { useState } from "react";
import { motion } from "framer-motion";
import { Image, Video, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { auth, firestore, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";

interface CreatePostProps {
  onPostCreated?: () => void;
}

const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleCreatePost = async () => {
    if (!auth.currentUser || !content.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      let imageUrl = "";
      
      // Upload image if selected
      if (selectedFile) {
        const storageRef = ref(storage, `posts/${auth.currentUser.uid}/${Date.now()}-${selectedFile.name}`);
        const uploadResult = await uploadBytes(storageRef, selectedFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }
      
      // Create post document
      const postData = {
        userId: auth.currentUser.uid,
        content: content.trim(),
        imageUrl: imageUrl || null,
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
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
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
            {selectedFile && (
              <div className="mb-3 p-2 bg-background rounded flex justify-between items-center">
                <span className="text-sm truncate">{selectedFile.name}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0" 
                  onClick={() => setSelectedFile(null)}
                >
                  ✕
                </Button>
              </div>
            )}
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <label className="cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Image className="w-4 h-4 mr-2" />
                    <span>Add Photo</span>
                  </Button>
                </label>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsExpanded(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreatePost}
                  disabled={!content.trim() || isSubmitting}
                  className="bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white"
                >
                  Post
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
            onClick={() => setIsExpanded(true)}
          >
            <Image className="w-5 h-5" />
            <span>Photo</span>
          </button>
          <button 
            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsExpanded(true)}
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
    </motion.div>
  );
};

export default CreatePost;
