
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ProfileEditForm from "@/components/profile/ProfileEditForm";

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (!authUser) {
        navigate("/auth");
        return;
      }

      try {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(firestore, "users", authUser.uid));
        
        if (userDoc.exists()) {
          setUser({
            ...userDoc.data(),
            id: authUser.uid,
            displayName: userDoc.data().displayName || authUser.displayName,
            email: authUser.email,
            photoURL: userDoc.data().photoURL || authUser.photoURL,
          });
        } else {
          // Create a minimal user object if no profile found
          setUser({
            id: authUser.uid,
            displayName: authUser.displayName,
            email: authUser.email,
            photoURL: authUser.photoURL,
            headline: "",
            location: "",
            bio: "",
            connectionCount: 0,
          });
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
  }, [navigate, toast]);

  // Fetch connection count
  useEffect(() => {
    const fetchConnectionCount = async () => {
      if (!user?.id) return;

      try {
        const connectionsQuery = query(
          collection(firestore, "connections"),
          where("userId", "==", user.id),
          where("status", "==", "accepted")
        );
        
        const connectionsSnapshot = await getDocs(connectionsQuery);
        
        setUser(prevUser => ({
          ...prevUser,
          connectionCount: connectionsSnapshot.size
        }));
      } catch (error) {
        console.error("Error fetching connection count:", error);
      }
    };

    fetchConnectionCount();
  }, [user?.id]);

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

  if (isEditing) {
    return (
      <div className="min-h-screen pt-20 px-4 bg-background pb-12">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-8">
              <h1 className="text-2xl font-bold mb-6">Edit Your Profile</h1>
              <ProfileEditForm 
                user={user}
                onCancel={() => setIsEditing(false)}
                onSave={() => setIsEditing(false)}
              />
            </div>
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
              <div className="w-24 h-24 rounded-full bg-sigma-blue/20 flex items-center justify-center text-sigma-blue text-4xl font-bold border-4 border-background overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                ) : (
                  user.displayName?.charAt(0) || "U"
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end">
              <div>
                <h1 className="text-2xl font-bold mb-2">{user.displayName}</h1>
                <p className="text-muted-foreground mb-2">{user.headline || "Add a professional headline"}</p>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <span>{user.location || "Add location"}</span>
                  <span className="mx-2">•</span>
                  <span className="text-sigma-blue dark:text-sigma-purple">
                    {user.connectionCount || 0} connections
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-4 md:mt-0">
                <Button 
                  className="bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
                <Button variant="outline" onClick={() => navigate("/network")}>View Network</Button>
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
            <p className="whitespace-pre-line">
              {user.bio || "Add information about yourself to help others understand your background and expertise."}
            </p>
            {!user.bio && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => setIsEditing(true)}
              >
                Add Bio
              </Button>
            )}
          </motion.div>

          {/* Experience Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-8 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Experience</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Add Experience
              </Button>
            </div>
            
            <div className="space-y-6">
              {user.experience && user.experience.length > 0 ? (
                user.experience.map((exp: any, index: number) => (
                  <div key={index} className="border-l-2 border-sigma-blue/50 dark:border-sigma-purple/50 pl-4">
                    <h3 className="font-bold">{exp.title || "Position"}</h3>
                    <p className="text-muted-foreground">
                      {exp.company || "Company"} • {exp.duration || "Duration"}
                    </p>
                    <p className="mt-2">{exp.description || ""}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Add your work experience to showcase your professional journey.</p>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Education</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Add Education
              </Button>
            </div>
            
            <div className="space-y-6">
              {user.education && user.education.length > 0 ? (
                user.education.map((edu: any, index: number) => (
                  <div key={index} className="border-l-2 border-sigma-blue/50 dark:border-sigma-purple/50 pl-4">
                    <h3 className="font-bold">{edu.school || "Institution"}</h3>
                    <p className="text-muted-foreground">
                      {edu.degree || "Degree"} • {edu.duration || "Duration"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Add your educational background to help others understand your qualifications.</p>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Skills</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Add Skills
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {user.skills && user.skills.length > 0 ? (
                user.skills.map((skill: string, index: number) => (
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
                <p className="text-muted-foreground">Add skills to showcase your expertise to other professionals and potential employers.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
