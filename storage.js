rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    function signedIn(){ return request.auth != null; }

    match /avatars/{uid}/{file} {
      allow read: if true;
      allow write: if signedIn() && request.auth.uid == uid;
    }

    match /posts/{uid}/{file} {
      allow read: if true;
      allow write: if signedIn() && request.auth.uid == uid;
    }

    match /comment_media/{postId}/{uid}/{file} {
      allow read: if true;
      allow write: if signedIn() && request.auth.uid == uid;
    }

    match /comment_audio/{postId}/{uid}/{file} {
      allow read: if true;
      allow write: if signedIn() && request.auth.uid == uid;
    }

    match /ads/{uid}/{file} {
      allow read: if true;
      allow write: if false; // gestite da voi
    }
  }
}
