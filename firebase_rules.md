
# Firebase Security Rules

## Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read user profiles
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Post rules
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
        ((resource.data.userId == request.auth.uid) || 
         (request.resource.data.keys().hasOnly(['likes', 'comments', 'likedBy']) && resource.data.userId != request.auth.uid));
    }
    
    // Comments rules
    match /comments/{commentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Connection rules
    match /connections/{connectionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && 
        (resource.data.userId == request.auth.uid || resource.data.connectionId == request.auth.uid);
      allow delete: if request.auth != null && 
        (resource.data.userId == request.auth.uid || resource.data.connectionId == request.auth.uid);
    }
    
    // Notifications rules
    match /notifications/{notificationId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Messages rules
    match /conversations/{conversationId} {
      allow read: if request.auth != null && 
        resource.data.participants.hasAny([request.auth.uid]);
      allow create: if request.auth != null && 
        request.resource.data.participants.hasAny([request.auth.uid]);
      allow update: if request.auth != null && 
        resource.data.participants.hasAny([request.auth.uid]);
    }
    
    match /messages/{messageId} {
      allow read: if request.auth != null && 
        (resource.data.senderId == request.auth.uid || resource.data.receiverId == request.auth.uid);
      allow create: if request.auth != null && 
        request.resource.data.senderId == request.auth.uid;
      allow update: if request.auth != null && 
        (resource.data.senderId == request.auth.uid || resource.data.receiverId == request.auth.uid);
    }
    
    // Jobs rules
    match /jobs/{jobId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    match /applications/{applicationId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || resource.data.jobUserId == request.auth.uid);
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && 
        (resource.data.userId == request.auth.uid || resource.data.jobUserId == request.auth.uid);
    }
  }
}
```

## Realtime Database Rules

```json
{
  "rules": {
    "status": {
      "$user_id": {
        // Only authenticated users can read other users' status
        ".read": "auth != null",
        // Users can only write to their own status
        ".write": "auth != null && auth.uid === $user_id"
      }
    },
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

## Firestore Collections Structure

1. **users**: Stores user profiles
   - Fields: userId, displayName, email, photoURL, headline, bio, location, skills, experience, education, connectionCount, createdAt, updatedAt

2. **posts**: Stores user posts
   - Fields: userId, content, imageUrl, likes, comments, shares, likedBy, createdAt, updatedAt

3. **comments**: Stores post comments
   - Fields: postId, userId, content, createdAt

4. **connections**: Stores user connections
   - Fields: userId, connectionId, status, createdAt, updatedAt

5. **notifications**: Stores user notifications
   - Fields: userId, senderId, type, message, isRead, timestamp, additionalData (like connectionId or postId)

6. **conversations**: Stores chat conversations
   - Fields: participants (array of userIds), lastMessage, lastMessageTime, createdAt, updatedAt

7. **messages**: Stores chat messages
   - Fields: conversationId, senderId, receiverId, text, read, timestamp

8. **jobs**: Stores job listings
   - Fields: userId, companyId, title, description, location, type, salary, requirements, applicationsCount, postedAt, updatedAt

9. **applications**: Stores job applications
   - Fields: userId, jobId, jobUserId, resume, coverLetter, status, submittedAt, updatedAt

## Realtime Database Structure

```
/status
  /$userId
    /state: "online" | "offline"
    /lastChanged: timestamp
```
