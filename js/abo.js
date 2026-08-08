import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import { auth } from "./firebase-config.js";
import { initAuthForms } from "./auth.js";

initAuthForms();

const loggedOutEl = document.getElementById("checkoutLoggedOut");
const loggedInEl = document.getElementById("checkoutLoggedIn");
const loggedInAsEl = document.getElementById("checkoutLoggedInAs");
const checkoutBtn = document.getElementById("checkoutBtn");
const agbConsent = document.getElementById("agbConsent");
const baseHref = checkoutBtn?.getAttribute("href") || "#";

function updateCheckoutBtnState() {
  if (!checkoutBtn) return;
  if (agbConsent?.checked) {
    checkoutBtn.removeAttribute("aria-disabled");
  } else {
    checkoutBtn.setAttribute("aria-disabled", "true");
  }
}

agbConsent?.addEventListener("change", updateCheckoutBtnState);
checkoutBtn?.addEventListener("click", (event) => {
  if (!agbConsent?.checked) event.preventDefault();
});

onAuthStateChanged(auth, (user) => {
  if (!loggedOutEl || !loggedInEl) return;
  loggedOutEl.hidden = !!user;
  loggedInEl.hidden = !user;
  if (!user) return;

  if (loggedInAsEl) loggedInAsEl.textContent = `Eingeloggt als ${user.email}`;
  updateCheckoutBtnState();

  if (checkoutBtn && baseHref !== "#") {
    const url = new URL(baseHref, window.location.href);
    url.searchParams.set("client_reference_id", user.uid);
    if (user.email) url.searchParams.set("prefilled_email", user.email);
    checkoutBtn.href = url.toString();
  }
});
