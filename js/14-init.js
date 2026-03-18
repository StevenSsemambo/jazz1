/* ═══════════════════════════════════════════════════════
 * Jazz Buddy -- 14-init.js
 * App initialisation -- runs on page load
 * Checks for returning session, delegates to auth
 * SayMy Tech Developers
 * ═══════════════════════════════════════════════════════ */

// ── INIT ──────────────────────────────────────────────────────────
// Runs once on page load.
// If a user session exists → restore it and launch app directly.
// If no session → splash screen stays visible (default HTML state).
function init() {
  // Init modules that need DB (called after 01-core.js is loaded)
  if(typeof initVS === 'function') initVS();
  if(typeof initCUST === 'function') initCUST();
  if(typeof _loadJournalEntries === 'function') _loadJournalEntries();

  const currentUser = localStorage.getItem('jb_currentUser');

  if (!currentUser) {
    // No session -- splash is already visible by default, focus the name input
    setTimeout(() => {
      const nameEl = document.getElementById('sl-name');
      if (nameEl) nameEl.focus();
    }, 300);
    return;
  }

  // Returning session -- restore prefix and data, then launch
  window._userPrefix = 'jb_' + currentUser + '_';

  // Load stored data into runtime vars
  const storedP = localStorage.getItem(window._userPrefix + 'P');
  if (storedP) { try { Object.assign(P, JSON.parse(storedP)); } catch(e) {} }

  const storedMems = localStorage.getItem(window._userPrefix + 'MEMS');
  if (storedMems) { try { MEMS = JSON.parse(storedMems); } catch(e) {} }

  const storedHist = localStorage.getItem(window._userPrefix + 'HIST');
  if (storedHist) { try { HIST = JSON.parse(storedHist); } catch(e) {} }

  const storedJournal = localStorage.getItem(window._userPrefix + 'JOURNAL');
  if (storedJournal) { try { journalEntries = JSON.parse(storedJournal); } catch(e) {} }

  // Hide splash
  const splash = document.getElementById('splash');
  if (splash) splash.style.display = 'none';

  // Returning user with completed onboarding → go to app
  const isOnboarded = localStorage.getItem(window._userPrefix + 'onboarded');
  const hasProfile  = P.joinDate && P.totalMsgs > 0;

  if (isOnboarded || hasProfile) {
    const ob  = document.getElementById('ob');
    const app = document.getElementById('app');
    if (ob)  ob.style.display  = 'none';
    if (app) app.style.display = 'flex';
    // Delegate session start to auth module
    if (typeof startAppSession === 'function') startAppSession();
  } else {
    // User record exists but onboarding not done (edge case)
    const ob = document.getElementById('ob');
    if (ob) { ob.style.display = 'flex'; }
    if (typeof renderOB === 'function') renderOB();
  }
}

init();
