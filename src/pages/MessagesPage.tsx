
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  collection, query, orderBy, limit, getDocs, 
  doc, getDoc, addDoc, serverTimestamp, where 
} from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: any;
  read: boolean;
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: number;
  otherUser: {
    id: string;
    displayName: string;
    photoURL: string | null;
  };
}

const MessagesPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [activeUser, setActiveUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
        // Fetch conversations
        const conversationsQuery = query(
          collection(firestore, "conversations"),
          where("participants", "array-contains", user.uid),
          orderBy("lastMessageTime", "desc"),
          limit(20)
        );
        
        const conversationsSnapshot = await getDocs(conversationsQuery);
        
        // Get the conversations and fetch the other user's details
        const conversationsPromises = conversationsSnapshot.docs.map(async (docSnap) => {
          const conversationData = docSnap.data();
          const otherUserId = conversationData.participants.find((id: string) => id !== user.uid);
          
          let otherUserData = {
            id: otherUserId,
            displayName: "User",
            photoURL: null,
          };
          
          try {
            const userDocRef = doc(firestore, "users", otherUserId);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
              otherUserData = {
                id: otherUserId,
                displayName: userDocSnap.data().displayName || "User",
                photoURL: userDocSnap.data().photoURL || null,
              };
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
          
          return {
            id: docSnap.id,
            participants: conversationData.participants,
            lastMessage: conversationData.lastMessage || "",
            lastMessageTime: conversationData.lastMessageTime,
            unreadCount: conversationData.unreadCount || 0,
            otherUser: otherUserData,
          } as Conversation;
        });
        
        const conversationsData = await Promise.all(conversationsPromises);
        setConversations(conversationsData);
        
        // If we have conversations, set the first one as active
        if (conversationsData.length > 0 && !activeConversation) {
          setActiveConversation(conversationsData[0].id);
          setActiveUser(conversationsData[0].otherUser);
          fetchMessages(conversationsData[0].id);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast({
          title: "Error",
          description: "Failed to load conversations",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, toast, activeConversation]);

  useEffect(() => {
    // Scroll to the bottom of the messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async (conversationId: string) => {
    try {
      const messagesQuery = query(
        collection(firestore, "messages"),
        where("conversationId", "==", conversationId),
        orderBy("timestamp", "asc"),
        limit(100)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      const messagesData = messagesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      
      setMessages(messagesData);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeConversation || !auth.currentUser) return;
    
    try {
      const messageData = {
        conversationId: activeConversation,
        senderId: auth.currentUser.uid,
        receiverId: activeUser.id,
        text: newMessage,
        timestamp: serverTimestamp(),
        read: false,
      };
      
      // In a real app, this would add the message to Firestore
      // and update the conversation's lastMessage and lastMessageTime
      
      // For now, just update the local state to show immediate feedback
      const newMessageObj = {
        id: `temp-${Date.now()}`,
        ...messageData,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, newMessageObj]);
      setNewMessage("");
      
      // Update the conversation in the list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversation
            ? {
                ...conv,
                lastMessage: newMessage,
                lastMessageTime: new Date(),
              }
            : conv
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (conversation) {
      setActiveConversation(conversationId);
      setActiveUser(conversation.otherUser);
      fetchMessages(conversationId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="glass-card p-6 h-96 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 bg-background">
      <div className="container mx-auto">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card overflow-hidden"
          >
            <div className="flex h-[calc(80vh-160px)] max-h-[700px]">
              {/* Conversations Sidebar */}
              <div className="w-full md:w-1/3 border-r border-secondary/20 flex flex-col">
                <div className="p-4 border-b border-secondary/20">
                  <h2 className="text-xl font-bold">Messages</h2>
                </div>
                
                <ScrollArea className="flex-1">
                  {conversations.length > 0 ? (
                    <div className="py-2">
                      {conversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          onClick={() => handleConversationSelect(conversation.id)}
                          className={`p-3 hover:bg-secondary/10 cursor-pointer ${
                            activeConversation === conversation.id
                              ? "bg-secondary/20"
                              : ""
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-sigma-blue/20 flex items-center justify-center text-sigma-blue font-bold">
                              {conversation.otherUser?.displayName?.charAt(0) || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <p className="font-medium truncate">
                                  {conversation.otherUser?.displayName || "User"}
                                </p>
                                {conversation.lastMessageTime && (
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(conversation.lastMessageTime?.toDate()).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {conversation.lastMessage || "No messages yet"}
                              </p>
                            </div>
                            {conversation.unreadCount > 0 && (
                              <div className="min-w-[20px] h-5 rounded-full bg-sigma-purple text-white text-xs flex items-center justify-center">
                                {conversation.unreadCount}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      <p>No conversations yet</p>
                      <p className="text-sm mt-2">
                        Connect with other professionals to start messaging
                      </p>
                      <Button
                        onClick={() => navigate("/network")}
                        variant="outline"
                        className="mt-4"
                      >
                        Find Connections
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </div>
              
              {/* Messages Area */}
              <div className="hidden md:flex flex-col flex-1">
                {activeConversation ? (
                  <>
                    {/* Message Header */}
                    <div className="p-4 border-b border-secondary/20 flex items-center">
                      <div className="w-10 h-10 rounded-full bg-sigma-blue/20 flex items-center justify-center text-sigma-blue font-bold mr-3">
                        {activeUser?.displayName?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-medium">
                          {activeUser?.displayName || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activeUser?.headline || "SiGMA Hub Member"}
                        </p>
                      </div>
                    </div>
                    
                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.length > 0 ? (
                          messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.senderId === auth.currentUser?.uid
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[70%] px-4 py-2 rounded-lg ${
                                  message.senderId === auth.currentUser?.uid
                                    ? "bg-sigma-blue text-white"
                                    : "bg-secondary/50"
                                }`}
                              >
                                <p>{message.text}</p>
                                <p className="text-xs opacity-70 text-right mt-1">
                                  {message.timestamp instanceof Date 
                                    ? message.timestamp.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "Sending..."}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground">
                            <p>No messages yet</p>
                            <p className="text-sm mt-1">
                              Send a message to start the conversation
                            </p>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                    
                    {/* Message Input */}
                    <form
                      onSubmit={handleSendMessage}
                      className="p-4 border-t border-secondary/20 flex space-x-2"
                    >
                      <Input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white"
                      >
                        Send
                      </Button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <p className="text-lg font-medium">Select a conversation</p>
                      <p className="text-sm mt-2">
                        Choose a conversation from the sidebar to start messaging
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Message Placeholder */}
              <div className="flex md:hidden flex-1 items-center justify-center">
                <div className="text-center text-muted-foreground p-4">
                  <p className="text-lg font-medium">Your Messages</p>
                  <p className="text-sm mt-2">
                    Select a conversation to view on a larger screen
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
