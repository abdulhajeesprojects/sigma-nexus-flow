import { Conversation } from '@/types/conversation';

// Get or create a conversation between two users
export const getOrCreateConversation = async (
  currentUserId: string,
  otherUserId: string
): Promise<Conversation> => {
  // For now, create a simple conversation ID by combining user IDs
  const conversationId = [currentUserId, otherUserId].sort().join('-');
  
  return {
    id: conversationId,
    participants: [currentUserId, otherUserId],
    lastMessage: '',
    lastMessageTime: new Date(),
    unreadCount: 0,
    otherUser: {
      id: otherUserId,
      displayName: 'User',
      photoURL: null,
      headline: 'SiGMA Hub Member'
    }
  };
};

// Get user details
export const getUserDetails = async (userId: string) => {
  // For now, return basic user details
  return {
    id: userId,
    displayName: 'User',
    photoURL: null,
    headline: 'SiGMA Hub Member'
  };
}; 