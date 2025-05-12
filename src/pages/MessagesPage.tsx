
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { getOrCreateConversation, sendMessage } from "@/services/firestore";
import { getAvatarForUser } from "@/services/avatars";
import { toast } from "sonner";
import { format } from 'date-fns';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
  getDoc, // Added the missing import for getDoc
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase";
import { Message } from "@/types/message";
import { Conversation } from "@/types/conversation";
import { getConversations, saveConversations, saveMessage, getMessages, syncMessages } from "@/services/localStorage";
import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';

const MessageBubble = ({ message, isOwnMessage }: { message: Message; isOwnMessage: boolean }) => {
  const formattedTime = format(new Date(message.timestamp), 'h:mm a');

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`rounded-xl px-4 py-2 ${isOwnMessage ? 'bg-sigma-blue text-white' : 'bg-gray-100 text-gray-800'}`}>
        <p className="text-sm">{message.text}</p>
        <p className="text-xs text-right">{formattedTime}</p>
      </div>
    </div>
  );
};

const ConversationItem = ({ conversation, currentUserId, onSelect }: {
  conversation: Conversation;
  currentUserId: string;
  onSelect: (conversationId: string) => void;
}) => {
  const otherUser = conversation.otherUser;
  const avatarUrl = getAvatarForUser(otherUser.id, 'professional', 'male'); // Customize as needed

  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary transition-colors w-full"
    >
      <Avatar>
        <AvatarImage src={avatarUrl} alt={otherUser.displayName} />
        <AvatarFallback>{otherUser.displayName.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{otherUser.displayName}</p>
        <p className="text-sm text-muted-foreground">{conversation.lastMessage}</p>
      </div>
    </button>
  );
};

const MessagesPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fix the auth reference
    const checkAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/auth");
      }
    });

    return () => checkAuth();
  }, [navigate]);

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchInitialConversation = async () => {
      const userId = searchParams.get('user');
      if (userId && currentUser) {
        try {
          const conversation = await getOrCreateConversation(currentUser.uid, userId);
          setSelectedConversationId(conversation.id);
        } catch (error) {
          console.error("Error fetching or creating conversation:", error);
          toast("Failed to load conversation");
        }
      }
    };

    fetchInitialConversation();
  }, [searchParams, currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    // Load conversations from local storage
    const loadConversationsFromLocalStorage = () => {
      // Convert conversations from localStorage to match the required type
      const conversationsList = getConversations();
      setConversations(conversationsList.map(conv => ({
        ...conv,
        lastMessage: conv.lastMessage || "",
        lastMessageTime: conv.lastMessageTime ? new Date(conv.lastMessageTime) : new Date(),
        unreadCount: conv.unreadCount || 0
      })));
    };

    loadConversationsFromLocalStorage();

    // Set up Firestore listener for conversations
    const conversationsQuery = query(
      collection(firestore, "conversations"),
      where("participants", "array-contains", currentUser.uid),
      orderBy("lastMessageTime", "desc")
    );

    const unsubscribeConversations = onSnapshot(conversationsQuery, (snapshot) => {
      const updatedConversations: Conversation[] = snapshot.docs.map(doc => {
        const data = doc.data();
        const otherUserId = data.participants.find(uid => uid !== currentUser.uid);

        return {
          id: doc.id,
          participants: data.participants,
          lastMessage: data.lastMessage,
          lastMessageTime: data.lastMessageTime?.toDate(),
          unreadCount: 0, // You might want to calculate this based on messages
          otherUser: {
            id: otherUserId,
            displayName: '',
            photoURL: null,
            headline: '',
            isOnline: false,
          },
        };
      });

      // Fetch other user details and update conversations
      Promise.all(
        updatedConversations.map(async (conversation) => {
          const otherUserId = conversation.participants.find(uid => uid !== currentUser.uid);
          if (!otherUserId) return conversation;
          
          // Fixed: Use correctly imported getDoc for document references
          const userDocRef = doc(firestore, "users", otherUserId);
          const userDocSnap = await getDoc(userDocRef);
          const userData = userDocSnap.exists() ? userDocSnap.data() : null;

          return {
            ...conversation,
            otherUser: {
              id: otherUserId,
              displayName: userData?.displayName || 'Unknown User',
              photoURL: userData?.photoURL || null,
              headline: userData?.headline || '',
              isOnline: false,
            },
          };
        })
      ).then(conversationsWithUserDetails => {
        setConversations(conversationsWithUserDetails);
        saveConversations(conversationsWithUserDetails);
        setLoading(false);
      });
    }, (error) => {
      console.error("Error fetching conversations:", error);
      toast("Failed to load conversations");
      setLoading(false);
    });

    return () => {
      unsubscribeConversations();
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !selectedConversationId) return;

    // Load messages from local storage
    const loadMessagesFromLocalStorage = () => {
      const storedMessages = getMessages(selectedConversationId);
      setMessages(storedMessages);
    };

    loadMessagesFromLocalStorage();

    // Fix firestore collection reference
    const messagesQuery = query(
      collection(firestore, "messages"),
      where("conversationId", "==", selectedConversationId),
      orderBy("timestamp", "asc")
    );

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const firebaseMessages: Message[] = snapshot.docs.map(doc => ({
        id: doc.id,
        conversationId: doc.data().conversationId,
        senderId: doc.data().senderId,
        receiverId: doc.data().receiverId,
        text: doc.data().text,
        timestamp: doc.data().timestamp?.toDate(),
        read: doc.data().read,
      }));

      // Sync messages with local storage
      const mergedMessages = syncMessages(selectedConversationId, firebaseMessages);
      setMessages(mergedMessages);
    }, (error) => {
      console.error("Error fetching messages:", error);
      toast("Failed to load messages");
    });

    // Fix markMessagesAsRead function
    const markMessagesAsRead = async (conversationId: string, senderId: string) => {
      try {
        const batch = writeBatch(firestore);
        const messagesQuery = query(
          collection(firestore, "messages"),
          where("conversationId", "==", conversationId),
          where("senderId", "==", senderId),
          where("read", "==", false)
        );
    
        const messagesSnapshot = await getDocs(messagesQuery);
    
        messagesSnapshot.docs.forEach(docSnapshot => {
          const messageRef = doc(firestore, "messages", docSnapshot.id);
          batch.update(messageRef, { read: true });
        });
    
        await batch.commit();
    
        // Update local state
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.senderId === senderId ? { ...msg, read: true } : msg
          )
        );
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    markMessagesAsRead(selectedConversationId, currentUser.uid);

    return () => {
      unsubscribeMessages();
    };
  }, [currentUser, selectedConversationId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !selectedConversationId) return;

    setSending(true);
    try {
      // Find the receiverId
      const conversation = conversations.find(conv => conv.id === selectedConversationId);
      const receiverId = conversation?.participants.find(uid => uid !== currentUser.uid);

      if (!receiverId) {
        console.error("Receiver ID not found");
        toast("Could not find receiver");
        return;
      }

      const messageResult = await sendMessage(selectedConversationId, currentUser.uid, receiverId, newMessage);

      if (messageResult?.messageId) {
        // Optimistically update local state
        const tempMessage: Message = {
          id: messageResult.messageId,
          conversationId: selectedConversationId,
          senderId: currentUser.uid,
          receiverId: receiverId,
          text: newMessage,
          timestamp: new Date(),
          read: false,
        };

        setMessages(prevMessages => [...prevMessages, tempMessage]);
        saveMessage(selectedConversationId, tempMessage);

        setNewMessage('');
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const batch = writeBatch(firestore);
      const conversationRef = doc(firestore, "conversations", conversationId);
      batch.delete(conversationRef);
  
      // Delete messages related to the conversation
      const messagesQuery = query(
        collection(firestore, "messages"),
        where("conversationId", "==", conversationId)
      );
  
      const messagesSnapshot = await getDocs(messagesQuery);
      messagesSnapshot.forEach(docSnapshot => {
        // Fixed: Create a document reference instead of trying to call the snapshot
        const messageRef = doc(firestore, "messages", docSnapshot.id);
        batch.delete(messageRef);
      });
  
      await batch.commit();
  
      // Update local state
      setConversations(prevConversations =>
        prevConversations.filter(conversation => conversation.id !== conversationId)
      );
      setSelectedConversationId(null);
      setMessages([]);
  
      toast("The conversation has been successfully deleted.");
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast("Failed to delete the conversation.");
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 bg-background">
      <div className="container mx-auto flex flex-col md:flex-row h-[80vh]">
        {/* Conversations List */}
        <div className="w-full md:w-1/3 lg:w-1/4 p-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card h-full rounded-lg"
          >
            <h2 className="text-xl font-bold mb-4 p-4">Conversations</h2>
            <ScrollArea className="h-[70vh]">
              {loading ? (
                <div className="animate-pulse p-4">Loading conversations...</div>
              ) : (
                conversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    currentUserId={currentUser?.uid || ''}
                    onSelect={setSelectedConversationId}
                  />
                ))
              )}
            </ScrollArea>
          </motion.div>
        </div>

        {/* Messages Area */}
        <div className="w-full md:w-2/3 lg:w-3/4 p-4 flex flex-col">
          {selectedConversationId ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col h-full glass-card rounded-lg"
            >
              {/* Messages Display */}
              <div className="flex-1 p-4">
                <ScrollArea className="h-[55vh]">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwnMessage={message.senderId === currentUser?.uid}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </ScrollArea>
              </div>

              {/* Message Input */}
              <div className="p-4 flex items-center border-t">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 rounded-l-md"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={sending}
                  className="rounded-r-md bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white"
                >
                  {sending ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div> : <Send className="h-4 w-4 mr-2" />}
                  Send
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center h-full glass-card rounded-lg"
            >
              <p className="text-muted-foreground">Select a conversation to view messages</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
