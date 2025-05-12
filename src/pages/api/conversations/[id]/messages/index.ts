import { NextApiRequest, NextApiResponse } from 'next';
import { triggerNewMessage } from '@/lib/pusher-server';
import { Message } from '@/types/message';
import { getMessages, saveMessage, updateConversationLastMessage } from '@/utils/messageStorage';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { id: conversationId } = req.query;
      const messages = getMessages(conversationId as string);
      res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  } else if (req.method === 'POST') {
    try {
      const { id: conversationId } = req.query;
      const message = req.body;

      // Add message metadata
      const newMessage: Message = {
        id: Date.now().toString(),
        conversationId: conversationId as string,
        senderId: message.senderId,
        receiverId: message.receiverId,
        text: message.text,
        timestamp: new Date(),
        read: false
      };

      // Save message to localStorage
      saveMessage(conversationId as string, newMessage);
      updateConversationLastMessage(conversationId as string, newMessage);

      // Trigger Pusher event
      await triggerNewMessage(conversationId as string, newMessage);

      res.status(200).json(newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 