
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { AlignJustify, LogOut } from "lucide-react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/auth");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navLinkClasses =
    "block lg:inline-block text-sm font-medium py-2 px-3 hover:text-sigma-blue dark:hover:text-sigma-purple transition-colors";

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      <div className="container mx-auto p-4 flex items-center justify-between bg-background/90 backdrop-blur-md border-b">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold text-sigma-blue dark:text-sigma-purple"
        >
          SigmaHub
        </Link>

        {/* Navigation Links */}
        <nav className={`lg:flex items-center gap-1 ${isMobileMenuOpen ? 'flex flex-col items-start absolute top-full left-0 right-0 p-4 bg-card/90 backdrop-blur-md border-b shadow-lg' : 'hidden'}`}>
          <Link to="/" className={navLinkClasses} onClick={closeMobileMenu}>
            Home
          </Link>
          <Link
            to="/about"
            className={navLinkClasses}
            onClick={closeMobileMenu}
          >
            About
          </Link>
          <Link
            to="/features"
            className={navLinkClasses}
            onClick={closeMobileMenu}
          >
            Features
          </Link>
          <Link
            to="/pricing"
            className={navLinkClasses}
            onClick={closeMobileMenu}
          >
            Pricing
          </Link>

          {/* Auth-only links */}
          {currentUser && (
            <>
              <Link
                to="/feed"
                className={navLinkClasses}
                onClick={closeMobileMenu}
              >
                Feed
              </Link>
              <Link
                to="/network"
                className={navLinkClasses}
                onClick={closeMobileMenu}
              >
                Network
              </Link>
              <Link
                to="/requests"
                className={navLinkClasses}
                onClick={closeMobileMenu}
              >
                Requests
              </Link>
              <Link
                to="/messages"
                className={navLinkClasses}
                onClick={closeMobileMenu}
              >
                Messages
              </Link>
              <Link
                to="/jobs"
                className={navLinkClasses}
                onClick={closeMobileMenu}
              >
                Jobs
              </Link>
            </>
          )}
        </nav>

        {/* Profile Menu / Auth Buttons */}
        <div className="flex items-center space-x-3">
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser?.photoURL || undefined} alt={currentUser?.displayName || "Avatar"} />
                    <AvatarFallback>{currentUser?.displayName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
              <Button onClick={() => navigate("/auth")}>Sign Up</Button>
            </>
          )}

          {/* Hamburger Menu (Mobile) */}
          <Button
            variant="ghost"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <AlignJustify className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
