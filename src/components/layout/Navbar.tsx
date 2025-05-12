
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import NotificationBell from '@/components/notifications/NotificationBell';
import { GlassCard } from '@/components/ui/glass-card';
import { Settings } from 'lucide-react';

const NavbarActions = () => {
  const { currentUser } = useAuth();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl bg-gradient-to-r from-sigma-blue to-sigma-purple bg-clip-text text-transparent">SiGMA Hub</span>
          </Link>
          
          {currentUser ? (
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/feed" className="text-foreground/80 hover:text-foreground transition-colors">Feed</Link>
                <Link to="/network" className="text-foreground/80 hover:text-foreground transition-colors">Network</Link>
                <Link to="/messages" className="text-foreground/80 hover:text-foreground transition-colors">Messages</Link>
                <Link to="/jobs" className="text-foreground/80 hover:text-foreground transition-colors">Jobs</Link>
              </div>
              
              <div className="flex items-center space-x-2">
                <NotificationBell />
                <Link to="/settings" className="p-2 rounded-full hover:bg-secondary transition-colors">
                  <Settings className="h-5 w-5" />
                </Link>
                <Link to="/profile" className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-sigma-purple/20 flex items-center justify-center text-sm font-medium text-sigma-purple">
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt={currentUser.displayName || ""} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      currentUser.displayName?.charAt(0) || "U"
                    )}
                  </div>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/auth" className="px-4 py-2 rounded-full bg-sigma-purple text-white hover:bg-sigma-blue transition-colors">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavbarActions;
