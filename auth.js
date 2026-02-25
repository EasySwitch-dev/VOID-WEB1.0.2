// auth.js
import { auth, storage } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

/**
 * Registrazione utente
 */
export async function register(username, email, password, avatarFile = null) {
  if (!username || !email || !password)
    throw new Error("Compila tutti i campi");

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

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

/**
 * Login utente
 */
export async function login(email, password) {
  if (!email || !password)
    throw new Error("Inserisci email e password");

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Autologin
 */
export function autoLogin(redirectIfLogged = true) {
  onAuthStateChanged(auth, (user) => {
    if (user && redirectIfLogged) {
      window.location.href = "home.html";
    }
  });
}
