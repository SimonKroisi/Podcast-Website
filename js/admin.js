import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

// Muss mit der isAdmin()-Liste in firestore.rules übereinstimmen.
const ALLOWED_ADMINS = ['podcastmj4@gmail.com', 'jedinger.michael@gmail.com'];

const loginView = document.getElementById('adminLogin');
const dashboardView = document.getElementById('adminDashboard');
const loginBtn = document.getElementById('adminLoginBtn');
const loginStatus = document.getElementById('adminLoginStatus');
const logoutBtn = document.getElementById('adminLogout');
const tableBody = document.getElementById('adminTableBody');
const countEl = document.getElementById('adminCount');

loginBtn?.addEventListener('click', async () => {
  loginStatus.textContent = '';
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
  } catch (error) {
    console.error('Login fehlgeschlagen', error);
    loginStatus.textContent = 'Login fehlgeschlagen. Bitte erneut versuchen.';
    loginStatus.className = 'form-status form-status--error';
  }
});

logoutBtn?.addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, async (user) => {
  if (user && ALLOWED_ADMINS.includes(user.email)) {
    loginView.style.display = 'none';
    dashboardView.style.display = 'block';
    await loadEntries();
  } else if (user) {
    loginStatus.textContent = `${user.email} hat keinen Admin-Zugriff.`;
    loginStatus.className = 'form-status form-status--error';
    await signOut(auth);
  } else {
    loginView.style.display = 'flex';
    dashboardView.style.display = 'none';
  }
});

async function loadEntries() {
  try {
    const q = query(collection(db, 'tippspielEntries'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    tableBody.innerHTML = '';
    countEl.textContent = String(snap.size);
    snap.forEach((doc) => {
      const d = doc.data();
      const date = d.createdAt?.toDate ? d.createdAt.toDate().toLocaleString('de-AT') : '–';
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${escapeHtml(date)}</td>
        <td>${escapeHtml(d.name || '')}</td>
        <td>${escapeHtml(d.email || '')}</td>
        <td>${escapeHtml(d.bundesligaMeister || '')}</td>
        <td>${escapeHtml(d.bundesligaPokal || '')}</td>
        <td>${escapeHtml(d.sonderfrage1 || '')}</td>
        <td>${escapeHtml(d.sonderfrage2 || '')}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Konnte Tippspiel-Daten nicht laden', error);
    tableBody.innerHTML = '<tr><td colspan="7">Fehler beim Laden der Daten – bist du als Admin freigeschaltet?</td></tr>';
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
