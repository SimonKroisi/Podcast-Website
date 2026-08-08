document.getElementById('year').textContent = new Date().getFullYear();

/* ===== "Zur Desktop-Version": merkt die Wahl für diese Session,
   damit index.html nicht sofort wieder hierher zurückleitet ===== */
document.querySelectorAll('#desktopLinkFooter, #desktopLinkSheet').forEach((link) => {
  link.addEventListener('click', () => {
    try { sessionStorage.setItem('hgnView', 'desktop'); } catch (e) {}
  });
});

/* ===== Countdown bis zur nächsten Folge: jeden Montag 20:00 Uhr (Europe/Vienna) ===== */
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

/* ===== "Warum reinhören" swipe-card dots ===== */
const swipeRow = document.querySelector('.m-swipe-row');
const dotsWrap = document.getElementById('warumDots');

if (swipeRow && dotsWrap) {
  const cards = Array.from(swipeRow.children);
  cards.forEach((_, i) => {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('is-active');
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  let ticking = false;
  swipeRow.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollLeft = swipeRow.scrollLeft;
      const cardWidth = cards[0].offsetWidth + 12;
      const activeIndex = Math.round(scrollLeft / cardWidth);
      dots.forEach((d, i) => d.classList.toggle('is-active', i === activeIndex));
      ticking = false;
    });
  }, { passive: true });
}

/* ===== Social media tabs ===== */
const socialTabs = document.querySelectorAll('.m-social-tab');
const socialPanels = document.querySelectorAll('.m-social-panel');

socialTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    socialTabs.forEach((t) => {
      t.classList.remove('is-active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');

    const targetId = tab.getAttribute('data-target');
    socialPanels.forEach((panel) => {
      const isTarget = panel.id === targetId;
      panel.classList.toggle('is-active', isTarget);
      panel.hidden = !isTarget;
    });
  });
});

/* ===== Bottom sheet ("Mehr") ===== */
const sheet = document.getElementById('moreSheet');
const sheetBackdrop = document.getElementById('sheetBackdrop');
const topMoreBtn = document.getElementById('topMoreBtn');
const tabMoreBtn = document.getElementById('tabMoreBtn');

function openSheet() {
  sheet.classList.add('is-open');
  sheetBackdrop.classList.add('is-open');
  sheet.setAttribute('aria-hidden', 'false');
  topMoreBtn?.setAttribute('aria-expanded', 'true');
  tabMoreBtn?.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeSheet() {
  sheet.classList.remove('is-open');
  sheetBackdrop.classList.remove('is-open');
  sheet.setAttribute('aria-hidden', 'true');
  topMoreBtn?.setAttribute('aria-expanded', 'false');
  tabMoreBtn?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

topMoreBtn?.addEventListener('click', openSheet);
tabMoreBtn?.addEventListener('click', openSheet);
sheetBackdrop?.addEventListener('click', closeSheet);

/* ===== Active tab bar highlight based on scroll position ===== */
const tabs = document.querySelectorAll('.m-tab[href]');
const sectionMap = [
  { id: 'top', tab: 'home' },
  { id: 'hoeren', tab: 'hoeren' },
];

function updateActiveTab() {
  let current = sectionMap[0].tab;
  for (const { id, tab } of sectionMap) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top - window.innerHeight / 2 <= 0) {
      current = tab;
    }
  }
  tabs.forEach((t) => t.classList.toggle('is-active', t.dataset.tab === current));
}

let tabTicking = false;
window.addEventListener('scroll', () => {
  if (tabTicking) return;
  tabTicking = true;
  requestAnimationFrame(() => {
    updateActiveTab();
    tabTicking = false;
  });
}, { passive: true });

updateActiveTab();
