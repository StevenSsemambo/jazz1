/* ═══════════════════════════════════════════════════════
 * Jazz Buddy -- 03-responses.js
 * SayMy Tech Developers
 * ═══════════════════════════════════════════════════════ */

// ── QUICK REPLIES ─────────────────────────────────────────────────
var QR_MAP={
  greeting:[{l:"Daily check-in",t:"Let's do my daily check-in"},{l:"I'm stressed",t:"I've been stressed lately"},{l:"Big news",t:"I have something to share"},{l:"I'm doing great",t:"I'm actually doing really well"}],
  venting:[{l:"Say more",t:"Let me explain more"},{l:"What do I do?",t:"What should I do?"},{l:"It's about work",t:"It's related to my work"},{l:"It's personal",t:"It's something personal"}],
  goals:[{l:"Help me plan",t:"Help me make a real plan"},{l:"Hold me accountable",t:"Can you hold me accountable?"},{l:"My biggest goal",t:"Let me tell you my biggest goal"}],
  healthCheck:[{l:"Sleep issues",t:"I've been having sleep issues"},{l:"Stress is high",t:"My stress levels are really high"},{l:"Log my mood",t:"I want to log how I'm feeling"},{l:"Energy check",t:"My energy has been really low"}],
  mentalHealth:[{l:"I'm safe",t:"I am safe, just needed to say that"},{l:"Tell me more",t:"I want to talk about this more"},{l:"Get support",t:"I want to know how to get support"}],
  motivation:[{l:"One small step",t:"What's one tiny thing I can do right now?"},{l:"Why I want this",t:"Let me explain why this matters to me"}],
  relationships:[{l:"More context",t:"Let me give you more context"},{l:"What should I do?",t:"What do you think I should do?"}],
  default:[{l:"How am I doing?",t:"Show me my stats"},{l:"Tell me a joke",t:"Tell me a joke"},{l:"I need advice",t:"I need some advice"},{l:"How are you?",t:"How are you doing Jazz?"}]
};
function getQR(intent){return(QR_MAP[intent]||QR_MAP.default).slice(0,4);}

// ── HEALTH MODULE UI ──────────────────────────────────────────────
function buildHealthConvo(intent,text){
  var numMatch=text.match(/\b([1-9]|10)\b/);
  var num=numMatch?parseInt(numMatch[1]):null;
  var lastB=lastBotMsg();
  if(lastB){
    var lb=lastB.text.toLowerCase();
    if(lb.includes('rate your sleep')&&num){logHealth('sleep',num);return{type:'health-log',logged:'sleep',val:num};}
    if(lb.includes('rate your stress')&&num){logHealth('stress',num);return{type:'health-log',logged:'stress',val:num};}
    if(lb.includes('rate your energy')&&num){logHealth('energy',num);return{type:'health-log',logged:'energy',val:num};}
  }
  return null;
}

// ── ONBOARDING ────────────────────────────────────────────────────
var OBQ=[
  {type:'display',
   title:'Welcome to Jazz Buddy',
   body:'I am not just a chatbot. I learn who you are, remember what matters to you, and show up every single time. Five quick questions and I will start knowing you.',
   btn:'Get started'},

  {type:'input',
   q:'What should I call you?',
   hint:'Just your first name',
   ph:'Your name',
   key:'name'},

  {type:'options',
   q:'How are you feeling about life right now?',
   hint:'No right answer here',
   key:'initMood',
   opts:[
     {l:'Pretty good',t:{A:5,N:-5},v:'happy'},
     {l:'A bit up and down',t:{N:5},v:'mixed'},
     {l:'Going through something hard',t:{N:12,depth:8},v:'sad'},
     {l:'Stressed and overwhelmed',t:{N:12,C:5},v:'anxious'}
   ]},

  {type:'options',
   q:'When something bothers you, what do you do?',
   hint:'Be honest',
   key:'coping',
   opts:[
     {l:'Talk about it out loud',t:{E:12},v:'verbal'},
     {l:'Keep it in and think alone',t:{E:-10,O:6},v:'internal'},
     {l:'Distract myself and keep busy',t:{C:7},v:'distract'},
     {l:'It depends on the situation',t:{O:5},v:'varies'}
   ]},

  {type:'options',
   q:'What kind of conversations do you want?',
   hint:'This shapes everything',
   key:'style',
   opts:[
     {l:'Deep and real',t:{depth:18,O:12},v:'deep'},
     {l:'Supportive, someone to listen',t:{A:12},v:'support'},
     {l:'A mix of real and light',t:{humor:6,depth:6},v:'mixed'},
     {l:'Practical advice and direction',t:{direct:12},v:'practical'}
   ]},

  {type:'options',
   q:'How do you feel about being challenged?',
   hint:'I can push you or hold you gently',
   key:'challenge',
   opts:[
     {l:'Challenge me, growth over comfort',t:{O:12,resilience:8},v:'yes'},
     {l:'Be gentle, I need support now',v:'gentle'},
     {l:'Read the room',t:{O:6},v:'dynamic'}
   ]},

  {type:'display',
   title:'I have got you.',
   body:'I have already started building your profile. The more we talk, the more I understand you. I am genuinely here.',
   btn:'Start talking to Jazz'}
];

var obStep=0;
var obAns={};

// These MUST be on window — called from inline onclick in rendered HTML
window.OB_PICK=function(i){
  var q=OBQ[obStep];
  if(!q||q.type!=='options')return;
  var opt=q.opts[i];
  if(!opt)return;

  // Save answer
  obAns[q.key]=opt.v;

  // Apply personality
  if(opt.t){
    var keys=Object.keys(opt.t);
    for(var k=0;k<keys.length;k++){
      var key=keys[k];
      var pmap={O:1,C:1,E:1,A:1,N:1,depth:1,humor:1,direct:1,resilience:1};
      if(pmap[key])P[key]=clamp((P[key]||50)+opt.t[key],0,100);
    }
  }

  // Visual: mark selected
  var btns=document.querySelectorAll('.ob-opt');
  for(var b=0;b<btns.length;b++){
    btns[b].style.opacity='0.4';
    btns[b].setAttribute('onclick','');// disable further clicks
  }
  if(btns[i]){
    btns[i].style.opacity='1';
    btns[i].style.background='rgba(108,92,231,.4)';
    btns[i].style.color='white';
  }

  setTimeout(window.OB_NEXT,300);
};

window.OB_NEXT=function(){
  obStep++;
  if(obStep>=OBQ.length) finishOB();
  else renderOB();
};

window.OB_SUBMIT=function(key){
  var inp=document.getElementById('ob-inp');
  var val=inp?inp.value.trim():'';
  if(!val){if(inp)inp.focus();return;}
  obAns[key]=val;
  if(key==='name'){
    P.name=val.charAt(0).toUpperCase()+val.slice(1);
    saveP();
  }
  window.OB_NEXT();
};

// Keep old names as aliases in case anything references them
function nextOB(){window.OB_NEXT();}
function subOBI(key){window.OB_SUBMIT(key);}

function renderOB(){
  var q=OBQ[obStep];
  if(!q)return;

  // Progress dots
  var prog=document.getElementById('ob-prog');
  if(prog){
    var dots='';
    for(var pi=0;pi<OBQ.length;pi++){
      dots+='<div class="op '+(pi<obStep?'done':pi===obStep?'active':'future')+'"></div>';
    }
    prog.innerHTML=dots;
  }

  var body=document.getElementById('ob-body');
  if(!body)return;

  if(q.type==='display'){
    var tt=(q.title||'').replace('{name}',P.name||obAns.name||'friend');
    var bd=(q.body||'').replace('{name}',P.name||obAns.name||'friend');
    body.innerHTML=
      '<div class="ob-q">'+tt+'</div>'+
      '<p style="color:var(--tx2);font-size:14px;line-height:1.7;margin:10px 0 20px">'+bd+'</p>'+
      '<button class="ob-btn" type="button" onclick="OB_NEXT()">'+q.btn+'</button>';

  }else if(q.type==='input'){
    body.innerHTML=
      '<div class="ob-q">'+q.q+'</div>'+
      '<div class="ob-hint">'+q.hint+'</div>'+
      '<input class="ob-input" id="ob-inp" type="text" placeholder="'+q.ph+'" autocomplete="off" autocorrect="off" autocapitalize="words" onkeydown="if(event.key===\'Enter\')OB_SUBMIT(\''+q.key+'\')"/>'+
      '<button class="ob-btn" type="button" onclick="OB_SUBMIT(\''+q.key+'\')">Continue</button>';
    setTimeout(function(){
      var el=document.getElementById('ob-inp');
      if(el)el.focus();
    },150);

  }else if(q.type==='options'){
    var html='<div class="ob-q">'+q.q+'</div>'+
              '<div class="ob-hint">'+q.hint+'</div>'+
              '<div class="ob-opts">';
    for(var oi=0;oi<q.opts.length;oi++){
      // Pure inline onclick with global function name — simplest possible
      html+='<button class="ob-opt" type="button" onclick="OB_PICK('+oi+')">'+q.opts[oi].l+'</button>';
    }
    html+='</div>';
    body.innerHTML=html;
  }
}

function finishOB(){
  if(obAns.challenge==='yes')P.likesChallenged=true;
  if(obAns.style==='deep'){P.depth=clamp(P.depth+20,0,100);P.prefTone='deep';}
  if(obAns.style==='support'){P.needsValidation=true;P.prefTone='warm';}
  if(obAns.style==='playful')P.prefTone='playful';
  if(obAns.style==='practical')P.prefTone='honest';
  P.joinDate=Date.now();P.streakDays=1;saveP();
  var prefix=window._userPrefix||'jb4_';
  localStorage.setItem(prefix+'onboarded','true');
  DB.s('onboarded',true);
  document.getElementById('ob').style.display='none';
  document.getElementById('app').style.display='flex';
  refreshStats();
  if(typeof startAppSession==='function')startAppSession();
  var nm=P.name||'friend';
  setTimeout(function(){
    addMsg('b',nm+'! Welcome to Jazz. This is your space. What is on your mind?','et-warm');
    histAdd('b','','neutral','greeting');
    setQR(getQR('greeting'));
    if(!localStorage.getItem('jb_tourDone')&&typeof startTour==='function'){
      setTimeout(startTour,3500);
    }
  },300);
}
