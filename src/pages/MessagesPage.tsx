
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/types/message";
import { Conversation } from "@/types/conversation";
import { getMessages, getConversations, saveMessages, saveConversations } from "@/services/localStorage";
import { UserSearch } from '@/components/messages/UserSearch';
import { Check, CheckCheck, Search, Send, MoreVertical, Paperclip, Smile, X, Reply, ThumbsUp } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from '@/contexts/AuthContext';
import Pusher from 'pusher-js';
import ChannelSubscription from '@/components/messages/ChannelSubscription';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GlassCard } from "@/components/ui/glass-card";
import { writeBatch, doc, collection, addDoc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

gsap.registerPlugin(ScrollTrigger);

// Initialize Pusher
const pusherInstance = new Pusher('85a86b13a7f1b409249e', {
  cluster: 'ap2',
  enabledTransports: ['ws', 'wss'],
  forceTLS: true
});

// Store the instance globally
if (typeof window !== 'undefined') {
  (window as any).pusher = pusherInstance;
}

const MessagesPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();

  // Load conversations and messages from localStorage
  useEffect(() => {
    if (currentUser) {
      const savedConversations = getConversations();
      setConversations(savedConversations);
      setIsLoading(false);
    }
  }, [currentUser]);

  // Load messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      const savedMessages = getMessages(selectedConversation.id);
      setMessages(savedMessages);
    }
  }, [selectedConversation]);

  // Subscribe to messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      try {
        const channel = pusherInstance.subscribe(selectedConversation.id);
        channel.bind('client-new-message', (data: Message) => {
          const updatedMessages = [...messages, data];
          setMessages(updatedMessages);
          
          // Update conversation list with new message
          const updatedConversations = conversations.map(conv => 
            conv.id === selectedConversation.id 
              ? { ...conv, lastMessage: data.text, lastMessageTime: data.timestamp.toISOString() }
              : conv
          ) as Conversation[];
          setConversations(updatedConversations);
          
          // Save updated messages to localStorage
          saveMessages(selectedConversation.id, updatedMessages);
          saveConversations(updatedConversations);
        });

        return () => {
          channel.unbind_all();
          pusherInstance.unsubscribe(selectedConversation.id);
        };
      } catch (error) {
        console.error('Error subscribing to channel:', error);
        toast({
          title: "Error",
          description: "Failed to subscribe to channel",
          variant: "destructive",
        });
      }
    }
  }, [selectedConversation?.id, messages, conversations]);

  // Add typing indicator
  useEffect(() => {
    if (selectedConversation) {
      const channel = pusherInstance.subscribe(selectedConversation.id);
      channel.bind('client-typing', (data: { userId: string, isTyping: boolean }) => {
        if (data.userId !== currentUser?.uid) {
          setIsTyping(data.isTyping);
        }
      });

      return () => {
        channel.unbind_all();
        pusherInstance.unsubscribe(selectedConversation.id);
      };
    }
  }, [selectedConversation?.id, currentUser?.uid]);

  // Handle typing indicator
  const handleTyping = (isTyping: boolean) => {
    if (selectedConversation) {
      const channel = pusherInstance.channel(selectedConversation.id);
      channel.trigger('client-typing', { userId: currentUser?.uid, isTyping });
    }
  };

  // Handle message reaction
  const handleReaction = (messageId: string, reaction: string) => {
    const updatedMessages = messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, reactions: { ...msg.reactions, [currentUser?.uid || '']: reaction } }
        : msg
    );
    setMessages(updatedMessages);
    if (selectedConversation) {
      saveMessages(selectedConversation.id, updatedMessages);
    }
  };

  // Handle message reply
  const handleReply = (message: Message) => {
    setReplyTo(message);
  };

  // Handle message search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = messages.filter(msg => 
        msg.text.toLowerCase().includes(query.toLowerCase())
      );
      setMessages(filtered);
    } else {
      // Reset to original messages when search is cleared
      if (selectedConversation) {
        const savedMessages = getMessages(selectedConversation.id);
        setMessages(savedMessages);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    try {
      const message: Message = {
        id: Date.now().toString(),
        conversationId: selectedConversation.id,
        senderId: currentUser.uid,
        receiverId: selectedConversation.participants.find(p => p !== currentUser.uid) || '',
        text: newMessage,
        timestamp: new Date(),
        read: false
      };

      // Instead of using batch which doesn't exist directly on firestore, use writeBatch
      const batch = writeBatch(firestore);
      
      // Create the message
      const messageRef = doc(collection(firestore, "messages"));
      batch.set(messageRef, {
        conversationId: message.conversationId,
        senderId: message.senderId,
        receiverId: message.receiverId,
        text: message.text,
        read: false,
        timestamp: serverTimestamp()
      });
      
      // Update the conversation
      if (selectedConversation.id.startsWith('conversation-')) {
        // This is a local conversation, create it in Firestore first
        const conversationRef = doc(collection(firestore, "conversations"));
        batch.set(conversationRef, {
          participants: selectedConversation.participants,
          lastMessage: message.text,
          lastMessageTime: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        // Update the local conversation ID
        message.conversationId = conversationRef.id;
      } else {
        // Update existing conversation
        const conversationRef = doc(firestore, "conversations", selectedConversation.id);
        batch.update(conversationRef, {
          lastMessage: message.text,
          lastMessageTime: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      // Commit the batch
      await batch.commit();

      // Send message through Pusher
      const channel = pusherInstance.channel(selectedConversation.id);
      if (!channel) {
        throw new Error('Channel not found');
      }
      channel.trigger('client-new-message', message);

      // Update local state
      const updatedMessages = [...messages, message];
      setMessages(updatedMessages);
      setNewMessage('');

      // Update conversation list
      const updatedConversations = conversations.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, lastMessage: message.text, lastMessageTime: message.timestamp.toISOString() }
          : conv
      ) as Conversation[];
      setConversations(updatedConversations);

      // Save to localStorage
      saveMessages(selectedConversation.id, updatedMessages);
      saveConversations(updatedConversations);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleUserSelect = async (userId: string) => {
    // Find existing conversation with this user
    const existingConversation = conversations.find(conv => 
      conv.participants.includes(userId) && conv.participants.includes(currentUser?.uid || '')
    );

    if (existingConversation) {
      setSelectedConversation(existingConversation);
    } else {
      try {
        // Fetch user details
        const userDoc = await getDoc(doc(firestore, "users", userId));
        if (!userDoc.exists()) {
          throw new Error("User not found");
        }
        
        const userData = userDoc.data();
        
        // Create new conversation
        const newConversation: Conversation = {
          id: `conversation-${Date.now()}`,
          participants: [currentUser?.uid || '', userId],
          lastMessage: '',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          otherUser: {
            id: userId,
            displayName: userData.displayName || 'User',
            photoURL: userData.photoURL || null,
            headline: userData.headline || ''
          }
        };

        setConversations([...conversations, newConversation]);
        setSelectedConversation(newConversation);
        saveConversations([...conversations, newConversation]);
      } catch (error) {
        console.error('Error creating conversation:', error);
        toast({
          title: "Error",
          description: "Failed to create conversation",
          variant: "destructive",
        });
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please sign in to access messages</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex bg-[#111b21] mt-16">
      {/* Sidebar */}
      <div className="w-full md:w-[30%] bg-[#202c33] flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="h-16 p-4 bg-[#202c33] border-b border-[#374045]">
          <div className="flex items-center justify-between h-full">
            <h2 className="text-xl font-semibold text-white">Messages</h2>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-white" onClick={() => setShowSearch(!showSearch)}>
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>
          {showSearch && (
            <div className="mt-2">
              <Input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="bg-[#2a3942] border-none text-white placeholder:text-[#8696a0]"
              />
            </div>
          )}
          <div className="mt-2">
            <UserSearch onUserSelect={handleUserSelect} />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => {
                setSelectedConversation(conversation);
                setSearchQuery(''); // Clear search when selecting a conversation
                const savedMessages = getMessages(conversation.id);
                setMessages(savedMessages);
              }}
              className={`p-3 hover:bg-[#202c33] cursor-pointer transition-all duration-200 ${
                selectedConversation?.id === conversation.id
                  ? "bg-[#2a3942]"
                  : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-[#374045] flex items-center justify-center text-white overflow-hidden">
                    {conversation.otherUser?.photoURL ? (
                      <img 
                        src={conversation.otherUser.photoURL} 
                        alt={conversation.otherUser.displayName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      conversation.otherUser?.displayName?.charAt(0) || "U"
                    )}
                  </div>
                  {conversation.otherUser?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#202c33]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium truncate">
                      {conversation.otherUser?.displayName || "Unknown User"}
                    </h3>
                    <span className="text-xs text-[#8696a0]">
                      {conversation.lastMessageTime ? new Date(conversation.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-[#8696a0] truncate">
                    {conversation.lastMessage || "No messages yet"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Messages Area */}
      <div className={`hidden md:flex flex-1 flex-col bg-[#0b141a] h-[calc(100vh-4rem)] ${
        !selectedConversation ? "items-center justify-center" : ""
      }`}>
        {selectedConversation ? (
          <>
            {/* Message Header */}
            <div className="h-16 p-4 bg-[#202c33] border-b border-[#374045]">
              <div className="flex items-center justify-between h-full">
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-[#374045] flex items-center justify-center text-white mr-3 overflow-hidden">
                      {selectedConversation.otherUser?.photoURL ? (
                        <img 
                          src={selectedConversation.otherUser.photoURL} 
                          alt={selectedConversation.otherUser.displayName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        selectedConversation.otherUser?.displayName?.charAt(0) || "U"
                      )}
                    </div>
                    {selectedConversation.otherUser?.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#202c33]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">
                      {selectedConversation.otherUser?.displayName || "Unknown User"}
                    </h3>
                    <p className="text-sm text-[#8696a0]">
                      {isTyping ? "typing..." : selectedConversation.otherUser?.headline || "No headline"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white"
                    onClick={() => {
                      setShowSearch(!showSearch);
                      setSearchQuery('');
                    }}
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === currentUser.uid ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="max-w-[70%]">
                      {message.replyTo && (
                        <div className={`mb-1 p-2 rounded-lg ${
                          message.senderId === currentUser.uid
                            ? "bg-[#005c4b]/50"
                            : "bg-[#202c33]/50"
                        }`}>
                          <p className="text-sm text-[#8696a0]">
                            Replying to {message.replyTo.senderId === currentUser.uid ? "you" : selectedConversation.otherUser?.displayName}
                          </p>
                          <p className="text-sm truncate">{message.replyTo.text}</p>
                        </div>
                      )}
                      <div
                        className={`rounded-lg p-3 ${
                          message.senderId === currentUser.uid
                            ? "bg-[#005c4b] text-white"
                            : "bg-[#202c33] text-white"
                        }`}
                      >
                        <p>{message.text}</p>
                        <div className="flex items-center justify-end mt-1">
                          <span className="text-xs text-[#8696a0]">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.senderId === currentUser.uid && (
                            <span className="ml-1">
                              {message.status === 'read' ? (
                                <CheckCheck className="h-4 w-4 text-[#8696a0]" />
                              ) : message.status === 'delivered' ? (
                                <CheckCheck className="h-4 w-4 text-[#8696a0]" />
                              ) : message.status === 'sent' ? (
                                <Check className="h-4 w-4 text-[#8696a0]" />
                              ) : (
                                <span className="animate-spin">⌛</span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      {message.reactions && Object.keys(message.reactions).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(message.reactions).map(([userId, reaction]) => (
                            <TooltipProvider key={userId}>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant="secondary" className="text-xs">
                                    {reaction}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{userId === currentUser?.uid ? "You" : "Other user"}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-[#8696a0]"
                          onClick={() => handleReply(message)}
                        >
                          <Reply className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-[#8696a0]"
                          onClick={() => handleReaction(message.id, "👍")}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="h-16 p-4 bg-[#202c33]">
              {replyTo && (
                <div className="mb-2 p-2 bg-[#2a3942] rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8696a0]">
                      Replying to {replyTo.senderId === currentUser?.uid ? "you" : selectedConversation.otherUser?.displayName}
                    </p>
                    <p className="text-sm text-white truncate">{replyTo.text}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-[#8696a0]"
                    onClick={() => setReplyTo(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <Button type="button" variant="ghost" size="icon" className="text-[#8696a0]">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  type="text"
                  placeholder="Type a message"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping(e.target.value.length > 0);
                  }}
                  onFocus={() => handleTyping(true)}
                  onBlur={() => handleTyping(false)}
                  className="flex-1 bg-[#2a3942] border-none text-white placeholder:text-[#8696a0]"
                />
                <Button type="button" variant="ghost" size="icon" className="text-[#8696a0]">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button type="submit" size="icon" className="bg-[#00a884] text-white">
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="text-center text-[#8696a0] p-4">
            <GlassCard className="p-8">
              <h3 className="text-xl font-medium mb-4">Welcome to Messages</h3>
              <p>Select a conversation or start a new one</p>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;

