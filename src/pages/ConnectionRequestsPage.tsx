
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { auth, firestore, database } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { acceptConnectionRequest, rejectConnectionRequest } from "@/services/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, UserX, UserPlus, Mail } from "lucide-react";
import { ref as dbRef, onValue, off } from "firebase/database";
import { Link } from "react-router-dom";

interface Connection {
  id: string;
  userId: string;
  connectionId: string;
  status: string;
  createdAt: any;
  displayName?: string;
  headline?: string;
  photoURL?: string;
}

const ConnectionRequestsPage = () => {
  const [sentRequests, setSentRequests] = useState<Connection[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("received");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/auth");
      }
    });

    return () => checkAuth();
  }, [navigate]);

  // Fetch connection requests
  useEffect(() => {
    const fetchRequests = async () => {
      if (!auth.currentUser) return;

      try {
        setLoading(true);
        
        // Fetch sent requests
        const sentRequestsQuery = query(
          collection(firestore, "connections"),
          where("userId", "==", auth.currentUser.uid),
          where("status", "==", "pending"),
          orderBy("createdAt", "desc")
        );
        
        const sentRequestsSnapshot = await getDocs(sentRequestsQuery);
        const sentData: Connection[] = [];
        
        // Fetch user details for sent requests
        for (const doc of sentRequestsSnapshot.docs) {
          const connection = { id: doc.id, ...doc.data() } as Connection;
          
          // Get user details for connectionId
          const userDoc = await getDocs(
            query(collection(firestore, "users"), where("userId", "==", connection.connectionId))
          );
          
          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            connection.displayName = userData.displayName;
            connection.headline = userData.headline;
            connection.photoURL = userData.photoURL;
          }
          
          sentData.push(connection);
        }
        
        setSentRequests(sentData);
        
        // Fetch received requests
        const receivedRequestsQuery = query(
          collection(firestore, "connections"),
          where("connectionId", "==", auth.currentUser.uid),
          where("status", "==", "pending"),
          orderBy("createdAt", "desc")
        );
        
        const receivedRequestsSnapshot = await getDocs(receivedRequestsQuery);
        const receivedData: Connection[] = [];
        
        // Fetch user details for received requests
        for (const doc of receivedRequestsSnapshot.docs) {
          const connection = { id: doc.id, ...doc.data() } as Connection;
          
          // Get user details for userId
          const userDoc = await getDocs(
            query(collection(firestore, "users"), where("userId", "==", connection.userId))
          );
          
          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            connection.displayName = userData.displayName;
            connection.headline = userData.headline;
            connection.photoURL = userData.photoURL;
          }
          
          receivedData.push(connection);
        }
        
        setReceivedRequests(receivedData);
      } catch (error) {
        console.error("Error fetching connection requests:", error);
        toast({
          title: "Error",
          description: "Failed to load connection requests",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
    
    // Set up real-time listener for new notifications
    if (auth.currentUser) {
      const notificationsRef = dbRef(database, `notifications/${auth.currentUser.uid}`);
      
      onValue(notificationsRef, (snapshot) => {
        if (snapshot.exists()) {
          // Refresh requests when new notifications come in
          fetchRequests();
        }
      });
      
      return () => {
        off(notificationsRef);
      };
    }
  }, [toast]);

  const handleAccept = async (connectionId: string) => {
    if (!auth.currentUser) return;
    
    setProcessingId(connectionId);
    
    try {
      await acceptConnectionRequest(connectionId);
      
      // Update local state
      setReceivedRequests(prev => prev.filter(req => req.id !== connectionId));
      
      toast({
        title: "Connection accepted",
        description: "You are now connected",
      });
    } catch (error) {
      console.error("Error accepting connection:", error);
      toast({
        title: "Error",
        description: "Failed to accept connection",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (connectionId: string) => {
    if (!auth.currentUser) return;
    
    setProcessingId(connectionId);
    
    try {
      await rejectConnectionRequest(connectionId);
      
      // Update local state
      setReceivedRequests(prev => prev.filter(req => req.id !== connectionId));
      
      toast({
        title: "Request ignored",
        description: "Connection request has been declined",
      });
    } catch (error) {
      console.error("Error rejecting connection:", error);
      toast({
        title: "Error",
        description: "Failed to decline request",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 bg-background">
      <div className="container mx-auto pb-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6 mb-6"
          >
            <h1 className="text-2xl font-bold mb-6">Network Requests</h1>
            
            <Tabs defaultValue="received" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="received">Received Requests</TabsTrigger>
                <TabsTrigger value="sent">Sent Requests</TabsTrigger>
              </TabsList>
              
              <TabsContent value="received" className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-24 bg-secondary/20 animate-pulse rounded-lg"></div>
                    ))}
                  </div>
                ) : receivedRequests.length > 0 ? (
                  receivedRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Link to={`/profile/${request.userId}`}>
                          <div className="w-12 h-12 rounded-full bg-sigma-purple/20 flex items-center justify-center text-sigma-purple font-bold">
                            {request.photoURL ? (
                              <img src={request.photoURL} alt={request.displayName} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              request.displayName?.charAt(0) || "U"
                            )}
                          </div>
                        </Link>
                        <div>
                          <Link to={`/profile/${request.userId}`} className="font-medium hover:underline">
                            {request.displayName || "User"}
                          </Link>
                          <p className="text-sm text-muted-foreground">{request.headline || "User"}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleReject(request.id)}
                          variant="outline"
                          size="sm"
                          disabled={processingId === request.id}
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Ignore
                        </Button>
                        
                        <Button
                          onClick={() => handleAccept(request.id)}
                          className="bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white"
                          size="sm"
                          disabled={processingId === request.id}
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <UserPlus className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 font-medium">No pending requests</h3>
                    <p className="text-muted-foreground mt-1">You don't have any connection requests at the moment</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="sent" className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-24 bg-secondary/20 animate-pulse rounded-lg"></div>
                    ))}
                  </div>
                ) : sentRequests.length > 0 ? (
                  sentRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Link to={`/profile/${request.connectionId}`}>
                          <div className="w-12 h-12 rounded-full bg-sigma-blue/20 flex items-center justify-center text-sigma-blue font-bold">
                            {request.photoURL ? (
                              <img src={request.photoURL} alt={request.displayName} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              request.displayName?.charAt(0) || "U"
                            )}
                          </div>
                        </Link>
                        <div>
                          <Link to={`/profile/${request.connectionId}`} className="font-medium hover:underline">
                            {request.displayName || "User"}
                          </Link>
                          <p className="text-sm text-muted-foreground">{request.headline || "User"}</p>
                          <p className="text-xs text-muted-foreground mt-1">Request pending</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/messages?user=${request.connectionId}`)}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <UserPlus className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 font-medium">No sent requests</h3>
                    <p className="text-muted-foreground mt-1">You haven't sent any connection requests</p>
                    <Button
                      className="mt-4 bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white"
                      onClick={() => navigate("/network")}
                    >
                      Explore Network
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionRequestsPage;
