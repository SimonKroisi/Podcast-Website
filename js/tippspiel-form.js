import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

const DEADLINE = new Date('2026-08-31T23:59:00+02:00');

const form = document.getElementById('tippForm');
const statusEl = document.getElementById('tippFormStatus');
const submitBtn = document.getElementById('tippFormSubmit');

const sessionId = new URLSearchParams(window.location.search).get('session_id') || '';

if (Date.now() > DEADLINE.getTime() && form) {
  form.querySelectorAll('input, button').forEach((el) => { el.disabled = true; });
  statusEl.textContent = 'Der Anmeldeschluss (31. August 2026) ist bereits vorbei – eine Tippabgabe ist nicht mehr möglich.';
  statusEl.className = 'form-status form-status--error';
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (Date.now() > DEADLINE.getTime()) {
    statusEl.textContent = 'Der Anmeldeschluss (31. August 2026) ist bereits vorbei – eine Tippabgabe ist nicht mehr möglich.';
    statusEl.className = 'form-status form-status--error';
    return;
  }

  const email = form.elements.email.value.trim();
  const name = form.elements.name.value.trim();
  const bundesligaMeister = form.elements.bundesligaMeister.value.trim();
  const bundesligaPokal = form.elements.bundesligaPokal.value.trim();
  const sonderfrage1 = form.elements.sonderfrage1.value.trim();
  const sonderfrage2 = form.elements.sonderfrage2.value.trim();

  if (!email || !name || !bundesligaMeister || !bundesligaPokal) {
    statusEl.textContent = 'Bitte fülle E-Mail, Name und die Pflichttipps aus.';
    statusEl.className = 'form-status form-status--error';
    return;
  }

  const payload = {
    email,
    name,
    bundesligaMeister,
    bundesligaPokal,
    sessionId,
    createdAt: serverTimestamp(),
  };
  if (sonderfrage1) payload.sonderfrage1 = sonderfrage1;
  if (sonderfrage2) payload.sonderfrage2 = sonderfrage2;

  submitBtn.disabled = true;
  statusEl.textContent = 'Wird gesendet …';
  statusEl.className = 'form-status';

  try {
    await addDoc(collection(db, 'tippspielEntries'), payload);
    form.reset();
    statusEl.textContent = 'Danke! Deine Tipps wurden gespeichert.';
    statusEl.className = 'form-status form-status--success';
  } catch (error) {
    console.error('Tippspiel-Abgabe fehlgeschlagen', error);
    statusEl.textContent = 'Da ist leider etwas schiefgelaufen. Bitte versuch es später erneut oder schreib uns direkt eine E-Mail.';
    statusEl.className = 'form-status form-status--error';
  } finally {
    submitBtn.disabled = false;
  }
});
