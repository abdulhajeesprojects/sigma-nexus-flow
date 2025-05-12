import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/notifications/NotificationBell';
import { Settings, Info, DollarSign, Zap, Heart, Users2, FileText, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// Animated Logo Component
const AnimatedLogo = () => {
  return (
    <motion.div
      className="relative w-8 h-8"
      animate={{
        rotateZ: [0, 360],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{
          boxShadow: [
            "0 0 5px #3b82f6, 0 0 10px #3b82f6",
            "0 0 10px #3b82f6, 0 0 20px #3b82f6",
            "0 0 5px #3b82f6, 0 0 10px #3b82f6",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-full h-full text-sigma-blue"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </motion.div>
    </motion.div>
  );
};

const NavLinks = ({ className = "" }) => {
  return (
    <div className={`flex items-center space-x-6 ${className}`}>
      <Link to="/feed" className="text-foreground/80 hover:text-foreground transition-colors">Feed</Link>
      <Link to="/network" className="text-foreground/80 hover:text-foreground transition-colors">Network</Link>
      <Link to="/messages" className="text-foreground/80 hover:text-foreground transition-colors">Messages</Link>
      <Link to="/jobs" className="text-foreground/80 hover:text-foreground transition-colors">Jobs</Link>
      <Link to="/features" className="text-foreground/80 hover:text-foreground transition-colors">Features</Link>
      <Link to="/about" className="text-foreground/80 hover:text-foreground transition-colors">About</Link>
      <Link to="/pricing" className="text-foreground/80 hover:text-foreground transition-colors">Pricing</Link>
      <Link to="/support" className="text-foreground/80 hover:text-foreground transition-colors">Support</Link>
    </div>
  );
};

const NavbarActions = () => {
  const { currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl bg-gradient-to-r from-sigma-blue to-sigma-purple bg-clip-text text-transparent">SiGMA Hub</span>
          </Link>
          
          {currentUser ? (
            <div className="flex items-center space-x-4">
              {/* Desktop Navigation */}
              <div className="hidden md:block">
                <NavLinks />
              </div>
              
              {/* Mobile Menu Button */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col space-y-4 mt-8">
                    <NavLinks className="flex-col space-y-4" />
                  </div>
                </SheetContent>
              </Sheet>
              
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
