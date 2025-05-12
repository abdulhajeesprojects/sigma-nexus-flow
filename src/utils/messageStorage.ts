import { Message } from '@/types/message';

// Get all messages for a conversation
export const getMessages = (conversationId: string): Message[] => {
  if (typeof window === 'undefined') return [];
  const messages = localStorage.getItem(`messages_${conversationId}`);
  return messages ? JSON.parse(messages) : [];
};

// Save a new message
export const saveMessage = (conversationId: string, message: Message) => {
  if (typeof window === 'undefined') return;
  const messages = getMessages(conversationId);
  messages.push(message);
  localStorage.setItem(`messages_${conversationId}`, JSON.stringify(messages));
};

// Update message read status
export const updateMessageReadStatus = (conversationId: string, messageId: string) => {
  if (typeof window === 'undefined') return;
  const messages = getMessages(conversationId);
  const updatedMessages = messages.map(msg => 
    msg.id === messageId ? { ...msg, read: true } : msg
  );
  localStorage.setItem(`messages_${conversationId}`, JSON.stringify(updatedMessages));
};

// Get all conversations
export const getConversations = () => {
  if (typeof window === 'undefined') return [];
  const conversations = localStorage.getItem('conversations');
  return conversations ? JSON.parse(conversations) : [];
};

// Save a new conversation
export const saveConversation = (conversation: any) => {
  if (typeof window === 'undefined') return;
  const conversations = getConversations();
  conversations.push(conversation);
  localStorage.setItem('conversations', JSON.stringify(conversations));
};

// Update conversation last message
export const updateConversationLastMessage = (conversationId: string, message: Message) => {
  if (typeof window === 'undefined') return;
  const conversations = getConversations();
  const updatedConversations = conversations.map(conv => 
    conv.id === conversationId 
      ? { 
          ...conv, 
          lastMessage: message.text,
          lastMessageTime: message.timestamp,
          unreadCount: message.senderId === conv.otherUser.id ? conv.unreadCount + 1 : 0
        }
      : conv
  );
  localStorage.setItem('conversations', JSON.stringify(updatedConversations));
}; 