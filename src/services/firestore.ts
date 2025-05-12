
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  runTransaction
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";

// User related operations
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    await setDoc(doc(firestore, "users", userId), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, userData: any) => {
  try {
    await updateDoc(doc(firestore, "users", userId), {
      ...userData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const docRef = doc(firestore, "users", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

// Connection related operations
export const sendConnectionRequest = async (userId: string, connectionId: string) => {
  try {
    // Check if a connection already exists
    const connectionsQuery = query(
      collection(firestore, "connections"),
      where("userId", "==", userId),
      where("connectionId", "==", connectionId)
    );
    
    const connectionsSnapshot = await getDocs(connectionsQuery);
    
    if (!connectionsSnapshot.empty) {
      throw new Error("Connection already exists");
    }
    
    // Create a new connection
    await addDoc(collection(firestore, "connections"), {
      userId,
      connectionId,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error sending connection request:", error);
    throw error;
  }
};

export const acceptConnectionRequest = async (connectionId: string) => {
  try {
    const connectionRef = doc(firestore, "connections", connectionId);
    const connectionSnap = await getDoc(connectionRef);
    
    if (!connectionSnap.exists()) {
      throw new Error("Connection does not exist");
    }
    
    const connectionData = connectionSnap.data();
    
    // Update the connection status
    await updateDoc(connectionRef, {
      status: "accepted",
      updatedAt: serverTimestamp()
    });
    
    // Create a reciprocal connection
    await addDoc(collection(firestore, "connections"), {
      userId: connectionData.connectionId,
      connectionId: connectionData.userId,
      status: "accepted",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error accepting connection request:", error);
    throw error;
  }
};

// Post related operations
export const createPost = async (userId: string, postData: any) => {
  try {
    const result = await addDoc(collection(firestore, "posts"), {
      userId,
      ...postData,
      likes: 0,
      comments: 0,
      shares: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { id: result.id };
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const getUserPosts = async (userId: string) => {
  try {
    const postsQuery = query(
      collection(firestore, "posts"),
      where("userId", "==", userId)
    );
    
    const postsSnapshot = await getDocs(postsQuery);
    
    return postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting user posts:", error);
    throw error;
  }
};

// Job related operations
export const postJob = async (userId: string, companyId: string, jobData: any) => {
  try {
    const result = await addDoc(collection(firestore, "jobs"), {
      userId,
      companyId,
      ...jobData,
      status: "active",
      applicationsCount: 0,
      postedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { id: result.id };
  } catch (error) {
    console.error("Error posting job:", error);
    throw error;
  }
};

export const applyForJob = async (userId: string, jobId: string, applicationData: any) => {
  try {
    const result = await runTransaction(firestore, async (transaction) => {
      // Create the application
      const applicationRef = doc(collection(firestore, "applications"));
      
      transaction.set(applicationRef, {
        userId,
        jobId,
        ...applicationData,
        status: "submitted",
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Update the job applications count
      const jobRef = doc(firestore, "jobs", jobId);
      const jobSnap = await transaction.get(jobRef);
      
      if (!jobSnap.exists()) {
        throw new Error("Job does not exist");
      }
      
      const jobData = jobSnap.data();
      
      transaction.update(jobRef, {
        applicationsCount: (jobData.applicationsCount || 0) + 1,
        updatedAt: serverTimestamp()
      });
      
      return { applicationId: applicationRef.id };
    });
    
    return result;
  } catch (error) {
    console.error("Error applying for job:", error);
    throw error;
  }
};

// Message related operations
export const getOrCreateConversation = async (userId1: string, userId2: string) => {
  try {
    // Check if a conversation already exists between these users
    const conversationsQuery1 = query(
      collection(firestore, "conversations"),
      where("participants", "array-contains", userId1)
    );
    
    const conversationsSnapshot = await getDocs(conversationsQuery1);
    const existingConversation = conversationsSnapshot.docs.find(doc => {
      const data = doc.data();
      return data.participants.includes(userId2);
    });
    
    if (existingConversation) {
      return { id: existingConversation.id, ...existingConversation.data() };
    }
    
    // Create a new conversation
    const result = await addDoc(collection(firestore, "conversations"), {
      participants: [userId1, userId2],
      lastMessage: "",
      lastMessageTime: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { id: result.id, participants: [userId1, userId2], lastMessage: "", createdAt: new Date() };
  } catch (error) {
    console.error("Error with conversation:", error);
    throw error;
  }
};

export const sendMessage = async (conversationId: string, senderId: string, receiverId: string, text: string) => {
  try {
    const result = await runTransaction(firestore, async (transaction) => {
      // Create the message
      const messageRef = doc(collection(firestore, "messages"));
      
      transaction.set(messageRef, {
        conversationId,
        senderId,
        receiverId,
        text,
        read: false,
        timestamp: serverTimestamp()
      });
      
      // Update the conversation
      const conversationRef = doc(firestore, "conversations", conversationId);
      
      transaction.update(conversationRef, {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { messageId: messageRef.id };
    });
    
    return result;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
