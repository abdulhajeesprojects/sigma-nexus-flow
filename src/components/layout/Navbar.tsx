
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import NotificationBell from "@/components/notifications/NotificationBell";
import { Home, Users, Briefcase, MessageSquare, User, Info, Star, CreditCard } from "lucide-react";

interface NavbarProps {
  isAuthenticated: boolean;
}

const Navbar = ({ isAuthenticated }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed out",
        description: "You've been successfully signed out of your account",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const navbarVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={navbarVariants}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-black/80 backdrop-blur-lg shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-2xl font-bold bg-gradient-to-r from-sigma-blue to-sigma-purple dark:from-sigma-purple dark:to-sigma-blue text-transparent bg-clip-text">
              SiGMA Hub
            </span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {isAuthenticated ? (
            <>
              <NavLink to="/feed" icon={<Home className="w-4 h-4 mr-1" />}>Feed</NavLink>
              <NavLink to="/network" icon={<Users className="w-4 h-4 mr-1" />}>Network</NavLink>
              <NavLink to="/jobs" icon={<Briefcase className="w-4 h-4 mr-1" />}>Jobs</NavLink>
              <NavLink to="/messages" icon={<MessageSquare className="w-4 h-4 mr-1" />}>Messages</NavLink>
              <NavLink to="/profile" icon={<User className="w-4 h-4 mr-1" />}>Profile</NavLink>
              <div className="flex items-center space-x-4">
                <NotificationBell />
                <ThemeToggle />
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="text-sm"
                >
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/about" icon={<Info className="w-4 h-4 mr-1" />}>About</NavLink>
              <NavLink to="/features" icon={<Star className="w-4 h-4 mr-1" />}>Features</NavLink>
              <NavLink to="/pricing" icon={<CreditCard className="w-4 h-4 mr-1" />}>Pricing</NavLink>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <Link to="/auth">
                  <Button
                    variant="ghost"
                    className="text-sm hover:bg-secondary/80"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth?signup=true">
                  <Button
                    className="text-sm bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-4">
          {isAuthenticated && <NotificationBell />}
          <ThemeToggle />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md hover:bg-secondary/80"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              )}
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-background border-t"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              {isAuthenticated ? (
                <>
                  <MobileNavLink
                    to="/feed"
                    onClick={() => setMobileMenuOpen(false)}
                    icon={<Home className="w-4 h-4 mr-2" />}
                  >
                    Feed
                  </MobileNavLink>
                  <MobileNavLink
                    to="/network"
                    onClick={() => setMobileMenuOpen(false)}
                    icon={<Users className="w-4 h-4 mr-2" />}
                  >
                    Network
                  </MobileNavLink>
                  <MobileNavLink
                    to="/jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    icon={<Briefcase className="w-4 h-4 mr-2" />}
                  >
                    Jobs
                  </MobileNavLink>
                  <MobileNavLink
                    to="/messages"
                    onClick={() => setMobileMenuOpen(false)}
                    icon={<MessageSquare className="w-4 h-4 mr-2" />}
                  >
                    Messages
                  </MobileNavLink>
                  <MobileNavLink
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    icon={<User className="w-4 h-4 mr-2" />}
                  >
                    Profile
                  </MobileNavLink>
                  <div className="pt-2 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full"
                    >
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <MobileNavLink
                    to="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    icon={<Info className="w-4 h-4 mr-2" />}
                  >
                    About
                  </MobileNavLink>
                  <MobileNavLink
                    to="/features"
                    onClick={() => setMobileMenuOpen(false)}
                    icon={<Star className="w-4 h-4 mr-2" />}
                  >
                    Features
                  </MobileNavLink>
                  <MobileNavLink
                    to="/pricing"
                    onClick={() => setMobileMenuOpen(false)}
                    icon={<CreditCard className="w-4 h-4 mr-2" />}
                  >
                    Pricing
                  </MobileNavLink>
                  <div className="pt-4 space-y-2 border-t">
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      to="/auth?signup=true"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button 
                        className="w-full bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

// Desktop NavLink component
const NavLink = ({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <Link to={to}>
    <motion.span
      className="relative text-sm font-medium cursor-pointer transition-colors hover:text-sigma-blue dark:hover:text-sigma-purple flex items-center"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {icon}
      {children}
    </motion.span>
  </Link>
);

// Mobile NavLink component
const MobileNavLink = ({
  to,
  onClick,
  icon,
  children,
}: {
  to: string;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Link to={to} onClick={onClick} className="block py-2">
    <motion.span
      className="text-base font-medium flex items-center"
      whileTap={{ scale: 0.95 }}
    >
      {icon}
      {children}
    </motion.span>
  </Link>
);

export default Navbar;
