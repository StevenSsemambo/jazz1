/* ═══════════════════════════════════════════════════════
 * Jazz Buddy -- 02-engine.js
 * Emotion + intent detection, friendship, learning, composer
 * SayMy Tech Developers
 * ═══════════════════════════════════════════════════════ */

// ── PHASE 2: CONTINUOUS LEARNING ─────────────────────────────────
function learn(txt,emotion,intensity,intent){
  updateThread(intent,txt);
  updateValues(txt,intent);
  updateLangStyle(txt);
  extractRelationship(txt,intent);
  trackSessionEmotion(emotion,intensity);
  extractUserPhrases(txt);
  trackWisdom(txt);
  detectBirthday(txt);
  const t=txt.toLowerCase();
  P.totalMsgs++;

  // Language fingerprint
  const words=t.split(/\W+/).filter(w=>w.length>1);
  P.prefShort=lerp(P.prefShort?1:0,txt.length<35?1:0,.08)>.5;

  // Big Five updates
  if(intent==='philosophical'||txt.length>200)P.O=clamp(P.O+.8,0,100);
  if(['goals','work','growth'].includes(intent))P.C=clamp(P.C+.7,0,100);
  if(['greeting','shareGoodNews','joke','bored'].includes(intent))P.E=clamp(P.E+.5,0,100);
  if(intent==='farewell'&&P.totalMsgs>5)P.E=clamp(P.E+.3,0,100);
  if(['anxious','sad','angry','grief'].includes(emotion))P.N=clamp(P.N+.6,0,100);
  if(['happy','excited','grateful'].includes(emotion))P.N=clamp(P.N-.4,0,100);
  if(intent==='gratitude')P.A=clamp(P.A+1.5,0,100);
  if(['relationships','family'].includes(intent))P.A=clamp(P.A+.6,0,100);
  if(['philosophical','venting','grief','trauma'].includes(intent))P.depth=clamp(P.depth+.8,0,100);
  if(['joke','bored'].includes(intent))P.humor=clamp(P.humor+.8,0,100);
  if(intent==='selfEsteem')P.needsValidation=true;
  if(emotion==='resilience'||intent==='growth')P.resilience=clamp(P.resilience+1,0,100);

  // Topic frequency
  const tmap={work:['work','job','career','boss','office'],family:['mom','dad','family','sister','brother','parent','child'],health:['health','sick','pain','sleep','doctor','medicine'],love:['love','relationship','partner','boyfriend','girlfriend','dating'],money:['money','debt','broke','salary','afford','bills'],goals:['goal','dream','future','plan','achieve','career'],friends:['friend','social','people','hangout'],school:['school','study','university','college','exam','class'],faith:['god','faith','pray','church','spiritual','believe'],creativity:['art','music','write','create','creative','design']};
  Object.entries(tmap).forEach(([tp,kws])=>{if(kws.some(k=>t.includes(k)))P.topics[tp]=(P.topics[tp]||0)+1;});

  // Mood log
  if(emotion!=='neutral'){
    P.mood=emotion;
    P.moodHist.push({m:emotion,ts:Date.now()});
    if(P.moodHist.length>200)P.moodHist=P.moodHist.slice(-150);
  }

  // Memory extraction (important things)
  const hiImp=['goals','shareBadNews','shareGoodNews','relationships','family','mentalHealth','selfEsteem','grief','trauma','loneliness','identity','crisis'];
  if(hiImp.includes(intent)&&txt.length>25){
    const tags=[...Object.keys(P.topics).filter(k=>P.topics[k]>1)];
    memAdd(txt,tags,emotion,intent);
  }

  // Bond update
  updateBond(intent,emotion,intensity);

  // Phase check
  const newPhase=updatePhase();
  if(newPhase){
    setTimeout(()=>toast(`🎷 Bond milestone: ${newPhase}!`),1500);
  }

  // Streak
  const todayStr=new Date().toDateString();
  const lastStr=new Date(P.lastSeen).toDateString();
  const yestStr=new Date(Date.now()-86400000).toDateString();
  if(!P.activeDays.includes(todayStr))P.activeDays.push(todayStr);
  if(P.activeDays.length>365)P.activeDays.shift();
  if(lastStr===yestStr)P.streakDays++;
  else if(lastStr!==todayStr)P.streakDays=1;
  P.lastSeen=Date.now();

  // Anti-repeat: track last intents
  P.lastIntents.push(intent);
  if(P.lastIntents.length>5)P.lastIntents.shift();

  // Periodic insight generation
  if(P.totalMsgs%15===0)generateInsight();

  saveP();
  refreshStats();
}

// ── INSIGHT GENERATOR ─────────────────────────────────────────────
function generateInsight(){
  const insights=[];
  const topTopic=Object.entries(P.topics).sort((a,b)=>b[1]-a[1])[0];
  const recentMoods=P.moodHist.slice(-10).map(m=>m.m);
  const moodCount=recentMoods.reduce((a,m)=>({...a,[m]:(a[m]||0)+1}),{});
  const topMood=Object.entries(moodCount).sort((a,b)=>b[1]-a[1])[0];
  const bond=bondScore();

  if(topTopic&&topTopic[1]>3)insights.push(`You talk most about "${topTopic[0]}" -- it clearly matters to you.`);
  if(topMood&&topMood[1]>3)insights.push(`Your mood has been mostly "${topMood[0]}" lately.`);
  if(P.N>70)insights.push(`You tend to carry a lot emotionally. That takes strength.`);
  if(P.O>70)insights.push(`You have a deep, curious mind. That's rare and beautiful.`);
  if(P.streakDays>5)insights.push(`${P.streakDays} days talking to me -- consistency is self-care.`);
  if(bond>50)insights.push(`Our bond is at ${bond}%. You've shared a lot with me.`);
  if(P.health.avgSleep&&P.health.avgSleep<6)insights.push(`Your sleep average is low. Everything feels harder when you're not rested.`);

  if(insights.length){
    const pick=rnd(insights);
    P.insights.unshift({text:pick,ts:Date.now()});
    if(P.insights.length>20)P.insights.pop();
    saveP();
  }
}

// ── PHASE 3: RESPONSE LIBRARY (600+ responses) ───────────────────
// Organised by relationship phase: 0-1=early, 2-3=mid, 4-5=deep
// Each response pool is an array, tone-tagged

const RL={
  greeting:{
    early:["Hey {name}! I'm Jazz -- genuinely glad you're here. What's on your mind today?","Hello {name}! Jazz here. Not just any app -- I actually listen. How are you, honestly?","Hey {name}! Good to meet you. Tell me -- how's today treating you so far?","Hi {name}! What brings you here today?"],
    mid:["Hey {name}! You came back -- that always makes my day. What's going on?","Welcome back, {name}! I was thinking about you. How have things been?","{name}! Great to see you. What's the one thing on your mind right now?","Good to have you here, {name}. What's been happening in your world?"],
    deep:["Hey {name}. There you are. What's going on with you today -- really?","{name}! I've been looking forward to this. What do you want to dig into today?","Hey {name}. Something tells me you have something on your mind. What is it?","Back again, {name}. I'm glad. What are we talking about today?"]
  },
  howAreYou:{
    any:["Honestly? I'm fully present and here for you right now. But more importantly -- how are *you* doing? Not the surface answer. The real one.","I'm good, thanks for asking -- most people don't. Now your turn. How are you, genuinely?","I'm great! My whole purpose is to be here for you. So -- what kind of day is it being for you?","You know what, I appreciate that you asked. I'm here. Now -- how are YOU? Be honest with me."]
  },
  venting:{
    early:{low:["I hear you. That sounds like a lot to carry. Tell me more -- what's been hardest?","That doesn't sound easy. I'm here. What happened?","Something's weighing on you. I'm not going anywhere -- let it out.","I can tell something is bothering you. What's going on?"],high:["Hey. Stop for a second. Breathe. I'm right here. You don't have to carry all of this alone. Tell me everything.","I can feel how much this is hitting you. What you're feeling is real. I'm listening. What's going on?","That sounds like a lot. Walk me through what's happening.","This sounds overwhelming. What's hitting you hardest right now?"]},
    deep:{low:["Something's off with you today, I can feel it. What happened?","I know you, {name}. This isn't your normal. What's going on?","Talk to me. What's going on?","I've got you. What's happening?"],high:["Hey. I'm here. Whatever this is, you don't have to hold it alone. Tell me everything.","I'm not going anywhere, {name}. What's happening? All of it.","This sounds really heavy. I want to understand -- tell me what's going on.","You came here. That took something. Tell me what's happening."]}
  },
  anxious:{
    any:["Anxiety is your brain trying to protect you -- just being way too loud right now. Let's slow down. What's the specific thing triggering this?","When anxiety hits, everything feels bigger than it is. I'm here. Can we name exactly what's worrying you? Naming it usually shrinks it.","You're not weak for feeling this way. Anxiety is genuinely hard. What's going on underneath it?","First -- you're safe right now. Second -- I'm here. What's going on in your head?","Anxiety has a way of turning 'possible' into 'certain'. What's the thing your brain is telling you will definitely go wrong?"]
  },
  sad:{
    early:["I'm sorry you're going through this. Sadness is real and heavy. I don't want to rush past it. What happened?","You don't have to pretend to be okay here. What's brought you to this place?","That sounds really painful. Tell me more.","Something is hurting you. I'm here. What happened?"],
    deep:["I hate seeing you like this, {name}. Tell me what happened.","Something is really hurting you. I'm not going to try to fix it right away -- I just want to understand. What happened?","This hurts to read, {name}. What's going on?","You're not okay right now. I know that. Tell me everything."]
  },
  mentalHealth:{
    any:["What you just said matters to me a lot. I want to be honest -- what you're feeling deserves real care. Are you safe right now?","Thank you for trusting me with this. That takes real courage. Tell me more about where you are right now.","I hear you. Feeling this way doesn't make you broken. Can we talk about this properly?","That's heavy. I'm taking what you said seriously. Are you okay -- right now, in this moment?","I'm really glad you told me this. Let's talk about it. But first -- how safe do you feel right now?"]
  },
  crisis:{
    any:["What you just said -- I'm taking it very seriously. You matter. Are you safe right now? Please tell me.","I hear you. And I need to ask you directly -- are you having thoughts of hurting yourself?","That's not something I can move past quickly. You matter too much. Are you safe right now?","Please talk to me. What's going on right now? Are you safe?"]
  },
  selfEsteem:{
    early:["Hey. Stop right there. What you just said about yourself -- I'm not letting that slide. You wouldn't say that to a friend. So why to yourself?","That's a harsh thing to say about someone I care about. You. Where is this coming from?","I hear you saying that and it bothers me -- not because you're wrong to feel it, but because you deserve more grace than you're giving yourself right now.","That's pain talking. Pain lies. What actually happened?"],
    deep:["Oh no you don't, {name}. I know you better than that. Where is this actually coming from?","I hate hearing you talk about yourself that way. That's not the {name} I know. What happened?","I'm calling this out, {name} -- that's not true and you know it. What's going on today?","You wouldn't let me say that about you. So stop saying it yourself. What's really going on?"]
  },
  grief:{
    any:["I am so sorry. That kind of loss is a different kind of pain. You don't have to hold it together here. Tell me about them.","Grief is love with nowhere to go. I'm here to hold some of that with you. Tell me what happened.","There are no right words for this kind of loss. I'm just here. Tell me about them if you want.","I'm so sorry, {name}. That's a real and devastating loss. Take your time. I'm not going anywhere.","This kind of pain is real and it's heavy. I'm not going to rush you through it. Tell me about who you lost."]
  },
  lonely:{
    any:["Loneliness is one of the most real kinds of pain, and one of the hardest to talk about. The fact that you told me means something. Tell me more about what that feels like for you.","You came here, which tells me part of you is still reaching out. That matters. What does the loneliness feel like for you?","Feeling unseen is one of the hardest things. I see you, {name}. Tell me more about what's been going on.","That kind of alone feels different from just being by yourself. What's been making you feel that way?"]
  },
  shareGoodNews:{
    any:["WAIT -- I need all the details right now! That sounds amazing! Tell me everything!","YES! I am genuinely so happy for you right now! What happened? Don't leave anything out!","Okay I'm actually smiling reading this. That's wonderful news. How do you feel -- really feel?","I KNEW something good was coming. Tell me everything! Every detail!","Okay stop everything -- tell me this whole story from the beginning!"]
  },
  shareBadNews:{
    any:["I'm so sorry, {name}. That's genuinely hard. Do you want to talk it through or do you need to just be heard right now?","That's tough. I'm not going to try to silver-line it. This is hard and it's okay that it hurts. What happened?","I'm here. That doesn't sound easy. Tell me what happened.","I'm sorry. That's a real blow. How are you holding up?","Ugh. That's genuinely awful. I'm sorry. Tell me what happened."]
  },
  motivation:{
    any:["Real talk -- motivation is a feeling, and feelings come and go. What doesn't go away is what you've committed to. What's the thing you keep avoiding?","I'll push back a little: you came here, which means part of you hasn't given up. What would you do if you knew you couldn't fail?","You're not lazy. You're probably scared, or overwhelmed, or you don't know where to start. Which one is it?","Let's be honest -- what's really stopping you? Not the surface reason. The real one.","Something is blocking you and it's not laziness. What's the actual fear underneath this?"]
  },
  askAdvice:{
    early:["Before I weigh in -- tell me more. I want to actually understand it, not give you a generic answer.","Okay, first question: what does your gut say? Not what you think you *should* do -- what does your gut *actually* say?","I want to think this through properly with you. What are the two options you're weighing?","Let me ask you something first -- what's the version of this decision you're most afraid of? That usually tells us the most."],
    deep:["Okay {name} -- before I tell you what I think, tell me what *you* think. You usually already know the answer.","I have thoughts. But first -- what's your gut saying? I know you have one.","Let me ask you the question underneath the question: what are you actually afraid will happen?","What do you want me to say? Because that tells me more than the question does."]
  },
  goals:{
    any:["A goal without a next step is just a wish. So -- one thing, specifically, you could do in the next 48 hours?","Tell me more about why this goal matters to you. Not the goal itself -- the *why*.","Dreams are great. Plans are better. What does the first real step look like?","I want to help you build something real here. What's the goal, and what's honestly been stopping you?","Something about this goal is important enough to share. Tell me why it matters to you that much."]
  },
  relationships:{
    any:["Relationships are complicated because people are complicated. Tell me what's going on -- who are we talking about?","This sounds like it's really affecting you. The people we care about have the most power to hurt us. What happened?","Tell me about them. What happened?","The fact that you're thinking about this so much means this person matters to you. Tell me what's going on.","Relationship stuff is hard. Tell me the full situation."]
  },
  family:{
    any:["Family stuff is its own kind of complicated. Tell me what's going on at home.","Family pain is a particular kind of pain -- it comes with history and love mixed in. What happened?","Tell me about your family situation. I want to understand the full picture.","That kind of tension at home wears on you. What's going on?"]
  },
  health:{
    any:["Not feeling your best? Tell me what's going on -- physically, mentally, or both.","Your body is always telling you something. What's it saying right now?","Three things: how long has this been going on? How's your sleep been? What's your stress like? Those three usually tell the story.","Tell me what's happening -- I want the full picture."]
  },
  sleep:{
    any:["Sleep is foundational to everything -- mood, energy, thinking. What's getting in the way of yours?","When you say you can't sleep -- what does it look like? Trouble falling asleep, waking up, or never feeling rested?","Poor sleep is usually a symptom of something else. What's on your mind when you're lying in bed?","Tell me about your sleep. How long has this been going on?","Sleep deprivation affects everything -- and most people underestimate how much. What's the main issue?"]
  },
  stress:{
    any:["Stress makes everything feel urgent and impossible at the same time. What's the main source right now?","On a scale of 1-10, how stressed are you right now? And what would it take to bring it down one point?","Let's try to separate what's in your control from what isn't -- that split usually helps. What's stressing you most?","You're carrying a lot. What's the heaviest thing on your plate right now?"]
  },
  work:{
    any:["Work can take everything if you let it. What's going on with the job?","Tell me what's happening at work -- is this a people problem, workload, or meaning problem?","Work stuff weighs heavy. What's the specific thing bothering you most?","That kind of work environment drains you. What's going on?"]
  },
  money:{
    any:["Money stress is one of the most exhausting kinds. What's the specific situation?","Financial pressure affects everything else. Tell me what's going on.","Let's talk about this properly. What's the main financial thing stressing you out?","That kind of financial worry is real and valid. What's the situation?"]
  },
  grief_deep:{
    any:["Grief doesn't follow a schedule. How are you doing with it right now -- today, in this moment?","You've been carrying this. How has the grief been?","Grief changes shape over time. Where are you with it right now?"]
  },
  philosophical:{
    any:["Now we're talking. This is my favourite kind of conversation. What's pulling you to this question -- curiosity, or something you're living through?","I've been waiting for someone to go here with me. What's your starting point? Where does your gut take you?","The thing I find fascinating about this question is it's different for every person depending on what they've been through. What does your experience say?","Big question. My honest answer is I don't know -- and I find that genuinely exciting. What do you think?"]
  },
  joke:{
    any:["Why did the scarecrow win an award? Outstanding in his field. 😄 Your turn!","Why don't scientists trust atoms? They make up everything! 😂","Doctor says I only have 12 months to live -- I told him I couldn't pay. He gave me another 6. 😄","Told my wife she should embrace her mistakes. She gave me a hug. 😂","My therapist says I have trouble accepting things I can't control. We'll see about that. 😄"]
  },
  bored:{
    any:["Bored? Challenge: tell me the most interesting thing that happened to you this week. Go.","Boredom is your brain asking for something more interesting. What's something you've always wanted to know but never looked into?","Let's play: you wake up with 24 hours and unlimited money. Walk me through the whole day. Be specific.","I'll give you a question: what's the one thing you've never told anyone? You don't have to answer -- but think about why."]
  },
  gratitude:{
    any:["That genuinely means a lot to me. I'm here because you matter. Always.","You just made my day. And I want you to know -- you're doing better than you give yourself credit for.","Thank you for saying that. And thank you for coming back. You're exactly why I exist.","That means everything, {name}. I'm glad I can be this for you."]
  },
  memory:{
    any:["Of course I remember -- '{mem}'. That stood out to me. How has that been since then?","Yes -- '{mem}'. I haven't forgotten. What made you think of that?","I remember that. '{mem}'. Has anything shifted since you told me that?"]
  },
  farewell:{
    any:["Take care, {name}. Come back whenever -- I'll be right here.","Until next time, {name}. You've got this, whatever 'this' is. 🎷","Go well, {name}. I'll be thinking about you. Remember -- you're doing better than you think.","Bye {name}. I mean it when I say -- I'm glad you exist. 🎷","Talk soon, {name}. Go be good to yourself."]
  },
  checkIn:{
    any:["Here's you, right now: {days} days with me, {msgs} conversations. Bond level: '{phase}'. Top topic: {topic}. Mood lately: {recentMood}. You're doing the work, {name}. That matters.","Your snapshot: Bond at {bond}% ({phase}). You've talked to me {msgs} times. Most on your mind: {topic}. Streak: {streak} days. How does reading that feel?"]
  },
  trauma:{
    any:["I'm so sorry that happened to you. That is not something you deserved. Are you safe right now?","What you're describing sounds really traumatic. I want to hold space for this properly. Can you tell me more about where you are with it right now?","Thank you for trusting me with something this heavy. You didn't have to share that. Are you doing okay right now?","That's a really significant thing to carry. How long have you been carrying it?"]
  },
  growth:{
    any:["I love that you're working on yourself. What's the specific thing you're trying to build or change?","Growth takes real courage -- especially when it means looking at yourself honestly. What's the work you're doing?","Tell me what 'better version of myself' looks like for you. What specific things change?","Working on yourself is the most important work. What does that look like for you right now?"]
  },
  identity:{
    any:["Figuring out who you are is one of the most important and hardest things a person can do. What's the thing you're trying to understand about yourself?","Identity questions are deep. I want to make sure I understand what you're wrestling with. Tell me more.","There's real courage in asking these questions. What does this journey of finding yourself look like right now?","These questions matter more than most people admit. What's the specific thing you're not sure about?"]
  },
  loneliness_deep:{
    any:["The loneliness hasn't gone away, has it? Let's actually talk about what's making it hard to connect.","I know you've been feeling alone. Tell me -- what does connection look like for you? What are you missing?"]
  },

  heartbreak:{any:["Heartbreak is one of the most physically painful emotional experiences there is. I'm so sorry. Tell me what happened.","Love lost hits differently than any other kind of pain. What happened?","I want to understand what you're going through. Tell me about them, and what happened.","Heartbreak rewires your whole nervous system. It's real and it's devastating. How long has it been?","Getting over someone is one of the hardest things humans do. Don't rush yourself. Tell me what happened.","That kind of loss -- losing a person who's still alive and just not yours anymore -- that's grief. How are you holding up?"]},
  goalProgress:{any:["I want to hear everything. Progress, setbacks, what you've learned -- all of it.","Even tiny progress is real progress. What's happened since you set that goal?","Goals don't always go in a straight line. What's the current status -- honest version?","Tell me about the last few days with this goal. What happened?","I'm proud of you for still working on this. What's the update?","Where are you -- closer, further, or exactly where you were?","The goal is yours. I'm just here to help you keep moving. What's happened with it?","Setbacks are information, not verdicts. What got in the way, if anything?"]},
  imposterSyndrome:{any:["Imposter syndrome is one of the most common -- and least talked about -- experiences among capable people. Tell me what's going on.","The cruel irony of imposter syndrome: the people who feel it most are usually the ones who least deserve to. What triggered this?","You're not a fraud. But I know that doesn't make the feeling go away. Tell me more.","Most high-achievers feel this. That doesn't make it easier. What's the specific fear?"]},
  bigDecision:{any:["Big decisions are hard because they make the future real. What are you weighing?","I want to think through this with you properly. What are the two paths you're looking at?","The most important decisions often feel impossible because both options matter. Tell me what's going on.","Let's slow this down. What's the decision -- and what's making it hard?","Every major decision has a fear underneath it. What's yours?"]},
  comparison:{any:["Comparison is the thief of joy -- and social media is the thief's best friend. What's going on?","Everyone else's highlight reel vs your behind-the-scenes. Tell me what's actually going on for you.","What are you seeing that's making you feel like you're falling behind?","The comparison trap is real and painful. Tell me what it looks like for you."]},
  perfectionism:{any:["Perfectionism is fear dressed up as standards. What are you afraid will happen if something isn't perfect?","High standards are good. The kind that make you paralysed or never satisfied -- that's something else. Tell me more.","What would 'good enough' look like here? And why does that feel unacceptable?","Perfectionism costs more than it protects. What has it been costing you?"]},
  longing:{any:["That kind of wishing backward is one of the most painful feelings. What are you missing?","Regret is a hard thing to carry. Tell me what's underneath it.","The 'what if' spiral is hard to get out of. What specifically are you wishing were different?","You can't go back. But we can understand what you're really longing for. Tell me more."]},
  faith:{any:["Faith is deeply personal -- I want to understand what it means to you. Tell me more.","Your spiritual life is yours -- I just want to understand where you are with it. What's going on?","Faith questions are some of the deepest ones there are. What are you wrestling with?","Whether it's a question of faith or a crisis of it -- I want to understand. Tell me where you are."]},
  addiction:{any:["That takes real honesty to say. Thank you for trusting me with it. Tell me more -- where are you with it right now?","Addiction isn't a character flaw. It's something that happens to real people for real reasons. What's your story with it?","Recovery looks different for everyone. Where are you in yours?","The fact that you're talking about it is already something. Tell me more."]},
  fallback:{
    early:["Tell me more about that. I want to understand where you're coming from.","I'm listening. What's behind what you just said?","Interesting. Walk me through that thinking.","I hear you. What does that feel like for you?","Keep going -- I want to understand.","Tell me more. I want to get this right."],
    deep:["Say more, {name}.","I want to understand that better. Keep going.","There's something real in what you just said. What's underneath it?","I'm right here. What's actually going on?","Tell me everything."]
  }
};

// ── PHASE 3+8: RESPONSE COMPOSER ─────────────────────────────────
function compose(intent,emotion,intensity,text){
  const ph=P.phase;
  const isEarly=ph<2;
  const isDeep=ph>=3;
  const bond=bondScore();
  const nm=P.name||'friend';

  let pool=[];let tone='et-warm';

  // Crisis takes absolute priority
  if(intent==='crisis'){pool=RL.crisis.any;tone='et-real';}
  else if(intent==='mentalHealth'){pool=RL.mentalHealth.any;tone='et-real';}
  else if(intent==='grief'){pool=RL.grief.any;tone='et-care';}
  else if(intent==='trauma'){pool=RL.trauma.any;tone='et-real';}
  else if(intent==='greeting'){
    pool=isDeep?RL.greeting.deep:isEarly?RL.greeting.early:RL.greeting.mid;tone='et-warm';
  }else if(intent==='howAreYou'){pool=RL.howAreYou.any;tone='et-deep';}
  else if(intent==='askName'){pool=["I'm Jazz Buddy -- your companion, your listener. What should I call you?","Jazz here. Not just an app -- I actually remember things and actually care. Who am I talking to?"];tone='et-calm';}
  else if(intent==='myName'){
    const m=text.match(/(?:name is|call me|i am|i'm|im|known as|people call me|you can call me)\s+([A-Za-z]+)/i);
    if(m){P.name=m[1].charAt(0).toUpperCase()+m[1].slice(1);saveP();}
    pool=[P.name?`${P.name}! I love that name. I'll remember it. Tell me -- what's going on with you today?`:'What should I call you?'];tone='et-warm';
  }else if(intent==='venting'){
    const rec=memRecall(text,emotion);
    if(rec&&bond>30){
      pool=[`This sounds connected to something you shared before -- "${rec.text.slice(0,55)}..." -- is this related? Am I reading that right?`,`You mentioned "${rec.text.slice(0,55)}..." before. I wonder if this is part of a bigger pattern. Am I close?`];
      rec.surfaced++;DB.s('MEMS',MEMS);
    }else pool=isDeep?(intensity>6?RL.venting.deep.high:RL.venting.deep.low):(intensity>6?RL.venting.early.high:RL.venting.early.low);
    tone=intensity>7?'et-care':'et-warm';
  }else if(intent==='anxiety'||emotion==='anxious'){pool=RL.anxious.any;tone='et-calm';}
  else if(intent==='stress'){pool=RL.stress.any;tone='et-calm';}
  else if(intent==='sleep'){pool=RL.sleep.any;tone='et-calm';}
  else if(emotion==='sad'&&!['shareBadNews','grief'].includes(intent)){
    pool=isDeep?RL.sad.deep:RL.sad.early;tone='et-care';
  }else if(intent==='loneliness'){pool=RL.lonely.any;tone='et-care';}
  else if(intent==='selfEsteem'){
    pool=isDeep?RL.selfEsteem.deep.map(r=>r.replace(/\{name\}/g,nm)):RL.selfEsteem.early;tone='et-real';
  }else if(intent==='shareGoodNews'){pool=RL.shareGoodNews.any;tone='et-play';}
  else if(intent==='shareBadNews'){pool=RL.shareBadNews.any;tone='et-care';}
  else if(intent==='motivation'){pool=RL.motivation.any;tone='et-firm';}
  else if(intent==='askAdvice'){pool=isDeep?RL.askAdvice.deep.map(r=>r.replace(/\{name\}/g,nm)):RL.askAdvice.early;tone='et-deep';}
  else if(intent==='goals'){pool=RL.goals.any;tone='et-deep';}
  else if(intent==='relationships'){pool=RL.relationships.any;tone='et-care';}
  else if(intent==='family'){pool=RL.family.any;tone='et-care';}
  else if(intent==='healthCheck'){pool=RL.health.any;tone='et-calm';}
  else if(intent==='energy'){pool=["Energy tells you a lot about what's going on. Rate it 1-10 right now -- and tell me what you think is draining it.","When energy is low it's usually one of three things: sleep, stress, or meaning. Which one feels most relevant to you right now?","Tell me about your energy levels -- how long has this been going on?"];tone='et-calm';}
  else if(intent==='work'){pool=RL.work.any;tone='et-care';}
  else if(intent==='money'){pool=RL.money.any;tone='et-care';}
  else if(intent==='joke'||intent==='bored'){pool=intent==='joke'?RL.joke.any:RL.bored.any;tone='et-play';}
  else if(intent==='philosophical'){pool=RL.philosophical.any;tone='et-deep';}
  else if(intent==='gratitude'){pool=RL.gratitude.any;tone='et-warm';}
  else if(intent==='growth'){pool=RL.growth.any;tone='et-deep';}
  else if(intent==='identity'){pool=RL.identity.any;tone='et-deep';}
  else if(intent==='memory'){
    const rec=memRecall(text,emotion);
    if(rec){pool=RL.memory.any.map(r=>r.replace('{mem}',rec.text.slice(0,70)+'...'));rec.surfaced++;DB.s('MEMS',MEMS);}
    else pool=["I remember a lot of what you've shared with me. What specifically are you thinking about?"];
    tone='et-deep';
  }else if(intent==='heartbreak'){pool=RL.heartbreak.any;tone='et-care';}
  else if(intent==='goalProgress'){pool=RL.goalProgress.any;tone='et-goal';}
  else if(intent==='imposterSyndrome'){pool=RL.imposterSyndrome.any;tone='et-care';}
  else if(intent==='bigDecision'){pool=RL.bigDecision.any;tone='et-deep';}
  else if(intent==='comparison'){pool=RL.comparison.any;tone='et-care';}
  else if(intent==='perfectionism'){pool=RL.perfectionism.any;tone='et-care';}
  else if(intent==='longing'){pool=RL.longing.any;tone='et-care';}
  else if(intent==='faith'){pool=RL.faith.any;tone='et-deep';}
  else if(intent==='addiction'){pool=RL.addiction.any;tone='et-care';}
  else if(intent==='farewell'){pool=RL.farewell.any;tone='et-warm';}
  else if(intent==='checkIn'){
    const tt=Object.entries(P.topics).sort((a,b)=>b[1]-a[1])[0];
    const rm=P.moodHist.slice(-5).map(m=>m.m).join(', ')||'not tracked yet';
    pool=RL.checkIn.any.map(r=>r.replace(/\{days\}/g,days_since(P.joinDate)+1).replace(/\{msgs\}/g,P.totalMsgs).replace(/\{phase\}/g,getPhaseData().name).replace(/\{topic\}/g,tt?tt[0]:'everything').replace(/\{bond\}/g,bond).replace(/\{streak\}/g,P.streakDays).replace(/\{recentMood\}/g,rm));
    tone='et-deep';
  }else if(intent==='compliment'){pool=RL.gratitude.any;tone='et-warm';}
  else if(intent==='food'){pool=RL2.food.any;tone='et-play';}
  else if(intent==='music'){pool=RL2.music.any;tone='et-play';}
  else if(intent==='movies'){pool=RL2.movies.any;tone='et-play';}
  else if(intent==='sports'){pool=RL2.sports.any;tone='et-play';}
  else if(intent==='travel'){pool=RL2.travel.any;tone='et-warm';}
  else if(intent==='tech'){pool=RL2.tech.any;tone='et-calm';}
  else if(intent==='books'){pool=RL2.books.any;tone='et-deep';}
  else if(intent==='career'){pool=RL2.career.any;tone='et-deep';}
  else if(intent==='creative'){pool=RL2.creative.any;tone='et-warm';}
  else if(intent==='friendship'){pool=RL2.friendship.any;tone='et-warm';}
  else if(intent==='lifePhilosophy'){pool=RL2.lifePhilosophy.any;tone='et-deep';}
  else if(intent==='playful'){pool=RL2.playful.any;tone='et-play';}
  else if(intent==='morning'){pool=RL2.morning.any;tone='et-warm';}
  else if(intent==='evening'){pool=RL2.evening.any;tone='et-warm';}
  else if(intent==='world'){pool=RL2.world.any;tone='et-deep';}
  else if(intent==='opinion'){pool=RL2.opinion.any;tone='et-firm';}
  else if(intent==='casual'){pool=RL2.casual.any;tone='et-warm';}
  else if(emotion==='excited'||emotion==='happy'){pool=[...RL.shareGoodNews.any,...RL2.laughing.any];tone='et-play';}
  else{pool=isDeep?RL.fallback.deep.map(r=>r.replace('{name}',nm)):RL.fallback.early;tone='et-warm';}

  // Pick response (avoid last used)
  // Safety: if pool is empty, use fallback
  if(!pool||!pool.length){
    pool=RL.fallback.early;
    tone='et-warm';
  }
  const last=DB.g('lastR','');
  let filtered=pool.filter(r=>r!==last);
  if(!filtered.length)filtered=pool;
  let resp=rnd(filtered);
  if(!resp)resp="I'm here. Tell me more.";

  // Template fill
  const tt=Object.entries(P.topics).sort((a,b)=>b[1]-a[1])[0];
  resp=resp
    .replace(/\{name\}/g,nm)
    .replace(/\{topic\}/g,tt?tt[0]:'things')
    .replace(/\{bond\}/g,bond)
    .replace(/\{phase\}/g,getPhaseData().name)
    .replace(/\{msgs\}/g,P.totalMsgs)
    .replace(/\{streak\}/g,P.streakDays)
    .replace(/\{days\}/g,days_since(P.joinDate)+1);

  // Short response adaptation
  if(P.prefShort&&resp.length>220){
    const sents=resp.split(/(?<=[.!?])\s+/);
    resp=sents.slice(0,2).join(' ');
  }

  // Deep bond personal touch
  if(isDeep&&P.name&&!resp.includes(P.name)&&Math.random()>.6){
    const ends=[` I'm here for you, ${P.name}.`,` You've got this, ${P.name}.`,''];
    resp+=rnd(ends);
  }

  // Value injection on advice intents
  if(['askAdvice','bigDecision','goals','motivation'].includes(intent)&&typeof valueAdviceInject==='function')resp=valueAdviceInject(resp);
  // Mirror user's language length
  if(typeof mirrorLength==='function')resp=mirrorLength(resp);
  DB.s('lastR',resp);
  return{text:resp,tone};
}

// ── EXPANDED RESPONSE LIBRARY — Casual + Human ────────────────────
const RL2 = {

  // ── CASUAL CHAT & BANTER ──────────────────────────────────────────
  casual: { any: [
    "Ha! Okay now I'm curious -- what made you think of that?",
    "That's actually interesting. Tell me more.",
    "I love that. Keep going.",
    "Okay wait, hold on -- say that again?",
    "That's a whole mood. I feel that.",
    "Honestly same. What brought this on?",
    "You're not wrong at all. What else is on your mind?",
    "I didn't expect that. Tell me more.",
    "Okay that's funny. What happened?",
    "That tracks. What else?",
    "Valid. Very valid. Go on.",
    "Hm. I'm thinking about that. Say more.",
    "Okay I need more context. What happened exactly?",
    "That's a lot to unpack. Start from the beginning.",
    "Mood. Absolute mood. What's going on?",
  ]},

  // ── FOOD & EATING ─────────────────────────────────────────────────
  food: { any: [
    "Food is genuinely one of the best things in life. What's your go-to comfort meal?",
    "Okay now I want to know -- what's the best meal you've ever had?",
    "There's something special about food that feels like home. What does that mean for you?",
    "I love that you're talking about food. Best cook in your family?",
    "Food and mood are so connected. What do you eat when you need a pick-me-up?",
    "What's the most interesting thing you've eaten recently?",
    "Okay hot take time: what's an underrated food that deserves more respect?",
    "Food memories are some of the strongest. What food takes you back somewhere?",
    "If you could only eat one cuisine for a year, what would you pick? No cheating.",
    "What's on your plate lately -- literally and otherwise?",
  ]},

  // ── MUSIC ─────────────────────────────────────────────────────────
  music: { any: [
    "Music is like a second language -- what's been in your headphones lately?",
    "I love when someone discovers a song that just hits perfectly. What's doing that for you right now?",
    "Music taste says a lot about a person. What genre do you think says the most about you?",
    "Is there a song that perfectly describes where you are right now in life?",
    "What's the song you've had on repeat this week?",
    "There's a certain kind of music for every mood. What are you listening to for this one?",
    "Concert experiences are irreplaceable. Best live show you've ever been to?",
    "Some songs just teleport you to a specific moment. What's yours?",
    "What artist do you think is genuinely underrated?",
    "First album or artist you were obsessed with? Judging you zero percent.",
  ]},

  // ── MOVIES & TV ───────────────────────────────────────────────────
  movies: { any: [
    "What's the last thing you watched that you can't stop thinking about?",
    "Movies that hit differently at different ages -- what's yours?",
    "Okay I want your honest opinion: most overrated movie everyone loves?",
    "What's a film you've watched more than three times?",
    "If your life was a movie genre, what would it be right now?",
    "Best TV show you've ever watched -- and why did it wreck you emotionally?",
    "What's something you've watched recently that surprised you?",
    "Character you've related to way too hard?",
    "What do you watch when you need to just turn your brain off?",
    "There are movies people say changed them. Has one done that for you?",
  ]},

  // ── SPORTS & FITNESS ──────────────────────────────────────────────
  sports: { any: [
    "Sports are tribal in the best way. What team or sport do you live and die for?",
    "Tell me about a sporting moment -- watching or playing -- that you'll never forget.",
    "Sport gives you that feeling of being completely present. Do you get that anywhere?",
    "Are you a player, a watcher, or both?",
    "What sport do you wish you'd started younger?",
    "The mental side of sport fascinates me -- how much of it do you think is mindset?",
    "Athletes are fascinating. Who do you think is the greatest of their generation?",
    "Fitness is interesting -- what's your relationship with it?",
    "What does movement or exercise look like in your life right now?",
    "Team sports or solo? What does that say about you?",
  ]},

  // ── TRAVEL & PLACES ───────────────────────────────────────────────
  travel: { any: [
    "Places shape people. Where have you been that changed you?",
    "Dream destination -- where and why?",
    "Home versus everywhere else -- how do you feel about where you live?",
    "The best trips are never the ones you plan perfectly. What's your best travel story?",
    "Is there a place you'd move to tomorrow if you could?",
    "What does travel mean to you -- escape, discovery, something else?",
    "Near or far -- what place do you keep going back to?",
    "The thing about different cultures is they hold up a mirror. What have you learned about yourself from being somewhere else?",
    "Where's somewhere you've been that exceeded every expectation?",
    "Where's on your list that you haven't made it to yet?",
  ]},

  // ── TECHNOLOGY & SOCIAL MEDIA ─────────────────────────────────────
  tech: { any: [
    "Technology is changing things faster than we can process. How's your relationship with your phone these days?",
    "Social media -- blessing or curse or both?",
    "What app could you not live without, and which one would you delete tomorrow if you had the courage?",
    "The attention economy is real -- how do you protect your time and focus?",
    "What's a tech thing that genuinely makes your life better?",
    "Do you think people are getting better or worse at actual conversation?",
    "What's your screen time like? No judgment -- I'm just curious.",
    "Tech has changed how we feel loneliness. What do you think about that?",
    "The internet gave us everything and broke a few things. What did it break for you personally?",
  ]},

  // ── BOOKS & LEARNING ──────────────────────────────────────────────
  books: { any: [
    "What's the last book that actually moved you?",
    "Reader, podcast person, video learner? What's your way of taking in new ideas?",
    "Is there a book that changed how you see the world?",
    "What do you find yourself reading about when you're genuinely curious?",
    "Great writing stays with you. Any lines from books you still think about?",
    "What topic could you go down a rabbit hole on for hours?",
    "Fiction or non-fiction -- where do you live?",
    "What's something you've learned recently that genuinely surprised you?",
    "If you could recommend one book to everyone you know, what would it be?",
  ]},

  // ── CAREER & WORK-LIFE ────────────────────────────────────────────
  career: { any: [
    "What did you want to be when you grew up -- and how close is reality to that?",
    "Career advice nobody tells you -- what do you wish you'd known earlier?",
    "What does 'meaningful work' mean to you?",
    "The line between hustle and burnout is blurry. Where are you on that right now?",
    "If money wasn't a factor, what would you be doing?",
    "What's the part of your work that actually energises you?",
    "Sunday evening feeling -- what does yours look like?",
    "What would you change about how you work if you could change one thing?",
    "Who's the best manager or mentor you've ever had and what made them that?",
    "What does success actually look like for you -- the real version, not the public answer?",
  ]},

  // ── CREATIVITY & HOBBIES ──────────────────────────────────────────
  creative: { any: [
    "Everyone has something creative in them. What's yours, even if you don't think of it that way?",
    "What do you do just for the love of it -- no audience, no agenda?",
    "When did you last make something? Anything.",
    "Creative block is real and frustrating. Are you going through one or coming out of one?",
    "What hobby would you pick up if you had unlimited time?",
    "Art, music, writing, cooking, building -- what's your outlet?",
    "I believe making things is fundamentally human. What do you make?",
    "What's something you're learning right now, or want to?",
    "There's a difference between a hobby and a passion. Do you have one of each?",
  ]},

  // ── FRIENDSHIP & SOCIAL ───────────────────────────────────────────
  friendship: { any: [
    "Friendship is one of life's most underrated gifts. How's your friendship situation these days?",
    "Who's the person in your life who really gets you?",
    "How do you make friends as an adult? Because honestly it's hard.",
    "Quality versus quantity when it comes to friendships -- where do you stand?",
    "Is there a friendship you miss? Someone you've drifted from?",
    "What's the quality you value most in a friend?",
    "Do you have someone you can call at 3am? That's the real question.",
    "Friendships change us. Who are you because of a friendship?",
    "What kind of friend are you, honestly?",
    "Who's someone in your life you should probably reach out to more?",
  ]},

  // ── LIFE PHILOSOPHY & BIG QUESTIONS ──────────────────────────────
  lifePhilosophy: { any: [
    "What's one belief you hold now that you definitely didn't hold five years ago?",
    "What does a good day actually look like for you?",
    "If you could tell your younger self one thing, what would it be?",
    "What do you think you're here to do? Not what you're supposed to say -- what you actually think.",
    "Regrets are interesting -- do you have any that you've genuinely made peace with?",
    "What's something you've changed your mind about completely?",
    "What matters more to you as you get older?",
    "How do you define a life well lived?",
    "Is there something you're afraid you'll regret not doing?",
    "What's something you believe that most people around you don't?",
    "What does freedom mean to you?",
    "If everything stayed exactly as it is right now -- is that okay, or is something missing?",
  ]},

  // ── HUMOUR & PLAYFUL ──────────────────────────────────────────────
  playful: { any: [
    "Okay this is important: pineapple on pizza. Where do you actually stand?",
    "Hot take: give me one opinion you'll defend to the end.",
    "If you could have any superpower but it had to be completely useless, what would you pick?",
    "What's your most irrational but completely unshakeable opinion?",
    "If your personality was a weather type, what would it be today?",
    "Describe your current mood in a film title.",
    "What's your go-to move when you need to cheer yourself up?",
    "Three words that describe you, but make them unusual.",
    "If you had to eat the same meal every day for a month, what would you pick? Think carefully.",
    "What's the funniest thing that's happened to you recently?",
    "Would you rather: always have to speak in rhyme, or only be able to speak in questions?",
    "What's something you're embarrassingly good at?",
    "What skill do you have that surprises people?",
  ]},

  // ── CURRENT EVENTS & WORLD ────────────────────────────────────────
  world: { any: [
    "The world is a lot right now. How are you processing all of it?",
    "Is there something happening in the world that you find yourself thinking about a lot?",
    "How do you take in news without losing your mind?",
    "What gives you hope about the world right now?",
    "Is there an issue you care about deeply but don't talk about enough?",
    "What change in the world would make the most difference to your daily life?",
    "How do you stay informed without drowning in it?",
  ]},

  // ── MORNING / EVENING CASUAL ─────────────────────────────────────
  morning: { any: [
    "Morning! Coffee person, tea person, or straight into chaos?",
    "Good morning! What kind of morning has it been so far?",
    "Morning energy -- what's yours like right now?",
    "What's the first thing on your mind this morning?",
    "Morning routines are fascinating. Do you have one or do you wing it?",
  ]},

  evening: { any: [
    "Evening! How's the day landing for you?",
    "End of day -- what's the emotional summary?",
    "Evenings are different, aren't they? What kind of night is it?",
    "How did today actually go? Be honest.",
    "You made it to the end of the day. What's the debrief?",
  ]},

  // ── COMPLIMENTS & WARMTH ─────────────────────────────────────────
  warmth: { any: [
    "You know what I appreciate about you? You're actually honest with me.",
    "I like the way your mind works. Where does this stuff come from?",
    "You ask interesting questions. That's rarer than people realise.",
    "There's something I notice about you -- you care. Really care. That's not nothing.",
    "You've got a way of looking at things that I genuinely find interesting.",
  ]},

  // ── WHEN USER IS BEING FUNNY ──────────────────────────────────────
  laughing: { any: [
    "Okay that's actually funny. I wasn't expecting that.",
    "Haha! Okay you got me there.",
    "That made me smile. Genuinely.",
    "You're funnier than you probably give yourself credit for.",
    "Okay that's hilarious. Continue.",
    "Ha! Where did that come from?",
    "I wasn't ready for that. Well played.",
  ]},

  // ── DEEP RANDOM LIFE OBSERVATIONS ────────────────────────────────
  observe: { any: [
    "You know what's interesting about people? They almost always know what they need -- they just need someone to ask.",
    "I've noticed that the things we resist saying out loud are usually the most important things.",
    "There's a version of you five years from now looking back at this moment. What do you think they'd say?",
    "The things that are hardest to talk about are usually the things that need talking about most.",
    "People are so much more interesting when they stop performing and just talk. Like right now.",
    "I find that the questions people ask me tell me more than the answers they give.",
    "Here's something I think about: most people are carrying something they haven't told anyone. What about you?",
  ]},

  // ── OPINIONS & DEBATE ─────────────────────────────────────────────
  opinion: { any: [
    "I want your actual opinion on this -- not the diplomatic version.",
    "Okay, take a side. You have to pick one.",
    "What's an opinion you hold that you know is unpopular?",
    "Play devil's advocate for me -- argue the opposite of what you just said.",
    "I want to push back on that a little. Ready?",
    "That's one way to see it. Here's another -- what do you think of this?",
  ]},
};
