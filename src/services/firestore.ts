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
  deleteDoc,
  getFirestore,
  orderBy,
  limit
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { firestore, storage, auth } from "@/lib/firebase";
import { User } from 'firebase/auth';

const db = getFirestore();

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  occupation?: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

// User related operations
export const createUserProfile = async (user: User): Promise<void> => {
  try {
    const userRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Generate a default username based on display name
      const defaultUsername = '@' + (user.displayName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000);
      
      await setDoc(userRef, {
        id: user.uid,
        displayName: user.displayName || 'User',
        email: user.email || '',
        photoURL: user.photoURL || null,
        username: defaultUsername,
        bio: '',
        location: '',
        occupation: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }
    return userDoc.data() as UserProfile;
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

export const getAllUsers = async (limit = 50) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No authenticated user");
    
    const usersQuery = query(
      collection(firestore, "users"),
      where("userId", "!=", currentUser.uid)
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    
    return usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        userId: data.userId,
        displayName: data.displayName || "User",
        headline: data.headline || "",
        photoURL: data.photoURL || null,
        ...data 
      };
    });
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
};

// Connection related operations
export const sendConnectionRequest = async (userId: string, connectionId: string) => {
  try {
    // Check if a connection already exists
    const existingConnectionQuery = query(
      collection(firestore, "connections"),
      where("userId", "==", userId),
      where("connectionId", "==", connectionId)
    );
    
    const existingConnectionSnapshot = await getDocs(existingConnectionQuery);
    
    if (!existingConnectionSnapshot.empty) {
      throw new Error("Connection request already sent");
    }
    
    // Check if a connection request from the other user already exists
    const receivedConnectionQuery = query(
      collection(firestore, "connections"),
      where("userId", "==", connectionId),
      where("connectionId", "==", userId)
    );
    
    const receivedConnectionSnapshot = await getDocs(receivedConnectionQuery);
    
    if (!receivedConnectionSnapshot.empty) {
      const existingRequest = receivedConnectionSnapshot.docs[0].data();
      if (existingRequest.status === "pending") {
        throw new Error("You already have a pending request from this user");
      }
      
      if (existingRequest.status === "rejected") {
        // If rejected, we allow sending a new request
        await deleteDoc(doc(firestore, "connections", receivedConnectionSnapshot.docs[0].id));
      }
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
    const connectionSnap = await getDoc(connectionRef);
    
    if (!connectionSnap.exists()) {
      throw new Error("Connection does not exist");
    }
    
    // Instead of deleting, update the status to rejected
    await updateDoc(connectionRef, {
      status: "rejected",
      updatedAt: serverTimestamp()
    });
    
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

// Comment related operations
export const addComment = async (postId: string, userId: string, text: string) => {
  try {
    const commentRef = await addDoc(collection(firestore, "comments"), {
      postId,
      userId,
      text,
      createdAt: serverTimestamp()
    });
    
    // Update comment count on post
    const postRef = doc(firestore, "posts", postId);
    const postSnap = await getDoc(postRef);
    
    if (postSnap.exists()) {
      const postData = postSnap.data();
      
      await updateDoc(postRef, {
        comments: (postData.comments || 0) + 1,
        updatedAt: serverTimestamp()
      });
      
      // Create notification for comment (if not your own post)
      if (postData.userId !== userId) {
        await addDoc(collection(firestore, "notifications"), {
          userId: postData.userId,
          senderId: userId,
          type: "postComment",
          postId,
          commentId: commentRef.id,
          message: "commented on your post",
          content: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
          isRead: false,
          timestamp: serverTimestamp()
        });
      }
    }
    
    return { id: commentRef.id };
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

export const getPostComments = async (postId: string) => {
  try {
    const commentsQuery = query(
      collection(firestore, "comments"),
      where("postId", "==", postId)
    );
    
    const commentsSnapshot = await getDocs(commentsQuery);
    
    return commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting post comments:", error);
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
      
      // Create notification for new message
      const notificationRef = doc(collection(firestore, "notifications"));
      
      transaction.set(notificationRef, {
        userId: receiverId,
        senderId: senderId,
        type: "message",
        message: "sent you a message",
        conversationId: conversationId,
        content: text.length > 30 ? text.substring(0, 30) + "..." : text,
        isRead: false,
        timestamp: serverTimestamp()
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

// Account related operations
export const deleteUserAccount = async (userId: string) => {
  try {
    // Delete user connections
    const connectionsQuery = query(
      collection(firestore, "connections"),
      where("userId", "==", userId)
    );
    
    const connectionsSnapshot = await getDocs(connectionsQuery);
    
    for (const connection of connectionsSnapshot.docs) {
      await deleteDoc(doc(firestore, "connections", connection.id));
    }
    
    // Delete the received connections
    const receivedConnectionsQuery = query(
      collection(firestore, "connections"),
      where("connectionId", "==", userId)
    );
    
    const receivedConnectionsSnapshot = await getDocs(receivedConnectionsQuery);
    
    for (const connection of receivedConnectionsSnapshot.docs) {
      await deleteDoc(doc(firestore, "connections", connection.id));
    }
    
    // Delete posts
    const postsQuery = query(
      collection(firestore, "posts"),
      where("userId", "==", userId)
    );
    
    const postsSnapshot = await getDocs(postsQuery);
    
    for (const post of postsSnapshot.docs) {
      await deleteDoc(doc(firestore, "posts", post.id));
    }
    
    // Delete comments
    const commentsQuery = query(
      collection(firestore, "comments"),
      where("userId", "==", userId)
    );
    
    const commentsSnapshot = await getDocs(commentsQuery);
    
    for (const comment of commentsSnapshot.docs) {
      await deleteDoc(doc(firestore, "comments", comment.id));
    }
    
    // Delete conversations
    const conversationsQuery = query(
      collection(firestore, "conversations"),
      where("participants", "array-contains", userId)
    );
    
    const conversationsSnapshot = await getDocs(conversationsQuery);
    
    for (const conversation of conversationsSnapshot.docs) {
      await deleteDoc(doc(firestore, "conversations", conversation.id));
      
      // Delete messages in the conversation
      const messagesQuery = query(
        collection(firestore, "messages"),
        where("conversationId", "==", conversation.id)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      
      for (const message of messagesSnapshot.docs) {
        await deleteDoc(doc(firestore, "messages", message.id));
      }
    }
    
    // Delete notifications sent to this user
    const notificationsQuery = query(
      collection(firestore, "notifications"),
      where("userId", "==", userId)
    );
    
    const notificationsSnapshot = await getDocs(notificationsQuery);
    
    for (const notification of notificationsSnapshot.docs) {
      await deleteDoc(doc(firestore, "notifications", notification.id));
    }
    
    // Delete notifications sent by this user
    const sentNotificationsQuery = query(
      collection(firestore, "notifications"),
      where("senderId", "==", userId)
    );
    
    const sentNotificationsSnapshot = await getDocs(sentNotificationsQuery);
    
    for (const notification of sentNotificationsSnapshot.docs) {
      await deleteDoc(doc(firestore, "notifications", notification.id));
    }
    
    // Finally, delete the user profile
    await deleteDoc(doc(firestore, "users", userId));
    
    // The Firebase Auth account needs to be deleted separately using Firebase Auth methods
    
    return true;
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw error;
  }
};

// Add username validation function
export const validateUsername = (username: string): boolean => {
  // Username must start with @ and contain only letters, numbers, and underscores
  const usernameRegex = /^@[a-zA-Z0-9_]+$/;
  return usernameRegex.test(username);
};

// Add function to check if username is available
export const isUsernameAvailable = async (username: string): Promise<boolean> => {
  const usersRef = collection(firestore, 'users');
  const q = query(usersRef, where('username', '==', username));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
};

// Add function to search users by username
export const searchUsersByUsername = async (searchTerm: string): Promise<UserProfile[]> => {
  if (!searchTerm.startsWith('@')) {
    searchTerm = '@' + searchTerm;
  }

  const usersRef = collection(firestore, 'users');
  const q = query(
    usersRef,
    where('username', '>=', searchTerm),
    where('username', '<=', searchTerm + '\uf8ff'),
    limit(10)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as UserProfile));
};

export const updateUsername = async (userId: string, newUsername: string): Promise<void> => {
  if (!validateUsername(newUsername)) {
    throw new Error('Invalid username format. Username must start with @ and contain only letters, numbers, and underscores.');
  }

  const isAvailable = await isUsernameAvailable(newUsername);
  if (!isAvailable) {
    throw new Error('Username is already taken.');
  }

  const userRef = doc(firestore, 'users', userId);
  await updateDoc(userRef, {
    username: newUsername,
    updatedAt: new Date()
  });
};
