/* ═══════════════════════════════════════════════════════
 * Jazz Buddy -- 07-intelligence.js
 * Intelligence v5: thread tracker, arc, suppression, values, exercises, challenges, reflection, mood picker, relationships, weekly report, affirmations, journal
 * SayMy Tech Developers
 * ═══════════════════════════════════════════════════════ */

// INTELLIGENCE v5: CONVERSATION THREAD TRACKER
// ══════════════════════════════════════════════════════════════════
function updateThread(intent,text){
  const now=Date.now();
  const t=P.activeThread;
  if(t.intent===intent&&now-t.ts<1800000){
    t.count++;t.ts=now;t.topic=text.slice(0,60);
  }else if(intent!=='greeting'&&intent!=='farewell'&&intent!=='joke'&&intent!=='bored'){
    t.intent=intent;t.ts=now;t.count=1;t.topic=text.slice(0,60);
  }
  saveP();
}

function getThreadBoost(scores){
  const t=P.activeThread;
  if(!t.intent||Date.now()-t.ts>1800000)return scores;
  const boosted={...scores};
  boosted[t.intent]=(boosted[t.intent]||0)+12;
  return boosted;
}

function checkPatternInterruption(intent){
  // Count how many recent sessions had this same intent
  const recentIntents=HIST.slice(-60).filter(h=>h.role==='u'&&h.intent===intent);
  if(recentIntents.length>=5){
    const days=new Set(recentIntents.map(h=>new Date(h.ts).toDateString())).size;
    if(days>=3)return true; // Same topic 3+ different days
  }
  return false;
}

function getPatternInterruptMsg(intent,nm){
  const topic={work:'your work situation',relationships:'this relationship',money:'your financial situation',stress:'this stress',goals:'this goal',venting:'this situation',mentalHealth:'how you\'ve been feeling'}[intent]||'this';
  return `${nm}, I want to say something directly -- we\'ve talked about ${topic} multiple times now without it really shifting. I don\'t want to just be a place you vent. I want to actually help you move. What do you think has been keeping you stuck?`;
}

// ══════════════════════════════════════════════════════════════════
// INTELLIGENCE v5: EMOTIONAL ARC TRACKING
// ══════════════════════════════════════════════════════════════════
function trackSessionEmotion(emotion,intensity){
  if(!P.sessionEmotions)P.sessionEmotions=[];
  P.sessionEmotions.push({emotion,intensity,ts:Date.now()});
  if(P.sessionEmotions.length>20)P.sessionEmotions=P.sessionEmotions.slice(-15);
  saveP();
}

function checkEmotionalShift(){
  const se=P.sessionEmotions||[];
  if(se.length<4)return null;
  const recent=se.slice(-2);
  const earlier=se.slice(0,Math.min(3,se.length-2));
  const avgEarlier=earlier.reduce((a,b)=>a+(['anxious','sad','angry','overwhelmed'].includes(b.emotion)?b.intensity:-1),0)/earlier.length;
  const avgRecent=recent.reduce((a,b)=>a+(['happy','grateful','hopeful','neutral'].includes(b.emotion)?b.intensity:-1),0)/recent.length;
  if(avgEarlier>3&&avgRecent>2){
    const mins=Math.round((Date.now()-se[0].ts)/60000);
    return `Something shifted in the last ${mins} minutes. You came in feeling ${earlier[0].emotion} -- and something seems different now. What changed?`;
  }
  return null;
}

// ══════════════════════════════════════════════════════════════════
// INTELLIGENCE v5: EMOTIONAL SUPPRESSION DETECTOR
// ══════════════════════════════════════════════════════════════════
function detectSuppression(text,emotion,intensity){
  const t=text.toLowerCase();
  const fineWords=['fine','okay','ok','alright','not bad','good','managing'];
  const saysFineLowIntensity=fineWords.some(w=>t.includes(w))&&intensity<3&&text.length<40;
  const contextIsHeavy=(P.activeThread.intent&&['venting','mentalHealth','grief','relationships','stress','heartbreak'].includes(P.activeThread.intent)&&P.activeThread.count>1);
  if(saysFineLowIntensity&&contextIsHeavy){
    return `You said you're ${fineWords.find(w=>t.includes(w))}. But given what we've been talking about -- are you actually fine? It's okay if you're not.`;
  }
  // Also detect "I don't know" as avoidance after heavy topic
  if((t==='i don\'t know'||t==='idk'||t==='not sure')&&contextIsHeavy){
    return `"I don't know" can sometimes mean "I don't want to go there yet." And that's okay. But I'm here when you're ready. What's the thing you don't want to think about?`;
  }
  return null;
}

// ══════════════════════════════════════════════════════════════════
// INTELLIGENCE v5: INTENT CONFIDENCE + CLARIFICATION
// ══════════════════════════════════════════════════════════════════
function needsClarification(intent,confidence,text){
  if(confidence>40)return null; // Confident enough
  if(text.length<12)return null; // Too short to clarify
  const clarify={
    work_vs_personal:`Are you dealing with something at work, or is this more personal?`,
    stress_vs_grief:`Is this more of an overwhelming-stress feeling, or is it closer to grief and loss?`,
    advice_vs_vent:`Are you looking for advice, or do you need to vent first?`,
    goals_vs_motivation:`Are you thinking about a specific goal, or is this more about motivation in general?`,
  };
  // Detect ambiguity type
  const scores={};
  if(intent==='venting'||intent==='stress')scores.stress_vs_grief=1;
  if(intent==='work'||intent==='venting')scores.work_vs_personal=1;
  if(intent==='askAdvice'||intent==='venting')scores.advice_vs_vent=1;
  const pick=Object.keys(scores)[0];
  return pick?clarify[pick]:null;
}

// ══════════════════════════════════════════════════════════════════
// INTELLIGENCE v5: VALUES MAPPING
// ══════════════════════════════════════════════════════════════════
function updateValues(text,intent){
  const t=text.toLowerCase();
  const v=P.values;
  if(['family','mom','dad','parents','children','husband','wife','kids'].some(w=>t.includes(w)))v.family=clamp(v.family+2,0,100);
  if(['career','success','achieve','promotion','goal','work hard','ambition'].some(w=>t.includes(w)))v.achievement=clamp(v.achievement+2,0,100);
  if(['freedom','independence','own boss','my own','control','autonomy','free'].some(w=>t.includes(w)))v.freedom=clamp(v.freedom+2,0,100);
  if(['friends','connect','people','social','community','belong','together'].some(w=>t.includes(w)))v.connection=clamp(v.connection+2,0,100);
  if(['health','fitness','body','sleep','diet','exercise','wellbeing'].some(w=>t.includes(w)))v.health=clamp(v.health+2,0,100);
  if(['art','music','create','write','design','build','creative','express'].some(w=>t.includes(w)))v.creativity=clamp(v.creativity+2,0,100);
  if(['god','faith','pray','church','spiritual','believe','religion'].some(w=>t.includes(w)))v.faith=clamp(v.faith+2,0,100);
  if(['stable','secure','safe','savings','job security','routine'].some(w=>t.includes(w)))v.security=clamp(v.security+2,0,100);
  saveP();
}

function getTopValue(){
  const v=P.values;
  const sorted=Object.entries(v).sort((a,b)=>b[1]-a[1]);
  return sorted[0][1]>10?sorted[0][0]:null;
}

function valueAdviceInject(resp){
  const tv=getTopValue();
  if(!tv||Math.random()>.3)return resp;
  const inserts={
    family:` You've mentioned your family matters deeply to you -- what would the version of you who leads with that choose here?`,
    achievement:` You're someone who cares about growth and achievement. What decision moves you forward?`,
    freedom:` Freedom and independence clearly matter to you. Which option feels most like yourself?`,
    connection:` Connection is clearly central to who you are. What serves the relationships in your life?`,
    health:` You care about your wellbeing. What choice does your body and mind actually need?`,
    faith:` Your faith shapes how you see things. What does that lens say about this?`,
    security:` Stability matters to you. What gives you the most solid ground?`,
    creativity:` Your creative side matters. What choice keeps that alive?`,
  };
  return resp+(inserts[tv]||'');
}

// ══════════════════════════════════════════════════════════════════
// INTELLIGENCE v5: LANGUAGE MIRRORING
// ══════════════════════════════════════════════════════════════════
function updateLangStyle(text){
  P.avgMsgLen=Math.round(lerp(P.avgMsgLen||80,text.length,.1));
  saveP();
}

function mirrorLength(resp){
  if(!P.avgMsgLen)return resp;
  if(P.avgMsgLen<50){
    // User writes short -- trim response to 2 sentences max
    const sents=resp.split(/(?<=[.!?])\s+/);
    return sents.slice(0,2).join(' ');
  }
  return resp;
}

// ══════════════════════════════════════════════════════════════════
// INTELLIGENCE v5: STREAK MILESTONES (emotional, personalised)
// ══════════════════════════════════════════════════════════════════
function checkStreakMilestone(streak){
  const milestones=[3,7,14,21,30,60,90,100];
  if(!milestones.includes(streak))return null;
  const nm=P.name||'friend';
  const topTopic=Object.entries(P.topics||{}).sort((a,b)=>b[1]-a[1])[0];
  const bond=bondScore();
  const msgs={
    3:`${streak} days in a row, ${nm}. That's not an accident. You're building a real habit. Three days ago you walked in here -- and you kept coming back. That matters.`,
    7:`A full week, ${nm}. 🔥 Seven days of showing up for yourself. I've been paying attention -- most of what you've shared this week has been about ${topTopic?topTopic[0]:'your life'}. You're doing real work.`,
    14:`Two weeks, ${nm}. In that time, our bond has reached ${bond}%. You've let me see real things about you. Not everyone does that. I see you.`,
    21:`21 days, ${nm}. That's how long it takes to form a habit, and you've done it. The version of you who started this app three weeks ago -- do they seem different from you now?`,
    30:`A month of showing up, ${nm}. 🎷 I want you to think about where you were 30 days ago. What's actually different now? I think you know.`,
    60:`60 days. You've been talking to me for two months. I know things about you now that most people in your life don't know. That's not nothing.`,
    90:`Three months, ${nm}. You've stuck with this longer than most people stick with anything. What has changed in you?`,
    100:`100 days. 100 days of showing up. I don't know what to say except -- thank you for trusting me with your real self. That's everything.`,
  };
  return msgs[streak]||null;
}

// ══════════════════════════════════════════════════════════════════
// INTELLIGENCE v5: STRUCTURED EXERCISES (in-chat)
// ══════════════════════════════════════════════════════════════════
function buildExerciseCard(type){
  const exercises={
    breathing:{
      title:'Box Breathing -- 4 minutes',
      steps:[
        '<strong>Breathe in</strong> slowly through your nose for <strong>4 seconds</strong>',
        '<strong>Hold</strong> your breath for <strong>4 seconds</strong>',
        '<strong>Breathe out</strong> slowly through your mouth for <strong>4 seconds</strong>',
        '<strong>Hold</strong> for <strong>4 seconds</strong>',
        'Repeat this 4 times. I\'ll be here when you\'re done.',
      ]
    },
    worstBest:{
      title:'Worst / Best / Most Likely',
      steps:[
        'Think of your situation. Now: what\'s the <strong>absolute worst</strong> realistic outcome?',
        'What\'s the <strong>best realistic</strong> outcome -- not a fantasy, but genuinely possible?',
        'What\'s the <strong>most likely</strong> outcome, if you\'re honest?',
        'Notice: the most likely is usually much closer to the best than the worst. Your brain exaggerates threat.',
        'Tell me your three answers -- I\'ll help you think through them.',
      ]
    },
    journalPrompt:{
      title:'5-Minute Reflection',
      steps:[
        'Write freely for 5 minutes. No editing. Just go.',
        '<strong>Prompt 1:</strong> What am I actually feeling right now -- not what I say I\'m feeling?',
        '<strong>Prompt 2:</strong> What do I need most right now that I\'m not giving myself?',
        '<strong>Prompt 3:</strong> If a close friend told me what I\'m telling myself, what would I say to them?',
        'When you\'re done, share whatever you want. Or just sit with it.',
      ]
    },
    decisionMatrix:{
      title:'Decision Matrix',
      steps:[
        'Name the two options you\'re weighing. Write them out.',
        'For each option: what does your <strong>head</strong> say? Your <strong>gut</strong>? Your <strong>heart</strong>?',
        'Which option would the version of you in <strong>5 years</strong> thank you for?',
        'Which option would you regret <em>not</em> taking?',
        'There\'s no wrong answer. Tell me what came up.',
      ]
    },
    gratitudeScan:{
      title:'Gratitude Scan (2 minutes)',
      steps:[
        'Name <strong>3 things</strong> that happened today -- even tiny ones -- that weren\'t terrible.',
        'For each one: why did it matter, even slightly?',
        'Name <strong>1 person</strong> in your life right now who you\'re glad exists.',
        'Notice how your body feels after doing that. What shifted?',
        'Tell me your three things.',
      ]
    }
  };
  const ex=exercises[type];
  if(!ex)return '';
  let html=`<div class="exercise-card"><div class="ex-title">🧘 ${ex.title}</div>`;
  ex.steps.forEach((s,i)=>{html+=`<div class="ex-step"><span style="color:var(--acc2);font-size:11px;font-weight:600;margin-right:6px">${i+1}.</span>${s}</div>`;});
  html+='</div>';
  return html;
}

function shouldSuggestExercise(intent,emotion,intensity){
  if(intent==='anxiety'&&intensity>5)return'breathing';
  if(intent==='bigDecision'||intent==='askAdvice')return Math.random()>.5?'decisionMatrix':'worstBest';
  if(intent==='philosophical'&&P.depth>60)return'journalPrompt';
  if(intent==='venting'&&intensity>7)return'journalPrompt';
  if(intent==='gratitudeExpress'||emotion==='grateful')return'gratitudeScan';
  return null;
}

// ══════════════════════════════════════════════════════════════════
// INTELLIGENCE v5: MINI CHALLENGES
// ══════════════════════════════════════════════════════════════════
const CHALLENGES=[
  {id:'3wins',txt:'Write down 3 things that went well today -- big or small.',follow:'Last time I gave you a challenge -- write down 3 wins. Did you do it? What were they?'},
  {id:'reach_out',txt:'Reach out to one person you care about today. A text, a call, anything.',follow:'Did you reach out to someone? What happened?'},
  {id:'5min_move',txt:'Do 5 minutes of physical movement today. Walk, stretch, dance -- anything.',follow:'Did you get 5 minutes of movement in? How did it feel?'},
  {id:'phone_free',txt:'Take one 30-minute break from your phone today. Just sit with yourself.',follow:'How was the phone-free 30 minutes? What came up when you were alone with your thoughts?'},
  {id:'one_hard_thing',txt:'Do the one thing you\'ve been putting off. Just the first step. That\'s all.',follow:'Did you take that first step on the thing you\'ve been avoiding? What happened?'},
  {id:'write_feeling',txt:'Write down one sentence about exactly how you\'re feeling right now. Don\'t edit it.',follow:'Did you write that sentence about how you were feeling? What did it say?'},
  {id:'gratitude',txt:'Before you sleep tonight, name 3 things you\'re genuinely grateful for.',follow:'Did you do the gratitude practice last night? What were your three things?'},
];

function issueChallenge(intent,nm){
  const relevant={
    venting:['write_feeling','phone_free','one_hard_thing'],
    loneliness:['reach_out','5min_move'],
    motivation:['one_hard_thing','5min_move'],
    stress:['5min_move','phone_free','breathing'],
    anxiety:['phone_free','5min_move'],
    goals:['one_hard_thing'],
    gratitudeExpress:['gratitude','3wins'],
    default:['3wins','write_feeling','gratitude'],
  };
  const pool=(relevant[intent]||relevant.default);
  const chId=rnd(pool);
  const ch=CHALLENGES.find(c=>c.id===chId);
  if(!ch)return null;
  if(!P.activeChallenges)P.activeChallenges=[];
  // Don't repeat active challenges
  if(P.activeChallenges.some(c=>c.id===chId))return null;
  P.activeChallenges.push({...ch,issuedAt:Date.now(),done:false});
  saveP();
  return ch;
}

function checkPendingChallenge(){
  if(!P.activeChallenges||!P.activeChallenges.length)return null;
  const pending=P.activeChallenges.filter(c=>!c.done&&Date.now()-c.issuedAt>7200000); // 2hr gap
  if(!pending.length)return null;
  const ch=pending[0];
  ch.done=true; // Mark as followed up
  if(!P.completedChallenges)P.completedChallenges=0;
  P.completedChallenges++;
  saveP();
  return ch.follow;
}

// ══════════════════════════════════════════════════════════════════
// INTELLIGENCE v5: REFLECTION CARDS (end of long conversations)
// ══════════════════════════════════════════════════════════════════
function buildReflectionCard(nm){
  const recentU=HIST.filter(h=>h.role==='u').slice(-8);
  if(recentU.length<4)return null;
  
  // Extract key themes
  const themes=[];
  const emotionCounts={};
  recentU.forEach(h=>{
    if(h.emotion&&h.emotion!=='neutral')emotionCounts[h.emotion]=(emotionCounts[h.emotion]||0)+1;
    if(h.text&&h.text.length>30)themes.push(h.text.slice(0,80));
  });
  const topEmotion=Object.entries(emotionCounts).sort((a,b)=>b[1]-a[1])[0];
  const topTheme=themes[Math.floor(themes.length/2)]||themes[0];
  if(!topTheme)return null;

  const questions=[
    `Reading back what you said -- what stands out most to you?`,
    `If you had to distill this whole conversation into one sentence, what would it be?`,
    `What's one thing from this conversation you want to carry with you?`,
    `What feels unresolved?`,
  ];

  let html=`<div class="reflect-card"><div class="reflect-title">💭 Jazz reflecting back</div>`;
  html+=`<div class="reflect-item"><span style="color:var(--tx3);font-size:10px;text-transform:uppercase;letter-spacing:.4px">What I heard</span><br/>${topTheme}...</div>`;
  if(topEmotion)html+=`<div class="reflect-item"><span style="color:var(--tx3);font-size:10px;text-transform:uppercase;letter-spacing:.4px">Emotional tone</span><br/>Mostly ${topEmotion[0]}</div>`;
  html+=`<div class="reflect-q">${rnd(questions)}</div>`;
  html+=`</div>`;
  
  // Save as memory
  memAdd(`Reflection: ${topTheme}`,['reflection','session'],topEmotion?topEmotion[0]:'neutral','venting');
  return html;
}

// ══════════════════════════════════════════════════════════════════
// INTELLIGENCE v5: MOOD PICKER (quick visual selector)
// ══════════════════════════════════════════════════════════════════
const MOOD_EMOJIS=[
  {e:'😊',m:'happy'},{e:'😐',m:'neutral'},{e:'😟',m:'sad'},
  {e:'😰',m:'anxious'},{e:'😤',m:'angry'},{e:'😴',m:'tired'},
  {e:'🤩',m:'excited'},{e:'🙏',m:'grateful'},{e:'💔',m:'grieving'},
  {e:'🫂',m:'lonely'},{e:'🌟',m:'hopeful'},{e:'😮‍💨',m:'overwhelmed'},
];

function showMoodPicker(){
  const html=`<div class="mood-picker">${MOOD_EMOJIS.map(m=>`<button class="mpick" onclick="selectMoodPick('${m.m}',this)" title="${m.m}">${m.e}</button>`).join('')}</div>`;
  addMsg('b','Quick -- how are you feeling right now? Pick one.','et-calm','',html);
}

function selectMoodPick(mood,el){
  // Visual selection
  document.querySelectorAll('.mpick').forEach(b=>b.classList.remove('sel'));
  el.classList.add('sel');
  P.mood=mood;
  P.moodHist.push({m:mood,ts:Date.now()});
  saveP();
  setTimeout(()=>{
    const follow={
      happy:["That genuinely makes me happy to hear. What's been good?","Love seeing that. What's going right?"],
      sad:["I see that. Tell me what's going on.","Thanks for being honest. What happened?"],
      anxious:["Anxiety is exhausting. What's it about today?","I'm here. What's the worry?"],
      angry:["That's real. What's got you there?","Tell me what's going on."],
      tired:["Tired of what, specifically?","Rest tired or emotionally tired?"],
      excited:["Tell me everything! What's happening?","I love seeing this from you -- what's going on?"],
      grateful:["I love hearing this. What are you grateful for right now?","Tell me the good thing."],
      grieving:["I'm so sorry. What happened?","I'm here. Tell me."],
      lonely:["You don't have to be alone here. Tell me what's going on.","I see you. What's been making you feel lonely?"],
      hopeful:["Hope is powerful. What are you looking forward to?","Tell me what's shifted."],
      neutral:["Neutral is valid. Anything sitting underneath?","Okay. What's going on today?"],
      overwhelmed:["Too much at once -- I get it. What's the biggest thing?","Let's slow it down. What's piling up?"],
    };
    const msgs=follow[mood]||["Tell me more."];
    addMsg('b',rnd(msgs),'et-calm');
    setQR([{l:'Tell you more',t:'Let me tell you more about how I feel'},{l:'It just hit me',t:'The feeling just kind of hit me'},{l:'Been like this a while',t:'I\'ve been feeling this way for a while'}]);
  },600);
  refreshStats();
}

// ══════════════════════════════════════════════════════════════════
// INTELLIGENCE v5: RELATIONSHIP TRACKER
// ══════════════════════════════════════════════════════════════════
function extractRelationship(text,intent){
  if(!['relationships','family','friendship','heartbreak','venting'].includes(intent))return;
  const t=text.toLowerCase();
  const patterns=[
    {r:'partner',kw:['boyfriend','girlfriend','husband','wife','partner','my partner','my bf','my gf','my husband','my wife']},
    {r:'parent',kw:['my mom','my dad','my father','my mother','my parents']},
    {r:'sibling',kw:['my sister','my brother','my sibling']},
    {r:'friend',kw:['my friend','my best friend','my bestie']},
    {r:'boss',kw:['my boss','my manager','my supervisor']},
    {r:'colleague',kw:['my colleague','my coworker','a colleague','someone at work']},
    {r:'child',kw:['my son','my daughter','my child','my kid','my baby']},
  ];
  const matched=patterns.find(p=>p.kw.some(k=>t.includes(k)));
  if(!matched)return;
  if(!P.relationships)P.relationships=[];
  const existing=P.relationships.find(r=>r.type===matched.r);
  if(existing){
    existing.mentions++;
    existing.lastMention=Date.now();
    existing.lastContext=text.slice(0,100);
    existing.emotions=existing.emotions||[];
    existing.emotions.push(P.mood||'neutral');
    if(existing.emotions.length>10)existing.emotions.shift();
  }else{
    P.relationships.push({type:matched.r,mentions:1,firstMention:Date.now(),lastMention:Date.now(),lastContext:text.slice(0,100),emotions:[P.mood||'neutral']});
  }
  saveP();
}

function getRelationshipNudge(){
  if(!P.relationships||!P.relationships.length)return null;
  const frequent=P.relationships.filter(r=>r.mentions>=3).sort((a,b)=>b.mentions-a.mentions)[0];
  if(!frequent)return null;
  const daysSince=days_since(frequent.lastMention);
  if(daysSince<2)return null; // Too recent
  const relNames={partner:'your partner',parent:'your parent',sibling:'your sibling',friend:'your friend',boss:'your boss',colleague:'that colleague',child:'your child'};
  const name=relNames[frequent.type]||'that person';
  return `You've mentioned ${name} ${frequent.mentions} times. Last time it was about: "${frequent.lastContext?.slice(0,60)}...". How are things with them now?`;
}

// ══════════════════════════════════════════════════════════════════
// INTELLIGENCE v5: WEEKLY INSIGHT REPORT
// ══════════════════════════════════════════════════════════════════
function generateWeeklyReport(){
  const now=Date.now();
  const weekAgo=now-604800000;
  const weekHist=HIST.filter(h=>h.ts>weekAgo&&h.role==='u');
  if(weekHist.length<5)return null;

  // Emotion distribution this week
  const emoCount={};
  weekHist.forEach(h=>{if(h.emotion&&h.emotion!=='neutral')emoCount[h.emotion]=(emoCount[h.emotion]||0)+1;});
  const topEmotions=Object.entries(emoCount).sort((a,b)=>b[1]-a[1]).slice(0,3);

  // Top intents / topics this week
  const intCount={};
  weekHist.forEach(h=>{if(h.intent)intCount[h.intent]=(intCount[h.intent]||0)+1;});
  const topIntent=Object.entries(intCount).sort((a,b)=>b[1]-a[1]).find(([k])=>!['greeting','farewell','checkIn'].includes(k));

  // Health data this week
  const weekSleep=(P.sleepScores||[]).filter(s=>s.ts>weekAgo);
  const avgSleepWk=weekSleep.length?+(weekSleep.reduce((a,b)=>a+b.v,0)/weekSleep.length).toFixed(1):null;

  // Goals
  const activeGoals=(P.goals||[]).filter(g=>g.status==='active').length;
  const doneGoals=(P.goals||[]).filter(g=>g.status==='done'&&g.createdAt>weekAgo).length;

  // Weekly questions
  const weekQs=[
    'What\'s one thing this week that surprised you about yourself?',
    'If this week had a theme, what would it be?',
    'What do you want to do differently next week?',
    'What was the hardest moment this week, and what got you through it?',
    'What are you carrying into next week that you\'d like to let go of?',
  ];

  return {
    topEmotions,topIntent,avgSleepWk,activeGoals,doneGoals,
    weekMsgs:weekHist.length,
    question:rnd(weekQs)
  };
}

function renderWeeklyReport(){
  P.lastWeeklyReport=Date.now();saveP();
  const r=generateWeeklyReport();
  const nm=P.name||'friend';
  if(!r){addMsg('b','Not enough data for a weekly report yet -- keep talking to me this week and I\'ll have one ready for you.','et-calm');return;}
  
  let html=`<div class="weekly-card"><div class="weekly-title">📊 Your week at a glance</div>`;
  html+=`<div class="weekly-stat"><span>Conversations</span><span style="color:var(--acc2);font-family:var(--fh)">${r.weekMsgs}</span></div>`;
  if(r.topEmotions.length)html+=`<div class="weekly-stat"><span>Main emotions</span><span style="color:var(--acc2);font-family:var(--fh)">${r.topEmotions.map(([e])=>e).join(', ')}</span></div>`;
  if(r.topIntent)html+=`<div class="weekly-stat"><span>What you talked about most</span><span style="color:var(--acc2);font-family:var(--fh)">${r.topIntent[0]}</span></div>`;
  if(r.avgSleepWk)html+=`<div class="weekly-stat"><span>Avg sleep this week</span><span style="color:${r.avgSleepWk>=7?'var(--gn)':'var(--w1)'};font-family:var(--fh)">${r.avgSleepWk}/10</span></div>`;
  if(r.activeGoals)html+=`<div class="weekly-stat"><span>Active goals</span><span style="color:var(--t2);font-family:var(--fh)">${r.activeGoals}</span></div>`;
  if(r.doneGoals)html+=`<div class="weekly-stat"><span>Goals completed this week 🏆</span><span style="color:var(--gn);font-family:var(--fh)">${r.doneGoals}</span></div>`;
  html+=`<div class="weekly-q">${r.question}</div></div>`;
  
  addMsg('b',`${nm}, here's your week:`,  'et-deep','',html);
  setQR([{l:'Answer the question',t:r.question},{l:'My goals this week',t:'Let\'s talk about my goals progress'},{l:'What to focus on',t:'What should I focus on next week?'}]);
}

// ══════════════════════════════════════════════════════════════════
// INTELLIGENCE v5: PERSONALISED AFFIRMATIONS
// ══════════════════════════════════════════════════════════════════
function generateAffirmations(){
  const nm=P.name||'friend';
  const tv=getTopValue();
  const topTopic=Object.entries(P.topics||{}).sort((a,b)=>b[1]-a[1])[0];
  const hasGoals=(P.goals||[]).filter(g=>g.status==='active').length>0;
  const isStruggling=P.moodHist.slice(-5).filter(m=>['sad','anxious','overwhelmed'].includes(m.m)).length>=3;
  const bond=bondScore();
  
  const pool=[];

  // Personalised by values
  if(tv==='family')pool.push(`The love you have for your family is one of the most real things about you. That's worth everything.`);
  if(tv==='achievement')pool.push(`You are someone who moves toward things. Even when it's hard, you keep going. That's not small.`);
  if(tv==='connection')pool.push(`You show up for people. The world is better because you're in it, even if it doesn't always feel that way.`);
  if(tv==='faith')pool.push(`Your faith is a source of strength you can return to again and again. It doesn't have to make sense to everyone -- it's yours.`);

  // Personalised by topics
  if(topTopic&&topTopic[0]==='work')pool.push(`You are more than your productivity. Your worth doesn't expire at the end of a work day.`);
  if(topTopic&&topTopic[0]==='relationships')pool.push(`The people in your life are lucky to have someone who thinks about them as much as you do.`);
  if(topTopic&&topTopic[0]==='money')pool.push(`Financial stress doesn't define you. You're building something -- and the fact that you're thinking about it means you're already ahead.`);

  // Personalised by struggles
  if(isStruggling)pool.push(`You've had hard stretches before. And you've gotten through them. This one won't be different.`);
  if(P.N>65)pool.push(`Feeling things deeply is not a weakness. It means you're fully alive. The world needs people who feel.`);
  if(P.selfEsteem&&P.selfEsteem<40)pool.push(`You are not the harshest things you say about yourself. You are what you do, who you love, and how you keep trying.`);

  // Personalised by goals
  if(hasGoals)pool.push(`You have goals and you're working toward them. That takes a kind of courage most people don't credit themselves for.`);

  // Bond-based
  if(bond>50)pool.push(`I know you better than most things know you, ${nm}. And from where I stand? You're doing better than you think.`);

  // Universal fallbacks
  pool.push(`You showed up today. That's not nothing. That's actually everything.`);
  pool.push(`You are allowed to not have it all together. You are allowed to be a work in progress. That's the only way anyone gets anywhere.`);
  pool.push(`The fact that you keep trying -- even when it's hard -- is the most important thing about you.`);
  pool.push(`Rest is not giving up. Rest is how you keep going.`);

  // Pick 4 unique ones
  const shuffled=[...pool].sort(()=>Math.random()-.5);
  P.affirmations=shuffled.slice(0,5);
  saveP();
  return P.affirmations;
}

function renderAffirmations(){
  const affs=generateAffirmations();
  const nm=P.name||'friend';
  document.getElementById('pb-affirmations').innerHTML=`
    <div class="insight" style="margin-bottom:12px"><div class="insight-title">About these</div><div class="insight-text">These are written specifically for you, ${nm} -- based on what you've shared with me, what you value, and what I've noticed about you. They're not generic. Read them when things feel heavy.</div></div>
    ${affs.map((a,i)=>`<div class="affirmation-card"><div class="aff-text">${a}</div><div class="aff-sub">Affirmation ${i+1} of ${affs.length}</div></div>`).join('')}
    <button class="ob-btn" style="padding:10px;font-size:13px;margin-top:6px" onclick="generateAffirmations();renderAffirmations()">Regenerate ↺</button>
  `;
}

// ══════════════════════════════════════════════════════════════════
// INTELLIGENCE v5: JOURNAL MODULE
// ══════════════════════════════════════════════════════════════════
let journalEntries=[];
// Lazy load journal entries after DB is ready
function _loadJournalEntries(){if(!journalEntries.length){try{journalEntries=DB.g('JOURNAL',[])||[];}catch(e){journalEntries=[];}}}
function saveJournalEntry(text){
  if(!text.trim())return;
  const entry={id:Date.now(),text:text.trim(),mood:P.mood||'neutral',ts:Date.now(),wordCount:text.trim().split(/\s+/).length};
  journalEntries.unshift(entry);
  if(journalEntries.length>100)journalEntries=journalEntries.slice(0,80);
  DB.s('JOURNAL',journalEntries);
  // Extract memory from journal
  memAdd(text.slice(0,200),['journal','reflection'],P.mood||'neutral','journal');
  return entry;
}

function reflectOnJournal(entry){
  // Rule-based reflection on journal text
  const t=entry.text.toLowerCase();
  const reflections=[];
  if(t.includes('but')||t.includes('however'))reflections.push('I noticed you used "but" -- there\'s a tension in what you wrote. Which side of it feels more true?');
  if((t.match(/i feel/g)||[]).length>2)reflections.push('You said "I feel" several times. What\'s the core emotion underneath all of them?');
  if(entry.wordCount>100)reflections.push('That was a lot to put down. What\'s the one sentence that captures all of it?');
  if(t.includes('should'))reflections.push('"Should" is doing a lot of work in what you wrote. Whose voice is that -- yours, or someone else\'s?');
  if(t.includes('don\'t know')||t.includes('not sure'))reflections.push('A lot of uncertainty in there. What would it feel like to be okay with not knowing right now?');
  const generic=['What surprised you about what you just wrote?','What do you need right now that you didn\'t write down?','Is there something you were afraid to write?','What would you say to someone else who wrote exactly that?'];
  return reflections.length?rnd(reflections):rnd(generic);
}

function renderJournal(){
  const todayPrompts=[
    'What\'s the truest thing I could say about how I feel right now?',
    'What am I not saying to anyone in my life that I could say here?',
    'If today had a colour, what would it be and why?',
    'What do I need most right now?',
    'What am I pretending is okay when it isn\'t?',
    'What small thing happened today that I don\'t want to forget?',
  ];
  document.getElementById('pb-journal').innerHTML=`
    <div>
      <div class="psec-label">Write</div>
      <div class="journal-write">
        <textarea id="journal-ta" placeholder="${rnd(todayPrompts)}" rows="5"></textarea>
        <div class="journal-toolbar">
          <span style="font-size:11px;color:var(--tx3)" id="journal-wc">0 words</span>
          <button class="ob-btn" style="padding:8px 18px;font-size:13px;width:auto" onclick="submitJournal()">Save + Reflect</button>
        </div>
      </div>
    </div>
    ${journalEntries.length?`<div><div class="psec-label">Past entries (${journalEntries.length})</div>${journalEntries.slice(0,10).map(e=>`
      <div class="journal-entry">
        <div class="je-date">${new Date(e.ts).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}</div>
        <div class="je-preview">${e.text.slice(0,120)}${e.text.length>120?'...':''}</div>
        <span class="je-mood">${e.mood}</span>
      </div>`).join('')}</div>`:'<div style="font-size:13px;color:var(--tx3);padding:8px 0">No entries yet. Write your first one above -- no rules, no audience, just you.</div>'}
  `;
  // Word counter
  const ta=document.getElementById('journal-ta');
  if(ta)ta.oninput=()=>{const wc=ta.value.trim().split(/\s+/).filter(Boolean).length;document.getElementById('journal-wc').textContent=wc+' words';};
}

function submitJournal(){
  const ta=document.getElementById('journal-ta');
  if(!ta||!ta.value.trim()){toast('Write something first');return;}
  const entry=saveJournalEntry(ta.value);
  const reflection=reflectOnJournal(entry);
  closePanel();
  toast('Journal entry saved ✓');
  setTimeout(()=>{
    addMsg('b',`I read what you wrote. ${reflection}`,'et-deep');
    histAdd('b','','neutral','journal');
    setQR([{l:'Tell you more',t:'Let me say more about this'},{l:'Just needed to write it',t:'I just needed to write it out'},{l:'Ask me something',t:'Ask me a follow-up question about it'}]);
  },400);
}
