import { register } from "./auth.js";

const regBtn = document.getElementById("regBtn");
const msg = document.getElementById("msg");

regBtn.addEventListener("click", async () => {

  msg.textContent = "Caricamento...";

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("pass").value;
  const avatarFile = document.getElementById("avatar").files[0] ?? null;

  try {

    await register(username, email, password, avatarFile);

    msg.textContent = "Registrazione completata!";

    setTimeout(() => {
      window.location.href = "home.html";
    }, 800);

  } catch (error) {

    console.error(error);
    msg.textContent = error.message;

  }

});
