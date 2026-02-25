// firebase-config.js

// importa Firebase SDK (VERSIONE STABILE)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// CONFIGURAZIONE
const firebaseConfig = {
  apiKey: "AIzaSyCihCC_yOcR_vDBFtUFz8q_kk_In7hEiKk",
  authDomain: "void-web-c4c20.firebaseapp.com",
  projectId: "void-web-c4c20",
  storageBucket: "void-web-c4c20.appspot.com",
  messagingSenderId: "669855615136",
  appId: "1:669855615136:web:92e90ff435dc0be66d21c5"
};


// inizializza app
const app = initializeApp(firebaseConfig);


// inizializza servizi
export const auth = getAuth(app);
export const db = getFirestore(app);


// test
console.log("Firebase inizializzato correttamente");
