import { login } from "./auth.js";

const loginBtn = document.getElementById("loginBtn");
const msg = document.getElementById("msg");

loginBtn.addEventListener("click", async () => {

  msg.textContent = "Caricamento...";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("pass").value;

  try {

    await login(email, password);

    msg.textContent = "Accesso effettuato!";

    setTimeout(() => {
      window.location.href = "home.html";
    }, 500);

  } catch (error) {

    console.error(error);
    msg.textContent = error.message;

  }

});
