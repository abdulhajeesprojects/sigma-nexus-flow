
export interface Message {
  id: string;
  conversationId?: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
  read: boolean;
  status?: 'sent' | 'delivered' | 'read';
  reactions?: Record<string, string>;
  replyTo?: Message;
}
