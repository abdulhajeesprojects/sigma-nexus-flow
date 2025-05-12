
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/lib/firebase";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { useToast } from "@/hooks/use-toast";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check if the URL has a signup parameter
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("signup") === "true") {
      setIsSignUp(true);
    }

    // Check if the user is already authenticated
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, redirect to feed
        toast({
          title: "Already signed in",
          description: "You're already logged in to your account",
        });
        navigate("/feed");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [location.search, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sigma-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="container mx-auto px-4 py-16 flex flex-col md:flex-row">
        {/* Left Side - Branding/Info */}
        <div className="w-full md:w-1/2 mb-10 md:mb-0 md:pr-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto md:ml-0 md:mr-auto"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sigma-blue to-sigma-purple dark:from-sigma-purple dark:to-sigma-blue">
                SiGMA Hub
              </span>
            </h1>
            <p className="text-2xl font-bold mb-4">
              {isSignUp ? "Join the network" : "Welcome back"}
            </p>
            <p className="text-muted-foreground mb-8">
              {isSignUp
                ? "Create your professional profile and connect with opportunities worldwide."
                : "Sign in to access your personalized feed, messages, and connections."}
            </p>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Personalized Smart Feed</p>
                  <p className="text-sm text-muted-foreground">
                    Content tailored to your professional interests
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Real-time Messaging</p>
                  <p className="text-sm text-muted-foreground">
                    Connect instantly with professionals worldwide
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Advanced Job Matching</p>
                  <p className="text-sm text-muted-foreground">
                    Find opportunities that perfectly align with your skills
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="w-full md:w-1/2">
          <div className="max-w-md mx-auto glass-card p-8">
            <AnimatePresence mode="wait">
              {isSignUp ? (
                <SignUpForm key="signup" onSwitch={() => setIsSignUp(false)} />
              ) : (
                <SignInForm key="signin" onSwitch={() => setIsSignUp(true)} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
