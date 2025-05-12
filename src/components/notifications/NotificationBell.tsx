import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: "like" | "comment" | "connection" | "message" | "mention";
  senderId: string;
  recipientId: string;
  read: boolean;
  createdAt: any;
  postId?: string;
  commentId?: string;
  messageId?: string;
  connectionId?: string;
  content?: string;
  senderName?: string;
  senderPhotoURL?: string;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const notificationsRef = collection(firestore, "notifications");
    const q = query(
      notificationsRef,
      where("recipientId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationData: Notification[] = [];
      snapshot.forEach((doc) => {
        notificationData.push({ id: doc.id, ...doc.data() } as Notification);
      });

      setNotifications(notificationData);
      setUnreadCount(notificationData.filter((n) => !n.read).length);
    });

    return () => unsubscribe();
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      try {
        const notificationRef = doc(firestore, "notifications", notification.id);
        await updateDoc(notificationRef, {
          read: true,
        });
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    // Navigate based on notification type
    switch (notification.type) {
      case "like":
      case "comment":
        // Navigate to post
        if (notification.postId) {
          // window.location.href = `/post/${notification.postId}`;
          toast({
            title: "Navigation",
            description: `Navigating to post ${notification.postId}`,
          });
        }
        break;
      case "connection":
        // Navigate to profile
        if (notification.senderId) {
          // window.location.href = `/profile/${notification.senderId}`;
          toast({
            title: "Navigation",
            description: `Navigating to profile of ${notification.senderName}`,
          });
        }
        break;
      case "message":
        // Navigate to messages
        if (notification.messageId) {
          // window.location.href = `/messages/${notification.senderId}`;
          toast({
            title: "Navigation",
            description: `Navigating to message conversation`,
          });
        }
        break;
      case "mention":
        // Navigate to post with mention
        if (notification.postId) {
          // window.location.href = `/post/${notification.postId}`;
          toast({
            title: "Navigation",
            description: `Navigating to post with mention`,
          });
        }
        break;
    }

    setIsOpen(false);
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.read);
      
      for (const notification of unreadNotifications) {
        const notificationRef = doc(firestore, "notifications", notification.id);
        await updateDoc(notificationRef, {
          read: true,
        });
      }
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  const getNotificationContent = (notification: Notification) => {
    switch (notification.type) {
      case "like":
        return `${notification.senderName} liked your post`;
      case "comment":
        return `${notification.senderName} commented on your post: "${notification.content?.substring(0, 30)}${
          notification.content && notification.content.length > 30 ? "..." : ""
        }"`;
      case "connection":
        return `${notification.senderName} ${
          'connectionId' in notification && notification.connectionId ? "accepted your connection request" : "sent you a connection request"
        }`;
      case "message":
        return `${notification.senderName} sent you a message: "${notification.content?.substring(0, 30)}${
          notification.content && notification.content.length > 30 ? "..." : ""
        }"`;
      case "mention":
        return `${notification.senderName} mentioned you in a post`;
      default:
        return "New notification";
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="p-2 rounded-full bg-secondary/80 dark:bg-secondary/30 hover:bg-secondary transition-colors relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-card border shadow-lg rounded-lg z-50 overflow-hidden"
          >
            <div className="p-3 border-b flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                      !notification.read ? "bg-muted/20" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={notification.senderPhotoURL || ""}
                          alt={notification.senderName || "User"}
                        />
                        <AvatarFallback>
                          {notification.senderName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">
                          {getNotificationContent(notification)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.createdAt &&
                            formatDistanceToNow(notification.createdAt.toDate(), {
                              addSuffix: true,
                            })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  <p>No notifications yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
