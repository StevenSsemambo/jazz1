/* ═══════════════════════════════════════════════════════
 * Jazz Buddy — 17-v8-ui.js
 * V8 UI/UX: Emotional skin, animated avatar, message reactions,
 * swipe gestures, haptics, typing variations, light/dark/auto theme,
 * micro-animations, 3am mode, progressive Jazz personality
 * SayMy Tech Developers
 * ═══════════════════════════════════════════════════════ */

// ══════════════════════════════════════════════════════════════════
// EMOTIONAL SKIN — mood-reactive ambient background
// ══════════════════════════════════════════════════════════════════
const MOOD_SKIN = {
  happy:       { orb1:'#f9ca24', orb2:'#f0932b', orb3:'#6ab04c', speed:'12s', opacity:'.45' },
  excited:     { orb1:'#fd79a8', orb2:'#fdcb6e', orb3:'#e17055', speed:'8s',  opacity:'.5'  },
  anxious:     { orb1:'#6c5ce7', orb2:'#a29bfe', orb3:'#2d3436', speed:'25s', opacity:'.3'  },
  sad:         { orb1:'#74b9ff', orb2:'#0984e3', orb3:'#2d3436', speed:'30s', opacity:'.28' },
  angry:       { orb1:'#d63031', orb2:'#e17055', orb3:'#6c5ce7', speed:'10s', opacity:'.4'  },
  tired:       { orb1:'#636e72', orb2:'#2d3436', orb3:'#b2bec3', speed:'35s', opacity:'.22' },
  grateful:    { orb1:'#00b894', orb2:'#55efc4', orb3:'#fdcb6e', speed:'18s', opacity:'.4'  },
  grieving:    { orb1:'#2d3436', orb2:'#636e72', orb3:'#74b9ff', speed:'40s', opacity:'.25' },
  lonely:      { orb1:'#6c5ce7', orb2:'#2d3436', orb3:'#636e72', speed:'28s', opacity:'.28' },
  hopeful:     { orb1:'#00cec9', orb2:'#55efc4', orb3:'#a29bfe', speed:'16s', opacity:'.42' },
  neutral:     { orb1:'#6c5ce7', orb2:'#fd8a6a', orb3:'#00cec9', speed:'20s', opacity:'.35' },
  overwhelmed: { orb1:'#e17055', orb2:'#6c5ce7', orb3:'#2d3436', speed:'15s', opacity:'.35' },
};

function applyEmotionalSkin(mood) {
  const skin = MOOD_SKIN[mood] || MOOD_SKIN.neutral;
  const orb1 = document.querySelector('.orb1');
  const orb2 = document.querySelector('.orb2');
  const orb3 = document.querySelector('.orb3');
  if (!orb1) return;

  // Smooth transition
  [orb1, orb2, orb3].forEach(orb => {
    orb.style.transition = 'all 3s ease';
    orb.style.opacity = skin.opacity;
  });
  orb1.style.background = `radial-gradient(circle,${skin.orb1} 0%,transparent 70%)`;
  orb2.style.background = `radial-gradient(circle,${skin.orb2} 0%,transparent 70%)`;
  orb3.style.background = `radial-gradient(circle,${skin.orb3} 0%,transparent 70%)`;
  orb1.style.animationDuration = skin.speed;
  orb2.style.animationDuration = skin.speed;

  // 3am mode — darken everything
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5) {
    document.body.style.filter = 'brightness(0.85) saturate(0.8)';
  } else {
    document.body.style.filter = '';
  }
}

// ══════════════════════════════════════════════════════════════════
// ANIMATED AVATAR — SVG face that reacts to conversation state
// ══════════════════════════════════════════════════════════════════
function buildJazzAvatar(state) {
  // state: neutral | listening | speaking | happy | sad | thinking | excited
  const configs = {
    neutral:   { eyes:'normal', mouth:'neutral', color:'var(--acc)',  anim:'breathe'  },
    listening: { eyes:'open',   mouth:'open',    color:'var(--t1)',   anim:'lean-in'  },
    speaking:  { eyes:'normal', mouth:'talking', color:'var(--acc2)', anim:'speak'    },
    happy:     { eyes:'squint', mouth:'smile',   color:'var(--gn)',   anim:'bounce'   },
    sad:       { eyes:'heavy',  mouth:'frown',   color:'#74b9ff',     anim:'slow'     },
    thinking:  { eyes:'look-up',mouth:'neutral', color:'var(--acc)',  anim:'sway'     },
    excited:   { eyes:'wide',   mouth:'grin',    color:'var(--pk)',   anim:'bounce'   },
    crisis:    { eyes:'soft',   mouth:'gentle',  color:'var(--gn)',   anim:'still'    },
  };
  const c = configs[state] || configs.neutral;

  const eyeMap = {
    normal:  `<ellipse cx="12" cy="14" rx="2.5" ry="3" fill="#fff" opacity=".9"/><ellipse cx="28" cy="14" rx="2.5" ry="3" fill="#fff" opacity=".9"/>`,
    open:    `<ellipse cx="12" cy="14" rx="3" ry="3.5" fill="#fff"/><ellipse cx="28" cy="14" rx="3" ry="3.5" fill="#fff"/>`,
    squint:  `<ellipse cx="12" cy="15" rx="2.5" ry="1.5" fill="#fff" opacity=".9"/><ellipse cx="28" cy="15" rx="2.5" ry="1.5" fill="#fff" opacity=".9"/>`,
    heavy:   `<ellipse cx="12" cy="15" rx="2.5" ry="2" fill="#fff" opacity=".7"/><ellipse cx="28" cy="15" rx="2.5" ry="2" fill="#fff" opacity=".7"/>`,
    'look-up':`<ellipse cx="12" cy="12" rx="2.5" ry="3" fill="#fff" opacity=".9"/><ellipse cx="28" cy="12" rx="2.5" ry="3" fill="#fff" opacity=".9"/>`,
    wide:    `<ellipse cx="12" cy="13" rx="3.2" ry="4" fill="#fff"/><ellipse cx="28" cy="13" rx="3.2" ry="4" fill="#fff"/>`,
    soft:    `<ellipse cx="12" cy="15" rx="2.5" ry="2.2" fill="#fff" opacity=".8"/><ellipse cx="28" cy="15" rx="2.5" ry="2.2" fill="#fff" opacity=".8"/>`,
  };
  const mouthMap = {
    neutral: `<path d="M13 25 Q20 26 27 25" stroke="#fff" stroke-width="1.5" fill="none" opacity=".8" stroke-linecap="round"/>`,
    smile:   `<path d="M13 23 Q20 29 27 23" stroke="#fff" stroke-width="1.8" fill="none" opacity=".9" stroke-linecap="round"/>`,
    grin:    `<path d="M11 22 Q20 31 29 22" stroke="#fff" stroke-width="2" fill="none" opacity=".9" stroke-linecap="round"/>`,
    frown:   `<path d="M13 27 Q20 22 27 27" stroke="#fff" stroke-width="1.5" fill="none" opacity=".7" stroke-linecap="round"/>`,
    open:    `<ellipse cx="20" cy="26" rx="3" ry="2.5" fill="#fff" opacity=".6"/>`,
    talking: `<ellipse cx="20" cy="26" rx="3.5" ry="3" fill="#fff" opacity=".7" class="mouth-anim"/>`,
    gentle:  `<path d="M14 25 Q20 27 26 25" stroke="#fff" stroke-width="1.5" fill="none" opacity=".8" stroke-linecap="round"/>`,
  };

  const animMap = {
    breathe: 'anim-breathe', 'lean-in': 'anim-lean', speak: 'anim-speak',
    bounce: 'anim-bounce', slow: 'anim-slow', sway: 'anim-sway', still: '', excited: 'anim-bounce',
  };

  return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" class="jazz-face ${animMap[c.anim]||''}">
    <circle cx="20" cy="20" r="19" fill="${c.color}" opacity="0.95"/>
    <circle cx="20" cy="20" r="17" fill="${c.color}"/>
    ${eyeMap[c.eyes]||eyeMap.normal}
    ${mouthMap[c.mouth]||mouthMap.neutral}
  </svg>`;
}

let currentAvatarState = 'neutral';

function setAvatarState(state) {
  currentAvatarState = state;
  const el = document.querySelector('.jav');
  if (!el) return;
  el.innerHTML = buildJazzAvatar(state);
  // Also update voice mode overlay avatar
  const vmoAvatar = document.getElementById('vmo-avatar');
  if (vmoAvatar) vmoAvatar.innerHTML = buildJazzAvatar(state);
}

function avatarFromEmotion(emotion, intent) {
  if (['crisis','mentalHealth','grief','trauma'].includes(intent)) return 'crisis';
  if (['happy','excited','hopeful'].includes(emotion)) return 'happy';
  if (['sad','grieving','lonely'].includes(emotion)) return 'sad';
  if (['anxious','overwhelmed'].includes(emotion)) return 'thinking';
  if (['shareGoodNews','celebrating'].includes(intent)) return 'excited';
  return 'listening';
}

// ══════════════════════════════════════════════════════════════════
// MESSAGE REACTIONS — long-press to react/save
// ══════════════════════════════════════════════════════════════════
function attachMessageReactions(msgEl, text, tone) {
  let pressTimer = null;

  const start = () => { pressTimer = setTimeout(() => showReactionMenu(msgEl, text, tone), 500); };
  const end = () => { clearTimeout(pressTimer); };

  msgEl.addEventListener('touchstart', start, { passive: true });
  msgEl.addEventListener('touchend', end);
  msgEl.addEventListener('mousedown', start);
  msgEl.addEventListener('mouseup', end);
  msgEl.addEventListener('mouseleave', end);
}

function showReactionMenu(msgEl, text, tone) {
  // Haptic feedback
  haptic('selection');

  // Remove any existing menu
  document.querySelectorAll('.reaction-menu').forEach(m => m.remove());

  const menu = document.createElement('div');
  menu.className = 'reaction-menu';
  menu.innerHTML = `
    <button class="react-btn" onclick="bookmarkMessage('${text.replace(/'/g,"\\'")}','${tone}');this.closest('.reaction-menu').remove()" title="Save to highlights">💾</button>
    <button class="react-btn" onclick="flagToJournal('${text.replace(/'/g,"\\'")}');this.closest('.reaction-menu').remove()" title="Add to journal">📓</button>
    <button class="react-btn" onclick="jazzSpeak('${text.replace(/'/g,"\\'")}');this.closest('.reaction-menu').remove()" title="Read aloud">🔊</button>
    <button class="react-btn" onclick="shareMessage('${text.replace(/'/g,"\\'")}');this.closest('.reaction-menu').remove()" title="Share">↗️</button>
    <button class="react-btn" onclick="this.closest('.reaction-menu').remove()" title="Close">✕</button>
  `;
  msgEl.style.position = 'relative';
  msgEl.appendChild(menu);

  // Auto-dismiss
  setTimeout(() => menu.remove(), 4000);
}

function flagToJournal(text) {
  saveJournalEntry(`From Jazz: ${text}`);
  toast('📓 Added to your journal');
}

function shareMessage(text) {
  if (navigator.share) {
    navigator.share({ text: `"${text}" — Jazz Buddy`, title: 'From Jazz' });
  } else {
    navigator.clipboard?.writeText(text).then(() => toast('Copied to clipboard'));
  }
}

// ══════════════════════════════════════════════════════════════════
// SWIPE GESTURES
// ══════════════════════════════════════════════════════════════════
function attachSwipeGestures() {
  const chat = document.getElementById('chat');
  if (!chat) return;
  let touchStartX = 0, touchStartY = 0, touchStartTime = 0;

  chat.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  }, { passive: true });

  chat.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const dt = Date.now() - touchStartTime;

    if (Math.abs(dx) < 40 || dt > 500 || Math.abs(dy) > Math.abs(dx)) return;

    const msgEl = e.target.closest('.msg.b');
    if (!msgEl) return;
    const bbl = msgEl.querySelector('.bbl');
    if (!bbl) return;
    const text = bbl.textContent;

    if (dx > 60) {
      // Swipe right → reply (populate textarea)
      haptic('light');
      txta.value = '> ' + text.slice(0, 50) + '...\n';
      txta.focus();
      arz(txta);
      toast('↩ Replying to Jazz');
    } else if (dx < -60) {
      // Swipe left → speak aloud
      haptic('light');
      jazzSpeak(text);
      toast('🔊 Reading aloud');
    }
  }, { passive: true });

  // Swipe up on input to open journal
  const inp = document.getElementById('inp-area');
  if (inp) {
    let startY = 0;
    inp.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
    inp.addEventListener('touchend', e => {
      const dy = startY - e.changedTouches[0].clientY;
      if (dy > 50) { haptic('medium'); openPanel('journal'); }
    }, { passive: true });
  }
}

// ══════════════════════════════════════════════════════════════════
// HAPTIC PATTERNS
// ══════════════════════════════════════════════════════════════════
const HAPTIC_MAP = {
  'et-warm':    [{ duration: 15 }, { pause: 20 }, { duration: 15 }],
  'et-care':    [{ duration: 20 }, { pause: 30 }, { duration: 20 }],
  'et-play':    [{ duration: 10 }, { pause: 10 }, { duration: 10 }, { pause: 10 }, { duration: 20 }],
  'et-firm':    [{ duration: 40 }],
  'et-deep':    [{ duration: 25 }, { pause: 40 }, { duration: 25 }],
  'et-goal':    [{ duration: 15 }, { pause: 15 }, { duration: 30 }],
  'et-checkin': [{ duration: 10 }, { pause: 15 }, { duration: 10 }, { pause: 15 }, { duration: 10 }],
  'selection':  [{ duration: 8 }],
  'light':      [{ duration: 15 }],
  'medium':     [{ duration: 30 }],
};

function haptic(tone) {
  if (!navigator.vibrate || !P.hapticsEnabled) return;
  const pattern = HAPTIC_MAP[tone];
  if (!pattern) return;
  const vibrateArr = [];
  pattern.forEach(p => {
    if (p.duration) vibrateArr.push(p.duration);
    if (p.pause) vibrateArr.push(p.pause);
  });
  navigator.vibrate(vibrateArr);
}

// ══════════════════════════════════════════════════════════════════
// TYPING INDICATOR VARIATIONS — per emotional tone
// ══════════════════════════════════════════════════════════════════
function showTypingVariant(tone) {
  if (isTyping) return;
  isTyping = true;
  const d = document.createElement('div');
  d.className = 'msg b';
  d.id = 'typ-msg';

  const speeds = {
    'et-care':  '1.2s',  // slow, deliberate
    'et-deep':  '1.4s',  // very slow with pause
    'et-play':  '0.5s',  // fast, bouncy
    'et-firm':  '0.7s',  // quick
    'et-warm':  '0.9s',  // normal warm
    'et-calm':  '1.1s',  // slow, grounded
  };
  const speed = speeds[tone] || '0.9s';

  d.innerHTML = `
    <div class="mav">${buildJazzAvatar('speaking')}</div>
    <div class="mc">
      <div class="bbl">
        <div class="typ" style="--typ-speed:${speed}">
          <div class="td"></div><div class="td"></div><div class="td"></div>
        </div>
      </div>
    </div>`;
  chatEl.appendChild(d);
  chatEl.scrollTop = chatEl.scrollHeight;
}

// ══════════════════════════════════════════════════════════════════
// LIGHT / DARK / AUTO THEME
// ══════════════════════════════════════════════════════════════════
const LIGHT_THEME = {
  '--bg':  '#f5f0e8',
  '--bg2': '#ede8e0',
  '--bg3': '#e5e0d8',
  '--s1':  '#ddd8d0',
  '--s2':  '#d5d0c8',
  '--s3':  '#cdc8c0',
  '--b1':  '#c0bbb0',
  '--b2':  '#b0aba0',
  '--b3':  '#a09b90',
  '--tx':  '#1a1a2e',
  '--tx2': '#4a4a6a',
  '--tx3': '#7a7a9a',
  '--tx4': '#aaaabc',
};

const DARK_THEME = {
  '--bg':  '#080810',
  '--bg2': '#0f0f1a',
  '--bg3': '#161622',
  '--s1':  '#1c1c2e',
  '--s2':  '#232336',
  '--s3':  '#2a2a42',
  '--b1':  '#2e2e48',
  '--b2':  '#3a3a58',
  '--b3':  '#484868',
  '--tx':  '#eeeef8',
  '--tx2': '#9898b8',
  '--tx3': '#585878',
  '--tx4': '#3a3a5a',
};

function applyLightMode() {
  Object.entries(LIGHT_THEME).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  CUST.lightMode = true;
  DB.s('cust', CUST);
}
function applyDarkMode() {
  Object.entries(DARK_THEME).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  CUST.lightMode = false;
  DB.s('cust', CUST);
}
function applyAutoMode() {
  const hour = new Date().getHours();
  (hour >= 7 && hour < 19) ? applyLightMode() : applyDarkMode();
  CUST.autoMode = true;
  DB.s('cust', CUST);
}

// ══════════════════════════════════════════════════════════════════
// PROGRESSIVE JAZZ PERSONALITY — unlocks per bond level
// ══════════════════════════════════════════════════════════════════
function getJazzPersonalityLayer() {
  const bond = bondScore();
  const ph = P.phase || 0;

  if (ph >= 5 || bond >= 78) {
    // Soul friends — Jazz has full opinions, calls out BS
    return {
      level: 'soul',
      callout: true,
      opinions: true,
      candidness: 'high',
      prefix: null,
    };
  } else if (ph >= 3 || bond >= 38) {
    // Close friends — pushes back, brings up patterns
    return { level: 'close', callout: false, opinions: true, candidness: 'medium', prefix: null };
  } else if (ph >= 2 || bond >= 20) {
    // Friends — more direct, occasional pushback
    return { level: 'friend', callout: false, opinions: false, candidness: 'low', prefix: null };
  } else {
    // Early — warm, careful
    return { level: 'new', callout: false, opinions: false, candidness: 'none', prefix: null };
  }
}

function applyPersonalityLayer(resp, intent, nm) {
  const layer = getJazzPersonalityLayer();

  if (layer.level === 'soul' && ['askAdvice','bigDecision','venting'].includes(intent) && Math.random() > 0.6) {
    const opinions = [
      `${nm}, I'm going to be honest with you because we're past the point where I pretend not to have opinions. `,
      `Real talk, ${nm} — `,
      `I want to say something you might not want to hear: `,
    ];
    return rnd(opinions) + resp;
  }

  if (layer.level === 'close' && Math.random() > 0.7) {
    const patterns = [
      `I've noticed something — `,
      `This is the part where I push back a little. `,
    ];
    if (['venting','stress','motivation'].includes(intent)) return rnd(patterns) + resp;
  }

  return resp;
}

// ══════════════════════════════════════════════════════════════════
// MICRO-ANIMATIONS — bond, goals, streak
// ══════════════════════════════════════════════════════════════════
function animateStatChange(id, newVal, suffix) {
  const el = document.getElementById(id);
  if (!el) return;
  const oldVal = el.textContent;
  if (oldVal === newVal + suffix) return;

  el.style.transform = 'scale(1.3)';
  el.style.color = 'var(--acc2)';
  el.style.transition = 'all .3s var(--spring)';
  setTimeout(() => {
    el.textContent = newVal + (suffix || '');
    setTimeout(() => {
      el.style.transform = '';
      el.style.color = '';
    }, 300);
  }, 150);
}

// Override refreshStats to use animated version
const _origRefreshStats = typeof refreshStats === 'function' ? refreshStats : null;
function refreshStatsAnimated() {
  const bond = bondScore();
  const days = days_since(P.joinDate) + 1;
  const moodEmoji = { happy:'😊', sad:'😢', anxious:'😟', excited:'🤩', tired:'😴', angry:'😤', neutral:'😐', grateful:'🙏', confused:'🤔', grieving:'💔', lonely:'🫂', hopeful:'🌟', overwhelmed:'😰' };
  const activeGoals = (P.goals || []).filter(g => g.status === 'active').length;

  animateStatChange('sv-days', days, '');
  animateStatChange('sv-msgs', P.totalMsgs, '');
  animateStatChange('sv-bond', bond, '%');
  document.getElementById('sv-mood').textContent = moodEmoji[P.mood] || '—';
  animateStatChange('sv-streak', '🔥' + P.streakDays, '');
  animateStatChange('sv-goals', activeGoals, '');
}

// ══════════════════════════════════════════════════════════════════
// NOTICED CARD HTML RENDERER
// ══════════════════════════════════════════════════════════════════
function injectNoticedCard() {
  const card = generateJazzNoticedCard();
  if (!card) return;
  addMsg('b', 'Something I\'ve noticed about you — and I mean this genuinely:', 'et-deep', null,
    `<div class="noticed-card"><div class="noticed-text">${card.text}</div></div>`);
}
