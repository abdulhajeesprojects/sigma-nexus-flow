import { Message } from "@/types/message";

const MESSAGE_STORAGE_KEY = 'sigma_messages';
const CONVERSATIONS_STORAGE_KEY = 'sigma_conversations';
const MAX_MESSAGES_PER_CHAT = 100; // Store more messages locally for better UX
const MAX_MESSAGES_IN_FIREBASE = 5; // Only sync last 5 messages to Firebase

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: Date | string;
  unreadCount?: number;
  otherUser: {
    id: string;
    displayName: string;
    photoURL: string | null;
    headline: string;
    isOnline?: boolean;
  };
}

export const saveMessage = (conversationId: string, message: Message) => {
  try {
    // Get existing messages
    const existingData = localStorage.getItem(MESSAGE_STORAGE_KEY);
    const allMessages = existingData ? JSON.parse(existingData) : {};
    
    // Initialize conversation array if it doesn't exist
    if (!allMessages[conversationId]) {
      allMessages[conversationId] = [];
    }
    
    // Add new message
    allMessages[conversationId].push(message);
    
    // Keep only the last MAX_MESSAGES_PER_CHAT messages in local storage
    if (allMessages[conversationId].length > MAX_MESSAGES_PER_CHAT) {
      allMessages[conversationId] = allMessages[conversationId].slice(-MAX_MESSAGES_PER_CHAT);
    }
    
    // Save back to localStorage
    localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(allMessages));
    
    return true;
  } catch (error) {
    console.error('Error saving message to localStorage:', error);
    return false;
  }
};

export const getMessages = (conversationId: string): Message[] => {
  try {
    const data = localStorage.getItem(MESSAGE_STORAGE_KEY);
    const allMessages = data ? JSON.parse(data) : {};
    return allMessages[conversationId] || [];
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

export const getLastMessages = (conversationId: string, count: number = MAX_MESSAGES_IN_FIREBASE): Message[] => {
  const messages = getMessages(conversationId);
  return messages.slice(-count);
};

export const clearMessages = (conversationId: string) => {
  try {
    const existingData = localStorage.getItem(MESSAGE_STORAGE_KEY);
    if (!existingData) return;
    
    const allMessages = JSON.parse(existingData);
    delete allMessages[conversationId];
    
    localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(allMessages));
  } catch (error) {
    console.error('Error clearing messages from localStorage:', error);
  }
};

export const syncMessages = (conversationId: string, firebaseMessages: Message[]) => {
  try {
    const localMessages = getMessages(conversationId);
    const existingData = localStorage.getItem(MESSAGE_STORAGE_KEY);
    const allMessages = existingData ? JSON.parse(existingData) : {};
    
    // Merge Firebase messages with local messages
    const mergedMessages = [...localMessages];
    
    firebaseMessages.forEach(fbMessage => {
      const existingIndex = mergedMessages.findIndex(msg => msg.id === fbMessage.id);
      if (existingIndex === -1) {
        mergedMessages.push(fbMessage);
      }
    });
    
    // Sort messages by timestamp
    mergedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Update local storage
    allMessages[conversationId] = mergedMessages.slice(-MAX_MESSAGES_PER_CHAT);
    localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(allMessages));
    
    return mergedMessages;
  } catch (error) {
    console.error('Error syncing messages:', error);
    return getMessages(conversationId);
  }
};

// Conversation storage functions
export const saveConversation = (conversation: {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  otherUser: {
    id: string;
    displayName: string;
    photoURL: string | null;
    headline: string;
    isOnline?: boolean;
  };
}) => {
  try {
    const existingData = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
    const conversations = existingData ? JSON.parse(existingData) : {};
    
    conversations[conversation.id] = conversation;
    localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
    
    return true;
  } catch (error) {
    console.error('Error saving conversation to localStorage:', error);
    return false;
  }
};

export const getConversations = (): Conversation[] => {
  try {
    const data = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
};

export const updateConversation = (conversationId: string, updates: Partial<{
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}>) => {
  try {
    const existingData = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
    if (!existingData) return false;
    
    const conversations = JSON.parse(existingData);
    if (!conversations[conversationId]) return false;
    
    conversations[conversationId] = {
      ...conversations[conversationId],
      ...updates
    };
    
    localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
    return true;
  } catch (error) {
    console.error('Error updating conversation in localStorage:', error);
    return false;
  }
};

export const saveMessages = (conversationId: string, messages: Message[]) => {
  try {
    const existingData = localStorage.getItem(MESSAGE_STORAGE_KEY);
    const allMessages = existingData ? JSON.parse(existingData) : {};
    allMessages[conversationId] = messages;
    localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(allMessages));
  } catch (error) {
    console.error('Error saving messages:', error);
  }
};

export const saveConversations = (conversations: Conversation[]) => {
  try {
    localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Error saving conversations:', error);
  }
};
