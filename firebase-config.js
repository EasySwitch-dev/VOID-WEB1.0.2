// firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// CONFIG FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCihCC_yOcR_vDBFtUFz8q_kk_In7hEiKk",
  authDomain: "void-web-c4c20.firebaseapp.com",
  projectId: "void-web-c4c20",
  storageBucket: "void-web-c4c20.firebasestorage.app",
  messagingSenderId: "669855615136",
  appId: "1:669855615136:web:92e90ff435dc0be66d21c5",
  measurementId: "G-EEWHX8F0LL"
};


// inizializza firebase
const app = initializeApp(firebaseConfig);


// esporta auth e database
export const auth = getAuth(app);
export const db = getFirestore(app);
