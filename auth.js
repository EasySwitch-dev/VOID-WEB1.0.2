// auth.js
import { auth, storage } from "./firebase-config.js";
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

/**
 * Registra un nuovo utente
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @param {File|null} avatarFile
 */
export async function register(username, email, password, avatarFile = null) {
  if (!username || !email || !password) throw new Error("Compila tutti i campi");

  // Crea l'utente su Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // Aggiorna displayName e avatar se presente
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
