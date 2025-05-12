import Pusher from 'pusher-js';

// Initialize Pusher with hardcoded credentials
export const pusher = new Pusher('85a86b13a7f1b409249e', {
  cluster: 'ap2',
  enabledTransports: ['ws', 'wss'],
  forceTLS: true
});

// Helper function to subscribe to a conversation channel
export const subscribeToConversation = (
  conversationId: string,
  onMessage: (message: any) => void,
  onRead: (messageId: string) => void
) => {
  const channel = pusher.subscribe(`conversation-${conversationId}`);
  
  channel.bind('client-new-message', onMessage);
  channel.bind('message-read', onRead);

  return () => {
    channel.unbind('client-new-message', onMessage);
    channel.unbind('message-read', onRead);
    pusher.unsubscribe(`conversation-${conversationId}`);
  };
};

// Helper function to subscribe to user's conversations
export const subscribeToUser = (
  userId: string,
  onNewConversation: (conversation: any) => void
) => {
  const channel = pusher.subscribe(`user-${userId}`);
  
  channel.bind('new-conversation', onNewConversation);

  return () => {
    channel.unbind('new-conversation', onNewConversation);
    pusher.unsubscribe(`user-${userId}`);
  };
}; 