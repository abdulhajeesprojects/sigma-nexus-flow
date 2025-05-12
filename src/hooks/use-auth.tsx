
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

const AuthContext = createContext<AuthContextType>(defaultContextValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setLoading(false);
      }, (error) => {
        console.error("Auth state change error:", error);
        setLoading(false);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error("Auth provider setup error:", error);
      setLoading(false);
      return () => {};
    }
  }, []);

  // Provide a stable object reference
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
