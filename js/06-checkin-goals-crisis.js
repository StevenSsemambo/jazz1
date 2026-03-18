/* ═══════════════════════════════════════════════════════
 * Jazz Buddy — 06-checkin-goals-crisis.js
 * Daily check-in, goal tracking, crisis resources
 * SayMy Tech Developers
 * ═══════════════════════════════════════════════════════ */

// NEW: DAILY CHECK-IN RITUAL
// ══════════════════════════════════════════════════════════════════
let ciState={active:false,step:0,data:{}};
const CI_STEPS=[
  {id:'sleep',q:'Let's start with last night — how did you sleep? Rate it 1-10.',opts:['1-3 (rough)','4-6 (okay)','7-8 (decent)','9-10 (great)']},
  {id:'mood',q:'And right now — how are you feeling as you start this day? The honest version.',opts:['😊 Good','😐 Neutral','😟 Struggling','😴 Drained','😤 Frustrated','😰 Anxious']},
  {id:'oneThingMind',q:'What's the *one thing* on your mind most right now? The thing you're carrying.',opts:['Work/school','A relationship','Money','My health','A personal goal','Something I can't name yet']},
  {id:'intention',q:'Last one: what's one intention you want to hold today? Could be anything.',opts:['Stay present','Be kind to myself','Get one hard thing done','Rest properly','Connect with someone','Let go of something']}
];
function startCheckIn(){
  closePanel(true);
  ciState={active:true,step:0,data:{}};
  document.getElementById('ci-nudge').classList.remove('show');
  const nm=P.name||'friend';
  const hr=new Date().getHours();
  const greeting=hr<12?`Morning, ${nm}! 🌅 Ready for your daily check-in?`:hr<17?`Hey ${nm}! 🌤️ Afternoon check-in time.`:`Hey ${nm}! 🌙 Evening check-in.`;
  const intro=greeting+' This takes about 2 minutes and helps me understand you better every day.';
  addMsg('b',intro,'et-checkin');
  histAdd('b',intro,'neutral','checkIn');
  setTimeout(()=>showCIStep(0),600);
}
function showCIStep(idx){
  if(idx>=CI_STEPS.length){finishCheckIn();return;}
  const step=CI_STEPS[idx];
  ciState.step=idx;
  addMsg('b',step.q,'et-checkin');
  histAdd('b',step.q,'neutral','checkIn');
  // TTS handled by addMsg auto-speak
  const el=document.getElementById('qr');el.innerHTML='';
  step.opts.forEach(opt=>{
    const b=document.createElement('button');b.className='chip';b.textContent=opt;
    b.onclick=()=>{txta.value=opt;send();};
    el.appendChild(b);
  });
}
function processCIStep(text){
  const step=CI_STEPS[ciState.step];
  if(!step)return;
  ciState.data[step.id]=text;
  if(step.id==='sleep'){
    const n=parseInt(text.match(/\d+/)?.[0]);
    if(n)logHealth('sleep',n);
    else if(text.includes('rough'))logHealth('sleep',2);
    else if(text.includes('okay'))logHealth('sleep',5);
    else if(text.includes('decent'))logHealth('sleep',7);
    else if(text.includes('great'))logHealth('sleep',9);
  }
  if(step.id==='mood'){
    const moodMap={'Good':'happy','Neutral':'neutral','Struggling':'sad','Drained':'tired','Frustrated':'angry','Anxious':'anxious'};
    const found=Object.keys(moodMap).find(k=>text.includes(k));
    if(found){P.mood=moodMap[found];P.moodHist.push({m:moodMap[found],ts:Date.now()});saveP();}
  }
  const nextIdx=ciState.step+1;
  if(nextIdx<CI_STEPS.length){
    const acks={sleep:"Got it. ",mood:"Understood. ",oneThingMind:"Noted. "};
    setTimeout(()=>showCIStep(nextIdx),300);
  }else{
    setTimeout(()=>finishCheckIn(),300);
  }
}
function finishCheckIn(){
  ciState.active=false;
  const todayStr=new Date().toDateString();
  const yestStr=new Date(Date.now()-86400000).toDateString();
  if(P.lastCheckInDate===yestStr)P.checkInStreak=(P.checkInStreak||0)+1;
  else if(P.lastCheckInDate!==todayStr)P.checkInStreak=1;
  P.lastCheckInDate=todayStr;
  P.checkInTotal=(P.checkInTotal||0)+1;
  P.lastCheckInData=ciState.data;
  saveP();
  const d=ciState.data;
  const nm=P.name||'friend';
  let summary='Check-in complete. ';
  if(d.mood)summary+=`You're feeling ${d.mood.replace(/[^a-zA-Z\s]/g,'').trim()}. `;
  if(d.oneThingMind)summary+=`You're carrying "${d.oneThingMind}" with you. `;
  if(d.intention)summary+=`Intention: *${d.intention}*. `;
  if((P.checkInStreak||0)>1)summary+=`\n\nThat's ${P.checkInStreak} days in a row checking in — that consistency matters more than you know.`;
  else summary+='\n\nFirst check-in done. Come back tomorrow and we'll start seeing real patterns.';
  if(d.mood&&(d.mood.includes('Struggling')||d.mood.includes('Anxious')))summary+='\n\nYou said you're struggling. I don't want to just move on from that. What's going on?';
  else if(d.oneThingMind)summary+=`\n\nThe thing on your mind — ${d.oneThingMind}. Do you want to talk about it?`;
  addMsg('b',summary,'et-checkin');
  histAdd('b',summary,'neutral','checkIn');
  checkGoalsDue();
  setQR([{l:"Let's talk about it",t:"I want to talk about what's on my mind"},{l:"I'm good, just logging",t:"I just wanted to check in"},{l:"My goals",t:"Let's talk about my goals"},{l:"How are my patterns?",t:"Show me my stats and patterns"}]);
  refreshStats();
}

// ══════════════════════════════════════════════════════════════════
// NEW: GOAL TRACKING WITH ACCOUNTABILITY
// ══════════════════════════════════════════════════════════════════
function createGoal(title,why,category){
  const goal={id:Date.now(),title:title.trim(),why:why||'',category:category||'personal',createdAt:Date.now(),status:'active',progress:0,checkIns:[],lastCheckedIn:null,nextCheckIn:Date.now()+86400000*3};
  if(!P.goals)P.goals=[];
  P.goals.push(goal);
  saveP();
  memAdd(`Goal set: "${title}". Reason: "${why}"`,['goal','goals',category],'excited','goals');
  return goal;
}
function updateGoal(id,updates){
  const g=(P.goals||[]).find(g=>g.id==id);
  if(!g)return;
  Object.assign(g,updates);
  if(updates.status==='done'){if(!P.goalsCompleted)P.goalsCompleted=0;P.goalsCompleted++;g.progress=100;}
  saveP();
}
function checkGoalsDue(){
  if(!P.goals)return;
  const now=Date.now();
  const overdue=P.goals.filter(g=>g.status==='active'&&g.nextCheckIn&&g.nextCheckIn<now);
  if(overdue.length>0){
    const g=rnd(overdue);
    setTimeout(()=>{
      const msgs=[`Before we go — I want to ask about your goal: *"${g.title}"*. How's it going? Honestly.`,`Quick goal check-in: *"${g.title}"*. What's the latest? Any progress, even tiny?`,`I've been thinking about your goal — *"${g.title}"*. Where are you with it?`];
      addMsg('b',rnd(msgs),'et-goal');
      histAdd('b',msgs[0],'neutral','goalCheck');
      setQR([{l:"Making progress!",t:`I've been making progress on my goal`},{l:"Stuck, need help",t:`I'm stuck on my goal and need help`},{l:"I completed it!",t:`I completed my goal!`},{l:"I've paused it",t:`I've put my goal on hold for now`}]);
      updateGoal(g.id,{lastCheckedIn:now,nextCheckIn:now+86400000*3});
    },2000);
  }
}

// ══════════════════════════════════════════════════════════════════
// NEW: CRISIS RESOURCE DIRECTORY (Multi-country)
// ══════════════════════════════════════════════════════════════════
const CRISIS_DB={
  UG:[{org:'Befrienders Uganda',num:'+256 800 212 121',note:'Free, confidential',hours:'24/7'},{org:'Mental Health Uganda Helpline',num:'+256 414 270 027',note:'Mental health support',hours:'Mon-Fri 9am-5pm'}],
  KE:[{org:'Befrienders Kenya',num:'+254 722 178 177',hours:'24/7'},{org:'Kenya Red Cross Psychosocial',num:'1199',hours:'24/7'}],
  ZA:[{org:'SADAG Suicide Crisis Line',num:'0800 456 789',note:'Free',hours:'24/7'},{org:'Lifeline South Africa',num:'0861 322 322',hours:'24/7'}],
  NG:[{org:'Mentally Aware Nigeria Initiative',num:'+234 703 027 9279',hours:'9am-5pm WAT'}],
  GH:[{org:'Ghana Mental Health Authority',num:'+233 302 666 229',hours:'Office hours'}],
  TZ:[{org:'Muhimbili National Hospital',num:'+255 22 215 0561',note:'Mental health unit',hours:'Office hours'}],
  US:[{org:'988 Suicide & Crisis Lifeline',num:'Call or text 988',hours:'24/7'},{org:'Crisis Text Line',num:'Text HOME to 741741',hours:'24/7'}],
  GB:[{org:'Samaritans',num:'116 123',note:'Free',hours:'24/7'},{org:'CALM',num:'0800 58 58 58',hours:'5pm-midnight'}],
  IN:[{org:'iCall (TISS)',num:'9152987821',hours:'Mon-Sat 8am-10pm'},{org:'Vandrevala Foundation',num:'1860-2662-345',hours:'24/7'}],
  AU:[{org:'Lifeline Australia',num:'13 11 14',hours:'24/7'},{org:'Beyond Blue',num:'1300 22 4636',hours:'24/7'}],
  GLOBAL:[{org:'Crisis Text Line (US/UK/Ireland)',num:'Text HOME to 741741',hours:'24/7'},{org:'Befrienders Worldwide',num:'befrienders.org',note:'Find local support in 50+ countries',hours:'24/7'}]
};
function buildCrisisCard(){
  const lines=[...CRISIS_DB.UG,...CRISIS_DB.GLOBAL.slice(0,1)];
  let html='<div class="crisis-card"><div class="crisis-title">🆘 You are not alone. Help is available right now.</div>';
  lines.forEach(l=>{
    const tel=l.num.match(/^[+\d\s]+$/)?`href="tel:${l.num.replace(/\s/g,'')}"`:'' ;
    html+=`<div class="crisis-line"><div><div class="crisis-org">${l.org}</div><div class="crisis-country">${l.note||''} · ${l.hours}</div></div><a class="crisis-num" ${tel}>${l.num}</a></div>`;
  });
  html+='</div>';
  return html;
}
