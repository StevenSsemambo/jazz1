/* ═══════════════════════════════════════════════════════
 * Jazz Buddy — 12-notifications.js
 * Push notifications: request, schedule, proactive
 * SayMy Tech Developers
 * ═══════════════════════════════════════════════════════ */

// PUSH NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════
async function requestNotifPerm() {
  if (!('Notification' in window)) { toast('Notifications not supported'); return; }
  const perm = await Notification.requestPermission();
  if (perm === 'granted') {
    toast('Notifications enabled! Jazz will reach out. 🎷');
    scheduleNotifications();
    DB.s('notifEnabled', true);
  } else {
    toast('Permission denied. Enable in browser settings.');
  }
}

function scheduleNotifications() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  // Use SW if available for background notifications
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SCHEDULE_NOTIFS', profile: { name: P.name, goals: P.goals } });
  }
}

function sendLocalNotif(title, body, delay = 0) {
  if (Notification.permission !== 'granted') return;
  setTimeout(() => {
    try { new Notification(title, { body, icon: './icons/icon-192.png', badge: './icons/icon-72.png' }); } catch(e) {}
  }, delay);
}

function checkProactiveNotifs() {
  if (!DB.g('notifEnabled', false)) return;
  const now = Date.now();
  const lastNotif = DB.g('lastNotif', 0);
  if (now - lastNotif < 3600000) return; // Max 1/hour

  const nm = P.name || 'friend';
  const hoursSilent = (now - P.lastSeen) / 3600000;
  const dayOfWeek = new Date().getDay();
  const hour = new Date().getHours();

  let notif = null;

  // After 2 days of silence
  if (hoursSilent > 48) {
    notif = { title: `Jazz misses you, ${nm}`, body: "You've been quiet. I noticed. Everything okay? Come talk to me." };
  }
  // Monday morning motivation
  else if (dayOfWeek === 1 && hour >= 7 && hour <= 10) {
    notif = { title: `New week, ${nm} 🌅`, body: "What's the one thing you want to make sure happens this week?" };
  }
  // Random depth question (weekday afternoon)
  else if (dayOfWeek >= 2 && dayOfWeek <= 5 && hour >= 14 && hour <= 16 && Math.random() > 0.7) {
    const qs = [
      "What's one thing you've been pretending is fine when it isn't?",
      "What are you most proud of yourself for lately?",
      "What would you do differently if you knew you couldn't fail?",
      "Who in your life do you need to have a real conversation with?",
    ];
    notif = { title: `Jazz is thinking of you 🎷`, body: rnd(qs) };
  }
  // Goal check
  else if (P.goals && P.goals.filter(g => g.status === 'active').length > 0) {
    const g = P.goals.find(g => g.status === 'active' && (!g.lastCheckedIn || now - g.lastCheckedIn > 259200000));
    if (g) notif = { title: `Goal check-in, ${nm}`, body: `"${g.title}" — it's been a few days. What happened?` };
  }
  // Check-in reminder
  else if ((P.lastCheckInDate || '') !== new Date().toDateString() && hour >= 8 && hour <= 10) {
    notif = { title: `Morning check-in, ${nm} ☀️`, body: 'Start your day with Jazz — 2 minutes, big difference.' };
  }

  if (notif) {
    sendLocalNotif(notif.title, notif.body);
    DB.s('lastNotif', now);
  }
}
