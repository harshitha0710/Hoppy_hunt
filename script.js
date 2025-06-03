const gameGrid = document.getElementById('gameGrid');
const scoreBoard = document.getElementById('score');
const timerDisplay = document.getElementById('time');
const startBtn = document.getElementById('startBtn');
const rulesModal = document.getElementById('rulesModal');
const closeRulesBtn = document.getElementById('closeRules');
const whackSound = document.getElementById('whackSound');

let score = 0;
let time = 30;
let gameActive = false;
let moleTimer;
let countdownTimer;
let lastHoleIndex = -1;

// Create 16 holes dynamically
for(let i = 0; i < 16; i++) {
  const hole = document.createElement('div');
  hole.classList.add('hole');
  hole.setAttribute('role', 'button');
  hole.setAttribute('tabindex', '0');
  hole.setAttribute('aria-label', 'Empty hole');
  gameGrid.appendChild(hole);
}

// Show the modal at the start
window.onload = () => {
  rulesModal.style.display = 'flex';
};

closeRulesBtn.onclick = () => {
  rulesModal.style.display = 'none';
  startBtn.focus();
};

function randomTime(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function randomHole() {
  let idx;
  do {
    idx = Math.floor(Math.random() * 16);
  } while (idx === lastHoleIndex);
  lastHoleIndex = idx;
  return gameGrid.children[idx];
}

function showMole() {
  if (!gameActive) return;
  const hole = randomHole();

  // Create mole element (Disney-style mouse emoji)
  const mole = document.createElement('div');
  mole.classList.add('mole', 'up');
  mole.textContent = '🐭'; // Mickey mouse style mole emoji
  mole.setAttribute('aria-label', 'Mole popped up');
  mole.tabIndex = 0;

  hole.appendChild(mole);
  hole.setAttribute('aria-label', 'Mole visible');

  mole.addEventListener('click', whackMole);
  mole.addEventListener('keydown', e => {
    if(e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      whackMole.call(mole, e);
    }
  });

  const moleUpTime = randomTime(1400, 1600);

  setTimeout(() => {
    mole.classList.remove('up');
    mole.classList.add('down');
  }, moleUpTime - 350);

  setTimeout(() => {
    if(mole.parentNode) {
      mole.parentNode.setAttribute('aria-label', 'Empty hole');
      mole.remove();
    }
  }, moleUpTime);

  moleTimer = setTimeout(showMole, randomTime(1000, 1400));
}

function whackMole(event) {
  if (!gameActive) return;

  score++;
  scoreBoard.textContent = score;

  whackSound.currentTime = 0;
  whackSound.play();

  createSparkleEffect(event);

  const mole = this;
  mole.removeEventListener('click', whackMole);
  mole.removeEventListener('keydown', whackMole);
  mole.classList.add('down');
  mole.classList.remove('up');
  mole.parentNode.setAttribute('aria-label', 'Empty hole');

  setTimeout(() => {
    if (mole.parentNode) mole.remove();
  }, 250);
}

function createSparkleEffect(event) {
  const sparkle = document.createElement('div');
  sparkle.classList.add('sparkle');

  const x = (Math.random() - 0.5) * 40;
  const y = (Math.random() - 0.5) * 40;
  sparkle.style.setProperty('--x', x + 'px');
  sparkle.style.setProperty('--y', y + 'px');

  // Position sparkle at the click location
  const rect = event.target.getBoundingClientRect();
  sparkle.style.left = rect.left + rect.width / 2 + 'px';
  sparkle.style.top = rect.top + rect.height / 3 + 'px';

  document.body.appendChild(sparkle);

  sparkle.addEventListener('animationend', () => {
    sparkle.remove();
  });
}

function countdown() {
  if(time <= 0) {
    clearInterval(countdownTimer);
    endGame();
    return;
  }
  time--;
  timerDisplay.textContent = time;
}

function startGame() {
  score = 0;
  time = 30;
  gameActive = true;
  scoreBoard.textContent = score;
  timerDisplay.textContent = time;
  startBtn.disabled = true;

  showMole();

  countdownTimer = setInterval(countdown, 1000);
}

function endGame() {
  gameActive = false;
  startBtn.disabled = false;
  clearTimeout(moleTimer);

  alert(`🎉 Time's up! Your magical score is: ${score} 🎉`);
}

startBtn.addEventListener('click', startGame);
