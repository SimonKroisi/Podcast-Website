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
