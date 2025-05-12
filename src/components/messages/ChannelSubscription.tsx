import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Pusher from 'pusher-js';

const CHANNEL_NAME = 'conversation-123';
const SUBSCRIPTION_KEY = 'sigma_subscribed_channels';

const ChannelSubscription = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  // Initialize Pusher and load subscription state
  useEffect(() => {
    // Load subscription state from localStorage
    const savedSubscriptions = localStorage.getItem(SUBSCRIPTION_KEY);
    const subscribedChannels = savedSubscriptions ? JSON.parse(savedSubscriptions) : [];
    setIsSubscribed(subscribedChannels.includes(CHANNEL_NAME));

    // Initialize Pusher
    const pusherInstance = new Pusher('85a86b13a7f1b409249e', {
      cluster: 'ap2',
      enabledTransports: ['ws', 'wss'],
      forceTLS: true
    });

    // Store the instance globally
    (window as any).pusher = pusherInstance;

    // If previously subscribed, resubscribe
    if (subscribedChannels.includes(CHANNEL_NAME)) {
      const channel = pusherInstance.subscribe(CHANNEL_NAME);
      channel.bind('client-new-message', handleNewMessage);
    }

    return () => {
      pusherInstance.disconnect();
    };
  }, []);

  const handleNewMessage = (data: any) => {
    console.log('New message received:', data);
    toast({
      title: "New Message",
      description: data.text,
    });
  };

  const handleSubscribe = () => {
    try {
      const pusherInstance = (window as any).pusher;
      if (!pusherInstance) {
        throw new Error('Pusher not initialized');
      }

      const channel = pusherInstance.subscribe(CHANNEL_NAME);
      channel.bind('client-new-message', handleNewMessage);
      
      // Save subscription to localStorage
      const savedSubscriptions = localStorage.getItem(SUBSCRIPTION_KEY);
      const subscribedChannels = savedSubscriptions ? JSON.parse(savedSubscriptions) : [];
      if (!subscribedChannels.includes(CHANNEL_NAME)) {
        subscribedChannels.push(CHANNEL_NAME);
        localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscribedChannels));
      }

      setIsSubscribed(true);
      toast({
        title: "Success",
        description: `Subscribed to channel: ${CHANNEL_NAME}`,
      });
    } catch (error) {
      console.error('Error subscribing to channel:', error);
      toast({
        title: "Error",
        description: "Failed to subscribe to channel",
        variant: "destructive",
      });
    }
  };

  const handleUnsubscribe = () => {
    try {
      const pusherInstance = (window as any).pusher;
      if (!pusherInstance) {
        throw new Error('Pusher not initialized');
      }

      pusherInstance.unsubscribe(CHANNEL_NAME);
      
      // Remove subscription from localStorage
      const savedSubscriptions = localStorage.getItem(SUBSCRIPTION_KEY);
      if (savedSubscriptions) {
        const subscribedChannels = JSON.parse(savedSubscriptions);
        const updatedChannels = subscribedChannels.filter((c: string) => c !== CHANNEL_NAME);
        localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(updatedChannels));
      }

      setIsSubscribed(false);
      toast({
        title: "Success",
        description: `Unsubscribed from channel: ${CHANNEL_NAME}`,
      });
    } catch (error) {
      console.error('Error unsubscribing from channel:', error);
      toast({
        title: "Error",
        description: "Failed to unsubscribe from channel",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 bg-[#202c33] rounded-lg">
      <h2 className="text-xl font-semibold text-white mb-4">Channel Subscription</h2>
      
      <div className="flex items-center justify-between p-2 bg-[#2a3942] rounded">
        <span className="text-white">{CHANNEL_NAME}</span>
        {isSubscribed ? (
          <Button
            onClick={handleUnsubscribe}
            variant="destructive"
            size="sm"
          >
            Unsubscribe
          </Button>
        ) : (
          <Button
            onClick={handleSubscribe}
            className="bg-[#00a884] hover:bg-[#00a884]/90 text-white"
            size="sm"
          >
            Subscribe
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChannelSubscription; 