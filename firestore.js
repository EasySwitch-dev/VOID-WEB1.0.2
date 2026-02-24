rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn(){ return request.auth != null; }

    match /users/{uid} {
      allow read: if true;
      allow create: if signedIn() && request.auth.uid == uid;

      // L'utente può aggiornare solo campi "safe"
      allow update: if signedIn() && request.auth.uid == uid
        && request.resource.data.diff(resource.data).changedKeys()
          .hasOnly(['username','bio','avatarUrl','bannerUrl','tier','followerCount','followingCount','createdAt']);
    }

    match /posts/{postId} {
      allow read: if true;

      // create solo con media (no testo-only)
      allow create: if signedIn()
        && request.resource.data.authorId == request.auth.uid
        && (request.resource.data.mediaType == 'image' || request.resource.data.mediaType == 'video')
        && request.resource.data.mediaUrl is string
        && request.resource.data.createdAt is number
        && request.resource.data.expiresAt is number;

      // update SOLO server (functions)
      allow update, delete: if false;

      match /comments/{commentId} {
        allow read: if true;
        allow write: if false; // solo Function addComment
      }
    }

    match /ads/{adId} {
      allow read: if true;
      allow write: if false; // ads gestite da voi (console/admin)
    }

    match /gates/{id} {
      allow read, write: if false;
    }

    match /users/{uid}/reposts/{postId} {
      allow read: if true;
      allow write: if false; // solo Function repostPost
    }
  }
}
