/* ═══════════════════════════════════════════════════════
 * Jazz Buddy -- 03-responses.js
 * Onboarding, quick replies, health convo
 * SayMy Tech Developers
 * ═══════════════════════════════════════════════════════ */

// ── QUICK REPLIES ─────────────────────────────────────────────────
var QR_MAP={
  greeting:[{l:"Daily check-in",t:"Let's do my daily check-in"},{l:"I'm stressed",t:"I've been really stressed lately"},{l:"Big news",t:"I have something to share"},{l:"I'm doing great",t:"I'm actually doing really well today"}],
  venting:[{l:"Say more",t:"Let me explain more"},{l:"What do I do?",t:"What should I do about this?"},{l:"It's about work",t:"It's related to my work"},{l:"It's personal",t:"It's something personal"}],
  goals:[{l:"Help me plan",t:"Help me make a real plan"},{l:"Hold me accountable",t:"Can you hold me accountable?"},{l:"My biggest goal",t:"Let me tell you my biggest goal"}],
  healthCheck:[{l:"Sleep issues",t:"I've been having sleep issues"},{l:"Stress is high",t:"My stress levels are really high"},{l:"Log my mood",t:"I want to log how I'm feeling"},{l:"Energy check",t:"My energy has been really low"}],
  mentalHealth:[{l:"I'm safe",t:"I am safe, just needed to say that"},{l:"Tell me more",t:"I want to talk about this more"},{l:"Get support",t:"I want to know how to get support"}],
  motivation:[{l:"One small step",t:"What's one tiny thing I can do right now?"},{l:"Why I want this",t:"Let me explain why this matters to me"}],
  relationships:[{l:"More context",t:"Let me give you more context"},{l:"What should I do?",t:"What do you think I should do?"}],
  philosophical:[{l:"Go deeper",t:"Let me share my perspective"},{l:"Another question",t:"Here's another question I think about"}],
  sleep:[{l:"Rate my sleep",t:"I rate my sleep 3 out of 10"},{l:"Tips",t:"What are some sleep tips?"}],
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
  {type:'display',title:'Welcome to Jazz Buddy',body:"I am not just a chatbot. I learn who you are, remember what matters to you, and show up every single time. Five quick questions and I will start knowing you.",btn:'Get started'},
  {type:'input',q:'What should I call you?',hint:'Just your first name',ph:'Your name',key:'name'},
  {type:'options',q:'How are you feeling about life right now?',hint:'No right answer here',key:'initMood',opts:[
    {l:'Pretty good',t:{A:5,N:-5},v:'happy'},
    {l:'A bit up and down',t:{N:5},v:'mixed'},
    {l:'Going through something hard',t:{N:12,depth:8},v:'sad'},
    {l:'Stressed and overwhelmed',t:{N:12,C:5},v:'anxious'}
  ]},
  {type:'options',q:'When something bothers you, what do you do?',hint:'Be honest',key:'coping',opts:[
    {l:'Talk about it out loud',t:{E:12},v:'verbal'},
    {l:'Keep it in and think alone',t:{E:-10,O:6},v:'internal'},
    {l:'Distract myself and keep busy',t:{C:7},v:'distract'},
    {l:'It depends on the situation',t:{O:5},v:'varies'}
  ]},
  {type:'options',q:'What kind of conversations do you want?',hint:'This shapes everything',key:'style',opts:[
    {l:'Deep and real',t:{depth:18,O:12},v:'deep'},
    {l:'Supportive, someone to listen',t:{A:12},v:'support'},
    {l:'A mix of real and light',t:{humor:6,depth:6},v:'mixed'},
    {l:'Practical advice and direction',t:{direct:12},v:'practical'}
  ]},
  {type:'options',q:'How do you feel about being challenged?',hint:'I can push you or hold you gently',key:'challenge',opts:[
    {l:'Challenge me, growth over comfort',t:{O:12,resilience:8},v:'yes'},
    {l:'Be gentle, I need support now',v:'gentle'},
    {l:'Read the room, sometimes push sometimes not',t:{O:6},v:'dynamic'}
  ]},
  {type:'display',title:'I have got you.',body:"I have already started building your profile. The more we talk, the more I understand you. I am genuinely here.",btn:'Start talking to Jazz'}
];

var obStep=0;
var obAns={};

// Store current opts on window so inline onclick always finds them
window._OB_CURRENT_OPTS=[];
window._OB_CURRENT_KEY='';

function renderOB(){
  var q=OBQ[obStep];

  // Progress dots
  var prog=document.getElementById('ob-prog');
  if(prog){
    var dots='';
    for(var pi=0;pi<OBQ.length;pi++){
      var cls=pi<obStep?'done':pi===obStep?'active':'future';
      dots+='<div class="op '+cls+'"></div>';
    }
    prog.innerHTML=dots;
  }

  var body=document.getElementById('ob-body');
  if(!body)return;

  if(q.type==='display'){
    var tt=q.title.replace('{name}',P.name||obAns.name||'friend');
    var bd=q.body.replace('{name}',P.name||obAns.name||'friend');
    body.innerHTML=
      '<div class="ob-q">'+tt+'</div>'+
      '<p style="color:var(--tx2);font-size:14px;line-height:1.7;margin:10px 0 20px">'+bd+'</p>'+
      '<button class="ob-btn" type="button" onclick="nextOB()">'+q.btn+'</button>';

  }else if(q.type==='input'){
    body.innerHTML=
      '<div class="ob-q">'+q.q+'</div>'+
      '<div class="ob-hint">'+q.hint+'</div>'+
      '<input class="ob-input" id="ob-inp" type="text" placeholder="'+q.ph+'" autocomplete="off" autocorrect="off" autocapitalize="words"/>'+
      '<button class="ob-btn" type="button" onclick="subOBI(\''+q.key+'\')">Continue</button>';
    setTimeout(function(){
      var el=document.getElementById('ob-inp');
      if(el){el.focus();el.onkeydown=function(e){if(e.key==='Enter')subOBI(q.key);};}
    },150);

  }else if(q.type==='options'){
    // Render HTML with data-index attributes (no onclick)
    var html=
      '<div class="ob-q">'+q.q+'</div>'+
      '<div class="ob-hint">'+q.hint+'</div>'+
      '<div class="ob-opts" id="ob-opts-list">';
    for(var oi=0;oi<q.opts.length;oi++){
      html+='<div class="ob-opt" data-idx="'+oi+'">'+q.opts[oi].l+'</div>';
    }
    html+='</div>';
    body.innerHTML=html;

    // Use setTimeout(0) to ensure DOM is fully painted before attaching listener
    var _opts=q.opts;
    var _key=q.key;
    setTimeout(function(){
      var optsList=document.getElementById('ob-opts-list');
      if(!optsList){ console.error('ob-opts-list not found'); return; }
      var _picked=false;
      optsList.addEventListener('click',function(e){
        if(_picked)return;
        var target=e.target;
        // Walk up to find ob-opt div
        while(target&&target!==optsList){
          if(target.classList&&target.classList.contains('ob-opt')){
            var idx=parseInt(target.getAttribute('data-idx'));
            if(!isNaN(idx)){
              _picked=true;
              _doObPick(idx,_key,_opts,optsList);
            }
            break;
          }
          target=target.parentElement;
        }
      });
    },0); // end setTimeout
  }
}

function _doObPick(i,key,opts,container){
  if(!opts||!opts[i])return;
  // Visual feedback
  var allOpts=container?container.querySelectorAll('.ob-opt'):document.querySelectorAll('.ob-opt');
  for(var a=0;a<allOpts.length;a++){
    allOpts[a].style.pointerEvents='none';
    allOpts[a].style.opacity='0.5';
  }
  allOpts[i].style.opacity='1';
  allOpts[i].style.background='rgba(108,92,231,.3)';
  allOpts[i].style.borderColor='var(--acc)';
  allOpts[i].style.color='var(--tx)';

  // Save answer
  obAns[key]=opts[i].v;

  // Apply personality traits
  var opt=opts[i];
  if(opt.t){
    var map={O:'O',C:'C',E:'E',A:'A',N:'N',depth:'depth',humor:'humor',direct:'direct',resilience:'resilience'};
    var ks=Object.keys(opt.t);
    for(var ti=0;ti<ks.length;ti++){
      var k=ks[ti];
      if(map[k])P[map[k]]=clamp((P[map[k]]||50)+opt.t[k],0,100);
    }
  }

  setTimeout(nextOB,280);
};
// Also make nextOB, subOBI global for inline onclicks
window.nextOB=function nextOB(){obStep++;if(obStep>=OBQ.length)finishOB();else renderOB();}
function nextOB(){obStep++;if(obStep>=OBQ.length)finishOB();else renderOB();}

window.subOBI=function(key){
  var inp=document.getElementById('ob-inp');
  var val=inp?inp.value.trim():'';
  if(!val)return;
  obAns[key]=val;
  if(key==='name'){P.name=val.charAt(0).toUpperCase()+val.slice(1);saveP();}
  nextOB();
};
function subOBI(key){window.subOBI(key);}

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
  var msg=nm+'! Welcome to Jazz. This is your space. What is on your mind?';
  setTimeout(function(){
    addMsg('b',msg,'et-warm');
    histAdd('b',msg,'neutral','greeting');
    setQR(getQR('greeting'));
    if(!localStorage.getItem('jb_tourDone')&&typeof startTour==='function'){
      setTimeout(startTour,3500);
    }
  },300);
}
