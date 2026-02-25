// user-global.js
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/**
 * Aggiorna tutti gli elementi con classi .user-name e .user-avatar
 * @param {Object} userData { displayName, photoURL }
 */
function updateUserElements(userData) {
  document.querySelectorAll(".user-name").forEach(el => {
    el.textContent = userData.displayName ?? "User";
  });
  document.querySelectorAll(".user-avatar").forEach(el => {
    el.src = userData.photoURL ?? "https://via.placeholder.com/50";
  });
  document.querySelectorAll(".user-profile-link").forEach(el => {
    el.href = `profile.html?uid=${auth.currentUser?.uid}`;
  });
}

/**
 * Inizializza la UI globale utente
 * Deve essere chiamato in tutte le pagine
 */
export async function initUserGlobal() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // se non loggato → login
      if (!location.pathname.includes("login.html") &&
          !location.pathname.includes("register.html") &&
          !location.pathname.includes("index.html")) {
        location.href = "login.html";
      }
      return;
    }

    let displayName = user.displayName;
    let photoURL = user.photoURL;

    // prova a prendere dati aggiuntivi da Firestore
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        displayName = data.username ?? displayName;
        photoURL = data.avatarUrl ?? photoURL;
      }
    } catch (err) {
      console.error("Errore recupero dati utente da Firestore:", err);
    }

    updateUserElements({ displayName, photoURL });
  });
}
