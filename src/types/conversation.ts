
export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  otherUser: {
    id: string;
    displayName: string;
    photoURL: string | null;
    headline: string;
    isOnline?: boolean;
  };
}
