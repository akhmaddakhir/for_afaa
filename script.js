const scenes = {
  loader: document.getElementById('loader'),
  welcome: document.getElementById('sceneWelcome'),
  letter: document.getElementById('sceneLetter'),
  cards: document.getElementById('sceneCards'),
  final: document.getElementById('sceneFinal')
};

const loaderText = document.getElementById('loaderText');
const envelopeButton = document.getElementById('envelopeButton');
const openEnvelopeHint = document.getElementById('openEnvelopeHint');
const letterBody = document.getElementById('letterBody');
const nextToCards = document.getElementById('nextToCards');
const nextToFinal = document.getElementById('nextToFinal');
const heartButton = document.getElementById('heartButton');
const finalText = document.getElementById('finalText');
const softAnswer = document.getElementById('softAnswer');
const forgivePanel = document.getElementById('forgivePanel');
const forgiveButtons = document.getElementById('forgiveButtons');
const yesButton = document.getElementById('yesButton');
const noButton = document.getElementById('noButton');
const glowBoom = document.getElementById('glowBoom');

const letterLines = [
  'Maaf ya aku akhir-akhir ini bikin kamu bingung.',
  'Ntah bales chat lama lah atau kelihatan cuek waktu bales.',
  'Ini bukannya aku ngga peduli sama kamu.',
  'Yang salah aku, karena biarin kamu bingung sendiri',
  'Maaf ya.'
];

const loaderLines = ['loading...', 'preparing something...', 'just for you.'];

startLoader();
initStars();
initParticles();
initConfetti();

async function startLoader() {
  for (const text of loaderLines) {
    loaderText.textContent = text;
    await wait(850);
  }
  switchScene(scenes.loader, scenes.welcome);
}

function switchScene(from, to) {
  from.classList.remove('active');

  setTimeout(() => {
    from.classList.add('hidden');
    to.classList.remove('hidden');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => to.classList.add('active'));
    });
  }, 420);
}

function openLetterFlow() {
  if (envelopeButton.classList.contains('opened')) return;

  envelopeButton.classList.add('opened');
  envelopeButton.disabled = true;

  setTimeout(() => {
    switchScene(scenes.welcome, scenes.letter);
    setTimeout(typeLetter, 650);
  }, 800);
}

envelopeButton.addEventListener('click', openLetterFlow);
openEnvelopeHint.addEventListener('click', openLetterFlow);

async function typeLetter() {
  letterBody.innerHTML = '';

  for (const line of letterLines) {
    const span = document.createElement('span');
    span.className = 'letter-line';
    span.textContent = line;
    letterBody.appendChild(span);

    await wait(120);
    span.classList.add('show');
    await wait(820);
  }

  nextToCards.classList.add('visible');
}

nextToCards.addEventListener('click', () => {
  switchScene(scenes.letter, scenes.cards);
  setTimeout(showCards, 720);
});

function showCards() {
  const cards = [...document.querySelectorAll('.info-card')];
  cards.forEach((card, index) => {
    setTimeout(() => card.classList.add('show'), index * 170);
  });

  setTimeout(() => nextToFinal.classList.add('visible'), cards.length * 170 + 420);
}

nextToFinal.addEventListener('click', () => {
  switchScene(scenes.cards, scenes.final);
});

heartButton.addEventListener('click', () => {
  if (heartButton.classList.contains('clicked')) return;

  heartButton.classList.add('clicked');
  heartButton.querySelector('span').textContent = 'Sekarang jawab ya';
  setTimeout(() => forgivePanel.classList.add('show'), 450);
});

let noRunCount = 0;
const noLabels = ['Yakin?', 'Masa sih?', 'Jangan dong 🥺', 'Please...', 'Coba lagi 😭', 'Hehe 😅'];

function moveNoButton(event) {
  if (noRunCount >= 7) return;
  event.preventDefault();

  noRunCount += 1;
  noButton.textContent = noLabels[noRunCount % noLabels.length];

  const panelRect = forgiveButtons.getBoundingClientRect();
  const btnRect = noButton.getBoundingClientRect();
  const maxX = Math.max(0, panelRect.width - btnRect.width - 12);
  const maxY = Math.max(0, panelRect.height - btnRect.height - 10);
  const x = Math.random() * maxX - (panelRect.width / 2 - btnRect.width / 2);
  const y = Math.random() * maxY - 18;

  noButton.style.transform = `translate(${x}px, ${y}px) scale(${Math.max(0.9, 1 - noRunCount * 0.015)})`;

  if (noRunCount === 7) {
    noButton.classList.add('tired');
    noButton.textContent = 'Yaudah deh 🤍';
  }
}

function showHappyEnding() {
  answerLocked = true;
  yesButton.disabled = true;
  noButton.disabled = true;
  noButton.style.opacity = '';
  heartButton.classList.add('clicked');
  glowBoom.style.opacity = '0.15';
  softAnswer.classList.remove('show');
  forgivePanel.classList.add('answered');
  finalText.classList.add('show');
  const finalActions = document.createElement('div');
  finalActions.className = 'final-answer-actions';
  finalText.insertAdjacentElement('afterend', finalActions);
  finalActions.append(yesButton, noButton);
  yesButton.classList.add('yes-btn-final');
  noButton.classList.add('no-btn-final');
  noButton.classList.remove('jumping');
  noButton.style.left = '';
  noButton.style.top = '';
  noButton.style.transform = '';
  launchConfetti();
}

function showSoftEnding() {
  if (noRunCount < 7) {
    moveNoButton(new Event('manual'));
    return;
  }
  noButton.disabled = true;
  yesButton.style.opacity = '0.55';
  finalText.classList.remove('show');
  softAnswer.classList.add('show');
}

let noMoveLock = false;
let noButtonPosition = null;
let answerLocked = false;
const noEscapeRadius = 160;
const playfulNoLabels = [
  'No 😒',
  'Are you sure?',
  'Really? 🥺',
  "Don't do that 😭",
  'Please...',
  'Think again 💛'
];

function getPointerPosition(event) {
  const point = event.touches?.[0] || event.changedTouches?.[0] || event;
  return {
    x: point.clientX,
    y: point.clientY
  };
}

function getDistanceToNoButton(pointer) {
  const rect = noButton.getBoundingClientRect();
  const buttonCenter = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };

  return Math.hypot(pointer.x - buttonCenter.x, pointer.y - buttonCenter.y);
}

function getRandomNoButtonPosition(pointer) {
  const areaRect = forgiveButtons.getBoundingClientRect();
  const btnRect = noButton.getBoundingClientRect();
  const padding = 10;
  const maxX = Math.max(padding, areaRect.width - btnRect.width - padding);
  const maxY = Math.max(padding, areaRect.height - btnRect.height - padding);
  const current = noButtonPosition || {
    x: noButton.offsetLeft,
    y: noButton.offsetTop
  };
  let bestPosition = null;
  let bestScore = -Infinity;
  let fallbackPosition = null;
  let fallbackScore = -Infinity;

  for (let i = 0; i < 36; i++) {
    const candidate = {
      x: randomBetween(padding, maxX),
      y: randomBetween(padding, maxY)
    };
    const candidateCenter = {
      x: areaRect.left + candidate.x + btnRect.width / 2,
      y: areaRect.top + candidate.y + btnRect.height / 2
    };
    const distanceFromPointer = pointer
      ? Math.hypot(pointer.x - candidateCenter.x, pointer.y - candidateCenter.y)
      : noEscapeRadius;
    const distanceFromCurrent = Math.hypot(candidate.x - current.x, candidate.y - current.y);
    const score = distanceFromPointer + distanceFromCurrent * 0.45;

    if (distanceFromCurrent > 36 && score > fallbackScore) {
      fallbackScore = score;
      fallbackPosition = candidate;
    }

    if (
      distanceFromPointer > noEscapeRadius + 36 &&
      distanceFromCurrent > Math.min(areaRect.width, areaRect.height) * 0.28 &&
      score > bestScore
    ) {
      bestScore = score;
      bestPosition = candidate;
    }
  }

  return bestPosition || fallbackPosition || current;
}

function moveNoButton(event, force = false) {
  if (answerLocked) return;

  event?.preventDefault?.();
  const pointer = event ? getPointerPosition(event) : null;

  if (!force && noMoveLock) return;
  if (!force && pointer && getDistanceToNoButton(pointer) > noEscapeRadius) return;

  noRunCount += 1;
  noMoveLock = true;
  noButtonPosition = getRandomNoButtonPosition(pointer);

  if (noRunCount % 3 === 0 || Math.random() > 0.58) {
    noButton.textContent = playfulNoLabels[Math.floor(Math.random() * playfulNoLabels.length)];
  }

  noButton.style.left = `${noButtonPosition.x}px`;
  noButton.style.top = `${noButtonPosition.y}px`;
  noButton.style.transform = `rotate(${randomBetween(-10, 10)}deg) scale(${randomBetween(0.94, 1.08)})`;
  noButton.classList.remove('jumping');
  void noButton.offsetWidth;
  noButton.classList.add('jumping');

  window.setTimeout(() => {
    noMoveLock = false;
    if (pointer && getDistanceToNoButton(pointer) < noEscapeRadius * 0.75) {
      moveNoButton(event, true);
    }
  }, 105);
}

function showSoftEnding() {
  if (answerLocked) return;

  moveNoButton(null, true);
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

yesButton.addEventListener('click', showHappyEnding);
forgiveButtons.addEventListener('pointermove', moveNoButton);
forgiveButtons.addEventListener('touchmove', moveNoButton, { passive: false });
noButton.addEventListener('pointerenter', event => moveNoButton(event, true));
noButton.addEventListener('touchstart', event => moveNoButton(event, true), { passive: false });
noButton.addEventListener('click', showSoftEnding);

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function initStars() {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;';
  document.body.appendChild(wrap);

  for (let i = 0; i < 70; i++) {
    const star = document.createElement('span');
    const size = Math.random() * 2.1 + 0.7;
    star.style.cssText = `
      position:absolute;
      width:${size}px;
      height:${size}px;
      top:${Math.random() * 100}%;
      left:${Math.random() * 100}%;
      border-radius:999px;
      background:#f5edd8;
      opacity:${Math.random() * 0.4 + 0.08};
      animation:twinkle ${Math.random() * 3 + 2.2}s ease-in-out infinite;
      animation-delay:${Math.random() * 4}s;
    `;
    wrap.appendChild(star);
  }

  const style = document.createElement('style');
  style.textContent = '@keyframes twinkle{50%{opacity:.8;transform:scale(1.5)}}';
  document.head.appendChild(style);
}

function initParticles() {
  const canvas = document.getElementById('particlesCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const createParticle = () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.8 + 0.5,
    vx: (Math.random() - 0.5) * 0.24,
    vy: -Math.random() * 0.32 - 0.08,
    alpha: Math.random() * 0.45 + 0.08,
    color: Math.random() > 0.48 ? '#ff8a3d' : '#f5edd8'
  });

  resize();
  window.addEventListener('resize', resize);
  particles = Array.from({ length: 85 }, createParticle);

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.y < -10) {
        particles[index] = createParticle();
        particles[index].y = canvas.height + 10;
      }

      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  };

  animate();
}

function initConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  const colors = ['#ff8a3d', '#ff6b1a', '#f5edd8', '#ffd8a8', '#ffffff'];
  let pieces = [];

  for (let i = 0; i < 150; i++) {
    pieces.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 180,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 11,
      vy: -(Math.random() * 10 + 5),
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      alpha: 1,
      isCircle: Math.random() > 0.62
    });
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces = pieces.filter(piece => piece.alpha > 0.02);

    pieces.forEach(piece => {
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.vy += 0.32;
      piece.rotation += piece.rotationSpeed;
      piece.alpha -= 0.008;

      ctx.save();
      ctx.globalAlpha = piece.alpha;
      ctx.fillStyle = piece.color;
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rotation * Math.PI / 180);

      if (piece.isCircle) {
        ctx.beginPath();
        ctx.arc(0, 0, piece.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-piece.size, -piece.size / 2, piece.size * 2, piece.size);
      }

      ctx.restore();
    });

    if (pieces.length) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  animate();
}
