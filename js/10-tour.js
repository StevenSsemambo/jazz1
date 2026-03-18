/* ═══════════════════════════════════════════════════════
 * Jazz Buddy — 10-tour.js
 * App tour: steps, navigation, positioning
 * SayMy Tech Developers
 * ═══════════════════════════════════════════════════════ */

// APP TOUR
// ══════════════════════════════════════════════════════════════════
const TOUR_STEPS = [
  {
    title: '👋 Welcome to Jazz Buddy!',
    text: "Jazz is your personal AI friend — not a chatbot. Jazz learns who you are over time, remembers what matters to you, and actually shows up for you. Let me show you around.",
    target: null,
    pos: 'center'
  },
  {
    title: '☀️ Daily Check-in',
    text: "Every day, tap ☀️ to do a 2-minute check-in with Jazz. Sleep, mood, what's on your mind, your intention for the day. Jazz uses this to understand your patterns.",
    target: '[title="Daily Check-in"]',
    pos: 'bottom'
  },
  {
    title: '🎯 Goal Tracking',
    text: "Set goals and Jazz will actually hold you accountable. Every few days Jazz checks in on your progress — and pushes you when you've gone quiet.",
    target: '[title="Goals"]',
    pos: 'bottom'
  },
  {
    title: '📓 Journal',
    text: "Write longer, private entries. Jazz reads what you write and reflects back something real — not just a summary, a question you didn't know you needed.",
    target: '[title="Journal"]',
    pos: 'bottom'
  },
  {
    title: '🔊 Voice Mode',
    text: "Jazz can speak every response aloud — and listen to you too. Tap 🔊 to turn on voice mode. Tap 🎙️ to speak instead of type. Try full-screen voice mode for a hands-free conversation.",
    target: '[title="Voice mode"]',
    pos: 'bottom'
  },
  {
    title: '✨ Affirmations',
    text: "Jazz writes personalised affirmations based on what you've shared — your values, your struggles, your goals. Not generic. Written specifically for you.",
    target: '[title="Affirmations"]',
    pos: 'bottom'
  },
  {
    title: '📝 Letter from Jazz',
    text: "Every two weeks, Jazz writes you a personal letter — reflecting on what it's noticed about you. This is the thing people screenshot and show their friends.",
    target: '[title="Letter from Jazz"]',
    pos: 'bottom'
  },
  {
    title: '⚙️ Customise Jazz',
    text: "Change themes, fonts, chat bubble style, and more. Make Jazz feel like yours.",
    target: '[title="Settings"]',
    pos: 'bottom'
  },
  {
    title: "That's Jazz. 🎷",
    text: "The more you talk to Jazz, the better Jazz knows you. Your bond grows. Jazz unlocks new ways of talking to you. It gets more honest, more personal, more real. Start talking.",
    target: null,
    pos: 'center'
  }
];

let tourStep = 0;

function startTour() {
  tourStep = 0;
  document.getElementById('tour').classList.add('show');
  renderTourStep();
}

function renderTourStep() {
  const step = TOUR_STEPS[tourStep];
  const box = document.getElementById('tour-box');
  document.getElementById('tour-title').textContent = step.title;
  document.getElementById('tour-text').textContent = step.text;
  document.getElementById('tour-next-btn').textContent = tourStep === TOUR_STEPS.length - 1 ? "Let's go! 🎷" : 'Next →';

  // Dots
  document.getElementById('tour-dots').innerHTML = TOUR_STEPS.map((_, i) =>
    `<div class="tour-dot ${i === tourStep ? 'active' : ''}"></div>`
  ).join('');

  // Position box
  if (step.target && step.pos !== 'center') {
    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      box.style.top = (rect.bottom + 12) + 'px';
      box.style.left = Math.min(rect.left, window.innerWidth - 300) + 'px';
      box.style.transform = '';
    } else {
      centerBox(box);
    }
  } else {
    centerBox(box);
  }
}

function centerBox(box) {
  box.style.top = '50%';
  box.style.left = '50%';
  box.style.transform = 'translate(-50%, -50%)';
}

function tourNext() {
  tourStep++;
  if (tourStep >= TOUR_STEPS.length) {
    tourSkip();
  } else {
    renderTourStep();
  }
}

function tourSkip() {
  document.getElementById('tour').classList.remove('show');
  localStorage.setItem('jb_tourDone','true');
}
