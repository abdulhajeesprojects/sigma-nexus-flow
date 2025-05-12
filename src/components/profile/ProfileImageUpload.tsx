
import { useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadProfileImage } from "@/services/firestore";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface ProfileImageUploadProps {
  userId: string;
  currentPhotoURL?: string | null;
  onPhotoUpdated: (url: string) => void;
}

const ProfileImageUpload = ({ userId, currentPhotoURL, onPhotoUpdated }: ProfileImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file is an image and not too large
    if (!file.type.includes("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    
    try {
      const photoURL = await uploadProfileImage(userId, file);
      
      // Also update the auth profile
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, { photoURL });
      }
      
      onPhotoUpdated(photoURL);
      
      toast({
        title: "Profile photo updated",
        description: "Your profile photo has been updated successfully",
      });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload profile image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getInitial = (name: string | null | undefined) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const userInitial = getInitial(auth.currentUser?.displayName);

  return (
    <div className="relative">
      <Avatar className="w-24 h-24 border-4 border-background">
        {currentPhotoURL ? (
          <AvatarImage 
            src={currentPhotoURL} 
            alt="Profile" 
            className="object-cover"
            onError={(e) => {
              // Handle broken image
              (e.target as HTMLImageElement).style.display = 'none';
            }} 
          />
        ) : null}
        <AvatarFallback className="text-4xl bg-sigma-blue/20 text-sigma-blue">
          {userInitial}
        </AvatarFallback>
      </Avatar>
      
      <label htmlFor="profile-image-upload" className="absolute -bottom-2 -right-2 bg-sigma-blue text-white rounded-full p-2 cursor-pointer shadow-md hover:bg-sigma-purple transition-colors">
        <Camera className="w-4 h-4" />
        <input 
          type="file" 
          id="profile-image-upload" 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>
      
      {uploading && (
        <div className="absolute inset-0 bg-background/50 rounded-full flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-sigma-blue border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;
