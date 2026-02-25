// auth.js

import { auth, storage } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

/* ---------------- REGISTER ---------------- */

export async function register(username, email, password, avatarFile = null) {

  if (!username || !email || !password)
    throw new Error("Compila tutti i campi");

  const userCredential =
    await createUserWithEmailAndPassword(auth, email, password);

  let photoURL = null;

  if (avatarFile) {
    const avatarRef = ref(storage, `avatars/${userCredential.user.uid}`);
    await uploadBytes(avatarRef, avatarFile);
    photoURL = await getDownloadURL(avatarRef);
  }

  await updateProfile(userCredential.user, {
    displayName: username,
    photoURL
  });

  return userCredential.user;
}


/* ---------------- LOGIN ---------------- */

export async function login(email, password) {

  if (!email || !password)
    throw new Error("Inserisci email e password");

  const userCredential =
    await signInWithEmailAndPassword(auth, email, password);

  return userCredential.user;
}


/* ---------------- AUTOLOGIN ---------------- */

export function protectPage() {

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
    }
  });

}
