
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  const { loading } = useAuth();

  // Adding a simple error boundary to prevent white screen errors
  try {
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
  } catch (error) {
    console.error("Layout render error:", error);
    // Fallback UI in case of error
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
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
