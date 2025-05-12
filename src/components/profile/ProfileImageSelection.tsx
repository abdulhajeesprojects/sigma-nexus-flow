
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DefaultProfileSelector from "@/components/profile/DefaultProfileSelector";
import { useAuth } from "@/hooks/use-auth";
import { Camera } from "lucide-react";

interface ProfileImageSelectionProps {
  currentPhotoURL?: string | null;
  onPhotoUpdated: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

const ProfileImageSelection = ({ currentPhotoURL, onPhotoUpdated, size = 'md' }: ProfileImageSelectionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { currentUser } = useAuth();
  
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };
  
  const getInitial = (name: string | null | undefined) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };
  
  const userInitial = getInitial(currentUser?.displayName);
  
  const handleImageSelected = (url: string) => {
    setIsDialogOpen(false);
    onPhotoUpdated(url);
  };
  
  return (
    <>
      <div className="relative">
        <Avatar className={`${sizeClasses[size]} border-4 border-background`}>
          {currentPhotoURL ? (
            <AvatarImage 
              src={currentPhotoURL} 
              alt="Profile" 
              className="object-cover"
              onError={(e) => {
                // Handle broken image gracefully
                (e.target as HTMLImageElement).style.display = 'none';
              }} 
            />
          ) : null}
          <AvatarFallback className="text-4xl bg-sigma-blue/20 text-sigma-blue">
            {userInitial}
          </AvatarFallback>
        </Avatar>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="absolute -bottom-2 -right-2 bg-sigma-blue text-white rounded-full p-2 cursor-pointer shadow-md hover:bg-sigma-purple transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Choose a Profile Picture</DialogTitle>
            </DialogHeader>
            <DefaultProfileSelector 
              currentPhotoURL={currentPhotoURL || undefined}
              onImageSelected={handleImageSelected}
              onClose={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default ProfileImageSelection;
