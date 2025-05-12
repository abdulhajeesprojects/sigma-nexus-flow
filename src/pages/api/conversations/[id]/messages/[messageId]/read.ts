import { NextApiRequest, NextApiResponse } from 'next';
import { triggerMessageRead } from '@/lib/pusher-server';
import { updateMessageReadStatus } from '@/utils/messageStorage';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { id: conversationId, messageId } = req.query;

      // Update message read status in localStorage
      updateMessageReadStatus(conversationId as string, messageId as string);

      // Trigger Pusher event
      await triggerMessageRead(conversationId as string, messageId as string);

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error marking message as read:', error);
      res.status(500).json({ error: 'Failed to mark message as read' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 