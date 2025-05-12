
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { auth, firestore, database } from "@/lib/firebase";
import { createUserProfile } from "./firestore";
import { ref, set, onDisconnect, serverTimestamp } from "firebase/database";
import { doc, setDoc } from "firebase/firestore";

export const signUp = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    if (user) {
      await updateProfile(user, { displayName });
      
      // Create user profile in Firestore
      await createUserProfile(user.uid, {
        userId: user.uid,
        displayName,
        email,
        photoURL: null,
        headline: "",
        location: "",
        bio: "",
        connectionCount: 0,
        createdAt: new Date(),
      });
      
      // Set user presence in Realtime Database
      const userStatusRef = ref(database, `status/${user.uid}`);
      await set(userStatusRef, {
        state: 'online',
        lastChanged: serverTimestamp(),
      });
      
      // Set up disconnect hook
      onDisconnect(userStatusRef).set({
        state: 'offline',
        lastChanged: serverTimestamp(),
      });
      
      // Send email verification
      await sendEmailVerification(user);
    }
    
    return { user };
  } catch (error) {
    console.error("Error during sign up:", error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user presence in Realtime Database
    if (user) {
      const userStatusRef = ref(database, `status/${user.uid}`);
      await set(userStatusRef, {
        state: 'online',
        lastChanged: serverTimestamp(),
      });
      
      // Set up disconnect hook
      onDisconnect(userStatusRef).set({
        state: 'offline',
        lastChanged: serverTimestamp(),
      });
    }
    
    return { user };
  } catch (error) {
    console.error("Error during sign in:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const user = auth.currentUser;
    
    // Update presence status before signing out
    if (user) {
      const userStatusRef = ref(database, `status/${user.uid}`);
      await set(userStatusRef, {
        state: 'offline',
        lastChanged: serverTimestamp(),
      });
    }
    
    await firebaseSignOut(auth);
    return true;
  } catch (error) {
    console.error("Error during sign out:", error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return new Promise<User | null>((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth, 
      (user) => {
        unsubscribe();
        resolve(user);
      },
      (error) => {
        reject(error);
      }
    );
  });
};

export const updateUserPresence = async (userId: string, status: 'online' | 'offline' | 'away') => {
  try {
    const userStatusRef = ref(database, `status/${userId}`);
    await set(userStatusRef, {
      state: status,
      lastChanged: serverTimestamp(),
    });
    
    if (status === 'online') {
      onDisconnect(userStatusRef).set({
        state: 'offline',
        lastChanged: serverTimestamp(),
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error updating user presence:", error);
    return false;
  }
};
