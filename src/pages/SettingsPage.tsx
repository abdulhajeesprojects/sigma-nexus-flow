import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile, getUserProfile, updateUsername } from '@/services/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarForUser } from '@/services/avatars';
import { LogOut, User, Lock, Bell, Shield, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { Switch } from '@/components/ui/switch';

const SettingsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) return;
      try {
        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
          setDisplayName(profile.displayName);
          setUsername(profile.username);
          setBio(profile.bio || '');
          setLocation(profile.location || '');
          setOccupation(profile.occupation || '');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive',
        });
      }
    };

    fetchUserProfile();
  }, [currentUser, toast]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: 'Error',
        description: 'Failed to log out',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      await updateUserProfile(currentUser.uid, {
        displayName,
        bio,
        location,
        occupation,
      });
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUsername = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      await updateUsername(currentUser.uid, username);
      setIsEditingUsername(false);
      toast({
        title: 'Username updated',
        description: 'Your username has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating username:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update username',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-2 sm:px-4 bg-background">
      <div className="w-full sm:container sm:mx-auto">
        <div className="w-full sm:max-w-4xl sm:mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
            <Card className="p-2 sm:p-0">
              <CardHeader>
                <CardTitle className="text-2xl">Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2">
                    <TabsTrigger value="profile" className="flex items-center justify-center">
                      <User className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center justify-center">
                      <Lock className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Security</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center justify-center">
                      <Bell className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Notifications</span>
                    </TabsTrigger>
                    <TabsTrigger value="privacy" className="flex items-center justify-center">
                      <Shield className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Privacy</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile" className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={getAvatarForUser(currentUser?.uid || '', 'professional', 'male')} alt={currentUser?.displayName || ''} />
                        <AvatarFallback>{currentUser?.displayName?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="text-center sm:text-left">
                        <h3 className="text-lg font-medium">{currentUser?.displayName}</h3>
                        <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={!isEditingUsername}
                            placeholder="@username"
                            className="flex-1"
                          />
                          {isEditingUsername ? (
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsEditingUsername(false);
                                  setUsername(username);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleUpdateUsername}
                                disabled={isLoading}
                              >
                                {isLoading ? 'Saving...' : 'Save'}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => setIsEditingUsername(true)}
                            >
                              Edit
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Your username must start with @ and contain only letters, numbers, and underscores.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell us about yourself"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Where are you based?"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="occupation">Occupation</Label>
                        <Input
                          id="occupation"
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          placeholder="What do you do?"
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={handleLogout}
                          className="text-destructive"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </Button>
                        <Button
                          onClick={handleUpdateProfile}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="notifications" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive email notifications about your account activity
                          </p>
                        </div>
                        <Switch
                          checked={notifications.email}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive push notifications on your device
                          </p>
                        </div>
                        <Switch
                          checked={notifications.push}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Marketing Emails</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive emails about new features and updates
                          </p>
                        </div>
                        <Switch
                          checked={notifications.marketing}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked }))}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="privacy" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Switch between light and dark theme
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="h-10 w-10"
                      >
                        {theme === 'dark' ? (
                          <Sun className="h-5 w-5" />
                        ) : (
                          <Moon className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="security" className="space-y-4">
                    <div className="flex flex-col space-y-4">
                      <Button
                        variant="destructive"
                        onClick={handleLogout}
                        className="w-full sm:w-auto"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Log Out
                      </Button>
          </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
