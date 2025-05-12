
// Firestore rules
// Copy these to your Firebase Console > Firestore Database > Rules

/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Basic read access to most collections
    match /{document=**} {
      allow read: if true;
    }
    
    // Allow public read access to users collection
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     (request.auth.uid == userId || request.resource.data.userId == userId);
    }
    
    // Posts collection - publicly readable and writeable with auth
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                              (resource.data.userId == request.auth.uid);
      
      // Allow anyone to like/comment on a post
      allow update: if request.auth != null && 
                     (request.resource.data.diff(resource.data).affectedKeys()
                      .hasOnly(['likes', 'likedBy', 'comments', 'commentCount']));
    }
    
    // Comments collection - public read
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                              (resource.data.userId == request.auth.uid);
    }
    
    // Connections collection
    match /connections/{connectionId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                              (resource.data.userId == request.auth.uid || 
                               resource.data.connectionId == request.auth.uid);
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                              (resource.data.userId == request.auth.uid);
    }
    
    // Jobs collection - public read
    match /jobs/{jobId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
    
    // Applications collection
    match /applications/{applicationId} {
      allow read: if request.auth != null && 
                    (resource.data.userId == request.auth.uid);
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                              (resource.data.userId == request.auth.uid);
    }
    
    // Conversations and messages
    match /conversations/{conversationId} {
      allow read: if request.auth != null && 
                    request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                      request.auth.uid in resource.data.participants;
    }
    
    match /messages/{messageId} {
      allow read: if request.auth != null && 
                    (request.auth.uid == resource.data.senderId || 
                     request.auth.uid == resource.data.receiverId);
      allow create: if request.auth != null && 
                      request.auth.uid == request.resource.data.senderId;
    }
  }
}
*/

// Realtime Database Rules
// Copy these to your Firebase Console > Realtime Database > Rules

/*
{
  "rules": {
    // Allow public read to most data
    ".read": true,
    
    "presence": {
      ".read": true,
      ".write": "auth != null",
      "$uid": {
        ".read": true,
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "status": {
      ".read": true,
      ".write": "auth != null",
      "$uid": {
        ".read": true,
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "users": {
      ".read": true,
      "$uid": {
        ".read": true,
        ".write": "auth != null && auth.uid == $uid",
        "media": {
          ".read": true,
          ".write": "auth != null && auth.uid == $uid"
        },
        "savedPosts": {
          ".read": "auth != null && auth.uid == $uid",
          ".write": "auth != null && auth.uid == $uid"
        }
      }
    },
    "notifications": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null"
      }
    },
    "userChats": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "chatMessages": {
      "$chatId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "publicFeed": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
*/
