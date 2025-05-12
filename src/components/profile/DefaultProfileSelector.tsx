import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { defaultProfileImages } from '@/lib/defaultProfileImages';
import { Button } from '@/components/ui/button';
import { updateUserProfile } from '@/services/firestore';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface DefaultProfileSelectorProps {
  onImageSelected?: (url: string) => void;
  currentPhotoURL?: string;
  onClose?: () => void;
}

const DefaultProfileSelector = ({
  onImageSelected,
  currentPhotoURL,
  onClose
}: DefaultProfileSelectorProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(currentPhotoURL || null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const handleSelect = (imageURL: string) => {
    setSelectedImage(imageURL);
  };

  const handleApply = async () => {
    if (!selectedImage || !currentUser) return;
    
    setIsLoading(true);
    
    try {
      // Update user's photoURL
      await updateUserProfile(currentUser.uid, {
        photoURL: selectedImage
      });
      
      toast({
        title: 'Profile updated',
        description: 'Your profile picture has been updated successfully.',
      });
      
      if (onImageSelected) {
        onImageSelected(selectedImage);
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile picture',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Choose a default profile picture</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
        {defaultProfileImages.map((image) => (
          <motion.div
            key={image.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(image.url)}
            className={`
              cursor-pointer rounded-lg overflow-hidden border-2 transition-colors
              ${selectedImage === image.url ? 'border-sigma-purple' : 'border-transparent'}
            `}
          >
            <img 
              src={image.url} 
              alt={image.alt} 
              className="w-full h-auto aspect-square object-cover"
            />
          </motion.div>
        ))}
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        
        <Button 
          onClick={handleApply} 
          disabled={!selectedImage || isLoading}
          className="bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white"
        >
          {isLoading ? 'Applying...' : 'Apply'}
        </Button>
      </div>
    </div>
  );
};

export default DefaultProfileSelector;
