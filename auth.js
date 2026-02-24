// auth.js

import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


export async function register(email, password, username) {

  try {

    const userCredential =
      await createUserWithEmailAndPassword(auth, email, password);

    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {

      username: username,
      email: email,
      premium: false,
      createdAt: new Date()

    });

    window.location.href = "home.html";

  } catch (error) {

    alert(error.message);

  }

}



export async function login(email, password) {

  try {

    await signInWithEmailAndPassword(auth, email, password);

    window.location.href = "home.html";

  } catch (error) {

    alert(error.message);

  }

}
