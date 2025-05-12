
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCeJxZ3Gsbl4R8Ab-bpTSnaDgj6slsTz88",
  authDomain: "ah-sigma-hub.firebaseapp.com",
  projectId: "ah-sigma-hub",
  storageBucket: "ah-sigma-hub.appspot.com",
  messagingSenderId: "357310750142",
  appId: "1:357310750142:web:f20481c423f56262572def",
  measurementId: "G-2LKW0YXC63",
  databaseURL: "https://ah-sigma-hub-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const database = getDatabase(app);

// Initialize Analytics if it's supported in the browser
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export default app;
