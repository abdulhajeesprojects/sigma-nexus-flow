
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
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

function App() {
  // Track user activity for presence system
  useEffect(() => {
    const setupPresence = async () => {
      // This is a placeholder for presence setup
      // We'll implement this later
    };

    setupPresence();
  }, []);

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="sigma-theme">
        <AuthProvider>
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
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
