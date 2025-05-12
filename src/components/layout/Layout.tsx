
import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  const { loading } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  // Clear error state when route changes
  useEffect(() => {
    return () => {
      setError(null);
    };
  }, [navigate]);

  // Error handling boundary
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-6 max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Something went wrong</h2>
          <p className="mb-4">{error.message || "An unexpected error occurred"}</p>
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sigma-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Loading SiGMA Hub...</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 pt-16"
        >
          <Outlet />
        </motion.main>
        <Footer />
      </div>
    );
  } catch (err) {
    console.error("Layout render error:", err);
    const errorMessage = err instanceof Error ? err : new Error("Unknown error occurred");
    setError(errorMessage as Error);
    
    // Return a simple fallback UI
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Something went wrong</h2>
          <p className="mb-4">We're sorry, but there was an error loading the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-sigma-purple text-white rounded-md hover:bg-sigma-blue transition-colors"
          >
            Refresh page
          </button>
        </div>
      </div>
    );
  }
};

export default Layout;
