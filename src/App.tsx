
import React, { useEffect, Suspense } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import FeaturesPage from "./pages/FeaturesPage";
import PricingPage from "./pages/PricingPage";
import AuthPage from "./pages/AuthPage";
import FeedPage from "./pages/FeedPage";
import ProfilePage from "./pages/ProfilePage";
import UserProfilePage from "./pages/UserProfilePage";
import NetworkPage from "./pages/NetworkPage";
import ConnectionRequestsPage from "./pages/ConnectionRequestsPage";
import MessagesPage from "./pages/MessagesPage";
import JobsPage from "./pages/JobsPage";
import NotFound from "./pages/NotFound";
import Layout from "./components/layout/Layout";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AuthProvider } from "./hooks/use-auth";
import "./App.css";

// Simple fallback for errors
const ErrorFallback = ({ error }: { error: Error }) => {
  const navigate = useNavigate();
  
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
            onClick={() => navigate("/")} 
            className="px-4 py-2 border border-sigma-purple text-sigma-purple rounded-md hover:bg-sigma-purple/10 transition-colors w-full"
          >
            Go to homepage
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom error boundary class
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error || new Error("Unknown error")} />;
    }

    return this.props.children;
  }
}

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-sigma-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-lg">Loading SiGMA Hub...</p>
    </div>
  </div>
);

function App() {
  return (
    <AppErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="sigma-theme">
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/:userId" element={<UserProfilePage />} />
                <Route path="/network" element={<NetworkPage />} />
                <Route path="/requests" element={<ConnectionRequestsPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            <Toaster />
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}

export default App;
