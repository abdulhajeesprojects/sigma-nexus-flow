
import { auth, database } from "@/lib/firebase";
import { ref, onDisconnect, serverTimestamp, onValue, set, off } from "firebase/database";

interface UserStatus {
  state: 'online' | 'offline';
  lastChanged: number;
}

// Set up the Firebase Realtime Database presence system
export const setupPresence = async () => {
  // Return early if not authenticated
  if (!auth.currentUser) return;

  const uid = auth.currentUser.uid;
  
  // Reference to the user's status node in the Realtime Database
  const userStatusRef = ref(database, `/status/${uid}`);
  
  // Reference to the user's connection state
  const isOfflineForDatabase: UserStatus = {
    state: 'offline',
    lastChanged: Date.now()
  };
  
  const isOnlineForDatabase: UserStatus = {
    state: 'online',
    lastChanged: Date.now()
  };
  
  // Create a reference to the '.info/connected' path
  const connectedRef = ref(database, '.info/connected');
  
  // Set up the connection state listener
  onValue(connectedRef, (snapshot) => {
    // If we're connected (or reconnected)
    if (snapshot.val() === true) {
      // Set presence to online and set up disconnect handler
      const onDisconnectRef = onDisconnect(userStatusRef);
      
      // When user disconnects, update the status to offline
      onDisconnectRef.set(isOfflineForDatabase).then(() => {
        // Now that we're connected, update to online
        set(userStatusRef, isOnlineForDatabase);
      });
    }
  });
};

// Clean up presence when user signs out
export const cleanupPresence = () => {
  if (!auth.currentUser) return;
  
  const uid = auth.currentUser.uid;
  const userStatusRef = ref(database, `/status/${uid}`);
  
  // Remove the '.info/connected' listener
  off(ref(database, '.info/connected'));
  
  // Set user status to offline
  set(userStatusRef, {
    state: 'offline',
    lastChanged: serverTimestamp()
  });
};

// Check if a user is online
export const checkUserOnlineStatus = (userId: string, callback: (isOnline: boolean) => void) => {
  const userStatusRef = ref(database, `/status/${userId}`);
  
  onValue(userStatusRef, (snapshot) => {
    if (snapshot.exists()) {
      const status = snapshot.val();
      callback(status.state === 'online');
    } else {
      callback(false);
    }
  });
  
  // Return a cleanup function
  return () => {
    off(userStatusRef);
  };
};
