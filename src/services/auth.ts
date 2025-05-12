
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut as firebaseSignOut 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserProfile } from "./firestore";

export const signUp = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    if (user) {
      await updateProfile(user, { displayName });
      
      // Create user profile in Firestore
      await createUserProfile(user.uid, {
        displayName,
        email,
        photoURL: null,
        headline: "",
        location: "",
        bio: "",
        connectionCount: 0
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
    return { user: userCredential.user };
  } catch (error) {
    console.error("Error during sign in:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
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
