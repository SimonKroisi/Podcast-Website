import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";
import { initAuthForms } from "./auth.js";

initAuthForms();

const TIP_DEADLINE = new Date("2026-08-31T23:59:00+02:00");

const LEAGUE_TABLE_FIELDS = [
  { key: "meister", label: "Meister" },
  { key: "vizemeister", label: "Vizemeister" },
  { key: "platz3", label: "3. Platz" },
  { key: "platz4", label: "4. Platz" },
  { key: "platz5", label: "5. Platz" },
  { key: "platz6", label: "6. Platz" },
  { key: "platz7", label: "7. Platz" },
];

const CUP_FIELDS = [
  { key: "sieger", label: "Sieger" },
  { key: "zweiter", label: "Zweiter" },
  { key: "halbfinale1", label: "Halbfinale" },
  { key: "halbfinale2", label: "Halbfinale" },
  { key: "halbfinale3", label: "Halbfinale" },
  { key: "halbfinale4", label: "Halbfinale" },
];

const COMPETITIONS = [
  {
    key: "laliga",
    name: "La Liga",
    flag: "🇪🇸",
    fields: [
      ...LEAGUE_TABLE_FIELDS,
      { key: "abstieg1", label: "Abstieg" },
      { key: "abstieg2", label: "Abstieg" },
      { key: "abstieg3", label: "Abstieg" },
      { key: "topscorer", label: "Top Torschütze" },
      { key: "pokalsieger", label: "Pokalsieger" },
    ],
  },
  {
    key: "bundesligaDE",
    name: "Deutsche Bundesliga",
    flag: "🇩🇪",
    fields: [
      ...LEAGUE_TABLE_FIELDS,
      { key: "relegation", label: "Relegation" },
      { key: "abstieg1", label: "Abstieg" },
      { key: "abstieg2", label: "Abstieg" },
      { key: "topscorer", label: "Top Torschütze" },
      { key: "pokalsieger", label: "Pokalsieger" },
    ],
  },
  {
    key: "bundesligaAT",
    name: "Österreichische Bundesliga",
    flag: "🇦🇹",
    fields: [
      ...LEAGUE_TABLE_FIELDS,
      { key: "abstieg1", label: "Abstieg" },
      { key: "topscorer", label: "Top Torschütze" },
      { key: "pokalsieger", label: "Pokalsieger" },
    ],
  },
  {
    key: "seriea",
    name: "Serie A",
    flag: "🇮🇹",
    fields: [
      ...LEAGUE_TABLE_FIELDS,
      { key: "abstieg1", label: "Abstieg" },
      { key: "abstieg2", label: "Abstieg" },
      { key: "abstieg3", label: "Abstieg" },
      { key: "topscorer", label: "Top Torschütze" },
      { key: "pokalsieger", label: "Pokalsieger" },
    ],
  },
  {
    key: "premierleague",
    name: "Premier League",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    fields: [
      ...LEAGUE_TABLE_FIELDS,
      { key: "abstieg1", label: "Abstieg" },
      { key: "abstieg2", label: "Abstieg" },
      { key: "abstieg3", label: "Abstieg" },
      { key: "topscorer", label: "Top Torschütze" },
      { key: "pokalsieger", label: "Pokalsieger" },
    ],
  },
  { key: "cl", name: "Champions League", flag: "🏆", fields: CUP_FIELDS },
  { key: "el", name: "Europa League", flag: "🏆", fields: CUP_FIELDS },
  { key: "uecl", name: "Conference League", flag: "🏆", fields: CUP_FIELDS },
];

const SONDERFRAGEN = [
  { key: "sonderfrage1", question: "Wer steigt von der 2. Liga in die österreichische Bundesliga auf?" },
  { key: "sonderfrage2", question: "Welche 4 Gegner bekommt Österreich in der EM 2028 Quali?" },
  { key: "sonderfrage3", question: "Wer gewinnt den Ballon d'Or 2026?" },
  { key: "sonderfrage4", question: "Wer hat am 31. Mai 2027 den höchsten Marktwert aller österreichischen Kicker?" },
  { key: "sonderfrage5", question: "Welcher Österreicher gibt sein Länderspieldebüt in der Saison 26/27?" },
  { key: "sonderfrage6", question: "Bleibt Infantino FIFA-Präsident? (Ja/Nein)" },
  { key: "sonderfrage7", question: "Welcher Österreicher schießt in der Saison 26/27 die meisten Tore für seinen Klub?" },
  { key: "sonderfrage8", question: "Welcher Trainer der österr. Bundesliga muss als Erstes gehen?" },
];

function fieldName(compKey, fieldKey) {
  return `${compKey}__${fieldKey}`;
}

function buildTipFormFields(container, answers) {
  container.innerHTML = "";

  COMPETITIONS.forEach((comp) => {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "tip-competition";
    const legend = document.createElement("legend");
    if (comp.flag) {
      const flagEl = document.createElement("span");
      flagEl.className = "tip-competition-flag";
      flagEl.textContent = comp.flag;
      flagEl.setAttribute("aria-hidden", "true");
      legend.appendChild(flagEl);
    }
    legend.appendChild(document.createTextNode(comp.name));
    fieldset.appendChild(legend);

    const grid = document.createElement("div");
    grid.className = "tip-grid";
    comp.fields.forEach((field) => {
      const name = fieldName(comp.key, field.key);
      const wrap = document.createElement("div");
      wrap.className = "form-group";
      const label = document.createElement("label");
      label.setAttribute("for", name);
      label.textContent = field.label;
      const input = document.createElement("input");
      input.type = "text";
      input.id = name;
      input.name = name;
      input.maxLength = 100;
      input.value = answers[name] || "";
      wrap.appendChild(label);
      wrap.appendChild(input);
      grid.appendChild(wrap);
    });
    fieldset.appendChild(grid);
    container.appendChild(fieldset);
  });

  const sonderfragenSet = document.createElement("fieldset");
  sonderfragenSet.className = "tip-competition";
  const sonderfragenLegend = document.createElement("legend");
  sonderfragenLegend.textContent = "Zusatzfragen";
  sonderfragenSet.appendChild(sonderfragenLegend);
  const sonderfragenGrid = document.createElement("div");
  sonderfragenGrid.className = "tip-grid tip-grid--wide";
  SONDERFRAGEN.forEach((item) => {
    const wrap = document.createElement("div");
    wrap.className = "form-group form-group--full";
    const label = document.createElement("label");
    label.setAttribute("for", item.key);
    label.textContent = item.question;
    const input = document.createElement("input");
    input.type = "text";
    input.id = item.key;
    input.name = item.key;
    input.maxLength = 200;
    input.value = answers[item.key] || "";
    wrap.appendChild(label);
    wrap.appendChild(input);
    sonderfragenGrid.appendChild(wrap);
  });
  sonderfragenSet.appendChild(sonderfragenGrid);
  container.appendChild(sonderfragenSet);
}

function collectTipAnswers(form) {
  const answers = {};
  new FormData(form).forEach((value, key) => {
    const trimmed = String(value).trim();
    if (trimmed) answers[key] = trimmed;
  });
  return answers;
}

function setStatus(el, message, isError) {
  if (!el) return;
  el.textContent = message;
  el.className = "form-status" + (isError ? " form-status--error" : message ? " form-status--success" : "");
}

let memberAreaInitialized = false;

async function initMemberArea(user) {
  if (memberAreaInitialized) return;
  memberAreaInitialized = true;

  const tipForm = document.getElementById("tipForm");
  const tipFields = document.getElementById("tipFormFields");
  const tipStatus = document.getElementById("tipFormStatus");
  const tipDeadlineNote = document.getElementById("tipDeadlineNote");

  if (tipForm && tipFields) {
    let existingAnswers = {};
    try {
      const tipDoc = await getDoc(doc(db, "tips", user.uid));
      if (tipDoc.exists()) existingAnswers = tipDoc.data().answers || {};
    } catch (error) {
      console.error("Failed to load existing tips", error);
    }

    buildTipFormFields(tipFields, existingAnswers);

    const deadlinePassed = Date.now() >= TIP_DEADLINE.getTime();
    if (deadlinePassed) {
      tipForm.querySelectorAll("input").forEach((input) => (input.disabled = true));
      const submitBtn = tipForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      if (tipDeadlineNote) tipDeadlineNote.textContent = "Der Anmeldeschluss (31. August 2026) ist erreicht – deine Tipps sind gespeichert und können nicht mehr geändert werden.";
    }

    tipForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (Date.now() >= TIP_DEADLINE.getTime()) {
        setStatus(tipStatus, "Der Anmeldeschluss ist bereits erreicht, deine Tipps können nicht mehr gespeichert werden.", true);
        return;
      }
      const submitBtn = tipForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      setStatus(tipStatus, "Tipps werden gespeichert …", false);
      try {
        const answers = collectTipAnswers(tipForm);
        await setDoc(doc(db, "tips", user.uid), {
          email: user.email,
          answers,
          updatedAt: serverTimestamp(),
        });
        setStatus(tipStatus, "Deine Tipps wurden gespeichert! Du kannst sie bis zum Anmeldeschluss jederzeit ändern.", false);
      } catch (error) {
        console.error("Failed to save tips", error);
        setStatus(tipStatus, "Da ist leider etwas schiefgelaufen. Bitte versuch es erneut.", true);
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  const questionForm = document.getElementById("questionForm");
  const questionStatus = document.getElementById("questionFormStatus");
  questionForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitBtn = questionForm.querySelector('button[type="submit"]');
    const question = questionForm.elements.question.value.trim();
    if (!question) {
      setStatus(questionStatus, "Bitte gib deine Frage ein.", true);
      return;
    }
    submitBtn.disabled = true;
    setStatus(questionStatus, "Wird gesendet …", false);
    try {
      await addDoc(collection(db, "questions"), {
        uid: user.uid,
        email: user.email,
        question,
        createdAt: serverTimestamp(),
      });
      questionForm.reset();
      setStatus(questionStatus, "Danke! Deine Frage kommt in den Stapel für die nächste Folge.", false);
    } catch (error) {
      console.error("Failed to submit question", error);
      setStatus(questionStatus, "Da ist leider etwas schiefgelaufen. Bitte versuch es erneut.", true);
    } finally {
      submitBtn.disabled = false;
    }
  });
}

const authSection = document.getElementById("auth");
const verifyEmailSection = document.getElementById("verifyEmail");
const lockedSection = document.getElementById("locked");
const memberSection = document.getElementById("memberArea");
const questionSection = document.getElementById("frage-podcast");
const tippspielSection = document.getElementById("tippspielArea");
const userEmailEls = document.querySelectorAll("[data-user-email]");

function showOnly(sectionToShow) {
  [authSection, verifyEmailSection, lockedSection, memberSection].forEach((section) => {
    if (!section) return;
    section.hidden = section !== sectionToShow;
  });
  if (questionSection) questionSection.hidden = sectionToShow !== memberSection;
  if (tippspielSection) tippspielSection.hidden = sectionToShow !== memberSection;
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    memberAreaInitialized = false;
    showOnly(authSection);
    return;
  }
  userEmailEls.forEach((el) => (el.textContent = user.email));

  try {
    await user.reload();
  } catch (error) {
    console.error("Failed to refresh user", error);
  }
  if (!user.emailVerified) {
    showOnly(verifyEmailSection);
    return;
  }

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const subscribed = userDoc.exists() && userDoc.data().subscribed === true;
    if (subscribed) {
      showOnly(memberSection);
      await initMemberArea(user);
    } else {
      showOnly(lockedSection);
    }
  } catch (error) {
    console.error("Failed to load user profile", error);
    showOnly(lockedSection);
  }
});
