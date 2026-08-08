import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

const form = document.getElementById('sponsorForm');
const statusEl = document.getElementById('sponsorFormStatus');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitBtn = form.querySelector('button[type="submit"]');

  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();
  const company = form.elements.company.value.trim();
  const website = form.elements.website.value.trim();
  const message = form.elements.message.value.trim();

  if (!name || !email || !message) {
    statusEl.textContent = 'Bitte fülle Name, E-Mail und Nachricht aus.';
    statusEl.className = 'form-status form-status--error';
    return;
  }

  const payload = { name, email, message, createdAt: serverTimestamp() };
  if (company) payload.company = company;
  if (website) payload.website = website;

  submitBtn.disabled = true;
  statusEl.textContent = 'Wird gesendet …';
  statusEl.className = 'form-status';

  try {
    await addDoc(collection(db, 'sponsorRequests'), payload);
    form.reset();
    statusEl.textContent = 'Danke! Deine Anfrage wurde übermittelt – wir melden uns in der Regel innerhalb weniger Tage zurück.';
    statusEl.className = 'form-status form-status--success';
  } catch (error) {
    console.error('Sponsor request failed', error);
    statusEl.textContent = 'Da ist leider etwas schiefgelaufen. Bitte versuch es später erneut oder schreib uns direkt eine E-Mail.';
    statusEl.className = 'form-status form-status--error';
  } finally {
    submitBtn.disabled = false;
  }
});
