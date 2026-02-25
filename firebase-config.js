// firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCihCC_yOcR_vDBFtUFz8q_kk_In7hEiKk",
  authDomain: "void-web-c4c20.firebaseapp.com",
  projectId: "void-web-c4c20",
  storageBucket: "void-web-c4c20.appspot.com",
  messagingSenderId: "669855615136",
  appId: "1:669855615136:web:92e90ff435dc0be66d21c5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log("Firebase inizializzato correttamente");
