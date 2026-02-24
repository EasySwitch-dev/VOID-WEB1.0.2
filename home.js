// home.js

import { db } from "./firebase-config.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { loadAds } from "./ads.js";


async function loadPosts() {

  const snapshot = await getDocs(collection(db, "posts"));

  let posts = [];

  snapshot.forEach(doc => {

    posts.push({
      id: doc.id,
      ...doc.data()
    });

  });

  return posts;

}



function renderFeed(feed) {

  const container = document.querySelector(".feed");

  container.innerHTML = "";

  feed.forEach(item => {

    const div = document.createElement("div");

    div.className = "post";

    if (item.isAd) {

      div.innerHTML = `
        <p>Sponsored</p>
        <img src="${item.mediaURL}">
      `;

    } else {

      div.innerHTML = `
        <img src="${item.mediaURL}">
        <p>${item.caption || ""}</p>
      `;

    }

    container.appendChild(div);

  });

}



async function initFeed() {

  const posts = await loadPosts();

  const ads = await loadAds();

  let finalFeed = [];

  let adIndex = 0;

  posts.forEach((post, index) => {

    finalFeed.push(post);

    if ((index + 1) % 5 === 0 && ads[adIndex]) {

      finalFeed.push(ads[adIndex]);

      adIndex++;

    }

  });

  renderFeed(finalFeed);

}



initFeed();
