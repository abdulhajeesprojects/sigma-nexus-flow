import { Message } from '@/types/message';
import { saveMessage, getMessages } from '@/services/localStorage';
import { pusher } from '@/lib/pusher';

// Subscribe to messages in a conversation
export const subscribeToMessages = (
  conversationId: string,
  currentUserId: string,
  onNewMessage: (message: Message) => void,
  onMessageRead: (messageId: string) => void,
  onConversationUpdate: (message: Message) => void
) => {
  // Subscribe to the conversation channel
  const channel = pusher.subscribe(`presence-conversation-${conversationId}`);
  
  // Listen for new messages
  channel.bind('client-new-message', (message: Message) => {
    // Save message to local storage
    saveMessage(conversationId, message);
    
    // Update conversation if we're the receiver
    if (message.receiverId === currentUserId) {
      onConversationUpdate(message);
    }
    
    // Call the callback
    onNewMessage(message);
  });

  // Listen for message read events
  channel.bind('message-read', ({ messageId }: { messageId: string }) => {
    onMessageRead(messageId);
  });

  return () => {
    channel.unbind_all();
    pusher.unsubscribe(`presence-conversation-${conversationId}`);
  };
};

// Subscribe to user's conversations
export const subscribeToUserConversations = (
  userId: string,
  onNewConversation: (conversation: any) => void
) => {
  const channel = pusher.subscribe(`presence-user-${userId}`);
  
  channel.bind('new-conversation', onNewConversation);

  return () => {
    channel.unbind_all();
    pusher.unsubscribe(`presence-user-${userId}`);
  };
};

// Send a new message
export const sendMessage = async (
  conversationId: string,
  message: Omit<Message, 'id' | 'timestamp' | 'read'>
): Promise<Message> => {
  try {
    // Create a new message with metadata
    const newMessage: Message = {
      id: Date.now().toString(),
      conversationId,
      ...message,
      timestamp: new Date(),
      read: false
    };

    // Save message to local storage
    saveMessage(conversationId, newMessage);

    // Trigger Pusher event
    const channel = pusher.channel(`presence-conversation-${conversationId}`);
    if (channel) {
      await channel.trigger('client-new-message', newMessage);
    }

    return newMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}; 