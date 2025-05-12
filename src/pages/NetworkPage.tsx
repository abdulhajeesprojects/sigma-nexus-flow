
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { collection, query, getDocs, limit, where, deleteDoc, doc } from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { sendConnectionRequest, getAllUsers } from "@/services/firestore";
import { UserPlus, Check, X } from "lucide-react";

interface Connection {
  id: string;
  userId: string;
  connectionId: string;
  status: string;
  createdAt: any;
  name?: string;
  title?: string;
  photoURL?: string;
}

interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  headline?: string;
  photoURL?: string;
}

const NetworkPage = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingConnections, setPendingConnections] = useState<Connection[]>([]);
  const [suggestedConnections, setSuggestedConnections] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        // Fetch existing connections
        const connectionsQuery = query(
          collection(firestore, "connections"),
          where("userId", "==", user.uid)
        );
        
        const connectionsSnapshot = await getDocs(connectionsQuery);
        const connectionsData = connectionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Connection[];
        
        // Separate accepted and pending connections
        const acceptedConnections = connectionsData.filter(conn => conn.status === "accepted");
        const pendingConnections = connectionsData.filter(conn => conn.status === "pending");
        
        // Fetch user details for connections
        const connectionsWithDetails = await Promise.all(
          acceptedConnections.map(async (connection) => {
            try {
              const userQuery = query(
                collection(firestore, "users"),
                where("userId", "==", connection.connectionId)
              );
              
              const userSnapshot = await getDocs(userQuery);
              
              if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                return {
                  ...connection,
                  name: userData.displayName || "User",
                  title: userData.headline || "",
                  photoURL: userData.photoURL
                };
              }
              
              return connection;
            } catch (err) {
              console.error("Error fetching connection details:", err);
              return connection;
            }
          })
        );
        
        // Fetch user details for pending connections
        const pendingWithDetails = await Promise.all(
          pendingConnections.map(async (connection) => {
            try {
              const userQuery = query(
                collection(firestore, "users"),
                where("userId", "==", connection.connectionId)
              );
              
              const userSnapshot = await getDocs(userQuery);
              
              if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                return {
                  ...connection,
                  name: userData.displayName || "User",
                  title: userData.headline || "",
                  photoURL: userData.photoURL
                };
              }
              
              return connection;
            } catch (err) {
              console.error("Error fetching pending connection details:", err);
              return connection;
            }
          })
        );

        setConnections(connectionsWithDetails);
        setPendingConnections(pendingWithDetails);

        // Get received connections (to filter out users who sent you requests)
        const receivedConnectionsQuery = query(
          collection(firestore, "connections"),
          where("connectionId", "==", user.uid)
        );
        
        const receivedConnectionsSnapshot = await getDocs(receivedConnectionsQuery);
        const receivedConnections = receivedConnectionsSnapshot.docs.map(doc => doc.data());
        
        // Get all users for suggestions
        const allUsers = await getAllUsers();
        
        // Filter out users that are already connected or have pending connections
        const connectedIds = [...connectionsData.map(c => c.connectionId), user.uid];
        const receivedPendingUserIds = receivedConnections
          .filter(c => c.status === "pending")
          .map(c => c.userId);
        
        // Filter out users who sent you requests or are already connected
        const filteredUsers = allUsers.filter(u => {
          return (
            !connectedIds.includes(u.userId) && 
            !receivedPendingUserIds.includes(u.userId)
          );
        });
        
        setSuggestedConnections(filteredUsers);
      } catch (error) {
        console.error("Error fetching network data:", error);
        toast({
          title: "Error",
          description: "Failed to load network data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, toast]);

  const handleConnect = async (userId: string) => {
    if (!auth.currentUser) return;
    
    try {
      await sendConnectionRequest(auth.currentUser.uid, userId);
      
      // Update UI by removing the user from suggested connections
      setSuggestedConnections(prev => 
        prev.filter(user => user.userId !== userId)
      );
      
      toast({
        title: "Connection Request Sent",
        description: "Your connection request has been sent",
      });
    } catch (error) {
      console.error("Error connecting:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send connection request",
        variant: "destructive",
      });
    }
  };

  const handleRemoveConnection = async (connectionId: string) => {
    if (!auth.currentUser) return;
    
    try {
      await deleteDoc(doc(firestore, "connections", connectionId));
      
      // Remove from connections list
      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
      
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

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-6 h-32 animate-pulse"
              ></motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 bg-background">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Your Network</h1>
          
          {/* Pending Sent Invitations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6 mb-6"
          >
            <h2 className="text-xl font-bold mb-4">Pending Invitations Sent</h2>
            <div className="space-y-4">
              {pendingConnections.length > 0 ? (
                pendingConnections.map((connection) => (
                  <div key={connection.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-sigma-purple/20 flex items-center justify-center text-sigma-purple font-bold overflow-hidden">
                        {connection.photoURL ? (
                          <img src={connection.photoURL} alt={connection.name} className="w-full h-full object-cover" />
                        ) : (
                          connection.name?.charAt(0) || "U"
                        )}
                      </div>
                      <div>
                        <Link to={`/profile/${connection.connectionId}`} className="hover:underline">
                          <p className="font-medium">{connection.name || "User"}</p>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {connection.title || "Professional"} • Request pending
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRemoveConnection(connection.id)}
                    >
                      <X className="w-4 h-4 mr-1" /> Cancel Request
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No pending invitations sent</p>
              )}
            </div>
          </motion.div>
          
          {/* Connections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card p-6 mb-6"
          >
            <h2 className="text-xl font-bold mb-4">Your Connections</h2>
            <div className="space-y-4">
              {connections.length > 0 ? (
                connections.map((connection) => (
                  <div key={connection.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-sigma-blue/20 flex items-center justify-center text-sigma-blue font-bold overflow-hidden">
                        {connection.photoURL ? (
                          <img src={connection.photoURL} alt={connection.name} className="w-full h-full object-cover" />
                        ) : (
                          connection.name?.charAt(0) || "U"
                        )}
                      </div>
                      <div>
                        <Link to={`/profile/${connection.connectionId}`} className="hover:underline">
                          <p className="font-medium">
                            {connection.name || "User"}
                          </p>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {connection.title || "Professional"} • Connected {new Date(connection.createdAt?.toDate()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/messages?userId=${connection.connectionId}`)}
                      >
                        Message
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveConnection(connection.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No connections yet. Start growing your network!</p>
              )}
            </div>
          </motion.div>
          
          {/* Suggested Connections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-bold mb-4">People You May Know</h2>
            <div className="space-y-4">
              {suggestedConnections.length > 0 ? (
                suggestedConnections.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-sigma-blue/20 flex items-center justify-center text-sigma-blue font-bold overflow-hidden">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                        ) : (
                          user.displayName?.charAt(0) || "U"
                        )}
                      </div>
                      <div>
                        <Link to={`/profile/${user.userId}`} className="hover:underline">
                          <p className="font-medium">
                            {user.displayName || "User"}
                          </p>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {user.headline || "Professional"}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleConnect(user.userId)}
                      className="flex items-center"
                    >
                      <UserPlus className="w-4 h-4 mr-1" /> Connect
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No suggested connections available at the moment</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NetworkPage;
