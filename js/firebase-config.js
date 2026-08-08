import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBwHqfQZ7YsuMisqJaR3CSAioeBrZuCYlg",
  authDomain: "hoch-gwimmas-nimma.firebaseapp.com",
  projectId: "hoch-gwimmas-nimma",
  storageBucket: "hoch-gwimmas-nimma.firebasestorage.app",
  messagingSenderId: "545457136245",
  appId: "1:545457136245:web:bf8f50ed503760c9710e3c",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
