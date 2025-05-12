import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Navbar from "./Navbar";
import Footer from "./Footer";

// Pages that don't require authentication
const PUBLIC_PAGES = ['/auth', '/about', '/features', '/pricing', '/support'];

const Layout = () => {
  const { currentUser, loading } = useAuth();
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle authentication
  useEffect(() => {
    if (!loading && !currentUser && !PUBLIC_PAGES.includes(location.pathname)) {
      navigate("/auth");
      toast("Please sign in to continue");
    }
  }, [currentUser, loading, location.pathname, navigate]);

  // Clear error state when route changes
  useEffect(() => {
    return () => {
      setError(null);
    };
  }, [navigate]);

  // Error handling boundary
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center p-6 max-w-md w-full mx-auto bg-card rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Something went wrong</h2>
          <p className="mb-4 text-muted-foreground">{error.message || "An unexpected error occurred"}</p>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-sigma-purple text-white rounded-md hover:bg-sigma-blue transition-colors w-full"
            >
              Refresh page
            </button>
            <button 
              onClick={() => {
                setError(null);
                navigate("/");
              }} 
              className="px-4 py-2 border border-sigma-purple text-sigma-purple rounded-md hover:bg-sigma-purple/10 transition-colors w-full"
            >
              Go to homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00a884]"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
