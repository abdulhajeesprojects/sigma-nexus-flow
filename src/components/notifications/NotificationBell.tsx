
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  updateDoc,
  doc,
  getDocs
} from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { acceptConnectionRequest } from "@/services/firestore";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: "connectionRequest" | "postLike" | "postComment" | "message";
  senderId: string;
  senderName?: string;
  isRead: boolean;
  timestamp: any;
  message: string;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!auth.currentUser) return;

    // Listen for notifications
    const notificationsQuery = query(
      collection(firestore, "notifications"),
      where("userId", "==", auth.currentUser.uid),
      where("isRead", "==", false)
    );

    const unsubscribe = onSnapshot(notificationsQuery, async (snapshot) => {
      const notificationData = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        let senderName = "A user";
        
        // Get sender details
        if (data.senderId) {
          try {
            const userDoc = await getDocs(
              query(collection(firestore, "users"), where("userId", "==", data.senderId))
            );
            if (!userDoc.empty) {
              senderName = userDoc.docs[0].data().displayName || "A user";
            }
          } catch (error) {
            console.error("Error fetching user details:", error);
          }
        }
        
        return {
          id: doc.id,
          ...data,
          senderName
        } as Notification;
      }));
      
      setNotifications(notificationData);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(firestore, "notifications", notificationId);
      await updateDoc(notificationRef, {
        isRead: true
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleAcceptConnection = async (notificationId: string, connectionId: string) => {
    try {
      await acceptConnectionRequest(connectionId);
      await markAsRead(notificationId);
      
      toast({
        title: "Connection Accepted",
        description: "You are now connected!"
      });
    } catch (error) {
      console.error("Error accepting connection:", error);
      toast({
        title: "Error",
        description: "Failed to accept connection",
        variant: "destructive",
      });
    }
  };

  const handleDeclineConnection = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      
      toast({
        description: "Connection request declined"
      });
    } catch (error) {
      console.error("Error declining connection:", error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="py-2 px-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
        </div>
        
        <AnimatePresence>
          {notifications.length > 0 ? (
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-b last:border-b-0 p-3"
                >
                  <p className="text-sm mb-2">
                    <span className="font-semibold">{notification.senderName}</span>{" "}
                    {notification.message}
                  </p>
                  
                  {notification.type === "connectionRequest" && (
                    <div className="flex space-x-2 mt-2">
                      <Button 
                        size="sm" 
                        className="text-xs bg-gradient-to-r from-sigma-blue to-sigma-purple text-white"
                        onClick={() => handleAcceptConnection(notification.id, notification.connectionId)}
                      >
                        Accept
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => handleDeclineConnection(notification.id)}
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No new notifications
            </div>
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
