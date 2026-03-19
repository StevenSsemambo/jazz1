/* ═══════════════════════════════════════════════════════
 * Jazz Buddy -- 14-init.js
 * App initialisation
 * SayMy Tech Developers
 * ═══════════════════════════════════════════════════════ */

function init() {
  // Safety: if core globals not loaded yet, abort silently
  if(typeof DB === 'undefined' || typeof P === 'undefined') {
    console.error('14-init: DB or P not defined — aborting init');
    return;
  }

  // Init modules that need DB
  if(typeof initDBOverrides === 'function') initDBOverrides();
  if(typeof initVS === 'function') initVS();
  if(typeof initCUST === 'function') initCUST();
  if(typeof _loadJournalEntries === 'function') _loadJournalEntries();
  if(typeof sanitizeP === 'function') sanitizeP();

  const currentUser = localStorage.getItem('jb_currentUser');

  if (!currentUser) {
    // No session — show splash, focus name input
    setTimeout(function(){
      var nameEl = document.getElementById('sl-name');
      if (nameEl) nameEl.focus();
    }, 300);
    return;
  }

  // Restore session
  window._userPrefix = 'jb_' + currentUser + '_';

  try {
    var storedP = localStorage.getItem(window._userPrefix + 'P');
    if (storedP) Object.assign(P, JSON.parse(storedP));
  } catch(e) {}

  try {
    var storedMems = localStorage.getItem(window._userPrefix + 'MEMS');
    if (storedMems) MEMS = JSON.parse(storedMems);
  } catch(e) {}

  try {
    var storedHist = localStorage.getItem(window._userPrefix + 'HIST');
    if (storedHist) HIST = JSON.parse(storedHist);
  } catch(e) {}

  try {
    var storedJournal = localStorage.getItem(window._userPrefix + 'JOURNAL');
    if (storedJournal && typeof journalEntries !== 'undefined') journalEntries = JSON.parse(storedJournal);
  } catch(e) {}

  if(typeof sanitizeP === 'function') sanitizeP();

  // Hide splash
  var splash = document.getElementById('splash');
  if (splash) splash.style.display = 'none';

  var isOnboarded = localStorage.getItem(window._userPrefix + 'onboarded');
  var hasProfile  = P.joinDate && P.totalMsgs > 0;

  if (isOnboarded || hasProfile) {
    var ob  = document.getElementById('ob');
    var app = document.getElementById('app');
    if (ob)  ob.style.display  = 'none';
    if (app) app.style.display = 'flex';
    if (typeof startAppSession === 'function') startAppSession();
  } else {
    var ob2 = document.getElementById('ob');
    if (ob2) ob2.style.display = 'flex';
    if (typeof renderOB === 'function') renderOB();
  }
}

// Wait for all scripts to be ready before calling init()
// Use setTimeout(0) to ensure all synchronous script loading is complete
setTimeout(init, 0);
