
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/services/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import DefaultProfileSelector from './DefaultProfileSelector';
import DeleteAccount from './DeleteAccount';

const ProfileSettings = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isEmailNotificationsEnabled, setIsEmailNotificationsEnabled] = useState(true);
  const [isProfilePublic, setIsProfilePublic] = useState(true);
  const [showDefaultProfileDialog, setShowDefaultProfileDialog] = useState(false);

  const handleToggleEmailNotifications = async (checked: boolean) => {
    if (!currentUser) return;

    setIsEmailNotificationsEnabled(checked);

    try {
      await updateUserProfile(currentUser.uid, {
        settings: {
          emailNotifications: checked
        }
      });

      toast({
        description: `Email notifications ${checked ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive',
      });
      setIsEmailNotificationsEnabled(!checked); // Revert on error
    }
  };

  const handleToggleProfileVisibility = async (checked: boolean) => {
    if (!currentUser) return;

    setIsProfilePublic(checked);

    try {
      await updateUserProfile(currentUser.uid, {
        settings: {
          isProfilePublic: checked
        }
      });

      toast({
        description: `Profile is now ${checked ? 'public' : 'private'}`,
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive',
      });
      setIsProfilePublic(!checked); // Revert on error
    }
  };

  const handleProfileImageSelected = (url: string) => {
    // Close the dialog
    setShowDefaultProfileDialog(false);
    
    // Confirmation toast
    toast({
      description: "Profile picture updated successfully",
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6"
    >
      <h2 className="text-xl font-bold mb-6">Account Settings</h2>
      
      <div className="space-y-6">
        {/* Profile Settings */}
        <div>
          <h3 className="text-lg font-medium mb-4">Profile</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="profile-visibility">Profile Visibility</Label>
                <p className="text-sm text-muted-foreground">
                  Make your profile visible to everyone on SigmaHub
                </p>
              </div>
              <Switch 
                id="profile-visibility" 
                checked={isProfilePublic} 
                onCheckedChange={handleToggleProfileVisibility}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for important updates
                </p>
              </div>
              <Switch 
                id="email-notifications" 
                checked={isEmailNotificationsEnabled}
                onCheckedChange={handleToggleEmailNotifications}
              />
            </div>
          </div>
        </div>
        
        {/* Profile Picture */}
        <div>
          <h3 className="text-lg font-medium mb-4">Profile Picture</h3>
          
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
              {currentUser?.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold">
                  {currentUser?.displayName?.charAt(0) || "U"}
                </span>
              )}
            </div>
            
            <div>
              <Dialog open={showDefaultProfileDialog} onOpenChange={setShowDefaultProfileDialog}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-to-r from-sigma-blue to-sigma-purple text-white hover:from-sigma-purple hover:to-sigma-blue"
                  >
                    Choose Default Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Choose a Default Profile</DialogTitle>
                  </DialogHeader>
                  <DefaultProfileSelector 
                    currentPhotoURL={currentUser?.photoURL || undefined}
                    onImageSelected={handleProfileImageSelected}
                    onClose={() => setShowDefaultProfileDialog(false)}
                  />
                </DialogContent>
              </Dialog>
              
              <p className="mt-2 text-xs text-muted-foreground">
                Choose from our collection of professional profile images
              </p>
            </div>
          </div>
        </div>
        
        {/* Delete Account */}
        <DeleteAccount />
      </div>
    </motion.div>
  );
};

export default ProfileSettings;
