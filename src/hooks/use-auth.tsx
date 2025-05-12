
import { useState, useEffect, createContext, useContext } from "react";
import { 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import { auth } from "@/lib/firebase";

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
};

// Create a default context value
const defaultContextValue: AuthContextType = {
  currentUser: null,
  loading: true
};

export const AuthContext = createContext<AuthContextType>(defaultContextValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribe = () => {};
    
    try {
      unsubscribe = onAuthStateChanged(
        auth, 
        (user) => {
          setCurrentUser(user);
          setLoading(false);
        }, 
        (error) => {
          console.error("Auth state change error:", error);
          setError(error as Error);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error("Auth provider setup error:", err);
      setError(err as Error);
      setLoading(false);
    }
      
    return () => unsubscribe();
  }, []);

  // If there's an error during auth setup, still render the app
  // but with null user (unauthenticated state)
  if (error) {
    console.error("Authentication error:", error);
    // Don't throw here, just log and continue with null user
  }

  const value = {
    currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
