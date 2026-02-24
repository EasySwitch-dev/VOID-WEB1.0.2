const admin = require("firebase-admin");
const functions = require("firebase-functions");

admin.initializeApp();
const db = admin.firestore();
const MIN = 60_000;

// blocca “ripetizioni” (1 like per utente per post, 1 repost per utente per post, 1 follow per creator)
async function gateOnce(key){
  const ref = db.collection("gates").doc(key);
  const snap = await ref.get();
  if(snap.exists) return false;
  await ref.set({ createdAt: Date.now() });
  return true;
}

// estende la vita del post (NO per ads direct)
async function extendPost(postId, deltaMs){
  const ref = db.collection("posts").doc(postId);
  await db.runTransaction(async (tx)=>{
    const snap = await tx.get(ref);
    if(!snap.exists) throw new functions.https.HttpsError("not-found","Post not found");
    const p = snap.data();

    // ads direct: non estendere e non “muoiono” con interazioni
    if(p?.isAd || p?.adMeta?.kind === "direct") return;

    const expiresAt = Number(p.expiresAt || Date.now());
    const base = Math.max(expiresAt, Date.now());
    tx.update(ref, { expiresAt: base + deltaMs });
  });
}

// LIKE +5m
exports.likePost = functions.https.onCall(async (data, context)=>{
  const uid = context.auth?.uid;
  if(!uid) throw new functions.https.HttpsError("unauthenticated","Login required");
  const postId = String(data.postId);

  const ok = await gateOnce(`like_${uid}_${postId}`);
  if(!ok) return { ok:true, skipped:true };

  await db.collection("posts").doc(postId).update({
    likeCount: admin.firestore.FieldValue.increment(1)
  });
  await extendPost(postId, 5*MIN);
  return { ok:true };
});

// REPOST +10m + salva repost in /users/{uid}/reposts/{postId}
exports.repostPost = functions.https.onCall(async (data, context)=>{
  const uid = context.auth?.uid;
  if(!uid) throw new functions.https.HttpsError("unauthenticated","Login required");
  const postId = String(data.postId);

  const ok = await gateOnce(`repost_${uid}_${postId}`);
  if(!ok) return { ok:true, skipped:true };

  await db.collection("posts").doc(postId).update({
    repostCount: admin.firestore.FieldValue.increment(1)
  });

  await db.collection("users").doc(uid).collection("reposts").doc(postId).set({
    postId,
    createdAt: Date.now()
  });

  await extendPost(postId, 10*MIN);
  return { ok:true };
});

// FOLLOW DA POST +30m (una volta per follower->creator)
exports.followFromPost = functions.https.onCall(async (data, context)=>{
  const uid = context.auth?.uid;
  if(!uid) throw new functions.https.HttpsError("unauthenticated","Login required");

  const postId = String(data.postId);
  const authorId = String(data.authorId);
  if(authorId === uid) return { ok:true, skipped:true };

  const ok = await gateOnce(`followpost_${uid}_${authorId}`);
  if(!ok) return { ok:true, skipped:true };

  await db.collection("users").doc(authorId).set({
    followerCount: admin.firestore.FieldValue.increment(1)
  }, { merge:true });

  await db.collection("users").doc(uid).set({
    followingCount: admin.firestore.FieldValue.increment(1)
  }, { merge:true });

  await db.collection("posts").doc(postId).update({
    followerFromThisCount: admin.firestore.FieldValue.increment(1)
  });

  await extendPost(postId, 30*MIN);
  return { ok:true };
});

// FOLLOW DA PROFILO (NO tempo extra)
exports.followUser = functions.https.onCall(async (data, context)=>{
  const uid = context.auth?.uid;
  if(!uid) throw new functions.https.HttpsError("unauthenticated","Login required");

  const targetUid = String(data.targetUid);
  if(targetUid === uid) return { ok:true, skipped:true };

  const ok = await gateOnce(`followprofile_${uid}_${targetUid}`);
  if(!ok) return { ok:true, skipped:true };

  await db.collection("users").doc(targetUid).set({
    followerCount: admin.firestore.FieldValue.increment(1)
  }, { merge:true });

  await db.collection("users").doc(uid).set({
    followingCount: admin.firestore.FieldValue.increment(1)
  }, { merge:true });

  return { ok:true };
});

// COMMENTI: text/gif/photo +5m, audio +10m
exports.addComment = functions.https.onCall(async (data, context)=>{
  const uid = context.auth?.uid;
  if(!uid) throw new functions.https.HttpsError("unauthenticated","Login required");

  const postId = String(data.postId);
  const kind = String(data.kind); // text/audio/gif/photo
  const text = (data.text ? String(data.text) : "").slice(0, 500);
  const mediaUrl = data.mediaUrl ? String(data.mediaUrl) : null;

  const uSnap = await db.collection("users").doc(uid).get();
  const username = uSnap.data()?.username || `user_${uid.slice(0,6)}`;

  await db.collection("posts").doc(postId).collection("comments").add({
    postId,
    authorId: uid,
    authorUsername: username,
    createdAt: Date.now(),
    kind,
    text: kind==="text" ? text : null,
    mediaUrl: kind!=="text" ? mediaUrl : null
  });

  await db.collection("posts").doc(postId).update({
    commentCount: admin.firestore.FieldValue.increment(1)
  });

  const delta = (kind === "audio") ? 10*MIN : 5*MIN;
  await extendPost(postId, delta);

  return { ok:true };
});

// Tier
exports.setTier = functions.https.onCall(async (data, context)=>{
  const uid = context.auth?.uid;
  if(!uid) throw new functions.https.HttpsError("unauthenticated","Login required");
  const tier = String(data.tier || "FREE");
  if(!["FREE","PULSE","ETERNAL"].includes(tier)) {
    throw new functions.https.HttpsError("invalid-argument","Bad tier");
  }
  await db.collection("users").doc(uid).set({ tier }, { merge:true });
  return { ok:true };
});

// Cleanup: cancella post scaduti ogni ora
exports.cleanupExpiredPosts = functions.pubsub
  .schedule("every 60 minutes")
  .onRun(async ()=>{
    const now = Date.now();
    const snap = await db.collection("posts").where("expiresAt","<=",now).limit(300).get();
    const batch = db.batch();
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    return null;
  });
