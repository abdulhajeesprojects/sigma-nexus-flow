
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { collection, query, getDocs, limit, where } from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Connection {
  id: string;
  userId: string;
  connectionId: string;
  status: string;
  createdAt: any;
  name?: string;
  title?: string;
}

interface UserProfile {
  id: string;
  displayName: string;
  headline?: string;
}

const NetworkPage = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
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
          where("userId", "==", user.uid),
          limit(10)
        );
        
        const connectionsSnapshot = await getDocs(connectionsQuery);
        const connectionsData = connectionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Connection[];
        
        setConnections(connectionsData);

        // Fetch suggested connections (users who are not already connected)
        const usersQuery = query(
          collection(firestore, "users"),
          limit(10)
        );
        
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs
          .filter(doc => doc.id !== user.uid && 
            !connectionsData.some(conn => conn.connectionId === doc.id))
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as UserProfile[];
        
        setSuggestedConnections(usersData);
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
      // Create a new connection in Firestore
      const connectionsRef = collection(firestore, "connections");
      const newConnection = {
        userId: auth.currentUser.uid,
        connectionId: userId,
        createdAt: new Date(),
        status: "pending", // Could be "pending", "accepted", "rejected"
      };
      
      // Here we would add the new connection to Firestore
      // For now, just update the local state to show immediate feedback
      setSuggestedConnections(prev => 
        prev.filter(user => user.id !== userId)
      );
      
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
          
          {/* Manage Invitations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6 mb-6"
          >
            <h2 className="text-xl font-bold mb-4">Pending Invitations</h2>
            <div className="space-y-4">
              {connections.filter(conn => conn.status === "pending").length > 0 ? (
                connections.filter(conn => conn.status === "pending").map((connection) => (
                  <div key={connection.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-sigma-purple/20 flex items-center justify-center text-sigma-purple font-bold">
                        {connection.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-medium">{connection.name || "User"}</p>
                        <p className="text-sm text-muted-foreground">
                          {connection.title || "Professional"}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">Accept</Button>
                      <Button size="sm" variant="ghost">Decline</Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No pending invitations</p>
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
              {connections.filter(conn => conn.status === "accepted").length > 0 ? (
                connections.filter(conn => conn.status === "accepted").map((connection) => (
                  <div key={connection.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-sigma-blue/20 flex items-center justify-center text-sigma-blue font-bold">
                        {connection.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <Link to={`/profile/${connection.connectionId}`}>
                          <p className="font-medium hover:text-sigma-blue transition-colors">
                            {connection.name || "User"}
                          </p>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {connection.title || "Professional"} • Connected {new Date(connection.createdAt?.toDate()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Message</Button>
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
                      <div className="w-10 h-10 rounded-full bg-sigma-blue/20 flex items-center justify-center text-sigma-blue font-bold">
                        {user.displayName?.charAt(0) || "U"}
                      </div>
                      <div>
                        <Link to={`/profile/${user.id}`}>
                          <p className="font-medium hover:text-sigma-blue transition-colors">
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
                      onClick={() => handleConnect(user.id)}
                    >
                      Connect
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
