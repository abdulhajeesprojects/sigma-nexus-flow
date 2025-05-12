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
  runTransaction,
  deleteDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { firestore, storage } from "@/lib/firebase";

// User related operations
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    await setDoc(doc(firestore, "users", userId), {
      userId,
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

export const uploadProfileImage = async (userId: string, file: File): Promise<string> => {
  try {
    const storageRef = ref(storage, `profile/${userId}/${file.name}`);
    const uploadResult = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(uploadResult.ref);
    
    // Update user profile with image URL
    await updateDoc(doc(firestore, "users", userId), {
      photoURL: downloadURL,
      updatedAt: serverTimestamp()
    });
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile image:", error);
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
    const connectionDoc = await addDoc(collection(firestore, "connections"), {
      userId,
      connectionId,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Create notification for connection request
    await addDoc(collection(firestore, "notifications"), {
      userId: connectionId,
      senderId: userId,
      type: "connectionRequest",
      message: "sent you a connection request",
      isRead: false,
      connectionId: connectionDoc.id,
      timestamp: serverTimestamp()
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
    
    // Create notification for accepted connection
    await addDoc(collection(firestore, "notifications"), {
      userId: connectionData.userId,
      senderId: connectionData.connectionId,
      type: "connectionAccepted",
      message: "accepted your connection request",
      isRead: false,
      timestamp: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error accepting connection request:", error);
    throw error;
  }
};

export const rejectConnectionRequest = async (connectionId: string) => {
  try {
    const connectionRef = doc(firestore, "connections", connectionId);
    await deleteDoc(connectionRef);
    return true;
  } catch (error) {
    console.error("Error rejecting connection request:", error);
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
      likedBy: [],
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

export const likePost = async (postId: string, userId: string, isLiked: boolean) => {
  try {
    const postRef = doc(firestore, "posts", postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) {
      throw new Error("Post does not exist");
    }
    
    const postData = postSnap.data();
    
    if (isLiked) {
      // Remove like
      await updateDoc(postRef, {
        likes: postData.likes - 1,
        likedBy: postData.likedBy.filter((id: string) => id !== userId),
        updatedAt: serverTimestamp()
      });
    } else {
      // Add like
      await updateDoc(postRef, {
        likes: postData.likes + 1,
        likedBy: [...(postData.likedBy || []), userId],
        updatedAt: serverTimestamp()
      });
      
      // Create notification for post like (if not your own post)
      if (postData.userId !== userId) {
        await addDoc(collection(firestore, "notifications"), {
          userId: postData.userId,
          senderId: userId,
          type: "postLike",
          postId,
          message: "liked your post",
          isRead: false,
          timestamp: serverTimestamp()
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error liking post:", error);
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

// Notification related operations
export const getNotifications = async (userId: string) => {
  try {
    const notificationsQuery = query(
      collection(firestore, "notifications"),
      where("userId", "==", userId),
      where("isRead", "==", false)
    );
    
    const notificationsSnapshot = await getDocs(notificationsQuery);
    
    return notificationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting notifications:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notificationRef = doc(firestore, "notifications", notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};
