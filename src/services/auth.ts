import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  sendPasswordResetEmail,
  deleteUser,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  OAuthProvider
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserProfile } from "./firestore";

// Initialize Firebase Authentication and get a reference to the service
// const auth = getAuth(app);

export const registerWithEmailPassword = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName });

    // Create user profile in Firestore
    await createUserProfile(user);

    return user;
  } catch (error: any) {
    console.error("Error during registration:", error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error("Error during sign in:", error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Error during sign out:", error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

export const deleteUserAccount = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      await deleteUser(user);
    }
  } catch (error: any) {
    console.error("Error deleting user account:", error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    
    // The signed-in user info.
    const user = result.user;
    
    // Create user profile in Firestore
    await createUserProfile(user);
    
    return user;
  } catch (error: any) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const signInWithFacebook = async () => {
  try {
    const provider = new FacebookAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // The signed-in user info.
    const user = result.user;
    
    // Create user profile in Firestore
    await createUserProfile(user);
    
    return user;
  } catch (error: any) {
    console.error("Error signing in with Facebook:", error);
    throw error;
  }
};

export const signInWithMicrosoft = async () => {
  try {
    const provider = new OAuthProvider('microsoft.com');
    const result = await signInWithPopup(auth, provider);
    
    // The signed-in user info.
    const user = result.user;
    
    // Create user profile in Firestore
    await createUserProfile(user);
    
    return user;
  } catch (error: any) {
    console.error("Error signing in with Microsoft:", error);
    throw error;
  }
};
