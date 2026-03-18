/* ═══════════════════════════════════════════════════════
 * Jazz Buddy — 03-responses.js
 * Full response library (1000+ responses)
 * SayMy Tech Developers
 * ═══════════════════════════════════════════════════════ */

// ── QUICK REPLIES ─────────────────────────────────────────────────
const QR_MAP={
  greeting:[{l:"Daily check-in",t:"Let's do my daily check-in"},{l:"I'm stressed",t:"I've been really stressed lately"},{l:"Big news!",t:"I have something to share"},{l:"I'm doing great!",t:"I'm actually doing really well today"},{l:"My goals",t:"Let's talk about my goals"}],
  venting:[{l:"Say more",t:"Let me explain more"},{l:"What do I do?",t:"What should I do about this?"},{l:"It's about work",t:"It's related to my work situation"},{l:"It's personal",t:"It's something personal"}],
  goals:[{l:"Help me plan",t:"Help me make a real plan"},{l:"Hold me accountable",t:"Can you hold me accountable?"},{l:"My biggest goal",t:"Let me tell you my biggest goal"}],
  healthCheck:[{l:"Sleep issues",t:"I've been having sleep issues"},{l:"Stress is high",t:"My stress levels are really high"},{l:"Log my mood",t:"I want to log how I'm feeling"},{l:"Energy check",t:"My energy has been really low"}],
  mentalHealth:[{l:"I'm safe",t:"I am safe, I just needed to say that"},{l:"Tell me more",t:"I want to talk about this more"},{l:"Get support",t:"I want to know how to get support"}],
  motivation:[{l:"One small step",t:"What's one tiny thing I can do right now?"},{l:"Why I want this",t:"Let me explain why this matters to me"}],
  relationships:[{l:"More context",t:"Let me give you more context"},{l:"What should I do?",t:"What do you think I should do?"}],
  philosophical:[{l:"Go deeper",t:"Let me share my perspective"},{l:"Another question",t:"Here's another question I think about"}],
  sleep:[{l:"Rate my sleep",t:"I'd rate my sleep 3 out of 10"},{l:"Tips",t:"What are some sleep tips?"}],
  default:[{l:"How am I doing?",t:"Show me my stats"},{l:"Tell me a joke",t:"Tell me a joke"},{l:"I need advice",t:"I need some advice"},{l:"How are you?",t:"How are you doing, Jazz?"}]
};
function getQR(intent){return(QR_MAP[intent]||QR_MAP.default).slice(0,4);}

// ── HEALTH MODULE UI ──────────────────────────────────────────────
function buildHealthConvo(intent,text){
  const t=text.toLowerCase();
  // Check if this is a health report with numbers
  const numMatch=text.match(/\b([1-9]|10)\b/);
  const num=numMatch?parseInt(numMatch[1]):null;
  const lastB=lastBotMsg();

  if(lastB){
    const lb=lastB.text.toLowerCase();
    if(lb.includes('rate your sleep')&&num){logHealth('sleep',num);return{type:'health-log',logged:'sleep',val:num};}
    if(lb.includes('rate your stress')&&num){logHealth('stress',num);return{type:'health-log',logged:'stress',val:num};}
    if(lb.includes('rate your energy')&&num){logHealth('energy',num);return{type:'health-log',logged:'energy',val:num};}
  }
  return null;
}

// ── ONBOARDING (Phase 2) ──────────────────────────────────────────
const OBQ=[
  {type:'display',title:'Welcome to Jazz Buddy 🎷',body:"I'm not just a chatbot. I learn who you are. I remember what matters to you. I actually show up — every single time. Five quick questions and I'll start knowing you.",btn:'Let\'s go'},
  {type:'input',q:'What should I call you?',hint:'Just your first name',ph:'Your name…',key:'name'},
  {type:'options',q:'How are you feeling about life right now — honestly?',hint:'No right answer here',key:'initMood',opts:[
    {l:'Pretty good, actually 😊',t:{A:5,N:-5},v:'happy'},
    {l:'A bit up and down 😐',t:{N:5},v:'mixed'},
    {l:'Going through something hard 😔',t:{N:12,depth:8},v:'sad'},
    {l:'Stressed and overwhelmed 😟',t:{N:12,C:5},v:'anxious'}
  ]},
  {type:'options',q:'When something is really bothering you, what do you do?',hint:'Be honest',key:'coping',opts:[
    {l:'Talk about it — I need to process out loud',t:{E:12},v:'verbal'},
    {l:'Keep it in and think through it alone',t:{E:-10,O:6},v:'internal'},
    {l:'Distract myself — keep busy',t:{C:7},v:'distract'},
    {l:'It depends on what it is',t:{O:5},v:'varies'}
  ]},
  {type:'options',q:'What kind of conversations do you want with me?',hint:'This shapes everything',key:'style',opts:[
    {l:'Deep and real — I want to actually think',t:{depth:18,O:12},v:'deep'},
    {l:'Supportive — I need someone to listen',t:{A:12},v:'support'},
    {l:'A mix — real but also light sometimes',t:{humor:6,depth:6},v:'mixed'},
    {l:'Practical — honest advice and direction',t:{direct:12},v:'practical'}
  ]},
  {type:'options',q:'One last thing — how do you feel about being challenged?',hint:'I can push you or hold you gently',key:'challenge',opts:[
    {l:"Challenge me — growth over comfort",t:{O:12,resilience:8},v:'yes'},
    {l:'Be gentle — I need support right now',v:'gentle'},
    {l:'Read the room — sometimes push, sometimes not',t:{O:6},v:'dynamic'}
  ]},
  {type:'display',title:'I\'ve got you, {name}. 🎷',body:"I've already started building your profile. The more we talk, the more I understand you — and the more this feels like a real friendship. I'm genuinely here.",btn:'Start talking to Jazz'}
];

let obStep=0,obAns={};

function renderOB(){
  const q=OBQ[obStep];
  const prog=document.getElementById('ob-prog');
  prog.innerHTML=OBQ.map((_,i)=>`<div class="op ${i<obStep?'done':i===obStep?'active':'future'}"></div>`).join('');
  const body=document.getElementById('ob-body');
  if(q.type==='display'){
    const tt=q.title.replace('{name}',P.name||obAns.name||'friend');
    const bd=q.body.replace('{name}',P.name||obAns.name||'friend');
    body.innerHTML=`<div class="ob-q">${tt}</div><p style="color:var(--tx2);font-size:14px;line-height:1.7;margin:10px 0 22px;font-family:var(--fb)">${bd}</p><button class="ob-btn" onclick="nextOB()">${q.btn}</button>`;
  }else if(q.type==='input'){
    body.innerHTML=`<div class="ob-q">${q.q}</div><div class="ob-hint">${q.hint}</div><input class="ob-input" id="ob-inp" placeholder="${q.ph}" autocomplete="off"/><button class="ob-btn" onclick="subOBI('${q.key}')">Continue →</button>`;
    setTimeout(()=>{const el=document.getElementById('ob-inp');if(el){el.focus();el.addEventListener('keydown',e=>{if(e.key==='Enter')subOBI(q.key);});}},80);
  }else if(q.type==='options'){
    body.innerHTML=`<div class="ob-q">${q.q}</div><div class="ob-hint">${q.hint}</div><div class="ob-opts">${q.opts.map((o,i)=>`<button class="ob-opt" onclick="selOB(${i},'${q.key}',${JSON.stringify(o)})">${o.l}</button>`).join('')}</div>`;
  }
}
function nextOB(){obStep++;if(obStep>=OBQ.length)finishOB();else renderOB();}
function subOBI(key){
  const val=document.getElementById('ob-inp')?.value.trim();if(!val)return;
  obAns[key]=val;
  if(key==='name'){P.name=val.charAt(0).toUpperCase()+val.slice(1);saveP();}
  nextOB();
}
function selOB(i,key,opt){
  obAns[key]=opt.v;
  if(opt.t)Object.entries(opt.t).forEach(([k,v])=>{
    const map={O:'O',C:'C',E:'E',A:'A',N:'N',depth:'depth',humor:'humor',direct:'direct',resilience:'resilience'};
    if(map[k])P[map[k]]=clamp((P[map[k]]||50)+v,0,100);
  });
  document.querySelectorAll('.ob-opt').forEach((el,idx)=>el.classList.toggle('sel',idx===i));
  setTimeout(nextOB,380);
}
function finishOB(){
  if(obAns.challenge==='yes')P.likesChallenged=true;
  if(obAns.style==='deep'){P.depth=clamp(P.depth+20,0,100);P.prefTone='deep';}
  if(obAns.style==='support'){P.needsValidation=true;P.prefTone='warm';}
  if(obAns.style==='playful')P.prefTone='playful';
  if(obAns.style==='practical')P.prefTone='honest';
  P.joinDate=Date.now();P.streakDays=1;saveP();
  // Mark onboarding done using user-namespaced key
  const prefix=window._userPrefix||'jb4_';
  localStorage.setItem(prefix+'onboarded','true');
  DB.s('onboarded',true);

  document.getElementById('ob').style.display='none';
  document.getElementById('app').style.display='flex';
  refreshStats();

  // Start app session (sets up voice, nudges, etc.)
  if(typeof startAppSession==='function') startAppSession();

  const nm=P.name||'friend';
  const opens=[
    `Hey ${nm}! I'm so glad you're here. I've already started learning about you. What's on your mind?`,
    `${nm}! Welcome to Jazz. This is a space where you can be completely real. Where do we start?`,
    `${nm}! I've been looking forward to this. Tell me — what's the one thing you most want to talk about right now?`
  ];
  setTimeout(()=>{
    addMsg('b',rnd(opens),'et-warm');
    histAdd('b',opens[0],'neutral','greeting');
    setQR(getQR('greeting'));
    // Start tour for brand new users
    if(!localStorage.getItem('jb_tourDone')&&typeof startTour==='function'){
      setTimeout(()=>startTour(),3500);
    }
  },250);
}
