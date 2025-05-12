
// Firestore rules
// Copy these to your Firebase Console > Firestore Database > Rules

/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access to all documents
    match /{document=**} {
      allow read: if true;
    }
    
    // Users collection
    match /users/{userId} {
      allow write: if request.auth != null && (request.auth.uid == userId || request.resource.data.userId == userId);
    }
    
    // Posts collection
    match /posts/{postId} {
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                              (resource.data.userId == request.auth.uid);
    }
    
    // Comments collection
    match /comments/{commentId} {
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                              (resource.data.userId == request.auth.uid);
    }
    
    // Connections collection
    match /connections/{connectionId} {
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                              (resource.data.userId == request.auth.uid || 
                               resource.data.connectionId == request.auth.uid);
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                              (resource.data.userId == request.auth.uid);
    }
  }
}
*/

// Realtime Database Rules
// Copy these to your Firebase Console > Realtime Database > Rules

/*
{
  "rules": {
    ".read": true,
    ".write": true,
    "presence": {
      "$uid": {
        ".read": true,
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "status": {
      "$uid": {
        ".read": true,
        ".write": "auth != null && auth.uid == $uid"
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
    }
  }
}
*/
