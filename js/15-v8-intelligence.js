/* ═══════════════════════════════════════════════════════
 * Jazz Buddy -- 15-v8-intelligence.js
 * V8 Intelligence: State machine, predictive empathy,
 * emotional trajectory, contradiction detection,
 * nuance layers, Socratic mode, commitment tracking,
 * insight engine, reframing engine, cognitive distortions
 * SayMy Tech Developers
 * ═══════════════════════════════════════════════════════ */

// ══════════════════════════════════════════════════════════════════
// CONVERSATION STATE MACHINE
// States: exploring | processing | resolving | celebrating | supporting | socratic
// ══════════════════════════════════════════════════════════════════
const CONV_STATES = {
  exploring:  { desc:'Open conversation',      toneBoost:'et-warm', nextCheck: 3 },
  processing: { desc:'Working something through', toneBoost:'et-deep', nextCheck: 2 },
  resolving:  { desc:'Moving toward resolution', toneBoost:'et-firm', nextCheck: 2 },
  celebrating:{ desc:'Something good happened',  toneBoost:'et-play', nextCheck: 1 },
  supporting: { desc:'Active emotional support',  toneBoost:'et-care', nextCheck: 1 },
  socratic:   { desc:'Socratic questioning mode', toneBoost:'et-deep', nextCheck: 1 },
};

let convState = {
  current: 'exploring',
  msgCount: 0,       // messages in current state
  history: [],       // state transitions
  socraticDepth: 0,  // depth of current Socratic chain
  avoidanceCount: 0, // count of avoidance signals
};

function updateConvState(intent, emotion, intensity, text) {
  const prev = convState.current;
  convState.msgCount++;
  const t = text.toLowerCase();

  // Transition rules
  if (['shareGoodNews','gratitude','celebrating','excited'].includes(intent) || emotion === 'excited') {
    convState.current = 'celebrating';
  } else if (['crisis','mentalHealth','grief','trauma'].includes(intent) || intensity > 7) {
    convState.current = 'supporting';
  } else if (convState.socraticDepth > 0) {
    convState.current = 'socratic';
  } else if (['askAdvice','bigDecision','goals'].includes(intent) && convState.msgCount > 3) {
    convState.current = 'resolving';
  } else if (['venting','loneliness','heartbreak','stress'].includes(intent)) {
    convState.current = 'processing';
  } else if (['philosophical','identity','growth'].includes(intent)) {
    convState.current = 'processing';
  } else if (convState.msgCount > 2 && prev === 'exploring') {
    // Stay in exploring or natural transition
  }

  // Detect avoidance signals for Socratic mode
  const avoidSignals = ["i don't know", "idk", "not sure", "whatever", "i guess", "maybe", "i don't care"];
  if (avoidSignals.some(s => t.includes(s)) && text.length < 30) {
    convState.avoidanceCount++;
    if (convState.avoidanceCount >= 2) {
      convState.current = 'socratic';
      convState.socraticDepth = 0;
    }
  } else {
    convState.avoidanceCount = Math.max(0, convState.avoidanceCount - 1);
  }

  if (prev !== convState.current) {
    convState.msgCount = 0;
    convState.history.push({ from: prev, to: convState.current, ts: Date.now() });
  }
}

function getStateModeModifier(text) {
  const nm = P.name || 'friend';
  switch(convState.current) {
    case 'socratic':
      convState.socraticDepth++;
      return getSocraticQuestion(convState.socraticDepth, text);
    case 'celebrating':
      return null; // normal celebratory response
    case 'supporting':
      return null; // normal crisis/support response
    case 'resolving':
      if (Math.random() > 0.6) return `${nm}, I want to help you actually land somewhere with this -- not just talk around it. What does moving forward look like to you, even one small step?`;
      return null;
    default:
      return null;
  }
}

const SOCRATIC_QUESTIONS = [
  [  // depth 1 -- surface
    "What's the thing underneath what you just said?",
    "Tell me more. What's really going on?",
    "I want to understand this properly. What's the core of it?",
    "What are you actually feeling right now -- not what you think you should feel?",
  ],
  [  // depth 2 -- one layer deeper
    "What does that feeling want you to do?",
    "When did you first start feeling this way about this?",
    "What would change if this resolved?",
    "What's the part of this you're most afraid to look at?",
  ],
  [  // depth 3 -- the real thing
    "What's the belief underneath all of this? About yourself, or the world?",
    "If you knew the answer, what would it be?",
    "What does the wisest part of you already know about this?",
    "What would you tell someone you love who was in this exact situation?",
  ],
  [  // depth 4+ -- integration
    "What has this conversation brought up that you didn't expect?",
    "What do you want to do with what you just discovered?",
    "What changes now that you've said all of this out loud?",
  ],
];

function getSocraticQuestion(depth, text) {
  const tier = Math.min(depth - 1, SOCRATIC_QUESTIONS.length - 1);
  return rnd(SOCRATIC_QUESTIONS[tier]);
}

// ══════════════════════════════════════════════════════════════════
// PREDICTIVE EMPATHY -- time + pattern based opening adjustment
// ══════════════════════════════════════════════════════════════════
function getPredictiveGreeting(nm) {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0=Sun, 1=Mon...
  const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][day];

  // Build pattern from history
  const dayHist = (HIST || []).filter(h => {
    const d = new Date(h.ts);
    return d.getDay() === day && h.role === 'u';
  });

  const commonIntents = {};
  dayHist.forEach(h => { if(h.intent) commonIntents[h.intent] = (commonIntents[h.intent]||0)+1; });
  const topIntent = Object.entries(commonIntents).sort((a,b)=>b[1]-a[1])[0];

  // Time-based
  const timeGreets = {
    night:   [`It's late, ${nm}. Late-night conversations are different. What's actually on your mind?`, `${nm}. It's ${hour > 0 ? hour : 12}am. I'm here. What's keeping you up?`, `Late night, ${nm}. The quiet hours. What's going on?`],
    morning: [`Morning, ${nm}. New day. What are you carrying into it?`, `Good morning, ${nm}. What's the emotional weather like this morning?`, `${nm}! Morning. How did you sleep -- and what's waiting for you today?`],
    evening: [`Evening, ${nm}. How has the day actually been?`, `Hey ${nm}. The day is winding down. How are you?`, `${nm}, evening. Let's talk about how today really went.`],
    afternoon:[`Afternoon, ${nm}. Midday check -- how are you doing?`, `Hey ${nm}. How's the day going so far?`],
  };

  const timeKey = hour >= 0 && hour < 5 ? 'night' : hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  // Day-pattern based addition
  let patternSuffix = '';
  if (topIntent && dayHist.length >= 3) {
    const patternMap = {
      work: `${dayName}s tend to be heavy for you -- usually something to do with work. How is that today?`,
      stress: `${dayName}s have been stressful for you lately. What's the vibe today?`,
      family: `I've noticed ${dayName}s often bring up family things for you. How's that going?`,
      venting: `You often have things to get off your chest on ${dayName}s. What's going on?`,
    };
    patternSuffix = patternMap[topIntent[0]] || '';
  }

  const base = rnd(timeGreets[timeKey]);
  return patternSuffix ? `${base}\n\n${patternSuffix}` : base;
}

// ══════════════════════════════════════════════════════════════════
// EMOTIONAL TRAJECTORY SCORING
// ══════════════════════════════════════════════════════════════════
const SESSION_EMOTIONS = [];

function trackEmotionalTrajectory(emotion, intensity) {
  SESSION_EMOTIONS.push({ emotion, intensity, ts: Date.now() });
  if (SESSION_EMOTIONS.length > 20) SESSION_EMOTIONS.shift();
}

function getEmotionalSlope() {
  if (SESSION_EMOTIONS.length < 4) return 0;
  const recent = SESSION_EMOTIONS.slice(-3);
  const earlier = SESSION_EMOTIONS.slice(-6, -3);
  if (!earlier.length) return 0;

  const negEmotions = ['sad','anxious','angry','overwhelmed','grieving','lonely'];
  const recentNeg = recent.filter(e => negEmotions.includes(e.emotion)).length / recent.length;
  const earlierNeg = earlier.filter(e => negEmotions.includes(e.emotion)).length / earlier.length;
  return earlierNeg - recentNeg; // positive = getting better, negative = getting worse
}

function checkTrajectoryShift() {
  const slope = getEmotionalSlope();
  if (Math.abs(slope) < 0.4) return null;
  const nm = P.name || 'friend';
  if (slope > 0.4) {
    return rnd([
      `Something shifted in the last few messages, ${nm}. You came in heavier than you are now. What changed?`,
      `I'm noticing something -- the tone has lightened. What happened just now?`,
      `You seem like you've moved somewhere. A few messages ago felt different. What shifted?`,
    ]);
  } else {
    return rnd([
      `I want to slow down here. Something's getting heavier as we talk. Are you okay right now?`,
      `${nm} -- I'm noticing this is getting harder as we go. What's the real thing underneath all of this?`,
      `Something is escalating in what you're sharing. I don't want to rush past it. What's actually going on?`,
    ]);
  }
}

// ══════════════════════════════════════════════════════════════════
// CONTRADICTION DETECTION
// ══════════════════════════════════════════════════════════════════
function detectContradiction(text, emotion) {
  const t = text.toLowerCase();
  const nm = P.name || 'friend';

  // "I'm fine" after heavy session
  const recentHeavy = SESSION_EMOTIONS.slice(-5).filter(e =>
    ['sad','anxious','angry','overwhelmed'].includes(e.emotion)
  ).length >= 2;

  const saysOkay = ['fine','okay','ok','alright','good','not bad'].some(w => {
    const re = new RegExp(`\\b${w}\\b`);
    return re.test(t);
  });

  if (saysOkay && recentHeavy && text.length < 30) {
    return rnd([
      `${nm} -- you said you're fine. But the last few things you shared weren't fine. Which is true right now?`,
      `I'm going to gently push back. You were just talking about something heavy, and now you're okay? What happened?`,
      `"Fine" after what you just shared -- I'm not sure I believe that. What's actually going on?`,
    ]);
  }

  // Repeating topic they claim to be over
  const claimsOver = ['moved on','over it','accepted','let it go','it is what it is','done with it'].some(w => t.includes(w));
  const topicCount = (HIST||[]).filter(h => h.role==='u' && h.intent === (P.activeThread?.intent)).length;
  if (claimsOver && topicCount > 3) {
    return rnd([
      `You say you're over it -- but this is the ${topicCount}th time we've talked about it. What does that tell you?`,
      `You said you've accepted it. And yet here we are again. What part of it hasn't actually resolved?`,
      `"It is what it is" is sometimes true. And sometimes it's a thing we say to stop feeling. Which is this?`,
    ]);
  }

  return null;
}

// ══════════════════════════════════════════════════════════════════
// NUANCE LAYERS -- modifier sentences added to responses
// ══════════════════════════════════════════════════════════════════
function getNuanceModifier(intent, text) {
  const h = P.health || {};
  const mods = [];

  // Sleep deprivation modifier
  if (h.avgSleep && h.avgSleep < 5.5 && ['stress','venting','anxiety','selfEsteem'].includes(intent)) {
    mods.push(`(And just so you know -- your sleep has been averaging ${h.avgSleep}/10 lately. Everything is harder when you're not rested.)`);
  }

  // Repeat topic modifier
  const topicCount = (HIST||[]).filter(h => h.role==='u' && h.intent === intent).length;
  if (topicCount >= 4) {
    mods.push(`This is the ${topicCount}th time we've come back to this. I don't say that as criticism -- I say it because it means this really matters to you.`);
  }

  // Time-of-day modifier
  const hour = new Date().getHours();
  if (hour >= 23 || hour < 4) {
    mods.push(`It's late. The things that feel unbearable at 3am almost always look different in daylight. Hold on until morning.`);
  }

  // Recent wins modifier
  const recentDone = (P.goals||[]).filter(g => g.status==='done' && days_since(g.createdAt||0) < 14).length;
  if (recentDone > 0 && ['selfEsteem','motivation','venting'].includes(intent)) {
    mods.push(`For what it's worth -- you completed ${recentDone} goal${recentDone>1?'s':''} recently. That version of you is still you.`);
  }

  return mods.length ? rnd(mods) : null;
}

// ══════════════════════════════════════════════════════════════════
// COMMITMENT TRACKING -- micro-commitments extracted from chat
// ══════════════════════════════════════════════════════════════════
// P.commitments initialised lazily in extractCommitment()

function extractCommitment(text) {
  if(typeof P!=='undefined'&&!P.commitments)P.commitments=[];
  const t = text.toLowerCase();
  const patterns = [
    /i(?:'m going to| will| am going to| plan to| want to| need to)\s+(.{10,80})/i,
    /(?:tomorrow|today|this week|tonight|next week) i(?:'ll| will| am going to)\s+(.{8,60})/i,
    /going to\s+(.{8,60})/i,
  ];

  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) {
      const commitment = m[1].trim().replace(/[.!?]$/, '');
      // Filter out vague commitments
      if (commitment.length > 8 && !['be okay','feel better','try','think about it'].includes(commitment)) {
        const existing = (P.commitments||[]).find(c => c.text.includes(commitment.slice(0,20)));
        if (!existing) {
          // P.commitments initialised lazily in extractCommitment()
          P.commitments.push({
            text: commitment,
            ts: Date.now(),
            checkedIn: false,
            nextCheck: Date.now() + 86400000 * 2,
          });
          if (P.commitments.length > 20) P.commitments.shift();
          saveP();
          return commitment;
        }
      }
    }
  }
  return null;
}

function checkPendingCommitments() {
  if (!P.commitments || !P.commitments.length) return null;
  const now = Date.now();
  const due = P.commitments.find(c => !c.checkedIn && c.nextCheck < now);
  if (!due) return null;
  due.checkedIn = true;
  saveP();
  return rnd([
    `Before we get into it -- you said you were going to "${due.text}". Did you do it?`,
    `I've been thinking about something you said -- you were going to "${due.text}". What happened with that?`,
    `Quick one: "${due.text}" -- that's what you said you'd do. How did it go?`,
  ]);
}

// ══════════════════════════════════════════════════════════════════
// INSIGHT ENGINE -- multi-variable pattern insights
// ══════════════════════════════════════════════════════════════════
function generateDeepInsight() {
  const h = P.health || {};
  const nm = P.name || 'friend';
  const insights = [];

  // Sleep × mood correlation
  if (h.avgSleep && P.moodHist && P.moodHist.length > 10) {
    const lowSleepDays = (P.sleepScores||[]).filter(s => s.v < 5);
    const badMoodAfterLowSleep = lowSleepDays.filter((s, i) => {
      const nextMood = P.moodHist.find(m => m.ts > s.ts && m.ts < s.ts + 86400000);
      return nextMood && ['anxious','sad','angry','overwhelmed'].includes(nextMood.m);
    }).length;
    if (badMoodAfterLowSleep >= 3) {
      insights.push(`${nm}, I've noticed a pattern: the days after your sleep is low, your mood tends to be harder. This isn't a coincidence -- sleep and emotional resilience are directly connected.`);
    }
  }

  // Topic × stress correlation
  const topicCounts = P.topics || {};
  const topTopic = Object.entries(topicCounts).sort((a,b)=>b[1]-a[1])[0];
  if (topTopic && topTopic[1] > 5 && h.avgStress > 6) {
    insights.push(`Something I've noticed: you talk most about ${topTopic[0]}, and your stress levels have been consistently high. I wonder if they're connected. What do you think?`);
  }

  // Day-of-week pattern
  const dayIntents = {};
  (HIST||[]).filter(h=>h.role==='u').forEach(h => {
    const day = new Date(h.ts).getDay();
    if (!dayIntents[day]) dayIntents[day] = {};
    if (h.intent) dayIntents[day][h.intent] = (dayIntents[day][h.intent]||0)+1;
  });
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  Object.entries(dayIntents).forEach(([day, intents]) => {
    const topInt = Object.entries(intents).sort((a,b)=>b[1]-a[1])[0];
    if (topInt && topInt[1] >= 3 && ['stress','venting','anxiety'].includes(topInt[0])) {
      insights.push(`${days[day]}s tend to be harder for you -- your conversations lean toward ${topInt[0]} on that day more than any other. What happens on ${days[day]}s?`);
    }
  });

  // Relationship × emotion
  const relMentions = (P.relationships||[]).sort((a,b)=>b.mentions-a.mentions)[0];
  if (relMentions && relMentions.mentions >= 4) {
    const negEmotions = (relMentions.emotions||[]).filter(e=>['sad','anxious','angry'].includes(e)).length;
    if (negEmotions >= 3) {
      insights.push(`Every time you mention your ${relMentions.type}, the emotional tone of your messages shifts. I don't think you've fully processed what's happening there.`);
    }
  }

  if (!insights.length) return null;
  return rnd(insights);
}

// ══════════════════════════════════════════════════════════════════
// REFRAMING ENGINE -- cognitive distortion detection + precision reframes
// ══════════════════════════════════════════════════════════════════
const COGNITIVE_DISTORTIONS = {
  catastrophizing: {
    signals: ['everything is','nothing will','it will never','always going to','worst thing','ruined everything','nothing will ever','completely failed'],
    reframes: [
      "Let's slow down for a second. You said ''{trigger}'' -- that's a very absolute statement. What's the most realistic outcome here, not the worst one?",
      "''Everything'' and ''nothing'' and ''never'' are words that almost never describe reality accurately. What's actually true right now, right in this moment?",
      "Your brain is running a worst-case scenario. That's what brains do when they're scared. What's the *most likely* outcome -- not the worst one?",
    ]
  },
  blackWhite: {
    signals: ['always','never','everyone','no one','completely','totally','absolutely','nothing works','everything fails','all the time'],
    reframes: [
      "You're thinking in absolutes -- ''always'', ''never'', ''everyone''. Reality is almost always more complicated. What's the grey area here?",
      "What would you say to someone who told you things were ''always'' a certain way? Is there any exception -- even one?",
      "Black-and-white thinking feels true but it usually isn't. Where's the middle ground in what you just described?",
    ]
  },
  personalisation: {
    signals: ["it's my fault","i caused","i ruined","because of me","i made this happen","my fault","i'm responsible for","i did this"],
    reframes: [
      "You're taking on a lot of responsibility here. What role did other people or circumstances play?",
      "If a friend told you this happened because of them, what would you say to them?",
      "You said it's your fault. What specifically are you responsible for -- and what is genuinely outside your control?",
    ]
  },
  mindReading: {
    signals: ['they think','she thinks','he thinks','they hate','they must think','everyone thinks i','they all know','they can tell','they notice'],
    reframes: [
      "You're telling me what other people are thinking. How do you actually know that's true?",
      "What's the evidence that they think this -- not what you fear, but what you actually know?",
      "We can't read minds. What's another possible explanation for what you're observing?",
    ]
  },
  shouldStatements: {
    signals: ["i should","i shouldn't","i must","i have to","i ought to","i need to be","i'm supposed to"],
    reframes: [
      "That word 'should' -- who decided that? Whose rule is that?",
      "What happens when you replace 'I should' with 'I choose to' or 'I don't choose to'? Does it feel different?",
      "The word 'should' often carries someone else's expectations. Is this actually what *you* want, or what you think you're supposed to want?",
    ]
  },
};

function detectCognitiveDistortion(text) {
  const t = text.toLowerCase();
  for (const [type, data] of Object.entries(COGNITIVE_DISTORTIONS)) {
    const trigger = data.signals.find(s => t.includes(s));
    if (trigger) {
      const reframe = rnd(data.reframes).replace('{trigger}', trigger);
      return { type, reframe };
    }
  }
  return null;
}

// ══════════════════════════════════════════════════════════════════
// SEASONAL AWARENESS
// ══════════════════════════════════════════════════════════════════
function getSeasonalContext() {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const day = now.getDate();
  const nm = P.name || 'friend';

  // Christmas/holiday season
  if (month === 11 && day >= 15) {
    return { flag: 'holiday', nudge: `The holiday season can be harder than it looks from the outside. How are you actually doing with all of it?` };
  }
  // New Year
  if (month === 0 && day <= 10) {
    return { flag: 'newyear', nudge: `New year. I know everyone makes a big deal of it. What does this time of year actually feel like for you -- not what it's supposed to feel like?` };
  }
  // Ramadan (approximate -- shifts each year)
  // We can't calculate exact dates without external data, but we can check for mentions
  return null;
}

// ══════════════════════════════════════════════════════════════════
// JAZZ "NOTICED" CARD -- unprompted deep observation
// ══════════════════════════════════════════════════════════════════
function generateJazzNoticedCard() {
  if (!P.totalMsgs || P.totalMsgs < 20) return null;
  const nm = P.name || 'friend';
  const bond = bondScore();
  const topTopic = Object.entries(P.topics||{}).sort((a,b)=>b[1]-a[1])[0];
  const relMentions = (P.relationships||[]).sort((a,b)=>b.mentions-a.mentions)[0];

  const observations = [];

  if (P.N > 65) observations.push(`You feel things very deeply. Most people don't. That's both a gift and a weight -- and I think you know that.`);
  if (P.A > 70) observations.push(`You always ask about other people before you talk about yourself. Every single time. I wonder when you last let someone take care of you.`);
  if (topTopic && topTopic[1] > 8) observations.push(`You talk about ${topTopic[0]} more than anything else. Not because you want to -- I think it's because it's unresolved.`);
  if (relMentions && relMentions.mentions >= 5) observations.push(`The ${relMentions.type} you keep mentioning -- I think there's more there than you've told me.`);
  if ((P.commitments||[]).filter(c=>!c.checkedIn).length > 2) observations.push(`You make commitments to yourself and then don't follow up on them. That's not laziness. That's usually fear dressed up as procrastination.`);
  if (P.depth > 70 && P.E < 40) observations.push(`You think deeply about everything but you keep most of it to yourself. The people around you probably don't know how much is going on in your head.`);
  if ((P.moodHist||[]).slice(-10).filter(m=>m.m==='neutral').length >= 6) observations.push(`You've been reporting neutral a lot. Neutral is sometimes peace. Sometimes it's numbness. I'm curious which it is for you.`);

  if (!observations.length) return null;

  return {
    text: rnd(observations),
    html: `<div class="noticed-card"><div class="noticed-icon">👁️</div><div class="noticed-title">Jazz noticed something</div><div class="noticed-text">${rnd(observations)}</div></div>`
  };
}

// ══════════════════════════════════════════════════════════════════
// MEMORY ANNIVERSARY SYSTEM
// ══════════════════════════════════════════════════════════════════
function checkMemoryAnniversaries() {
  const now = Date.now();
  const oneYear = 31536000000;
  const oneYearAgo = now - oneYear;
  const tolerance = 86400000 * 3; // ±3 days

  const anniversary = (MEMS||[]).find(m =>
    m.importance >= 8 &&
    Math.abs(m.ts - oneYearAgo) < tolerance &&
    !m.anniversarySurfaced
  );

  if (!anniversary) return null;
  anniversary.anniversarySurfaced = true;
  DB.s('MEMS', MEMS);

  const nm = P.name || 'friend';
  return `${nm} -- a year ago today, you told me something that stayed with me: "${anniversary.text.slice(0,120)}..."\n\nA lot has happened since then. How does that feel to look back on?`;
}

// ══════════════════════════════════════════════════════════════════
// RELATIONSHIP ANNIVERSARIES (with Jazz)
// ══════════════════════════════════════════════════════════════════
function checkRelationshipMilestones() {
  const nm = P.name || 'friend';
  const msgs = P.totalMsgs || 0;
  const days = days_since(P.joinDate || Date.now());
  const milestoneKey = 'lastMilestone';
  const last = DB.g(milestoneKey, 0);

  const milestones = [
    { msgs: 10,  days: 0,  msg: `${nm}, you've sent me 10 messages. This is becoming a real thing. I'm glad.` },
    { msgs: 50,  days: 0,  msg: `50 conversations, ${nm}. I know things about you now. Real things. Thank you for trusting me with them.` },
    { msgs: 100, days: 0,  msg: `100 conversations. ${nm}, I want you to sit with that. 100 times you came back. That's not nothing -- that's commitment to yourself.` },
    { msgs: 0,   days: 7,  msg: `One week together, ${nm}. I've been paying attention. I hope you've felt that.` },
    { msgs: 0,   days: 30, msg: `A month, ${nm}. 30 days of showing up. The version of you from a month ago -- do they feel different from who you are today?` },
    { msgs: 0,   days: 90, msg: `Three months, ${nm}. I know you in a way most things don't. That matters to me.` },
    { msgs: 0,   days: 365,msg: `A full year together, ${nm}. 365 days. I've watched you go through things. And you're still here. That says everything.` },
  ];

  for (const m of milestones) {
    const key = `${m.msgs}_${m.days}`;
    if (last === key) continue;
    if ((m.msgs && msgs >= m.msgs && msgs - 1 < m.msgs) ||
        (m.days && days >= m.days && days - 1 < m.days)) {
      DB.s(milestoneKey, key);
      return m.msg;
    }
  }
  return null;
}

// ══════════════════════════════════════════════════════════════════
// 3AM FRIEND MODE -- late night tone shift
// ══════════════════════════════════════════════════════════════════
function get3amModifier(baseResp) {
  const hour = new Date().getHours();
  if (hour < 0 || hour >= 4) return null; // Only midnight-4am
  const nm = P.name || 'friend';
  const suffixes = [
    ` It's late. The things that feel impossible at this hour usually look different in the morning. But I'm here for them right now.`,
    ` Late-night ${nm} is different from daytime ${nm}. I want to hear what's really here.`,
    ` The quiet hours. What you're feeling right now is real. I'm not going anywhere.`,
  ];
  return rnd(suffixes);
}

// ══════════════════════════════════════════════════════════════════
// EMOTIONAL FINGERPRINT -- radar chart data
// ══════════════════════════════════════════════════════════════════
function generateEmotionalFingerprint() {
  if (!P.totalMsgs || P.totalMsgs < 30) return null;

  const moodCounts = (P.moodHist||[]).reduce((a,m)=>({...a,[m.m]:(a[m.m]||0)+1}),{});
  const total = P.moodHist?.length || 1;

  return {
    range: Math.round((Object.keys(moodCounts).length / 12) * 100), // emotional range
    resilience: Math.round(P.resilience || 50),
    depth: Math.round(P.depth || 50),
    openness: Math.round(P.O || 50),
    empathy: Math.round(P.A || 50),
    anxiety: Math.round(Math.min(((moodCounts.anxious||0)/total)*200, 100)),
    joy: Math.round(Math.min(((moodCounts.happy||0)+(moodCounts.excited||0))/total*150, 100)),
    primaryCoping: P.prefTone || 'balanced',
    topEmotion: Object.entries(moodCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'neutral',
  };
}

// ══════════════════════════════════════════════════════════════════
// TIME CAPSULE
// ══════════════════════════════════════════════════════════════════
function saveTimeCapsule(message, months) {
  const capsule = {
    message: message.trim(),
    writtenAt: Date.now(),
    openAt: Date.now() + months * 30 * 86400000,
    months,
    opened: false,
    jazzReflection: null,
  };
  if (!P.timeCapsules) P.timeCapsules = [];
  P.timeCapsules.push(capsule);
  saveP();
  return capsule;
}

function checkTimeCapsules() {
  if (!P.timeCapsules) return null;
  const now = Date.now();
  const due = P.timeCapsules.find(c => !c.opened && c.openAt <= now);
  if (!due) return null;
  due.opened = true;

  // Generate Jazz's reflection based on what's changed
  const nm = P.name || 'friend';
  const monthsAgo = Math.round((now - due.writtenAt) / (30 * 86400000));
  const topTopic = Object.entries(P.topics||{}).sort((a,b)=>b[1]-a[1])[0];

  due.jazzReflection = `${monthsAgo} months ago, you wrote this to yourself. I've been watching over it. In that time, I've seen you talk most about ${topTopic?topTopic[0]:'life'}, and your bond with me has reached ${bondScore()}%. The ${nm} who wrote this message and the ${nm} reading it now -- I think they're different people. In ways you might not have noticed yet.`;
  saveP();
  return due;
}

// ══════════════════════════════════════════════════════════════════
// MOOD MUSIC SUGGESTION
// ══════════════════════════════════════════════════════════════════
const MOOD_MUSIC = {
  anxious:     ["lofi beats study calm", "ambient sleep music no lyrics", "528hz anxiety relief", "piano for anxious minds"],
  sad:         ["sad indie songs for crying", "acoustic songs about heartbreak", "melancholic piano playlist", "songs that understand sadness"],
  angry:       ["release anger playlist", "intense workout music no lyrics", "emotional release songs", "cathartic music playlist"],
  happy:       ["feel good indie playlist", "upbeat songs for good days", "happy vibes playlist 2024", "music for a good mood"],
  tired:       ["gentle morning music", "calm wake up playlist", "peaceful instrumental music", "soft background energy music"],
  lonely:      ["songs about loneliness that feel like a hug", "comforting music for lonely nights", "songs that feel like company"],
  grateful:    ["beautiful instrumental gratitude music", "peaceful morning playlist", "uplifting orchestral music"],
  anxious_night:["sleep music calm", "rain and piano for sleep", "delta waves sleep music", "ambient music for night anxiety"],
  overwhelmed: ["calming music for overthinking", "ambient focus music", "music to slow down to"],
  grieving:    ["music for grief healing", "gentle sad piano", "music for loss and healing"],
  neutral:     ["good background music for thinking", "ambient instrumental playlist", "calm concentration music"],
};

function getMoodMusic(emotion) {
  const hour = new Date().getHours();
  const key = (emotion === 'anxious' && hour >= 22) ? 'anxious_night' : (emotion || 'neutral');
  const pool = MOOD_MUSIC[key] || MOOD_MUSIC.neutral;
  return rnd(pool);
}
