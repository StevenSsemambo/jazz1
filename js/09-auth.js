/* ═══════════════════════════════════════════════════════
 * Jazz Buddy — 09-auth.js
 * Auth system: login, signup, guest, signout
 * SayMy Tech Developers
 * ═══════════════════════════════════════════════════════ */

// AUTH SYSTEM — Login / Signup / Guest / Signout
// ══════════════════════════════════════════════════════════════════
function splashTab(tab, el) {
  document.querySelectorAll('.splash-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('splash-login').style.display = tab === 'login' ? '' : 'none';
  document.getElementById('splash-signup').style.display = tab === 'signup' ? '' : 'none';
  document.getElementById('splash-err').textContent = '';
}

function splashErr(msg) { document.getElementById('splash-err').textContent = msg; }

function doLogin() {
  const u = document.getElementById('sl-user').value.trim();
  const p = document.getElementById('sl-pass').value;
  if (!u || !p) { splashErr('Please enter username and password'); return; }
  const accounts = DB.g('accounts', {});
  if (!accounts[u]) { splashErr('Account not found. Create one first.'); return; }
  if (accounts[u].password !== btoa(p)) { splashErr('Incorrect password'); return; }
  DB.s('currentUser', u);
  loadUserProfile(u);
  hideSplash();
}

function doSignup() {
  const u = document.getElementById('ss-user').value.trim();
  const p = document.getElementById('ss-pass').value;
  const p2 = document.getElementById('ss-pass2').value;
  if (!u || !p) { splashErr('Please fill all fields'); return; }
  if (p !== p2) { splashErr('Passwords do not match'); return; }
  if (u.length < 3) { splashErr('Username must be at least 3 characters'); return; }
  if (p.length < 4) { splashErr('Password must be at least 4 characters'); return; }
  const accounts = DB.g('accounts', {});
  if (accounts[u]) { splashErr('Username already taken'); return; }
  accounts[u] = { password: btoa(p), createdAt: Date.now() };
  DB.s('accounts', accounts);
  DB.s('currentUser', u);
  loadUserProfile(u);
  hideSplash();
  // Show onboarding for new accounts
  document.getElementById('ob').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
  renderOB();
}

function doGuest() {
  DB.s('currentUser', 'guest');
  loadUserProfile('guest');
  hideSplash();
}

function loadUserProfile(username) {
  // Load user-specific profile using prefixed keys
  const prefix = 'jb4_' + username + '_';
  const storedP = localStorage.getItem(prefix + 'P');
  if (storedP) {
    try { Object.assign(P, JSON.parse(storedP)); } catch(e) {}
  }
  // Override saveP to use user prefix
  window._userPrefix = prefix;
}

// Override DB to be user-aware after login
const _origSave = DB.s.bind(DB);
const _origLoad = DB.g.bind(DB);
DB.s = (k, v) => {
  const prefix = window._userPrefix || 'jb4_';
  // Auth keys stay global
  if (['accounts','currentUser','vs_tts','vs_rate','vs_pitch','vs_volume','vs_voice','vs_autoListen'].includes(k)) {
    _origSave(k, v);
  } else {
    try { localStorage.setItem(prefix + k, JSON.stringify(v)); } catch(e) {}
  }
};
DB.g = (k, d = null) => {
  const prefix = window._userPrefix || 'jb4_';
  if (['accounts','currentUser','vs_tts','vs_rate','vs_pitch','vs_volume','vs_voice','vs_autoListen'].includes(k)) {
    return _origLoad(k, d);
  }
  try {
    const v = localStorage.getItem(prefix + k);
    return v != null ? JSON.parse(v) : d;
  } catch { return d; }
};

function hideSplash() {
  document.getElementById('splash').style.display = 'none';
}

function signOut() {
  if (!confirm('Sign out of Jazz Buddy?')) return;
  // Stop voice
  if (typeof voiceStop === 'function') voiceStop();
  // Stop mic
  if (VS.recognition) { try { VS.recognition.stop(); } catch(e) {} }
  // Reset user prefix
  window._userPrefix = 'jb4_';
  DB.del('currentUser');
  // Reset P to defaults
  Object.assign(P, {name:'',totalMsgs:0,streakDays:1,mood:null,moodHist:[],goals:[],topics:{},bond:{trust:0,vuln:0,humor:0,consist:0,support:0,mem:0,growth:0,depth:0},phase:0,insights:[],checkInStreak:0,lastCheckInDate:'',affirmations:[],relationships:[]});
  MEMS = [];
  HIST = [];
  // Show splash
  document.getElementById('app').style.display = 'none';
  document.getElementById('ob').style.display = 'none';
  document.getElementById('splash').style.display = 'flex';
  document.getElementById('sl-user').value = '';
  document.getElementById('sl-pass').value = '';
  document.getElementById('splash-err').textContent = '';
  toast('Signed out. See you soon! 🎷');
}
