// ads.js

import { db } from "./firebase-config.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


export async function loadAds() {

  const snapshot = await getDocs(collection(db, "ads"));

  let ads = [];

  snapshot.forEach(doc => {

    ads.push({
      id: doc.id,
      ...doc.data(),
      isAd: true
    });

  });

  return ads;

}
