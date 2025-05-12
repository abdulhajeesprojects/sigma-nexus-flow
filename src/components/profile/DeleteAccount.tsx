
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteUserAccount } from '@/services/firestore';
import { auth } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const DeleteAccount = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return;
    
    setIsDeleting(true);
    
    try {
      // Delete account data from Firestore
      await deleteUserAccount(auth.currentUser.uid);
      
      // Delete the Firebase Auth account
      await auth.currentUser.delete();
      
      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted.',
      });
      
      navigate('/auth');
    } catch (error) {
      console.error('Error deleting account:', error);
      
      // Check if error is due to recent sign-in required
      if (error.code === 'auth/requires-recent-login') {
        toast({
          title: 'Re-authentication required',
          description: 'Please log out and log in again before deleting your account.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete account. Please try again later.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t">
      <h2 className="text-xl font-bold mb-4 text-destructive">Danger Zone</h2>
      <p className="mb-6 text-muted-foreground">
        Once you delete your account, there is no going back. Please be certain.
      </p>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">
            Delete Account
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Account Permanently
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All of your data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-destructive/10 p-4 rounded-md text-sm">
              <p>You will lose:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>All your profile information</li>
                <li>Your posts and comments</li>
                <li>Your connection network</li>
                <li>All message history</li>
                <li>Any job applications you've submitted</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-delete">
                Please type <span className="font-bold">"delete my account"</span> to confirm:
              </Label>
              <Input
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="delete my account"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={confirmText !== 'delete my account' || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete My Account Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeleteAccount;
