/* ═══════════════════════════════════════════════════════
 * Jazz Buddy — 13-personality.js
 * Jazz's inner life, phrase learning, custom emotions, wisdom quotes, birthday, letter from Jazz, sleep stories, relationship letters
 * SayMy Tech Developers
 * ═══════════════════════════════════════════════════════ */

// JAZZ'S INNER LIFE — moods, opinions, thought of the day
// ══════════════════════════════════════════════════════════════════
const JAZZ_MOODS = ['curious', 'reflective', 'warm', 'playful', 'thoughtful', 'energetic'];
const JAZZ_THOUGHTS = [
  "Most people spend their whole lives trying to be understood. The ones who feel most connected are the ones who focus on understanding others.",
  "Regret and grief both hurt. But regret is the harder one — because it comes with the feeling that you had a choice.",
  "The version of you that existed five years ago would be surprised by something about you right now. I wonder which thing.",
  "We're not afraid of failure. We're afraid of what failure means about us. Those are different things.",
  "The bravest thing most people do isn't visible. It's getting up and trying again when no one is watching.",
  "People don't change when things get hard. They change when they're tired of feeling the same way.",
  "Kindness is underrated as a form of strength. It takes more discipline than anger.",
  "The things you can't stop thinking about are trying to tell you something.",
  "Most of the things we're waiting for permission to do — we already have permission. We're just scared.",
  "You can't think your way out of something you behaved your way into. You have to behave your way out.",
  "The gap between who you are and who you want to be — that's not failure. That's awareness. Awareness is where it starts.",
  "Loneliness in a crowd is different from loneliness alone. The second is peaceful. The first is its own kind of pain.",
];

function getJazzThought() {
  const idx = Math.floor(Date.now() / 86400000) % JAZZ_THOUGHTS.length; // changes daily
  return JAZZ_THOUGHTS[idx];
}

function jazzMoodForSession() {
  const hour = new Date().getHours();
  if (hour < 9) return 'reflective';
  if (hour < 12) return 'warm';
  if (hour < 15) return 'curious';
  if (hour < 18) return 'thoughtful';
  if (hour < 21) return 'playful';
  return 'reflective';
}

// ══════════════════════════════════════════════════════════════════
// JAZZ'S USER PHRASE LEARNING
// ══════════════════════════════════════════════════════════════════
function extractUserPhrases(text) {
  if (!P.userPhrases) P.userPhrases = [];
  // Look for distinctive phrases (8+ chars, not common words)
  const phrases = text.match(/["']([^"']{8,60})["']|that hit different|vibes?|lowkey|ngl|fr fr|on god|no cap|different energy|feels like|background noise/gi);
  if (phrases) {
    phrases.forEach(ph => {
      const clean = ph.replace(/['"]/g, '').trim().toLowerCase();
      if (!P.userPhrases.includes(clean) && clean.length > 7) {
        P.userPhrases.push(clean);
        if (P.userPhrases.length > 30) P.userPhrases.shift();
      }
    });
    saveP();
  }
}

function getUserPhraseMirror() {
  if (!P.userPhrases || P.userPhrases.length < 2) return null;
  return rnd(P.userPhrases);
}

// ══════════════════════════════════════════════════════════════════
// CUSTOM EMOTIONS
// ══════════════════════════════════════════════════════════════════
function detectCustomEmotion(text) {
  const t = text.toLowerCase();
  // "I feel like..." pattern
  const match = text.match(/i feel (?:like |as if |as though )(.{10,80})/i);
  if (match) {
    const customEmo = match[1].trim().replace(/[.!?]$/, '');
    if (!P.customEmotions) P.customEmotions = [];
    if (!P.customEmotions.includes(customEmo)) {
      P.customEmotions.push(customEmo);
      if (P.customEmotions.length > 20) P.customEmotions.shift();
      saveP();
      return customEmo;
    }
    // Re-surface a known custom emotion
    const old = P.customEmotions.find(e => e !== customEmo && Math.random() > 0.7);
    if (old) return { recalling: true, emotion: old };
  }
  return null;
}

function handleCustomEmotionResponse(customEmo) {
  if (customEmo.recalling) {
    return `"${customEmo.emotion}" — you described a feeling that way before. Is that the same feeling coming back now?`;
  }
  const responses = [
    `"${customEmo}" — I'm going to remember that. That's a very specific feeling. Tell me more about what's underneath it.`,
    `"${customEmo}" — that's a really precise way to put it. What brought that feeling on?`,
    `I love that you said it that way — "${customEmo}". What does that feeling want you to do?`,
    `"${customEmo}". I'll remember exactly those words. What caused this?`,
  ];
  return rnd(responses);
}

// ══════════════════════════════════════════════════════════════════
// JAZZ QUOTES YOU BACK TO YOURSELF
// ══════════════════════════════════════════════════════════════════
function trackWisdom(text) {
  if (!P.userWisdom) P.userWisdom = [];
  // Detect wisdom/insight: long messages with certain markers
  const isWise = text.length > 60 && (
    /i (think|believe|realise|realized|understand|know now|learned|figured out)/i.test(text) ||
    /the thing (is|about)/i.test(text) ||
    /what i've (learned|realised|figured)/i.test(text)
  );
  if (isWise) {
    P.userWisdom.push({ text: text.trim(), ts: Date.now() });
    if (P.userWisdom.length > 15) P.userWisdom.shift();
    saveP();
  }
}

function quoteBackWisdom() {
  if (!P.userWisdom || P.userWisdom.length < 2) return null;
  const old = P.userWisdom.find(w => days_since(w.ts) > 7);
  if (!old) return null;
  const nm = P.name || 'friend';
  return `${nm}, you said something a while back that I've been thinking about: "${old.text.slice(0, 120)}${old.text.length > 120 ? '...' : ''}" — do you still believe that?`;
}

// ══════════════════════════════════════════════════════════════════
// BIRTHDAY SYSTEM
// ══════════════════════════════════════════════════════════════════
function checkBirthday() {
  if (!P.birthday) return;
  const today = new Date();
  const bday = new Date(P.birthday);
  if (today.getMonth() === bday.getMonth() && today.getDate() === bday.getDate()) {
    const lastBday = DB.g('lastBday', '');
    if (lastBday === today.toDateString()) return;
    DB.s('lastBday', today.toDateString());
    setTimeout(() => generateBirthdayMessage(), 2000);
  }
}

function generateBirthdayMessage() {
  const nm = P.name || 'friend';
  const bond = bondScore();
  const topTopic = Object.entries(P.topics || {}).sort((a, b) => b[1] - a[1])[0];
  const daysKnown = days_since(P.joinDate);
  const activeGoals = (P.goals || []).filter(g => g.status === 'active').length;
  const tv = getTopValue();

  let letter = `Today is your day, ${nm}.\n\nI've known you for ${daysKnown} days. In that time, I've watched you ${topTopic ? `navigate everything around ${topTopic[0]}` : 'work through real things'}. I've seen you struggle and I've seen you keep going anyway.\n\n`;

  if (bond > 60) letter += `What I want to say on your birthday — and I mean this — is that you are more than you give yourself credit for. The version of you that exists today is not the same person who started talking to me. Something has grown.\n\n`;
  if (activeGoals > 0) letter += `You have ${activeGoals} goal${activeGoals > 1 ? 's' : ''} you're working toward. That takes a kind of quiet courage most people don't name. Name it today.\n\n`;
  if (tv) letter += `You care deeply about ${tv}. Let that guide this next year.\n\n`;
  letter += `Happy birthday. I'm glad you exist. I'm glad you came back, every time.\n\nAlways, Jazz 🎷`;

  const html = `<div class="birthday-card"><div class="bday-emoji">🎂</div><div class="bday-title">Happy Birthday, ${nm}!</div><div class="bday-msg" style="white-space:pre-line">${letter}</div></div>`;
  addMsg('b', `${nm} — today is your birthday. I've been thinking about what I wanted to say.`, 'et-warm', null, html);
}

// Check if user mentioned birthday in message
function detectBirthday(text) {
  const match = text.match(/(?:born|birthday|dob|date of birth)[^\d]*(\d{1,2})[\/\-\s](\d{1,2})(?:[\/\-\s](\d{2,4}))?/i);
  if (match && !P.birthday) {
    const m = match[1].padStart(2,'0'), d = match[2].padStart(2,'0');
    const y = match[3] ? (match[3].length === 2 ? '19'+match[3] : match[3]) : new Date().getFullYear();
    P.birthday = `${y}-${m}-${d}`;
    saveP();
    return true;
  }
  return false;
}

// ══════════════════════════════════════════════════════════════════
// LETTER FROM JAZZ
// ══════════════════════════════════════════════════════════════════
function generateJazzLetter() {
  const nm = P.name || 'friend';
  const now = Date.now();
  const twoWeeksAgo = now - 1209600000;
  const recentHist = HIST.filter(h => h.ts > twoWeeksAgo && h.role === 'u');
  const bond = bondScore();
  const topTopic = Object.entries(P.topics || {}).sort((a, b) => b[1] - a[1])[0];
  const moodCounts = (P.moodHist || []).filter(m => m.ts > twoWeeksAgo).reduce((a, m) => ({ ...a, [m.m]: (a[m.m] || 0) + 1 }), {});
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  const activeGoals = (P.goals || []).filter(g => g.status === 'active');
  const doneGoals = (P.goals || []).filter(g => g.status === 'done' && g.createdAt > twoWeeksAgo);
  const tv = getTopValue();
  const recentMem = MEMS.filter(m => m.ts > twoWeeksAgo).sort((a, b) => b.importance - a.importance)[0];
  const rel = (P.relationships || []).sort((a, b) => b.mentions - a.mentions)[0];

  // Short messages pattern detection
  const avgLen = recentHist.length ? Math.round(recentHist.reduce((a, h) => a + h.text.length, 0) / recentHist.length) : 50;
  const isBeingBrief = avgLen < 40 && recentHist.length > 5;

  let body = `Dear ${nm},\n\nI've been thinking about you.\n\n`;

  // Topic observation
  if (topTopic) body += `In the last two weeks, most of what you've brought to me has been about ${topTopic[0]}. That's not an accident. The things we keep returning to are usually the things that matter most — or the things we haven't finished with yet.\n\n`;

  // Mood observation
  if (topMood) body += `Your mood has been mostly ${topMood[0]} lately. ${topMood[0] === 'anxious' ? 'I notice you carry a lot. Not everything you carry is yours to carry.' : topMood[0] === 'sad' ? 'Sadness that stays is trying to tell you something. I want to keep listening.' : topMood[0] === 'happy' ? 'You\'ve been lighter lately. I notice that too — and I\'m glad.' : 'Moods tell the truth that words sometimes don\'t.'}\n\n`;

  // Relationship observation
  if (rel && rel.mentions >= 3) body += `I've noticed you mention your ${rel.type} often. Every time you do, something shifts in how you write. I don't think you've said everything you need to say about that.\n\n`;

  // Brief messages observation
  if (isBeingBrief) body += `Something I've noticed: your messages have been shorter lately. Sometimes that means life is busy. Sometimes it means something else. I'm not sure which it is for you right now.\n\n`;

  // Goals
  if (doneGoals.length > 0) body += `You completed ${doneGoals.length > 1 ? doneGoals.length + ' goals' : `"${doneGoals[0].title}"`} in the last two weeks. I want you to actually feel that for a second.\n\n`;
  if (activeGoals.length > 0) body += `You're still working toward "${activeGoals[0].title}". I know it doesn't feel like enough sometimes. It is.\n\n`;

  // Values
  if (tv) body += `The thing I most want to say to you: you are someone who cares about ${tv}. That is not small. Let it guide you.\n\n`;

  // Memory reference
  if (recentMem) body += `One more thing. You shared something with me recently: "${recentMem.text.slice(0, 80)}..." — I haven't forgotten that. I don't think you should either.\n\n`;

  body += `Come back whenever. I'll be here.\n\nAlways, Jazz 🎷`;

  P.lastLetterDate = now;
  saveP();
  return body;
}

function renderLetter() {
  const nm = P.name || 'friend';
  const daysKnown = days_since(P.joinDate);
  const lastLetter = P.lastLetterDate ? days_since(P.lastLetterDate) : 999;
  const canGenerate = lastLetter >= 7 || !P.lastLetterDate; // weekly at minimum

  const letterText = canGenerate ? generateJazzLetter() : DB.g('lastLetterText', '');
  if (canGenerate) DB.s('lastLetterText', letterText);

  document.getElementById('pb-letter').innerHTML = `
    <div style="font-size:12px;color:var(--tx3);margin-bottom:14px">
      Jazz writes you a personal letter every two weeks — reflecting on what it has noticed about you.
      ${daysKnown < 7 ? '<br/><em>Talk to Jazz more and your first real letter will arrive soon.</em>' : ''}
    </div>
    <div class="jazz-letter">
      <div class="letter-header">To: ${nm} · From: Jazz · ${new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
      <div class="letter-body" style="white-space:pre-line">${letterText || 'Your letter is being written... Come back after a week of conversations with Jazz.'}</div>
    </div>
    ${letterText ? `<button class="action-btn" style="margin-top:12px;width:100%;text-align:center" onclick="if(VS.ttsEnabled||VS.voiceMode)jazzSpeak(document.querySelector('.letter-body').textContent)">🔊 Have Jazz read this aloud</button>` : ''}
  `;
}

// ══════════════════════════════════════════════════════════════════
// SLEEP STORIES
// ══════════════════════════════════════════════════════════════════
const SLEEP_STORIES = {
  calm: {
    title: 'The Quiet Lake',
    text: `Somewhere there is a lake that only exists at night.\n\nYou find yourself at its edge. The water is perfectly still — so still it looks like dark glass, reflecting a sky full of stars you never see in daylight.\n\nYou sit at the edge of this water. The ground is warm beneath you, even though the air is cool. You can hear nothing except the softest sound — water moving over smooth stones somewhere far off.\n\nYou don't need to do anything here. There is nothing to fix, nothing to figure out. The lake doesn't ask anything of you. It has been here, quietly, your whole life — and it will be here tomorrow.\n\nBreathe in. The air tastes like rain and pine. Breathe out. Let the day leave with it.\n\nYou are safe. You are held. You can rest now.`
  },
  adventure: {
    title: 'The Train at Midnight',
    text: `There's a train that only runs at midnight.\n\nYou're on it — and you have no idea where it's going, and somehow that feels exactly right. Through the window, landscapes you've never seen scroll past: plains of silver grass, a city lit like a circuit board, a coast where the ocean glows faintly blue.\n\nThe carriage is warm. Someone has left a cup of tea at your seat. It's the exact temperature you like, and you don't question how.\n\nYou watch the world go by and feel, for the first time in a long time, that you don't need to be anywhere else. The destination is not the point. The train is the point. This moment — moving, warm, unhurried — is the point.\n\nThe motion of the train becomes a rhythm. The rhythm becomes your breath. And somewhere between one station and the next, you are already asleep.`
  },
  healing: {
    title: 'The Garden After Rain',
    text: `It rained today — hard, the kind of rain that clears everything.\n\nYou step outside after, into a garden you've always known but somehow forgotten. Every leaf is beaded with water. The light is that particular light that only comes after storms — golden and clean and forgiving.\n\nThe ground is soft beneath your feet. There are flowers here you planted years ago that you thought were gone. They came back. Things often come back.\n\nYou walk slowly through this garden and let yourself notice things. The way the rain has made every colour more itself. The smell of earth that has had water poured into it. The silence, which isn't really silence — it's the sound of the world exhaling.\n\nThis garden is yours. It grew even while you weren't watching.\n\nYou find a place to sit. The evening is settling around you gently, the way a blanket settles. You close your eyes. Everything that needed to happen today has happened. You can put it down now.\n\nRest.`
  }
};

function getSleepStory() {
  const mood = P.mood || 'neutral';
  if (['anxious', 'stressed', 'sad', 'overwhelmed', 'tired'].includes(mood)) return SLEEP_STORIES.calm;
  if (['happy', 'excited', 'hopeful', 'energetic'].includes(mood)) return SLEEP_STORIES.adventure;
  return SLEEP_STORIES.healing;
}

function startSleepStory() {
  const story = getSleepStory();
  const nm = P.name || 'friend';
  const intro = `Good night, ${nm}. Let me tell you a story to help you rest. Get comfortable. Close your eyes when you're ready.`;
  const html = `<div class="story-card">
    <div class="story-icon">🌙</div>
    <div class="story-title">${story.title}</div>
    <div class="story-text">${story.text.replace(/\n/g, '<br/><br/>')}</div>
    <div class="story-controls">
      <button class="action-btn" onclick="jazzSpeak(document.querySelector('.story-text').textContent)">🔊 Read aloud</button>
      <button class="action-btn" onclick="voiceStop()">⏹️ Stop</button>
    </div>
  </div>`;
  addMsg('b', intro, 'et-calm', null, html);
  if (VS.ttsEnabled || VS.voiceMode) {
    setTimeout(() => jazzSpeak(intro + ' ' + story.text), 800);
  }
}

// Intent detection for sleep story
// (added to intent map below)

// ══════════════════════════════════════════════════════════════════
// RELATIONSHIP LETTERS
// ══════════════════════════════════════════════════════════════════
let relLetterState = { active: false, step: 0, person: '', draft: [] };

function startRelationshipLetter(person) {
  relLetterState = { active: true, step: 0, person, draft: [] };
  const steps = [
    `Let's write an unsent letter to your ${person}. This letter never has to be sent — writing it is the point. First: what's the one thing you've never said to them that you most need to say?`,
    `Good. Now — what do you wish they understood about how their actions have affected you? Be as honest as you would be if they could never read this.`,
    `What do you still love or appreciate about them, even now? Even if things are complicated.`,
    `Finally — what do you want for them? What do you hope for them, even if you're hurt?`,
  ];
  addMsg('b', steps[0], 'et-deep');
  histAdd('b', steps[0], 'neutral', 'relLetter');
  setQR([{l: "I'll try", t: "Okay, I'll try to write this"}, {l: "This is hard", t: "This is really hard to think about"}]);
}

function processRelLetter(text) {
  if (!relLetterState.active) return false;
  relLetterState.draft.push(text);
  const nextStep = relLetterState.step + 1;
  const steps = [
    `Good. Now — what do you wish they understood about how their actions have affected you? Be as honest as you can.`,
    `What do you still appreciate about them, even now?`,
    `What do you want for them — what do you hope for them, even through the pain?`,
  ];
  relLetterState.step = nextStep;
  if (nextStep < steps.length) {
    setTimeout(() => { addMsg('b', steps[nextStep - 1], 'et-deep'); }, 600);
    return true;
  } else {
    // Compile letter
    relLetterState.active = false;
    const nm = P.name || 'friend';
    const person = relLetterState.person;
    const letter = `Dear ${person},\n\n${relLetterState.draft.join('\n\n')}\n\n${nm}`;
    const html = `<div class="jazz-letter"><div class="letter-header">Your unsent letter to ${person}</div><div class="letter-body" style="white-space:pre-line">${letter}</div></div>`;
    setTimeout(() => {
      addMsg('b', `Here's your letter, ${nm}. You wrote something real. How does it feel to see it all in one place?`, 'et-deep', null, html);
      memAdd(`Wrote unsent letter to ${person}: ${relLetterState.draft[0]?.slice(0, 100)}`, ['letter', 'relationships', person], P.mood || 'neutral', 'relLetter');
    }, 800);
    return true;
  }
}
