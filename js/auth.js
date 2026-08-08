import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

function setStatus(el, message, isError) {
  if (!el) return;
  el.textContent = message;
  el.className = "form-status" + (isError ? " form-status--error" : message ? " form-status--success" : "");
}

function friendlyAuthError(error) {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "Diese E-Mail-Adresse ist bereits registriert. Versuch dich einzuloggen.";
    case "auth/invalid-email":
      return "Bitte gib eine gültige E-Mail-Adresse ein.";
    case "auth/weak-password":
      return "Das Passwort muss mindestens 6 Zeichen lang sein.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "E-Mail oder Passwort ist falsch.";
    case "auth/too-many-requests":
      return "Zu viele Versuche. Bitte warte einen Moment und versuch es erneut.";
    default:
      return "Da ist leider etwas schiefgelaufen. Bitte versuch es erneut.";
  }
}

export function initAuthForms() {
  const tabButtons = document.querySelectorAll(".auth-tab");
  const panels = document.querySelectorAll(".auth-panel");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("is-active"));
      panels.forEach((p) => p.classList.remove("is-active"));
      btn.classList.add("is-active");
      document.getElementById(`auth-panel-${btn.dataset.tab}`)?.classList.add("is-active");
    });
  });

  const registerForm = document.getElementById("registerForm");
  const registerStatus = document.getElementById("registerStatus");
  registerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const email = registerForm.elements.email.value.trim();
    const password = registerForm.elements.password.value;
    const passwordConfirm = registerForm.elements.passwordConfirm.value;

    if (password !== passwordConfirm) {
      setStatus(registerStatus, "Die Passwörter stimmen nicht überein.", true);
      return;
    }
    if (password.length < 6) {
      setStatus(registerStatus, "Das Passwort muss mindestens 6 Zeichen lang sein.", true);
      return;
    }

    submitBtn.disabled = true;
    setStatus(registerStatus, "Konto wird erstellt …", false);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", credential.user.uid), {
        email,
        subscribed: false,
        createdAt: serverTimestamp(),
      });
      await sendEmailVerification(credential.user);
      registerForm.reset();
      setStatus(registerStatus, "Konto erstellt! Wir haben dir eine Bestätigungs-E-Mail geschickt.", false);
    } catch (error) {
      console.error("Registration failed", error);
      setStatus(registerStatus, friendlyAuthError(error), true);
    } finally {
      submitBtn.disabled = false;
    }
  });

  const loginForm = document.getElementById("loginForm");
  const loginStatus = document.getElementById("loginStatus");
  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const email = loginForm.elements.email.value.trim();
    const password = loginForm.elements.password.value;

    submitBtn.disabled = true;
    setStatus(loginStatus, "Wird eingeloggt …", false);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      loginForm.reset();
      setStatus(loginStatus, "", false);
    } catch (error) {
      console.error("Login failed", error);
      setStatus(loginStatus, friendlyAuthError(error), true);
    } finally {
      submitBtn.disabled = false;
    }
  });

  const forgotBtn = document.getElementById("forgotPasswordBtn");
  forgotBtn?.addEventListener("click", async () => {
    const email = loginForm?.elements.email.value.trim();
    if (!email) {
      setStatus(loginStatus, "Gib zuerst deine E-Mail-Adresse ein, dann kannst du dein Passwort zurücksetzen.", true);
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setStatus(loginStatus, "Wir haben dir eine E-Mail zum Zurücksetzen des Passworts geschickt.", false);
    } catch (error) {
      console.error("Password reset failed", error);
      setStatus(loginStatus, friendlyAuthError(error), true);
    }
  });

  document.querySelectorAll("[data-logout]").forEach((btn) => {
    btn.addEventListener("click", () => signOut(auth));
  });

  const resendBtn = document.querySelector("[data-resend-verification]");
  const verifyEmailStatus = document.getElementById("verifyEmailStatus");
  resendBtn?.addEventListener("click", async () => {
    if (!auth.currentUser) return;
    resendBtn.disabled = true;
    setStatus(verifyEmailStatus, "Wird gesendet …", false);
    try {
      await sendEmailVerification(auth.currentUser);
      setStatus(verifyEmailStatus, "E-Mail wurde erneut gesendet.", false);
    } catch (error) {
      console.error("Resend verification failed", error);
      setStatus(verifyEmailStatus, friendlyAuthError(error), true);
    } finally {
      resendBtn.disabled = false;
    }
  });
}
