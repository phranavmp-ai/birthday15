/* =========================================================
   CONFIG
   ========================================================= */
// Countdown target: 15 July 2026, 12:00:00 AM local time
const TARGET_DATE = new Date(2026, 6, 15, 0, 0, 0); // month is 0-indexed -> 6 = July

/* =========================================================
   SCREEN MANAGEMENT
   ========================================================= */
const screens = {
  countdown: document.getElementById('countdown-screen'),
  birthday: document.getElementById('birthday-screen'),
  proposal: document.getElementById('proposal-screen'),
  celebration: document.getElementById('celebration-screen'),
};

function switchScreen(fromEl, toEl) {
  if (fromEl) {
    fromEl.classList.add('fade-out');
    fromEl.classList.remove('fade-in');
    setTimeout(() => {
      fromEl.classList.remove('active-screen', 'fade-out');
    }, 700);
  }
  setTimeout(() => {
    toEl.classList.add('active-screen');
    // force reflow so the animation restarts
    void toEl.offsetWidth;
    toEl.classList.add('fade-in');
  }, fromEl ? 500 : 0);
}

/* =========================================================
   COUNTDOWN
   ========================================================= */
const cdDays = document.getElementById('cd-days');
const cdHours = document.getElementById('cd-hours');
const cdMinutes = document.getElementById('cd-minutes');
const cdSeconds = document.getElementById('cd-seconds');

let countdownFinished = false;

function pad(n) { return n.toString().padStart(2, '0'); }

function updateCountdown() {
  const now = new Date();
  const diff = TARGET_DATE.getTime() - now.getTime();

  if (diff <= 0 && !countdownFinished) {
    countdownFinished = true;
    cdDays.textContent = '00';
    cdHours.textContent = '00';
    cdMinutes.textContent = '00';
    cdSeconds.textContent = '00';
    clearInterval(countdownInterval);
    revealMainContent();
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const newDays = pad(days), newHours = pad(hours), newMinutes = pad(minutes), newSecs = pad(seconds);

  if (cdDays.textContent !== newDays) cdDays.textContent = newDays;
  if (cdHours.textContent !== newHours) cdHours.textContent = newHours;
  if (cdMinutes.textContent !== newMinutes) cdMinutes.textContent = newMinutes;
  if (cdSeconds.textContent !== newSecs) cdSeconds.textContent = newSecs;

  cdSeconds.classList.add('tick');
  setTimeout(() => cdSeconds.classList.remove('tick'), 150);
}

let countdownInterval;

function startCountdown() {
  updateCountdown();
  if (!countdownFinished) {
    countdownInterval = setInterval(updateCountdown, 1000);
  } else {
    revealMainContent();
  }
}

function revealMainContent() {
  switchScreen(screens.countdown, screens.birthday);
  setTimeout(() => launchConfettiBurst(1600), 900);
}

/* =========================================================
   BIRTHDAY -> PROPOSAL
   ========================================================= */
document.getElementById('to-proposal-btn').addEventListener('click', () => {
  switchScreen(screens.birthday, screens.proposal);
});

/* =========================================================
   NO BUTTON — EVASIVE BEHAVIOR
   ========================================================= */
const noBtn = document.getElementById('no-btn');
const yesBtn = document.getElementById('yes-btn');
const proposalButtonsWrap = document.getElementById('proposal-buttons');
let noBtnEscaped = false;

function moveNoButtonRandom() {
  const margin = 60;
  const btnW = noBtn.offsetWidth || 120;
  const btnH = noBtn.offsetHeight || 56;

  const maxX = window.innerWidth - btnW - margin;
  const maxY = window.innerHeight - btnH - margin;

  const newX = Math.random() * (maxX - margin) + margin;
  const newY = Math.random() * (maxY - margin) + margin;

  if (!noBtnEscaped) {
    noBtn.classList.add('escaped');
    proposalButtonsWrap.classList.add('escaping');
    noBtnEscaped = true;
  }

  noBtn.style.left = `${newX}px`;
  noBtn.style.top = `${newY}px`;
}

function distanceToButton(x, y) {
  const rect = noBtn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return Math.hypot(x - cx, y - cy);
}

const EVADE_RADIUS = 110;

function handlePointerNear(x, y) {
  if (distanceToButton(x, y) < EVADE_RADIUS) {
    moveNoButtonRandom();
  }
}

document.addEventListener('mousemove', (e) => {
  if (screens.proposal.classList.contains('active-screen')) {
    handlePointerNear(e.clientX, e.clientY);
  }
});

document.addEventListener('touchmove', (e) => {
  if (screens.proposal.classList.contains('active-screen') && e.touches.length) {
    const t = e.touches[0];
    handlePointerNear(t.clientX, t.clientY);
  }
}, { passive: true });

document.addEventListener('touchstart', (e) => {
  if (screens.proposal.classList.contains('active-screen') && e.touches.length) {
    const t = e.touches[0];
    handlePointerNear(t.clientX, t.clientY);
  }
}, { passive: true });

// If somehow focused via keyboard/tab, still dodge instead of allowing activation
noBtn.addEventListener('mouseenter', moveNoButtonRandom);
noBtn.addEventListener('focus', moveNoButtonRandom);
noBtn.addEventListener('click', (e) => {
  e.preventDefault();
  moveNoButtonRandom();
});

// Reposition safely if the window resizes while it's escaped
window.addEventListener('resize', () => {
  if (noBtnEscaped) moveNoButtonRandom();
});

/* =========================================================
   YES BUTTON -> CELEBRATION
   ========================================================= */
yesBtn.addEventListener('click', () => {
  switchScreen(screens.proposal, screens.celebration);
  setTimeout(() => {
    launchConfettiBurst(2400);
    startHeartRain(6000);
  }, 700);
});

/* =========================================================
   AMBIENT BACKGROUND GENERATORS
   ========================================================= */
const petalsContainer = document.getElementById('petals-container');
const heartsContainer = document.getElementById('hearts-container');
const sparklesContainer = document.getElementById('sparkles-container');
const butterfliesContainer = document.getElementById('butterflies-container');

const PETAL_EMOJI = ['🌸', '🌺', '🌷'];
const HEART_EMOJI = ['❤️', '💗', '💕'];
const BUTTERFLY_EMOJI = ['🦋'];

function spawnPetal() {
  const el = document.createElement('span');
  el.className = 'petal';
  el.textContent = PETAL_EMOJI[Math.floor(Math.random() * PETAL_EMOJI.length)];
  el.style.left = `${Math.random() * 100}vw`;
  el.style.setProperty('--drift', `${(Math.random() - 0.5) * 160}px`);
  el.style.animationDuration = `${10 + Math.random() * 8}s`;
  el.style.fontSize = `${14 + Math.random() * 12}px`;
  petalsContainer.appendChild(el);
  setTimeout(() => el.remove(), 20000);
}

function spawnHeart() {
  const el = document.createElement('span');
  el.className = 'heart-float';
  el.textContent = HEART_EMOJI[Math.floor(Math.random() * HEART_EMOJI.length)];
  el.style.left = `${Math.random() * 100}vw`;
  el.style.setProperty('--drift', `${(Math.random() - 0.5) * 120}px`);
  el.style.animationDuration = `${12 + Math.random() * 8}s`;
  el.style.fontSize = `${12 + Math.random() * 14}px`;
  heartsContainer.appendChild(el);
  setTimeout(() => el.remove(), 22000);
}

function spawnSparkle() {
  const el = document.createElement('span');
  el.className = 'sparkle';
  el.textContent = '✨';
  el.style.left = `${Math.random() * 100}vw`;
  el.style.top = `${Math.random() * 100}vh`;
  el.style.animationDuration = `${2.5 + Math.random() * 3}s`;
  el.style.fontSize = `${10 + Math.random() * 10}px`;
  sparklesContainer.appendChild(el);
  setTimeout(() => el.remove(), 6000);
}

function spawnButterfly() {
  const el = document.createElement('span');
  el.className = 'butterfly';
  el.textContent = BUTTERFLY_EMOJI[0];
  el.style.left = `${Math.random() * 90}vw`;
  el.style.top = `${Math.random() * 80}vh`;
  el.style.animationDuration = `${16 + Math.random() * 8}s`;
  butterfliesContainer.appendChild(el);
  setTimeout(() => el.remove(), 24000);
}

setInterval(spawnPetal, 900);
setInterval(spawnHeart, 1300);
setInterval(spawnSparkle, 500);
setInterval(spawnButterfly, 5000);

// seed a few immediately so the page doesn't feel empty on load
for (let i = 0; i < 8; i++) setTimeout(spawnPetal, i * 150);
for (let i = 0; i < 6; i++) setTimeout(spawnHeart, i * 200);
for (let i = 0; i < 10; i++) setTimeout(spawnSparkle, i * 100);
for (let i = 0; i < 2; i++) setTimeout(spawnButterfly, i * 400);

/* =========================================================
   CONFETTI (lightweight canvas implementation, no external libs)
   ========================================================= */
const confettiCanvas = document.getElementById('confetti-canvas');
const ctx = confettiCanvas.getContext('2d');
let confettiPieces = [];
let confettiAnimating = false;

function resizeConfettiCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfettiCanvas);
resizeConfettiCanvas();

const CONFETTI_COLORS = ['#FF5FA2', '#F8BBD9', '#FFD6E7', '#E8A0BF', '#FFFFFF'];

function launchConfettiBurst(count = 1500 /* actually piece-ms budget */) {
  const pieceCount = Math.min(180, Math.floor(count / 12));
  for (let i = 0; i < pieceCount; i++) {
    confettiPieces.push({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * 200,
      size: 5 + Math.random() * 6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      speedY: 2 + Math.random() * 3,
      speedX: (Math.random() - 0.5) * 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      life: 0,
      maxLife: 260 + Math.random() * 120,
    });
  }
  if (!confettiAnimating) {
    confettiAnimating = true;
    requestAnimationFrame(animateConfetti);
  }
}

function animateConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiPieces.forEach((p) => {
    p.x += p.speedX;
    p.y += p.speedY;
    p.rotation += p.rotationSpeed;
    p.life++;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
    if (p.shape === 'rect') {
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  confettiPieces = confettiPieces.filter(
    (p) => p.life < p.maxLife && p.y < confettiCanvas.height + 40
  );

  if (confettiPieces.length > 0) {
    requestAnimationFrame(animateConfetti);
  } else {
    confettiAnimating = false;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

/* =========================================================
   HEART RAIN (celebration screen)
   ========================================================= */
function startHeartRain(durationMs = 5000) {
  const end = Date.now() + durationMs;
  const rainInterval = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(rainInterval);
      return;
    }
    for (let i = 0; i < 2; i++) spawnHeart();
  }, 150);
}

/* =========================================================
   CUSTOM CURSOR HEART BURST ON CLICK
   ========================================================= */
document.addEventListener('click', (e) => {
  for (let i = 0; i < 3; i++) {
    const heart = document.createElement('span');
    heart.className = 'click-heart';
    heart.textContent = '❤️';
    heart.style.left = `${e.clientX}px`;
    heart.style.top = `${e.clientY}px`;
    heart.style.setProperty('--bx', `${(Math.random() - 0.5) * 60}px`);
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 850);
  }
});

/* =========================================================
   MUSIC TOGGLE
   ========================================================= */
const musicBtn = document.getElementById('music-toggle');
const bgMusic = document.getElementById('bg-music');
let musicPlaying = false;

musicBtn.addEventListener('click', () => {
  if (!musicPlaying) {
    bgMusic.play().catch(() => {
      /* Autoplay restrictions or missing audio source — fail silently */
    });
    musicBtn.classList.add('playing');
    musicPlaying = true;
  } else {
    bgMusic.pause();
    musicBtn.classList.remove('playing');
    musicPlaying = false;
  }
});

/* =========================================================
   INIT
   ========================================================= */
startCountdown();
