document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

navToggle?.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

mainNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

// Bottom-Tab-Bar "Mehr"-Sheet (mobile)
const moreSheet = document.getElementById('moreSheet');
const sheetBackdrop = document.getElementById('sheetBackdrop');
const tabMoreBtn = document.getElementById('tabMoreBtn');

function openMoreSheet() {
  moreSheet.classList.add('is-open');
  sheetBackdrop.classList.add('is-open');
  moreSheet.setAttribute('aria-hidden', 'false');
  tabMoreBtn?.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMoreSheet() {
  moreSheet.classList.remove('is-open');
  sheetBackdrop.classList.remove('is-open');
  moreSheet.setAttribute('aria-hidden', 'true');
  tabMoreBtn?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (moreSheet && sheetBackdrop) {
  tabMoreBtn?.addEventListener('click', openMoreSheet);
  sheetBackdrop.addEventListener('click', closeMoreSheet);
}

// Countdown bis zur nächsten Folge: jeden Montag 20:00 Uhr (Europe/Vienna)
const countdownEl = document.getElementById('countdown');

function getViennaOffsetMs(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Vienna',
    hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(date).reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  const asUTC = Date.UTC(
    parts.year, parts.month - 1, parts.day,
    parts.hour === '24' ? 0 : parts.hour, parts.minute, parts.second
  );
  return asUTC - date.getTime();
}

function getNextMondayEightPm(now) {
  const offset = getViennaOffsetMs(now);
  const viennaWall = new Date(now.getTime() + offset);
  const day = viennaWall.getUTCDay();
  const daysUntilMonday = (1 - day + 7) % 7;
  let targetWall = new Date(Date.UTC(
    viennaWall.getUTCFullYear(), viennaWall.getUTCMonth(), viennaWall.getUTCDate() + daysUntilMonday,
    20, 0, 0
  ));
  if (daysUntilMonday === 0 && viennaWall.getTime() >= targetWall.getTime()) {
    targetWall = new Date(targetWall.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
  return new Date(targetWall.getTime() - offset);
}

function updateCountdown() {
  if (!countdownEl) return;
  const now = new Date();
  const target = getNextMondayEightPm(now);
  const diff = Math.max(0, target.getTime() - now.getTime());

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  countdownEl.textContent =
    `Nächste Folge in ${days}T ${hours}Std ${minutes}Min ${seconds}Sek`;
}

if (countdownEl) {
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// Countdown bis Anmeldeschluss Tippspiel: 31.08.2026, 23:59 (Europe/Vienna)
const tippspielCountdownEl = document.getElementById('tippspielCountdown');

function updateTippspielCountdown() {
  if (!tippspielCountdownEl) return;
  const deadline = new Date('2026-08-31T23:59:00+02:00');
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();

  if (diff <= 0) {
    tippspielCountdownEl.textContent = 'Anmeldeschluss erreicht';
    return;
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  tippspielCountdownEl.textContent =
    `Noch ${days}T ${hours}Std ${minutes}Min bis Anmeldeschluss`;
}

if (tippspielCountdownEl) {
  updateTippspielCountdown();
  setInterval(updateTippspielCountdown, 60000);
}

