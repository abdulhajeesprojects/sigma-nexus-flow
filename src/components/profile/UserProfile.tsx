import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '@/services/firestore';
import { getAvatarForUser } from '@/services/avatars';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL: string;
  bio: string;
  location: string;
  occupation: string;
  interests: string[];
  connections: string[];
  posts: string[];
  createdAt: Date;
  updatedAt: Date;
}

export function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      try {
        const userProfile = await getUserProfile(userId);
        setProfile(userProfile);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
        <Button onClick={() => navigate('/')}>Return Home</Button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.uid === userId;
  const avatarUrl = getAvatarForUser(profile.id, 'professional', 'male'); // You can adjust type and gender based on user data

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="relative">
          <div className="absolute -top-16 left-8">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={avatarUrl} alt={profile.displayName} />
              <AvatarFallback>{profile.displayName[0]}</AvatarFallback>
            </Avatar>
          </div>
          <div className="ml-36">
            <CardTitle className="text-3xl font-bold">{profile.displayName}</CardTitle>
            <p className="text-muted-foreground">{profile.occupation}</p>
            {isOwnProfile && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/settings/profile')}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="connections">Connections</TabsTrigger>
            </TabsList>
            <TabsContent value="about" className="mt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Bio</h3>
                      <p className="text-muted-foreground">{profile.bio || 'No bio provided'}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Location</h3>
                      <p className="text-muted-foreground">{profile.location || 'No location provided'}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Occupation</h3>
                      <p className="text-muted-foreground">{profile.occupation || 'No occupation provided'}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests?.length > 0 ? (
                        profile.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {interest}
                          </span>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No interests listed</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="posts" className="mt-6">
              <ScrollArea className="h-[600px]">
                {/* Post list will be implemented here */}
                <p className="text-muted-foreground">Posts will be displayed here</p>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="connections" className="mt-6">
              <ScrollArea className="h-[600px]">
                {/* Connections list will be implemented here */}
                <p className="text-muted-foreground">Connections will be displayed here</p>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
} 