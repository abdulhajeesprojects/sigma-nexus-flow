
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCeJxZ3Gsbl4R8Ab-bpTSnaDgj6slsTz88",
  authDomain: "ah-sigma-hub.firebaseapp.com",
  projectId: "ah-sigma-hub",
  storageBucket: "ah-sigma-hub.firebasestorage.app",
  messagingSenderId: "357310750142",
  appId: "1:357310750142:web:f20481c423f56262572def",
  measurementId: "G-2LKW0YXC63"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics if it's supported in the browser
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export default app;
