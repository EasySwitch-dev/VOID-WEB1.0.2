import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function getActiveAds() {
  const now = new Date();

  const q = query(
    collection(db, "ads"),
    where("expiresAt", ">", now),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  let ads = [];

  snapshot.forEach((doc) => {
    ads.push({
      id: doc.id,
      ...doc.data(),
      isAd: true
    });
  });

  return ads;
}
