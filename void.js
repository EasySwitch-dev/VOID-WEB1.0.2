// void.js (ESM module)
// IMPORTS Firebase v10 (CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth, onAuthStateChanged,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc,
  collection, addDoc, getDocs, query, where, orderBy, limit
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-functions.js";

// =======================
// 1) INCOLLA QUI LA TUA CONFIG FIREBASE
// =======================
export const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  appId: "YOUR_APP_ID",
};

// =======================
// 2) (OPZIONALE) TENOR KEY PER GIF PICKER
// se la lasci vuota, il picker GIF non si carica
// =======================
export const TENOR_KEY = ""; // es: "AIza...." oppure ""

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Cloud Functions (sicure)
export const fnLike = httpsCallable(functions, "likePost");            // +5m
export const fnRepost = httpsCallable(functions, "repostPost");        // +10m
export const fnFollowFromPost = httpsCallable(functions, "followFromPost"); // +30m
export const fnAddComment = httpsCallable(functions, "addComment");    // +5/+10
export const fnSetTier = httpsCallable(functions, "setTier");          // FREE/PULSE/ETERNAL
export const fnFollowUser = httpsCallable(functions, "followUser");    // follow da profilo (NO tempo extra)

// Time helpers
const MIN = 60_000;
export const base24h = (t) => t + 24 * 60 * MIN;
export const remainingMs = (expiresAt) => Math.max(0, expiresAt - Date.now());
export const formatRemaining = (ms) => {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m ${sec}s`;
};
export const lifePct = (createdAt, expiresAt) => {
  const total = Math.max(1, expiresAt - createdAt);
  const rem = Math.max(0, expiresAt - Date.now());
  return Math.max(0, Math.min(1, rem / total));
};

// Utils
export const $ = (id) => document.getElementById(id);
export const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));

export function normalizeTags(raw){
  const parts = raw
    .split(/[, ]+/)
    .map(s=>s.trim())
    .filter(Boolean)
    .map(s => (s.startsWith("#") ? s.slice(1) : s))
    .map(s => s.toLowerCase().replace(/[^a-z0-9_àèéìòù]/gi,""))
    .filter(Boolean);
  return Array.from(new Set(parts)).slice(0,5);
}

export async function uploadTo(path, fileOrBlob){
  const r = ref(storage, path);
  await uploadBytes(r, fileOrBlob);
  return await getDownloadURL(r);
}

export async function requireAuthOrRedirect(){
  return new Promise((resolve)=>{
    onAuthStateChanged(auth, (u)=>{
      if(!u) location.href = "login.html";
      else resolve(u);
    });
  });
}

export async function getUser(uid){
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function logout(){
  await signOut(auth);
  location.href = "index.html";
}

// Feed data
export async function fetchLivePosts(){
  const qy = query(
    collection(db, "posts"),
    where("expiresAt", ">", Date.now()),
    orderBy("expiresAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(qy);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchActiveAds(){
  const qy = query(
    collection(db, "ads"),
    where("active", "==", true),
    orderBy("priority", "desc"),
    limit(10)
  );
  const snap = await getDocs(qy);
  return snap.docs.map(d => ({ id: d.id, ...d.data(), isAd:true }));
}

export function injectAds(posts, ads, everyN, tier){
  if(tier !== "FREE") return posts;
  if(!ads.length) return posts;
  const out = [];
  let c = 0, ai = 0;
  for(const p of posts){
    out.push(p); c++;
    if(c % everyN === 0){
      out.push(ads[ai % ads.length]);
      ai++;
    }
  }
  return out;
}

// Tenor
export async function tenorSearch(q){
  if(!TENOR_KEY) return [];
  const r = await fetch(`https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=${TENOR_KEY}&limit=12`);
  const j = await r.json();
  return (j.results||[])
    .map(x => x.media_formats?.gif?.url || x.media_formats?.tinygif?.url)
    .filter(Boolean);
}

// Auth helpers (used in login/register)
export async function login(email, pass){
  await signInWithEmailAndPassword(auth, email, pass);
}
export async function register(username, email, pass, avatarFile){
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  const uid = cred.user.uid;

  let avatarUrl = null;
  if(avatarFile){
    avatarUrl = await uploadTo(`avatars/${uid}/${Date.now()}_${avatarFile.name}`, avatarFile);
  }

  await setDoc(doc(db, "users", uid), {
    username: username || email.split("@")[0],
    bio: "Qui per far sopravvivere i miei post.",
    avatarUrl,
    bannerUrl: null,
    followerCount: 0,
    followingCount: 0,
    tier: "FREE", // FREE/PULSE/ETERNAL
    createdAt: Date.now(),
  });

  return cred;
}

export async function setTier(tier){
  await fnSetTier({ tier });
}

export async function followUser(targetUid){
  await fnFollowUser({ targetUid });
}
