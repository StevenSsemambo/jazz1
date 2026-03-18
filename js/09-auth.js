/* ═══════════════════════════════════════════════════════
 * Jazz Buddy -- 09-auth.js
 * Auth system: name-based entry, guest mode, sign out
 * NO passwords -- just enter your name and go
 * SayMy Tech Developers
 * ═══════════════════════════════════════════════════════ */

// ── AUTH SYSTEM ───────────────────────────────────────────────────
// Simple: user types their name → app starts with that profile
// Guest: jumps straight in with no name saved
// Sign out: returns to splash, clears session state
// Each name gets its own localStorage partition (jb_<name>_)

function splashErr(msg) {
  const el = document.getElementById('splash-err');
  if (el) el.textContent = msg;
}

// ── ENTER -- main entry point, called by both button and Enter key
function doEnter() {
  const nameInput = document.getElementById('sl-name');
  const name = nameInput ? nameInput.value.trim() : '';

  if (!name) {
    splashErr('Please enter your name to continue');
    nameInput && nameInput.focus();
    return;
  }
  if (name.length < 2) {
    splashErr('Name must be at least 2 characters');
    return;
  }

  // Capitalise first letter
  const cleanName = name.charAt(0).toUpperCase() + name.slice(1);

  // Save as current user
  localStorage.setItem('jb_currentUser', cleanName);

  // Set storage prefix for this user
  window._userPrefix = 'jb_' + cleanName + '_';

  // Load any existing profile for this name
  loadUserData(cleanName);

  // Launch app
  launchApp(cleanName);
}

// ── GUEST -- enter with no name stored
function doGuest() {
  localStorage.setItem('jb_currentUser', 'guest');
  window._userPrefix = 'jb_guest_';
  loadUserData('guest');
  launchApp(null); // null = no name pre-set, onboarding will ask
}

// ── LOAD USER DATA ────────────────────────────────────────────────
function loadUserData(username) {
  const prefix = 'jb_' + username + '_';

  // Profile
  const storedP = localStorage.getItem(prefix + 'P');
  if (storedP) {
    try { Object.assign(P, JSON.parse(storedP)); } catch(e) { console.warn('Profile load err', e); }
  }

  // Memories
  const storedMems = localStorage.getItem(prefix + 'MEMS');
  if (storedMems) {
    try { MEMS = JSON.parse(storedMems); } catch(e) {}
  }

  // History
  const storedHist = localStorage.getItem(prefix + 'HIST');
  if (storedHist) {
    try { HIST = JSON.parse(storedHist); } catch(e) {}
  }

  // Journal entries
  const storedJournal = localStorage.getItem(prefix + 'JOURNAL');
  if (storedJournal) {
    try { journalEntries = JSON.parse(storedJournal); } catch(e) {}
  }
}

// ── LAUNCH APP ────────────────────────────────────────────────────
function launchApp(name) {
  // Hide splash
  const splash = document.getElementById('splash');
  if (splash) splash.style.display = 'none';

  // If new user (no profile saved) → show onboarding
  // If returning user (profile exists) → go straight to app
  const isReturning = P.joinDate && P.totalMsgs > 0;
  const hasName = P.name && P.name.length > 0;

  if (!isReturning) {
    // New user -- pre-set name if provided, then onboard
    if (name && name !== 'guest') {
      P.name = name;
      saveP();
    }
    const ob = document.getElementById('ob');
    const app = document.getElementById('app');
    if (ob) { ob.style.display = 'flex'; ob.style.position = 'fixed'; }
    if (app) app.style.display = 'none';
    if (typeof renderOB === 'function') renderOB();
  } else {
    // Returning user -- go straight to app
    const ob = document.getElementById('ob');
    const app = document.getElementById('app');
    if (ob) ob.style.display = 'none';
    if (app) app.style.display = 'flex';
    startAppSession();
  }
}

// ── START APP SESSION -- called after successful login ─────────────
function startAppSession() {
  if (typeof refreshStats === 'function') refreshStats();
  if (typeof restoreCustomization === 'function') restoreCustomization();

  // Restore voice mode
  if (typeof VS !== 'undefined' && VS.ttsEnabled) {
    setTimeout(() => {
      const vbar = document.getElementById('voice-bar');
      const btn  = document.getElementById('voice-toggle-btn');
      if (vbar) vbar.classList.add('show');
      if (btn) {
        btn.style.background = 'rgba(108,92,231,.2)';
        btn.style.borderColor = 'var(--acc)';
        btn.style.color = 'var(--acc2)';
      }
    }, 500);
  }

  // Daily check-in nudge
  const todayStr = new Date().toDateString();
  if ((P.lastCheckInDate || '') !== todayStr) {
    setTimeout(() => {
      const nudge = document.getElementById('ci-nudge');
      if (nudge) nudge.classList.add('show');
    }, 1500);
  }

  // Birthday check
  if (typeof checkBirthday === 'function') checkBirthday();

  // Notifications
  if (typeof checkProactiveNotifs === 'function') checkProactiveNotifs();

  // Weekly report (Sunday)
  if (new Date().getDay() === 0 && Date.now() - (P.lastWeeklyReport || 0) > 604800000) {
    setTimeout(() => { if (typeof renderWeeklyReport === 'function') renderWeeklyReport(); }, 3000);
  }

  // V8 extras
  setTimeout(() => {
    if (typeof attachSwipeGestures === 'function') attachSwipeGestures();
    if (typeof applyEmotionalSkin === 'function' && P.mood) applyEmotionalSkin(P.mood);
    if (typeof setAvatarState === 'function') setAvatarState('neutral');
  }, 800);

  // Time capsule check
  if (typeof checkTimeCapsules === 'function') {
    const tc = checkTimeCapsules();
    if (tc) {
      setTimeout(() => {
        const html = `<div class="capsule-card">
          <div class="capsule-seal">📦</div>
          <div class="capsule-to">To you, from ${tc.months} months ago:</div>
          <div class="capsule-msg">${tc.message}</div>
          ${tc.jazzReflection ? `<div class="capsule-jazz">${tc.jazzReflection}</div>` : ''}
        </div>`;
        if (typeof addMsg === 'function')
          addMsg('b', `Something arrived for you today, ${P.name || 'friend'}. You wrote this to yourself.`, 'et-deep', null, html);
      }, 4000);
    }
  }

  // Smart greeting
  const h = (Date.now() - (P.lastSeen || Date.now())) / 3600000;
  const nm = P.name || 'friend';
  let msg;

  if (h < 0.5) {
    msg = `Hey ${nm}! You're back. What's on your mind?`;
  } else if (typeof HIST !== 'undefined' && HIST.length > 10 && typeof getPredictiveGreeting === 'function') {
    msg = getPredictiveGreeting(nm);
  } else if (h < 3)  { msg = `${nm}! Good to see you. How has the day been?`; }
  else if (h < 24)   { msg = `Hey ${nm}! How has the rest of your day been?`; }
  else if (h < 48)   { msg = `${nm}! It's been a day. I've been thinking about you. How are you?`; }
  else if (h < 96)   { msg = `${nm}! It's been a couple of days. What's been happening?`; }
  else if (h < 168)  { msg = `${nm}! A whole week. I've genuinely missed you. What have I missed?`; }
  else               { msg = `${nm}! It's been a while. I'm really glad you came back.`; }

  // Append goal/thread context
  if (typeof lastUserMsg === 'function') {
    const lastU = lastUserMsg();
    if (lastU) {
      const d = typeof days_since === 'function' ? days_since(lastU.ts) : 0;
      if (d > 0 && d < 7 && ['venting','mentalHealth','grief','goals','relationships'].includes(lastU.intent)) {
        const topicLabel = { goals:'your goals', relationships:'a relationship situation', grief:'grief', mentalHealth:'how you were feeling', venting:'something difficult' }[lastU.intent] || 'something';
        msg += ` Last time you were dealing with ${topicLabel}. How has that been?`;
      }
    }
  }

  // Goal check
  const overdueGoals = (P.goals || []).filter(g => g.status === 'active' && g.nextCheckIn && g.nextCheckIn < Date.now());
  if (overdueGoals.length > 0 && h > 12) {
    msg += ` Also -- I want to check in on ${overdueGoals.length === 1 ? `your goal: "${overdueGoals[0].title}"` : `${overdueGoals.length} of your goals`} when you're ready.`;
  }

  // Session count / thought of the day
  P.sessionCount = (P.sessionCount || 0) + 1;
  saveP();
  const showThought = P.sessionCount % 3 === 0 && P.totalMsgs > 5;

  setTimeout(() => {
    if (typeof addMsg === 'function') {
      addMsg('b', msg, 'et-warm');
      if (typeof histAdd === 'function') histAdd('b', msg, 'neutral', 'greeting');
    }
    if (showThought && typeof getJazzThought === 'function') {
      setTimeout(() => {
        const thought = getJazzThought();
        if (typeof addMsg === 'function')
          addMsg('b', `Something I've been thinking about:\n\n*"${thought}"*\n\nWhat does that bring up for you?`, 'et-deep');
      }, 1800);
    }
    if (typeof setQR === 'function' && typeof getQR === 'function') setQR(getQR('greeting'));
    // Tour for first-timers
    if (!localStorage.getItem('jb_tourDone') && typeof startTour === 'function') {
      setTimeout(() => startTour(), 3500);
    }
  }, 300);
}

// ── USER-AWARE DB OVERRIDES ───────────────────────────────────────
// Called from 14-init.js after all modules loaded
const GLOBAL_KEYS = ['jb_currentUser','vs_tts','vs_rate','vs_pitch','vs_volume','vs_voice','vs_autoListen','cust','jb_tourDone'];

function initDBOverrides(){
  const _orig_s = DB.s.bind(DB);
  const _orig_g = DB.g.bind(DB);
  const _orig_d = DB.del.bind(DB);

  DB.s = function(k, v){
    if(GLOBAL_KEYS.includes(k)){ _orig_s(k,v); return; }
    const prefix = window._userPrefix || 'jb4_';
    try{ localStorage.setItem(prefix+k, JSON.stringify(v)); }catch(e){}
  };
  DB.g = function(k, d){
    if(d===undefined)d=null;
    if(GLOBAL_KEYS.includes(k)){ return _orig_g(k,d); }
    const prefix = window._userPrefix || 'jb4_';
    try{
      const v = localStorage.getItem(prefix+k);
      return v!=null ? JSON.parse(v) : d;
    }catch{ return d; }
  };
  DB.del = function(k){
    if(GLOBAL_KEYS.includes(k)){ _orig_d(k); return; }
    const prefix = window._userPrefix || 'jb4_';
    try{ localStorage.removeItem(prefix+k); }catch(e){}
  };
}

// ── SIGN OUT ──────────────────────────────────────────────────────
function signOut() {
  if (!confirm('Sign out of Jazz Buddy?')) return;

  // Stop voice
  if (typeof voiceStop === 'function') voiceStop();
  if (typeof VS !== 'undefined' && VS.recognition) {
    try { VS.recognition.stop(); } catch(e) {}
  }

  // Clear session
  localStorage.removeItem('jb_currentUser');
  window._userPrefix = 'jb4_';

  // Reset runtime state
  const defaultBond = { trust:0, vuln:0, humor:0, consist:0, support:0, mem:0, growth:0, depth:0 };
  Object.assign(P, {
    name:'', totalMsgs:0, streakDays:1, mood:null,
    moodHist:[], goals:[], topics:{}, bond:defaultBond,
    phase:0, insights:[], checkInStreak:0,
    lastCheckInDate:'', affirmations:[], relationships:[],
    sessionCount:0, joinDate:Date.now(), lastSeen:Date.now(),
  });
  if (typeof MEMS !== 'undefined') MEMS = [];
  if (typeof HIST !== 'undefined') HIST = [];

  // Reset DOM
  const chat = document.getElementById('chat');
  if (chat) chat.innerHTML = '';

  // Hide app, show splash
  const app   = document.getElementById('app');
  const ob    = document.getElementById('ob');
  const splash = document.getElementById('splash');
  if (app)    app.style.display    = 'none';
  if (ob)     ob.style.display     = 'none';
  if (splash) splash.style.display = 'flex';

  // Clear name input
  const nameEl = document.getElementById('sl-name');
  if (nameEl) { nameEl.value = ''; nameEl.focus(); }
  splashErr('');

  if (typeof toast === 'function') toast('Signed out. See you soon! 💬');
}
