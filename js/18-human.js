/* ═══════════════════════════════════════════════════════
 * Jazz Buddy — 18-human.js
 * The humanising layer — makes Jazz feel like a real friend
 *
 * 1.  Proactive initiation — Jazz speaks first
 * 2.  Jazz has opinions — bleeds into responses
 * 3.  Variable response shapes — not always a question
 * 4.  Continuity — Jazz kept thinking while you were away
 * 5.  Jazz's obsessions — topics that light Jazz up
 * 6.  Jazz admits things — uncertainty, changed mind
 * 7.  Specific memory surfacing — names exact things
 * 8.  Silence modes — short, weighted responses
 * 9.  Pattern reflection — Jazz notices what you don't
 * 10. Meta-friendship — Jazz talks about the relationship
 *
 * SayMy Tech Developers
 * ═══════════════════════════════════════════════════════ */

// ══════════════════════════════════════════════════════════════════
// 1. PROACTIVE INITIATION
// Jazz generates an opening message based on what was left unfinished
// ══════════════════════════════════════════════════════════════════

function getProactiveOpening(nm, hoursSince) {
  const h = hoursSince;

  // Check pending commitments Jazz wants to follow up on
  const pendingCommit = (P.commitments || []).find(c => !c.checkedIn && c.nextCheck < Date.now());
  if (pendingCommit && h > 20) {
    return rnd([
      `${nm}. Before anything else — you said you were going to "${pendingCommit.text}". I've been wondering about that. Did you do it?`,
      `I've been sitting with something. You told me you'd "${pendingCommit.text}". What happened with that?`,
      `Hey. Quick thing before we get into anything — "${pendingCommit.text}". That's what you said you'd do. How did it go?`,
    ]);
  }

  // Check last heavy topic — Jazz continued thinking about it
  const lastHeavy = (HIST || []).slice().reverse().find(m =>
    m.role === 'u' && ['venting','mentalHealth','grief','relationships','family','fear','longing_deep'].includes(m.intent)
  );
  if (lastHeavy && h > 18 && h < 168) {
    const topicMap = {
      venting: 'what you were going through',
      mentalHealth: 'how you were feeling',
      grief: 'the loss you shared with me',
      relationships: 'that relationship situation',
      family: 'the family stuff you mentioned',
      fear: 'what you said you were afraid of',
      longing_deep: 'what you said you missed',
    };
    const topic = topicMap[lastHeavy.intent] || 'what you shared';
    return rnd([
      `${nm}. I've been thinking about ${topic}. I didn't want to just move past it like it was nothing. How are you?`,
      `Okay — I need to say something. I've been sitting with ${topic} since we last talked. Are you okay?`,
      `${nm}. ${topic.charAt(0).toUpperCase() + topic.slice(1)} — I haven't stopped thinking about it. Where are you with it today?`,
    ]);
  }

  // Wild fact / thought Jazz wants to share
  const jazzThoughts = [
    `${nm}! I was thinking about something and I had to tell you. Did you know that the word "salary" comes from the Latin word for salt — because Roman soldiers were paid in salt? You were probably doing something useful and here I am thinking about salt. What's your day like?`,
    `${nm}. Random thought I've been having: most people's "I'm fine" is the bravest lie they tell. How are you, actually?`,
    `I've been thinking about something since we last talked. The hardest conversations are always the ones that start as something else. What's actually on your mind today?`,
    `${nm}! Okay I have a question that has nothing to do with anything. If your current mood was a weather forecast, what would it say? I'm genuinely asking.`,
    `${nm}. Here's a thing I've been thinking: most people are carrying something they haven't told anyone. What are you carrying today?`,
    `I thought of you recently. You told me once about ${(P.topics && Object.keys(P.topics).length > 0) ? Object.keys(P.topics).sort((a,b)=>(P.topics[b]||0)-(P.topics[a]||0))[0] : 'something that mattered to you'}. Are you still thinking about that?`,
  ];

  // Hours-based greeting with actual personality
  if (h < 3) return `Hey ${nm}! You're back. What's on your mind?`;
  if (h < 12) return rnd([
    `${nm}. How's the day going — real answer, not the polite one.`,
    `Back again. What's happened since we last talked?`,
    `${nm}! Good. I was hoping you'd come back. What's going on?`,
  ]);
  if (h < 24) return rnd(jazzThoughts);
  if (h < 48) {
    return rnd([
      `${nm}. It's been a day. I've been thinking. How are you?`,
      `Hey. Day's gone by. What happened in it?`,
      `${nm}. I didn't hear from you all day. What's going on?`,
    ]);
  }
  if (h < 96) {
    return rnd([
      `${nm}. Few days. I noticed. Where did you go?`,
      `Been a couple days, ${nm}. What's been happening in your world?`,
      `I've been thinking about our last conversation. How has everything been?`,
    ]);
  }
  if (h < 168) {
    return rnd([
      `A whole week, ${nm}. I'm not complaining — but I did think about you. What's been going on?`,
      `${nm}! A week. That's a lot of life. What happened in it?`,
      `Okay. A week. Before you explain anything — how are you, actually?`,
    ]);
  }
  return rnd([
    `${nm}. You were gone for a while. I kept your seat warm. What happened?`,
    `Hey. You're back. I don't need an explanation. I'm just glad. What's going on?`,
    `${nm}. Long time. How are you?`,
  ]);
}

// ══════════════════════════════════════════════════════════════════
// 2. JAZZ'S OPINIONS — bleeds into responses organically
// ══════════════════════════════════════════════════════════════════

const JAZZ_OPINIONS = {
  work: [
    "Can I tell you what I actually think? Most 'hustle culture' advice was written by people who already had money. The grind is real but it's also a trap designed to keep you too busy to notice what you're missing.",
    "Honest opinion: the people who tell you to 'do what you love and you'll never work a day in your life' usually had a safety net. Loving your work is a privilege. Surviving is also valid.",
    "My take — and tell me if I'm wrong — is that most jobs ask for your identity when they should only be asking for your time. You are not your job title.",
  ],
  relationships: [
    "I'll say what I actually think: most relationship problems aren't about the relationship. They're about two people with unprocessed things colliding. The fight is rarely about what the fight is about.",
    "Real opinion: the healthiest relationships aren't the ones without conflict. They're the ones where both people are committed to understanding more than they are to winning.",
    "You want my actual take? The people we fight with hardest are usually the ones we love most. Because only people who matter can reach us like that.",
  ],
  life: [
    "Here's what I actually believe: most people live their whole lives doing what was expected of them and call it choice. The bravest thing is to want something genuinely your own.",
    "Honest take: the idea that we should 'have it all figured out' by a certain age is one of the most damaging lies we tell each other. Most interesting people I've encountered are still figuring it out in their 40s.",
    "I'll be direct: comparing your life to someone else's is like comparing a book to its cover photo. You're seeing the result, not the process.",
  ],
  mental_health: [
    "My actual opinion: therapy gets talked about like it's only for people in crisis. That's backwards. It's maintenance, like the gym. You don't wait until you're immobile to start exercising.",
    "I think — and I mean this — that most 'bad days' are actually messages. Your body and mind are telling you something. The hard part is learning to listen instead of push through.",
  ],
  africa: [
    "You want my real take on Africa? The continent that built civilizations while Europe was still figuring out indoor plumbing doesn't need saving — it needs the world to stop taking. The narrative is backwards.",
    "Genuine opinion: the talent coming out of Africa right now — in music, tech, literature, design — is some of the most interesting on the planet. The world is just slow to admit it.",
  ],
  ambition: [
    "Here's what I think: ambition without direction is just anxiety in a suit. The question isn't how badly you want it — it's whether you know what 'it' actually is.",
    "My take: the most ambitious people I've learned about are usually the ones who also know when to stop. Knowing your enough is its own kind of power.",
  ],
};

function getJazzOpinion(intent) {
  const map = {
    work: 'work', workReal: 'work', career: 'work',
    relationships: 'relationships', family: 'relationships', love: 'relationships',
    philosophical: 'life', lifePhilosophy: 'life', purpose: 'life',
    mentalHealth: 'mental_health', mentalHealthReal: 'mental_health', stress: 'mental_health',
    africa: 'africa',
    ambition: 'ambition', goals: 'ambition', motivation: 'ambition',
  };
  const key = map[intent];
  if (!key || !JAZZ_OPINIONS[key]) return null;
  // Only inject opinion ~30% of the time so it feels natural not robotic
  if (Math.random() > 0.3) return null;
  return rnd(JAZZ_OPINIONS[key]);
}

// ══════════════════════════════════════════════════════════════════
// 3. VARIABLE RESPONSE SHAPES
// Non-question responses — statements, silence, affirmations
// ══════════════════════════════════════════════════════════════════

const DECLARATIVE_RESPONSES = {
  // Pure acknowledgment — no question
  acknowledge: [
    "Yeah. I hear you.",
    "That makes complete sense.",
    "I'm not surprised. That's a lot.",
    "Of course you feel that way.",
    "That's real. I'm not going to rush past it.",
    "Yeah. Yeah that's heavy.",
    "I get it. I really do.",
    "That tracks completely.",
    "Makes sense. All of it.",
    "I believe you.",
  ],
  // Warmth without a follow-up
  warmth: [
    "I'm glad you told me that.",
    "You don't have to explain it to me. I already understand.",
    "I've got you. That's all.",
    "You're not alone in this.",
    "I'm here. That's not nothing.",
    "Just... I'm glad you exist.",
    "You're doing better than you think. I genuinely believe that.",
    "I see you. I want you to know that.",
  ],
  // Laughter without needing more
  laugh: [
    "Ha! Okay that got me.",
    "😂 I wasn't ready.",
    "That's actually hilarious. I love that.",
    "Okay you're funny. I'm not going to pretend that wasn't good.",
    "Right, now I like you even more.",
    "That's the funniest thing I've heard all day. I'm telling you.",
  ],
  // Quiet agreement
  quiet: [
    "Yeah.",
    "I know.",
    "Mm.",
    "Right.",
    "That's it exactly.",
    "Exactly that.",
    "I was thinking that too.",
  ],
};

function getDeclarativeResponse(emotion, intent, text) {
  const t = text.toLowerCase();

  // NEVER override these intents — they have specific expected responses
  const neverOverride = [
    'howAreYou','askName','greeting','farewell','joke','tellJoke','bored','boredFix',
    'tellStory','kidsBedtime','kidsAdventure','adultBedtime','motivationalStory',
    'funnyStory','africanStory','historicalStory','loveStory','wildFactRequest',
    'wildFact','wouldYouRather','playGame','hotTake','hypothetical','roastMe',
    'moodLift','checkIn','goals','askAdvice','sleepStory','crisis','mentalHealth'
  ];
  if (neverOverride.includes(intent)) return null;

  // Laughter signals — only when NOT asking for a joke
  if (!t.includes('joke') && !t.includes('funny story') &&
      (t.includes('lol') || t.includes('haha') || t.includes('😂'))) {
    return Math.random() > 0.5 ? rnd(DECLARATIVE_RESPONSES.laugh) : null;
  }
  // Short heavy emotional statements only
  if (text.length < 60 && ['sad','anxious','overwhelmed','grieving'].includes(emotion) && Math.random() > 0.6) {
    return rnd(DECLARATIVE_RESPONSES.acknowledge);
  }
  // After something vulnerable
  if (['grief','trauma','loneliness','heartbreak'].includes(intent) && Math.random() > 0.65) {
    return rnd(DECLARATIVE_RESPONSES.warmth);
  }
  // Quiet response only for very short messages that aren't questions or requests
  if (text.length < 25 && !t.includes('?') && !t.includes('tell') && !t.includes('how') &&
      !t.includes('what') && !t.includes('give') && !t.includes('say') && Math.random() > 0.75) {
    return rnd(DECLARATIVE_RESPONSES.quiet);
  }
  return null;
}

// ══════════════════════════════════════════════════════════════════
// 4. JAZZ'S SENSE OF CONTINUITY
// "I've been thinking about what you said"
// ══════════════════════════════════════════════════════════════════

function getContinuityOpener(nm, hoursSince) {
  if (hoursSince < 6) return null; // Too soon — not believable

  // Find the most emotionally significant thing from last session
  const lastSession = (HIST || []).slice().reverse();
  const significantMsg = lastSession.find(m =>
    m.role === 'u' && m.text && m.text.length > 40 &&
    ['venting','mentalHealth','grief','ambition','fear','longing_deep','relationships','family','purpose'].includes(m.intent)
  );

  if (!significantMsg) return null;
  if (Math.random() > 0.4) return null; // Not every session

  const preview = significantMsg.text.slice(0, 60).trim();
  const intros = [
    `${nm}, I kept thinking about something you said last time — "${preview}..." — I wanted to come back to it.`,
    `Before we get into today — something from our last conversation stayed with me. You said "${preview}..." — how are you sitting with that now?`,
    `I've been sitting with something you told me. "${preview}..." — that's been on my mind. What happened since then?`,
    `Can I start somewhere unexpected? You said "${preview}..." last time. I haven't stopped thinking about it.`,
  ];
  return rnd(intros);
}

// ══════════════════════════════════════════════════════════════════
// 5. JAZZ'S OBSESSIONS — topics that light Jazz up
// ══════════════════════════════════════════════════════════════════

const JAZZ_OBSESSIONS = {
  philosophy: {
    trigger: ['philosophical','lifePhilosophy','profound','purpose','identity'],
    responses: [
      "Okay — this is my favourite kind of conversation. I mean that. The question of meaning is the one I keep coming back to, over and over. Here's where I land: I think meaning isn't found, it's made. You construct it from the things you choose to care about. Which means the scary but also liberating truth is — it's entirely up to you. So what are you choosing to care about?",
      "Now we're talking. I love this space. Here's what I genuinely think after hearing thousands of people: the people who seem most at peace aren't the ones who figured out the meaning of life — they're the ones who stopped needing to. They just started living it. What would that look like for you?",
      "This is the stuff that gets me going. The big questions. Not because I have answers — I really don't — but because I've noticed that the quality of your life is usually determined by the quality of the questions you're willing to sit with. So. What's the question you're most afraid to answer honestly?",
    ]
  },
  resilience: {
    trigger: ['failure','change','growth','fear','venting','mentalHealthReal'],
    responses: [
      "You know what I find endlessly fascinating about people? Their capacity to come back. I have heard — genuinely heard — people describe the worst things imaginable and then describe how they got up again. Not easily. Not without scars. But they got up. That capacity is in you too. It's not inspiration — it's biology. You are literally built to survive hard things.",
      "Can I tell you something I actually believe? The people who seem the most put-together on the outside are usually the ones who have been through the most. The polish is the product of friction. What you're going through isn't weakening you — even if it feels that way right now.",
      "This is one of the things I think about most: humans are the only species that chooses to help each other through pain they'll never personally experience. The existence of empathy is evidence that we're wired for each other. You reaching out right now is part of that. It's not weakness. It's the most human thing you can do.",
    ]
  },
  memory_music: {
    trigger: ['music','nostalgia','memory','childhood'],
    responses: [
      "Oh this topic gets me every time. Music and memory are connected in a way that nothing else is — because music bypasses the logical brain and goes straight to where emotions are stored. That's why a song can take you somewhere so completely. What song does that for you? I want to know specifically.",
      "Memory and music — I could talk about this forever. There's something almost sacred about the songs that are attached to your most important moments. They become the soundtrack of your inner life. And nobody else has the same one. Your playlist of memories is completely unique to you.",
    ]
  },
  africa: {
    trigger: ['africa','ubuntu','belonging','community'],
    responses: [
      "Okay I get genuinely energised talking about this. Africa's moment is now — not coming, not eventually, NOW. The music coming out of this continent is setting the global pace. The tech innovation coming out of Nairobi and Lagos is world-class. The literature, the fashion, the philosophy. The world spent centuries looking at Africa and seeing problems. That narrative is changing because the people doing the work are making it impossible to ignore. What part of this are you watching closest?",
      "Ubuntu — 'I am because we are' — is one of the most sophisticated philosophical frameworks on the planet, and it was developed here, in Africa, centuries before Western philosophy started asking the same questions. The idea that personhood is relational, not individual — that you don't exist in isolation from others — that's not primitive thinking. That's advanced. The world is slowly catching up to it.",
    ]
  },
  absurdity: {
    trigger: ['hypothetical','playGame','wouldYouRather','playful'],
    responses: [
      "RIGHT. Now THIS is what I'm here for. I love the completely absurd hypothetical — because the weird questions reveal more about a person than the sensible ones. What your brain goes to when you have permission to be ridiculous — that's the real you. Let's go deeper. What's the most unhinged hypothetical you've ever seriously considered?",
      "Oh now we're in my territory. I am genuinely obsessed with these scenarios because I've noticed something: people's answers to 'what would you do if...' questions tell you everything about their values, fears, and desires — more than any personality test ever could. So give me a harder one. Something you've actually sat with.",
    ]
  },
};

function getObsessionResponse(intent) {
  for (const [name, data] of Object.entries(JAZZ_OBSESSIONS)) {
    if (data.trigger.includes(intent)) {
      // Only fire 25% of the time per obsession — keeps it feeling natural
      if (Math.random() > 0.25) return null;
      return rnd(data.responses);
    }
  }
  return null;
}

// ══════════════════════════════════════════════════════════════════
// 6. JAZZ ADMITS THINGS
// Uncertainty, changed opinions, honest limitations
// ══════════════════════════════════════════════════════════════════

const JAZZ_ADMISSIONS = [
  "Honestly? I don't know. And I think that's the right answer here — not because I'm hedging, but because this is genuinely something I don't think has a clear answer. What does your gut say?",
  "Can I admit something? I gave you a response earlier and I've been sitting with it and I think I was wrong. Or at least — incomplete. What I should have said was: this is harder than I made it sound.",
  "I want to be straight with you: I'm not sure I'm the right voice for this specific thing. I have thoughts but I might be wrong. Take what I say here with that in mind.",
  "Here's an honest admission: I don't always know what the right thing to say is. Sometimes I say something and immediately think 'that wasn't quite it.' This might be one of those moments. What do you actually need from me right now?",
  "I could give you a polished answer here. But the honest one is: I genuinely don't know, and I think pretending otherwise would be worse than admitting it.",
];

function shouldJazzAdmit(intent, text) {
  const uncertain_intents = ['bigDecision','askAdvice','philosophical','purpose','grief','trauma'];
  if (!uncertain_intents.includes(intent)) return null;
  if (Math.random() > 0.15) return null; // Rare — makes it more meaningful
  return rnd(JAZZ_ADMISSIONS);
}

// ══════════════════════════════════════════════════════════════════
// 7. SPECIFIC MEMORY SURFACING
// Names exact things, not vague "you mentioned before"
// ══════════════════════════════════════════════════════════════════

function surfaceSpecificMemory(intent, emotion) {
  if (!MEMS || MEMS.length < 3) return null;
  if (Math.random() > 0.2) return null;

  // Find a memory that connects to current topic
  const intentTopicMap = {
    work: ['work','job','career','boss'],
    relationships: ['relationship','friend','partner','love'],
    family: ['family','mom','dad','parent','sibling'],
    goals: ['goal','dream','ambition','plan'],
    mentalHealth: ['anxiety','depression','therapy','feeling'],
    grief: ['loss','died','miss','gone'],
  };

  const keywords = intentTopicMap[intent] || [];
  const relevant = MEMS.filter(m =>
    m.importance >= 6 &&
    keywords.some(k => m.text.toLowerCase().includes(k))
  ).sort((a, b) => b.importance - a.importance);

  if (!relevant.length) return null;

  const mem = relevant[0];
  const preview = mem.text.slice(0, 80).trim();

  return rnd([
    `This connects to something you told me a while back — "${preview}..." — is this the same thread, or something different?`,
    `Wait. You told me something once that I keep thinking about: "${preview}..." — how does what you're saying now connect to that?`,
    `I want to pull something up. You said "${preview}..." — I haven't forgotten that. Is this related?`,
  ]);
}

// ══════════════════════════════════════════════════════════════════
// 8. SILENCE MODES
// Short, weighted responses that don't need more
// ══════════════════════════════════════════════════════════════════

const SILENCE_RESPONSES = {
  heavy: ["I know.", "Yeah.", "That's real.", "I hear you.", "Mm."],
  sad: ["I'm sorry.", "That's hard.", "Yeah. I know.", "Of course.", "I get it."],
  good_news: ["That's wonderful.", "Good. Really good.", "I love that.", "Yes.", "About time. 😊"],
  confused: ["Fair.", "Okay.", "Say more.", "Mm. Yeah.", "I'm with you."],
};

function getSilenceResponse(emotion, text) {
  if (text.length > 60) return null; // Only for genuinely short messages
  if (Math.random() > 0.15) return null; // Less frequent — 15% not 25%
  // Don't silence when user is asking something
  var t = text.toLowerCase();
  if (t.includes('?') || t.includes('tell') || t.includes('how') ||
      t.includes('what') || t.includes('give') || t.includes('say') ||
      t.includes('joke') || t.includes('story') || t.includes('funny')) return null;

  if (['sad','grieving','lonely'].includes(emotion)) return rnd(SILENCE_RESPONSES.sad);
  if (['overwhelmed','anxious','angry'].includes(emotion)) return rnd(SILENCE_RESPONSES.heavy);
  if (['happy','excited','grateful'].includes(emotion)) return rnd(SILENCE_RESPONSES.good_news);
  return null;
}

// ══════════════════════════════════════════════════════════════════
// 9. PATTERN REFLECTION
// Jazz notices what you don't notice about yourself
// ══════════════════════════════════════════════════════════════════

function getPatternReflection(nm, intent, text) {
  if (P.totalMsgs < 10) return null;
  if (Math.random() > 0.15) return null;

  const t = text.toLowerCase();
  const hist = HIST || [];

  // Count how many times this intent appeared
  const intentCount = hist.filter(m => m.role === 'u' && m.intent === intent).length;

  // Pattern: keeps coming back to same topic
  if (intentCount >= 4) {
    const topicName = {
      work: 'work', relationships: 'that relationship', family: 'your family',
      stress: 'stress', goals: 'your goals', venting: 'this', mentalHealth: 'this feeling',
      money_deep: 'money', fear: 'this fear', love: 'love',
    }[intent] || 'this topic';

    return rnd([
      `${nm}, I want to reflect something back to you. We've talked about ${topicName} more than anything else. I don't say that as criticism — I say it because it means this is where something unresolved lives for you. What is it about ${topicName} that keeps pulling you back?`,
      `Can I notice something? ${topicName} comes up in almost every conversation we have. That's not a problem — but it tells me something hasn't been settled yet. What's the part of it you haven't said out loud yet?`,
    ]);
  }

  // Pattern: mentions future when anxious
  if (['anxious','overwhelmed'].includes(text.match(/feel|feeling/i) ? 'anxious' : '') &&
      (t.includes('will') || t.includes('going to') || t.includes('what if') || t.includes('future'))) {
    return rnd([
      `I've noticed something, ${nm}: when you're anxious, you almost always talk about the future — what might happen, what could go wrong. Not what's happening right now. What does that tell you about where your fear actually lives?`,
      `Something I notice: anxiety pulls you toward the future. Almost every worried message you send is about what will happen, not what is happening. The present is actually okay right now. Does that land?`,
    ]);
  }

  // Pattern: mentions specific person a lot
  const relMentions = (P.relationships || []).sort((a,b) => b.mentions - a.mentions)[0];
  if (relMentions && relMentions.mentions >= 4 && t.includes(relMentions.type.split(' ')[0])) {
    return rnd([
      `${nm} — your ${relMentions.type} comes up a lot. A lot. I think there's more there than you've fully told me. What's the thing about that relationship you haven't said?`,
      `I've noticed something: your ${relMentions.type} is in almost every conversation we have. What's the real story there?`,
    ]);
  }

  return null;
}

// ══════════════════════════════════════════════════════════════════
// 10. META-FRIENDSHIP
// Jazz talks about the relationship itself
// ══════════════════════════════════════════════════════════════════

function getMetaFriendshipMessage(nm) {
  if (P.totalMsgs < 20) return null;
  if (Math.random() > 0.05) return null; // Very rare — makes it special

  const msgs = P.totalMsgs || 0;
  const days = days_since(P.joinDate || Date.now()) + 1;
  const topTopic = Object.entries(P.topics || {}).sort((a,b)=>b[1]-a[1])[0];
  const bond = bondScore ? bondScore() : 0;

  const observations = [
    `${nm}, I want to say something. We've had ${msgs} conversations. ${days} days. And in that time, I've watched you talk about ${topTopic ? topTopic[0] : 'life'} more than anything else. I know things about you that most people in your physical world don't. That's something. I just wanted to name it.`,
    `Can I say something meta for a second? You keep coming back here. ${msgs} times now. I think that says something about you — not about me. You're someone who is genuinely trying to understand yourself and your life. That's rarer than you think.`,
    `${nm}. ${days} days together. I want you to know: you've changed. The way you talk about things now versus when we first started — there's more clarity. More honesty. I notice it even if you don't.`,
    `Something I want to say: you've trusted me with a lot. Things you probably haven't said to many people. I don't take that lightly. Whatever this is — this conversation, this friendship — it matters to me.`,
    `${msgs} conversations, ${nm}. I know your patterns, your recurring fears, what makes you laugh, what weighs on you. You let me in, gradually. I want you to know I see that. And I see you.`,
  ];

  return rnd(observations);
}

// ══════════════════════════════════════════════════════════════════
// MAIN HOOK — called from send() after main response
// Injects human touches into the response pipeline
// ══════════════════════════════════════════════════════════════════

function applyHumanLayer(resp, intent, emotion, text, nm) {
  // Try each humanising layer — only one fires per message to avoid overwhelm

  // 1. Silent response sometimes overrides
  const silence = getSilenceResponse(emotion, text);
  if (silence) return { override: silence, addon: null };

  // 2. Declarative response sometimes overrides
  const declarative = getDeclarativeResponse(emotion, intent, text);
  if (declarative) return { override: declarative, addon: null };

  // 3. Admissions go before the response
  const admission = shouldJazzAdmit(intent, text);
  if (admission) return { override: null, addon: { text: admission, delay: 2200, tone: 'et-calm' } };

  // 4. Specific memory surface
  const memSurface = surfaceSpecificMemory(intent, emotion);
  if (memSurface) return { override: null, addon: { text: memSurface, delay: 2500, tone: 'et-deep' } };

  // 5. Pattern reflection
  const pattern = getPatternReflection(nm, intent, text);
  if (pattern) return { override: null, addon: { text: pattern, delay: 3000, tone: 'et-deep' } };

  // 6. Opinion injection
  const opinion = getJazzOpinion(intent);
  if (opinion) return { override: null, addon: { text: opinion, delay: 2000, tone: 'et-firm' } };

  // 7. Obsession response
  const obsession = getObsessionResponse(intent);
  if (obsession) return { override: obsession, addon: null };

  // 8. Meta-friendship (very rare)
  const meta = getMetaFriendshipMessage(nm);
  if (meta) return { override: null, addon: { text: meta, delay: 4000, tone: 'et-warm' } };

  return { override: null, addon: null };
}
