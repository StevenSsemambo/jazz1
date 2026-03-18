/* ═══════════════════════════════════════════════════════
 * Jazz Buddy -- 16-v8-productivity.js
 * V8 Productivity: Focus/Pomodoro, morning/evening rituals,
 * habit builder, decision journal, body scan,
 * weekly planning, voice memo flow
 * SayMy Tech Developers
 * ═══════════════════════════════════════════════════════ */

// ══════════════════════════════════════════════════════════════════
// FOCUS / POMODORO MODE
// ══════════════════════════════════════════════════════════════════
let focusState = { active: false, task: '', startTime: null, duration: 25, timer: null, blocksCompleted: 0 };

function startFocusMode(task, minutes) {
  focusState = { active: true, task: task || 'your work', startTime: Date.now(), duration: minutes || 25, timer: null, blocksCompleted: 0 };
  const nm = P.name || 'friend';

  const intros = [
    `Okay, ${nm}. ${focusState.duration} minutes. "${focusState.task}". That's the only thing that exists right now. I'll check in when the time is up. Go.`,
    `Focus mode: ON. "${focusState.task}" -- ${focusState.duration} minutes. Close everything else. I'll be here when you're done.`,
    `${focusState.duration} minutes, ${nm}. Just "${focusState.task}". Nothing else. I'll come back for you.`,
  ];

  addMsg('b', rnd(intros), 'et-firm');
  histAdd('b', '', 'neutral', 'focus');

  // Show timer UI in chat
  const timerHtml = buildFocusTimerCard(focusState.duration);
  setTimeout(() => {
    const lastMsg = chatEl.lastElementChild;
    if (lastMsg) {
      const extra = document.createElement('div');
      extra.innerHTML = timerHtml;
      extra.id = 'focus-timer-card';
      lastMsg.querySelector('.mc')?.appendChild(extra);
    }
    startFocusCountdown();
  }, 600);
}

function buildFocusTimerCard(minutes) {
  return `<div class="focus-card" id="focus-card">
    <div class="focus-icon">🎯</div>
    <div class="focus-task" id="focus-task-display">${focusState.task}</div>
    <div class="focus-timer" id="focus-timer-display">${String(minutes).padStart(2,'0')}:00</div>
    <div class="focus-bar-wrap"><div class="focus-bar" id="focus-bar" style="width:0%"></div></div>
    <button class="action-btn" onclick="endFocusEarly()" style="margin-top:10px;font-size:12px">End early</button>
  </div>`;
}

function startFocusCountdown() {
  const totalSecs = focusState.duration * 60;
  let elapsed = 0;
  focusState.timer = setInterval(() => {
    elapsed++;
    const remaining = totalSecs - elapsed;
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const pct = (elapsed / totalSecs) * 100;

    const timerEl = document.getElementById('focus-timer-display');
    const barEl = document.getElementById('focus-bar');
    if (timerEl) timerEl.textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    if (barEl) barEl.style.width = pct + '%';

    if (remaining <= 0) {
      clearInterval(focusState.timer);
      focusState.active = false;
      focusState.blocksCompleted++;
      endFocusSession(true);
    }
  }, 1000);
}

function endFocusEarly() {
  if (focusState.timer) clearInterval(focusState.timer);
  focusState.active = false;
  endFocusSession(false);
}

function endFocusSession(completed) {
  const nm = P.name || 'friend';
  const task = focusState.task;
  if (completed) {
    const msgs = [
      `Time's up, ${nm}. ${focusState.duration} minutes on "${task}". How did it go? Did you stay with it?`,
      `Done! ${focusState.duration} minutes. "${task}" -- what happened? Tell me everything.`,
      `That's ${focusState.duration} minutes. You just did the thing. How do you feel?`,
    ];
    addMsg('b', rnd(msgs), 'et-goal');
    // Offer another block
    setTimeout(() => {
      addMsg('b', `Want to do another block? We can go again -- or we can debrief and stop here. Your call.`, 'et-calm');
      setQR([
        {l:'Another block!', t:`Let's do another ${focusState.duration}-minute block`},
        {l:'Done for now', t:'I am done for now, let me debrief'},
        {l:'It went well', t:'It went really well, I stayed focused'},
        {l:'Got distracted', t:'I got distracted honestly'},
      ]);
    }, 1200);
  } else {
    addMsg('b', `You ended early. That's okay. What happened -- did something come up, or did you lose focus?`, 'et-calm');
  }
}

// ══════════════════════════════════════════════════════════════════
// MORNING RITUAL (distinct from daily check-in)
// ══════════════════════════════════════════════════════════════════
let morningState = { active: false, step: 0, data: {} };
const MORNING_STEPS = [
  { id: 'gratitude', q: "Morning. Before anything else -- name one thing you're genuinely grateful for right now. Small is fine.", opts: [] },
  { id: 'intention', q: "Good. Now: what's your one true priority for today? Not your list -- the one thing that, if you did it, the day would feel worth it.", opts: [] },
  { id: 'worry',     q: "Last one: what's the one thing you're worried about today? Name it so it doesn't follow you around unnamed.", opts: [] },
];

function startMorningRitual() {
  morningState = { active: true, step: 0, data: {} };
  const nm = P.name || 'friend';
  const hour = new Date().getHours();
  const intro = hour < 12
    ? `Morning, ${nm}. Let's start the day right -- three questions, one minute each. No pressure, just honesty.`
    : `Let's do a quick morning reset, ${nm}. Three questions. Just answer what's true.`;
  addMsg('b', intro, 'et-checkin');
  histAdd('b', intro, 'neutral', 'morningRitual');
  setTimeout(() => {
    addMsg('b', MORNING_STEPS[0].q, 'et-checkin');
  }, 700);
}

function processMorningStep(text) {
  if (!morningState.active) return false;
  const step = MORNING_STEPS[morningState.step];
  morningState.data[step.id] = text;
  morningState.step++;

  if (morningState.step < MORNING_STEPS.length) {
    setTimeout(() => addMsg('b', MORNING_STEPS[morningState.step].q, 'et-checkin'), 500);
    return true;
  } else {
    morningState.active = false;
    const nm = P.name || 'friend';
    const d = morningState.data;
    const summary = `Morning set, ${nm}.\n\n✦ Grateful for: ${d.gratitude}\n✦ Priority: ${d.intention}\n✦ Watching: ${d.worry}\n\nI'll check on the priority later. Now go.`;
    // Store morning intention as commitment
    if (d.intention) {
      if (!P.commitments) P.commitments = [];
      P.commitments.push({ text: d.intention, ts: Date.now(), checkedIn: false, nextCheck: Date.now() + 43200000, isMorning: true });
      saveP();
    }
    memAdd(`Morning ritual: grateful for "${d.gratitude}", priority "${d.intention}", worried about "${d.worry}"`, ['morning','ritual','gratitude'], 'neutral', 'morningRitual');
    setTimeout(() => { addMsg('b', summary, 'et-checkin'); setQR(getQR('greeting')); }, 600);
    return true;
  }
}

// ══════════════════════════════════════════════════════════════════
// EVENING RITUAL
// ══════════════════════════════════════════════════════════════════
let eveningState = { active: false, step: 0, data: {} };
const EVENING_STEPS = [
  { id: 'win1',    q: "Evening. Three wins from today -- they can be tiny. First one?" },
  { id: 'win2',    q: "Second win?" },
  { id: 'win3',    q: "Third win?" },
  { id: 'release', q: "Good. Now: what's one thing from today you want to put down? Something you're choosing not to carry into tomorrow." },
  { id: 'sleep',   q: "Last one: on a scale of 1-10, how tired are you? And is it the good kind of tired or the depleted kind?" },
];

function startEveningRitual() {
  eveningState = { active: true, step: 0, data: {} };
  const nm = P.name || 'friend';
  addMsg('b', `Evening, ${nm}. Let's close the day properly. Five quick things -- wins, release, sleep check.`, 'et-checkin');
  setTimeout(() => addMsg('b', EVENING_STEPS[0].q, 'et-checkin'), 700);
}

function processEveningStep(text) {
  if (!eveningState.active) return false;
  const step = EVENING_STEPS[eveningState.step];
  eveningState.data[step.id] = text;
  eveningState.step++;

  if (eveningState.step < EVENING_STEPS.length) {
    setTimeout(() => addMsg('b', EVENING_STEPS[eveningState.step].q, 'et-checkin'), 500);
    return true;
  } else {
    eveningState.active = false;
    const d = eveningState.data;
    const nm = P.name || 'friend';
    // Log sleep
    const sleepNum = parseInt((d.sleep||'').match(/\d+/)?.[0]);
    if (sleepNum) logHealth('energy', sleepNum);
    // Store wins as wisdom
    memAdd(`Evening wins: ${d.win1}, ${d.win2}, ${d.win3}`, ['wins','evening','gratitude'], 'grateful', 'eveningRitual');
    const summary = `Evening wrapped, ${nm}.\n\n✦ Wins: ${d.win1} · ${d.win2} · ${d.win3}\n✦ Releasing: ${d.release}\n\nRest well. You showed up today.`;
    setTimeout(() => {
      addMsg('b', summary, 'et-checkin');
      setTimeout(() => {
        addMsg('b', `One more thing -- would you like me to tell you a sleep story? Just say the word.`, 'et-calm');
        setQR([{l:'Yes, a sleep story', t:'Tell me a sleep story please'}, {l:'No, I\'m good', t:'No I\'m good, goodnight Jazz'}]);
      }, 1500);
    }, 600);
    return true;
  }
}

// ══════════════════════════════════════════════════════════════════
// HABIT BUILDER
// ══════════════════════════════════════════════════════════════════
// P.habits initialised lazily in buildHabit()

function buildHabit(habitName, anchorBehavior, frequency) {
  if(typeof P!=='undefined'&&!P.habits)P.habits=[];
  const habit = {
    id: Date.now(),
    name: habitName,
    anchor: anchorBehavior, // what they already do
    frequency: frequency || 'daily',
    streak: 0,
    lastDone: null,
    nextCheck: Date.now() + 86400000,
    createdAt: Date.now(),
    status: 'active',
  };
  // P.habits initialised lazily in buildHabit()
  P.habits.push(habit);
  saveP();
  memAdd(`Habit started: "${habitName}" anchored to "${anchorBehavior}"`, ['habit','routine'], 'excited', 'habit');
  return habit;
}

function checkHabitsDue() {
  if (!P.habits) return null;
  const now = Date.now();
  const due = P.habits.find(h => h.status === 'active' && h.nextCheck < now);
  if (!due) return null;
  const daysSince = due.lastDone ? days_since(due.lastDone) : 99;
  due.nextCheck = now + 86400000;
  saveP();

  if (daysSince <= 1) {
    due.streak++;
    saveP();
    return `"${due.name}" -- did you do it yesterday? Your streak is at ${due.streak} day${due.streak>1?'s':''}.`;
  } else {
    due.streak = 0;
    saveP();
    return `"${due.name}" -- the habit you wanted to build. It's been ${daysSince} days. What got in the way?`;
  }
}

// ══════════════════════════════════════════════════════════════════
// DECISION JOURNAL
// ══════════════════════════════════════════════════════════════════
// P.decisions initialised lazily in saveDecision()

function saveDecision(decision, options, reasoning, choice) {
  if(typeof P!=='undefined'&&!P.decisions)P.decisions=[];
  const entry = {
    id: Date.now(),
    decision,
    options: options || [],
    reasoning,
    choice,
    ts: Date.now(),
    reviewAt: Date.now() + 180 * 86400000, // 6 months
    reviewed: false,
  };
  // P.decisions initialised lazily in saveDecision()
  P.decisions.push(entry);
  saveP();
  return entry;
}

function checkDecisionReviews() {
  if (!P.decisions) return null;
  const now = Date.now();
  const due = P.decisions.find(d => !d.reviewed && d.reviewAt <= now);
  if (!due) return null;
  due.reviewed = true;
  saveP();
  const monthsAgo = Math.round((now - due.ts) / (30 * 86400000));
  return `${monthsAgo} months ago you made a decision: "${due.decision}". You chose: "${due.choice}".\n\nHow did it turn out? What would you tell yourself then?`;
}

// ══════════════════════════════════════════════════════════════════
// BODY SCAN
// ══════════════════════════════════════════════════════════════════
let bodyScanState = { active: false, step: 0, data: {} };
const BODY_SCAN_STEPS = [
  { id: 'head', area: 'head and neck', q: "Let's do a body scan. Close your eyes if you can. Start with your head and neck -- what do you notice? Tension? Pain? Numbness? Looseness?" },
  { id: 'chest', area: 'chest and breathing', q: "Move to your chest and breathing. Is your breath shallow or deep right now? Does your chest feel tight or open?" },
  { id: 'stomach', area: 'stomach and gut', q: "Stomach. What's happening there -- butterflies, tightness, emptiness, warmth, nothing?" },
  { id: 'hands', area: 'hands and arms', q: "Hands and arms. Tense? Restless? Heavy? What do you notice?" },
  { id: 'overall', area: 'overall', q: "Overall body. If your whole body had one word to describe how it feels right now, what would it be?" },
];

const BODY_EMOTION_MAP = {
  tight: 'anxiety or stress',
  tense: 'tension or unresolved stress',
  heavy: 'tiredness or sadness',
  shallow: 'anxiety or stress',
  butterflies: 'nervous excitement or anxiety',
  empty: 'dissociation or deep sadness',
  warm: 'comfort or safety',
  loose: 'relaxation or exhaustion',
  numb: 'dissociation or overwhelm',
};

function startBodyScan() {
  bodyScanState = { active: true, step: 0, data: {} };
  const nm = P.name || 'friend';
  addMsg('b', `Let's do a body scan, ${nm}. Your body holds things your mind doesn't always have words for. Five areas, one at a time. Take your time with each.`, 'et-calm');
  setTimeout(() => addMsg('b', BODY_SCAN_STEPS[0].q, 'et-calm'), 800);
}

function processBodyScanStep(text) {
  if (!bodyScanState.active) return false;
  const step = BODY_SCAN_STEPS[bodyScanState.step];
  bodyScanState.data[step.id] = text;
  bodyScanState.step++;

  if (bodyScanState.step < BODY_SCAN_STEPS.length) {
    setTimeout(() => addMsg('b', BODY_SCAN_STEPS[bodyScanState.step].q, 'et-calm'), 600);
    return true;
  } else {
    bodyScanState.active = false;
    const d = bodyScanState.data;
    // Interpret body signals
    const allText = Object.values(d).join(' ').toLowerCase();
    let bodyEmotion = null;
    for (const [signal, emotion] of Object.entries(BODY_EMOTION_MAP)) {
      if (allText.includes(signal)) { bodyEmotion = emotion; break; }
    }
    const nm = P.name || 'friend';
    let summary = `Thank you for going there with me, ${nm}. Your body said:\n\nHead: ${d.head} · Chest: ${d.chest} · Stomach: ${d.stomach} · Hands: ${d.hands} · Overall: ${d.overall}.`;
    if (bodyEmotion) summary += `\n\nI notice some signals that often come with ${bodyEmotion}. Your body is not wrong -- it's picking up something real. What does that tell you?`;
    else summary += `\n\nWhat does your body's wisdom say about how you're actually doing right now?`;
    setTimeout(() => {
      addMsg('b', summary, 'et-calm');
      setQR([
        {l:'Tell me more', t:'Let me tell you more about what I noticed'},
        {l:'It makes sense', t:'That actually makes a lot of sense'},
        {l:'I\'m not sure', t:'I\'m not really sure what it means'},
      ]);
    }, 600);
    return true;
  }
}

// ══════════════════════════════════════════════════════════════════
// WEEKLY PLANNING SESSION (Monday)
// ══════════════════════════════════════════════════════════════════
let weeklyPlanState = { active: false, step: 0, data: {} };
const WEEKLY_PLAN_STEPS = [
  { id: 'priorities', q: "Monday. New week. What are your three real priorities this week -- the ones that actually matter?" },
  { id: 'worry',      q: "What's the one thing you're most worried about this week?" },
  { id: 'lookForward',q: "What are you looking forward to -- even something small?" },
  { id: 'letGo',      q: "What do you want to let go of from last week that you don't want to carry into this one?" },
  { id: 'goodWeek',   q: "Last one: what does a good week look like for you? What would make Friday feel like a win?" },
];

function startWeeklyPlan() {
  weeklyPlanState = { active: true, step: 0, data: {} };
  const nm = P.name || 'friend';
  addMsg('b', `Monday, ${nm}. Let's set the week properly. Five questions -- takes three minutes. Worth every second.`, 'et-goal');
  setTimeout(() => addMsg('b', WEEKLY_PLAN_STEPS[0].q, 'et-goal'), 700);
}

function processWeeklyPlanStep(text) {
  if (!weeklyPlanState.active) return false;
  const step = WEEKLY_PLAN_STEPS[weeklyPlanState.step];
  weeklyPlanState.data[step.id] = text;
  weeklyPlanState.step++;

  if (weeklyPlanState.step < WEEKLY_PLAN_STEPS.length) {
    setTimeout(() => addMsg('b', WEEKLY_PLAN_STEPS[weeklyPlanState.step].q, 'et-goal'), 500);
    return true;
  } else {
    weeklyPlanState.active = false;
    const d = weeklyPlanState.data;
    const nm = P.name || 'friend';
    const plan = `Week set, ${nm}.\n\n🎯 Priorities: ${d.priorities}\n⚠️ Watching: ${d.worry}\n✦ Looking forward to: ${d.lookForward}\n✂️ Letting go: ${d.letGo}\n🏆 A good week looks like: ${d.goodWeek}`;
    if (!P.weeklyPlans) P.weeklyPlans = [];
    P.weeklyPlans.push({ ...d, ts: Date.now() });
    if (P.weeklyPlans.length > 12) P.weeklyPlans.shift();
    saveP();
    setTimeout(() => {
      addMsg('b', plan, 'et-goal');
      setTimeout(() => {
        addMsg('b', `I'll check in on Friday. Go make the week yours.`, 'et-warm');
        setQR(getQR('goals'));
      }, 1500);
    }, 600);
    return true;
  }
}

// ══════════════════════════════════════════════════════════════════
// CONVERSATION BOOKMARKS
// ══════════════════════════════════════════════════════════════════
// P.bookmarks init is lazy
function bookmarkMessage(text, tone, ts) {
  if(typeof P!=="undefined"&&!P.bookmarks)P.bookmarks=[];
  P.bookmarks.push({ text, tone, ts: ts || Date.now(), id: Date.now() });
  if (P.bookmarks.length > 50) P.bookmarks.shift();
  saveP();
  toast('💾 Saved to your highlights');
}

function renderBookmarks() {
  const bm = (P.bookmarks || []).slice().reverse();
  return bm.length
    ? bm.map(b => `<div class="bookmark-item"><div class="bookmark-text">"${b.text.slice(0,120)}${b.text.length>120?'...':''}"</div><div class="bookmark-time">${new Date(b.ts).toLocaleDateString()}</div></div>`).join('')
    : '<div style="font-size:13px;color:var(--tx3)">No saved highlights yet. Long-press any Jazz message to save it.</div>';
}

// ══════════════════════════════════════════════════════════════════
// EMOTIONAL FINGERPRINT RENDERER (inline chart using Canvas/SVG)
// ══════════════════════════════════════════════════════════════════
function renderEmotionalFingerprintCard() {
  const fp = generateEmotionalFingerprint();
  if (!fp) return '<div style="font-size:13px;color:var(--tx3)">Talk to Jazz for at least 30 conversations to unlock your emotional fingerprint.</div>';

  const dims = [
    { label: 'Range',      val: fp.range },
    { label: 'Resilience', val: fp.resilience },
    { label: 'Depth',      val: fp.depth },
    { label: 'Openness',   val: fp.openness },
    { label: 'Empathy',    val: fp.empathy },
    { label: 'Joy',        val: fp.joy },
  ];
  const n = dims.length;
  const cx = 110, cy = 110, r = 85;
  const points = dims.map((d, i) => {
    const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
    const pct = d.val / 100;
    return {
      x: cx + Math.cos(angle) * r * pct,
      y: cy + Math.sin(angle) * r * pct,
      lx: cx + Math.cos(angle) * (r + 18),
      ly: cy + Math.sin(angle) * (r + 18),
      label: d.label,
      val: d.val,
    };
  });
  const polyPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  // Grid rings
  const gridRings = [25, 50, 75, 100].map(pct => {
    const gp = dims.map((_, i) => {
      const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
      return `${cx + Math.cos(angle) * r * pct/100},${cy + Math.sin(angle) * r * pct/100}`;
    }).join(' ');
    return `<polygon points="${gp}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>`;
  }).join('');

  const spokes = dims.map((_, i) => {
    const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
    return `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(angle)*r}" y2="${cy + Math.sin(angle)*r}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>`;
  }).join('');

  const labels = points.map(p =>
    `<text x="${p.lx}" y="${p.ly}" text-anchor="middle" dominant-baseline="middle" fill="#9898b8" font-size="9" font-family="DM Sans,sans-serif">${p.label}</text>`
  ).join('');

  const svg = `<svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:240px;display:block;margin:0 auto">
    ${gridRings}${spokes}
    <polygon points="${polyPoints}" fill="rgba(108,92,231,0.25)" stroke="rgba(162,155,254,0.9)" stroke-width="1.5"/>
    ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="3" fill="#a29bfe"/>`).join('')}
    ${labels}
  </svg>`;

  return `<div style="text-align:center;padding:10px 0">
    <div class="psec-label" style="margin-bottom:12px">Your Emotional Fingerprint</div>
    ${svg}
    <div style="font-size:11px;color:var(--tx3);margin-top:10px;line-height:1.6">
      Primary coping style: <strong style="color:var(--acc2)">${fp.primaryCoping}</strong> ·
      Top emotion: <strong style="color:var(--acc2)">${fp.topEmotion}</strong>
    </div>
  </div>`;
}
