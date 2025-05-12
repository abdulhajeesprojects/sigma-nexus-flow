
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { doc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, UserPlus, X, CheckCheck } from "lucide-react";
import { sendConnectionRequest } from "@/services/firestore";
import { checkUserOnlineStatus } from "@/services/presence";

const UserProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (!userId) return;
      
      if (!authUser) {
        navigate("/auth");
        return;
      }

      // Don't allow viewing your own profile through this page
      if (userId === authUser.uid) {
        navigate("/profile");
        return;
      }

      try {
        // Fetch user profile
        const userDoc = await getDoc(doc(firestore, "users", userId));
        
        if (userDoc.exists()) {
          const profileData = {
            id: userDoc.id,
            ...userDoc.data(),
          };
          
          setProfile(profileData);
          
          // Check connection status
          const connectionsQuery = query(
            collection(firestore, "connections"),
            where("userId", "==", authUser.uid),
            where("connectionId", "==", userId)
          );
          
          const connectionsSnapshot = await getDocs(connectionsQuery);
          
          if (!connectionsSnapshot.empty) {
            const connectionData = connectionsSnapshot.docs[0].data();
            setConnectionId(connectionsSnapshot.docs[0].id);
            setIsConnected(connectionData.status === "accepted");
            setIsPending(connectionData.status === "pending");
          }

          // Set up online status listener
          const cleanup = checkUserOnlineStatus(userId, (online) => {
            setIsOnline(online);
          });

          return cleanup;
        } else {
          toast({
            title: "User Not Found",
            description: "This user profile does not exist or has been removed.",
            variant: "destructive",
          });
          navigate("/network");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [userId, navigate, toast]);

  const handleConnect = async () => {
    if (!auth.currentUser || !userId) return;
    
    try {
      await sendConnectionRequest(auth.currentUser.uid, userId);
      
      setIsPending(true);
      
      toast({
        title: "Connection Request Sent",
        description: "Your connection request has been sent",
      });
    } catch (error) {
      console.error("Error connecting:", error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
    }
  };

  const handleRemoveConnection = async () => {
    if (!connectionId || !auth.currentUser) return;
    
    try {
      await deleteDoc(doc(firestore, "connections", connectionId));
      
      setIsConnected(false);
      setIsPending(false);
      setConnectionId(null);
      
      toast({
        title: "Connection Removed",
        description: "You are no longer connected with this user",
      });
    } catch (error) {
      console.error("Error removing connection:", error);
      toast({
        title: "Error",
        description: "Failed to remove connection",
        variant: "destructive",
      });
    }
  };

  const handleMessage = () => {
    if (!userId) return;
    navigate(`/messages?userId=${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-8 animate-pulse h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-background">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-8 mb-6 relative"
          >
            {/* Cover Image */}
            <div className="h-32 md:h-48 -mx-8 -mt-8 mb-16 bg-gradient-to-r from-sigma-blue/80 to-sigma-purple/80 rounded-t-xl"></div>

            {/* Profile Picture */}
            <div className="absolute top-20 md:top-24 left-8">
              <div className="w-24 h-24 rounded-full bg-sigma-blue/20 flex items-center justify-center text-sigma-blue text-4xl font-bold border-4 border-background overflow-hidden relative">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                ) : (
                  profile?.displayName?.charAt(0) || "U"
                )}
                
                {/* Online status indicator */}
                <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-background ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end">
              <div>
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold mb-2">{profile?.displayName || "User"}</h1>
                  {isOnline && (
                    <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Online</span>
                  )}
                </div>
                <p className="text-muted-foreground mb-2">{profile?.headline || "SiGMA Hub Member"}</p>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <span>{profile?.location || "Location not specified"}</span>
                  <span className="mx-2">•</span>
                  <span className="text-sigma-blue dark:text-sigma-purple">
                    {profile?.connectionCount || 0} connections
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-4 md:mt-0">
                {isConnected ? (
                  <>
                    <Button 
                      className="bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white"
                      onClick={handleMessage}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" /> Message
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleRemoveConnection}
                    >
                      <X className="w-4 h-4 mr-1" /> Remove Connection
                    </Button>
                  </>
                ) : isPending ? (
                  <Button variant="outline" disabled>
                    <CheckCheck className="w-4 h-4 mr-1" /> Pending
                  </Button>
                ) : (
                  <Button
                    className="bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white"
                    onClick={handleConnect}
                  >
                    <UserPlus className="w-4 h-4 mr-1" /> Connect
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card p-8 mb-6"
          >
            <h2 className="text-xl font-bold mb-4">About</h2>
            <p className="whitespace-pre-line">{profile?.bio || "This user hasn't added a bio yet."}</p>
          </motion.div>

          {/* Experience Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-8 mb-6"
          >
            <h2 className="text-xl font-bold mb-4">Experience</h2>
            <div className="space-y-6">
              {profile?.experience && profile.experience.length > 0 ? (
                profile.experience.map((exp: any, index: number) => (
                  <div key={index} className="border-l-2 border-sigma-blue/50 dark:border-sigma-purple/50 pl-4">
                    <h3 className="font-bold">{exp.title || "Position"}</h3>
                    <p className="text-muted-foreground">
                      {exp.company || "Company"} • {exp.duration || "Duration"}
                    </p>
                    <p className="mt-2">{exp.description || ""}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No experience information available.</p>
              )}
            </div>
          </motion.div>

          {/* Education Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card p-8 mb-6"
          >
            <h2 className="text-xl font-bold mb-4">Education</h2>
            <div className="space-y-6">
              {profile?.education && profile.education.length > 0 ? (
                profile.education.map((edu: any, index: number) => (
                  <div key={index} className="border-l-2 border-sigma-blue/50 dark:border-sigma-purple/50 pl-4">
                    <h3 className="font-bold">{edu.school || "Institution"}</h3>
                    <p className="text-muted-foreground">
                      {edu.degree || "Degree"} • {edu.duration || "Duration"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No education information available.</p>
              )}
            </div>
          </motion.div>

          {/* Skills Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card p-8"
          >
            <h2 className="text-xl font-bold mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile?.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill: string, index: number) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-secondary/50 dark:bg-secondary/20 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </motion.div>
                ))
              ) : (
                <p className="text-muted-foreground">No skills listed yet.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
