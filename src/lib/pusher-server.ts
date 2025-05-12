import Pusher from 'pusher';

// Initialize Pusher server
const pusher = new Pusher({
  appId: '1798037',
  key: '85a86b13a7f1b409249e',
  secret: 'c0c0c0c0c0c0c0c0c0c0',
  cluster: 'ap2',
  useTLS: true
});

// Helper function to trigger new message event
export const triggerNewMessage = async (conversationId: string, message: any) => {
  await pusher.trigger(`conversation-${conversationId}`, 'new-message', message);
};

// Helper function to trigger message read event
export const triggerMessageRead = async (conversationId: string, messageId: string) => {
  await pusher.trigger(`conversation-${conversationId}`, 'message-read', { messageId });
};

// Helper function to trigger new conversation event
export const triggerNewConversation = async (userId: string, conversation: any) => {
  await pusher.trigger(`user-${userId}`, 'new-conversation', conversation);
}; 