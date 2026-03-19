/* ═══════════════════════════════════════════════════════
 * Jazz Buddy -- 04-ui-panels.js
 * UI functions, onboarding, all panel renderers
 * SayMy Tech Developers
 * ═══════════════════════════════════════════════════════ */

// ── UI FUNCTIONS ──────────────────────────────────────────────────
const chatEl=document.getElementById('chat');
const txta=document.getElementById('txta');
const sbtn=document.getElementById('sbtn');

function arz(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,110)+'px';}
function hkey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}

let isTyping=false;
function showTyping(){
  if(isTyping)return;isTyping=true;
  const d=document.createElement('div');d.className='msg b';d.id='typ-msg';
  d.innerHTML=`<div class="mav">🎷</div><div class="mc"><div class="bbl"><div class="typ"><div class="td"></div><div class="td"></div><div class="td"></div></div></div></div>`;
  chatEl.appendChild(d);chatEl.scrollTop=chatEl.scrollHeight;
}
function hideTyping(){
  const t=document.getElementById('typ-msg');if(t)t.remove();isTyping=false;
}

function addMsg(role,text,tone='et-warm',memNote=null,extra=null){
  const d=document.createElement('div');d.className=`msg ${role}`;
  const tnames={'et-warm':'warm','et-calm':'calm','et-deep':'deep','et-play':'playful','et-care':'caring','et-real':'honest','et-firm':'direct','et-goal':'goal','et-checkin':'check-in'};
  const time=fmt_time();
  const isBuddy=role==='b';
  const etag=isBuddy?`<div class="etag ${tone}">${tnames[tone]||'warm'}</div>`:'';
  const mpill=memNote?`<div class="mpill" title="Memory recalled">💭 ${memNote}</div>`:'';
  const extraHTML=extra||'';
  // Speaking wave indicator (only on bot messages)
  const waveHTML=isBuddy?`<span class="speaking-wave"><div class="sw-bar"></div><div class="sw-bar"></div><div class="sw-bar"></div><div class="sw-bar"></div><div class="sw-bar"></div></span>`:'';
  // Speak button for each bot message
  const speakBtn=isBuddy&&text?`<button onclick="jazzSpeak(this.closest('.msg').querySelector('.bbl').textContent)" style="background:none;border:none;color:var(--tx4);cursor:pointer;font-size:11px;padding:0 4px;margin-left:4px" title="Read aloud">🔊</button>`:'';
  d.innerHTML=`
    <div class="mav">${isBuddy?'🎷':'😊'}</div>
    <div class="mc">
      ${etag}
      <div class="bbl">${text.replace(/\n/g,'<br>').replace(/\*(.*?)\*/g,'<em>$1</em>')}${waveHTML}</div>
      ${mpill}${extraHTML}
      <div class="mt">${time}${speakBtn}</div>
    </div>`;
  chatEl.appendChild(d);
  chatEl.scrollTo({top:chatEl.scrollHeight,behavior:'smooth'});

  // AUTO-SPEAK: Jazz reads every bot response aloud
  if(isBuddy && text && typeof VS!=='undefined' && (VS.ttsEnabled || VS.voiceMode)){
    // Small delay so the message renders first
    setTimeout(()=>{
      showSpeakingWave(d);
      jazzSpeak(text, ()=>{
        clearSpeakingWave();
        // Update voice mode overlay
        if(typeof VS!=='undefined' && VS.voiceMode){
          const lastJazz=document.getElementById('vmo-last-jazz');
          if(lastJazz)lastJazz.textContent=text.slice(0,200)+(text.length>200?'...':'');
        }
      });
    }, 120);
  }
}

function setQR(replies){
  const el=document.getElementById('qr');el.innerHTML='';
  replies.forEach(r=>{
    const b=document.createElement('button');b.className='chip';b.textContent=r.l;
    b.onclick=()=>{txta.value=r.t;send();};
    el.appendChild(b);
  });
}

function refreshStats(){
  const bond=bondScore();
  const days=days_since(P.joinDate)+1;
  const moodEmoji={happy:'😊',sad:'😢',anxious:'😟',excited:'🤩',tired:'😴',angry:'😤',neutral:'😐',grateful:'🙏',confused:'🤔',grieving:'💔',lonely:'🫂'};
  const ws=healthScore();
  document.getElementById('sv-days').textContent=days;
  document.getElementById('sv-msgs').textContent=P.totalMsgs;
  document.getElementById('sv-bond').textContent=bond+'%';
  document.getElementById('sv-mood').textContent=moodEmoji[P.mood]||'--';
  document.getElementById('sv-streak').textContent='🔥'+P.streakDays;
  document.getElementById('sv-goals').textContent=(P.goals||[]).filter(g=>g.status==='active').length;
}

function toast(msg){
  const t=document.getElementById('toast');t.textContent=msg;t.classList.add('on');
  setTimeout(()=>t.classList.remove('on'),3000);
}

function newChat(){
  chatEl.innerHTML='';
  const nm=P.name||'friend';
  const opens=[`Fresh start! What's on your mind, ${nm}?`,`New conversation -- I'm all yours. What's going on, ${nm}?`,`Let's talk. What's happening in your world, ${nm}?`];
  addMsg('b',rnd(opens),'et-warm');
  histAdd('b',opens[0],'neutral','greeting');
  setQR(getQR('greeting'));
  toast('New conversation ✨');
}

// ── PANEL: PROFILE ────────────────────────────────────────────────
function renderProfile(){
  const bond=bondScore();const pd=getPhaseData();
  const tt=Object.entries(P.topics).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([t])=>t).join(', ')||'Not yet tracked';
  const moodCounts=P.moodHist.reduce((a,{m})=>({...a,[m]:(a[m]||0)+1}),{});
  const topMood=Object.entries(moodCounts).sort((a,b)=>b[1]-a[1])[0];
  const recentInsight=P.insights[0];

  document.getElementById('pb-profile').innerHTML=buildVoiceSettingsHTML()+`
    <div>${['Openness','Conscientiousness','Extraversion','Agreeableness','Neuroticism'].map((n,i)=>{const keys=['O','C','E','A','N'];const cls=['tf1','tf2','tf3','tf4','tf5'];return tb(n,P[keys[i]],cls[i]);}).join('')}</div>
    <div class="bond-card">
      <div class="bond-lbl">Bond level: <strong style="color:var(--acc2)">${pd.name}</strong></div>
      <div class="bond-bar-w"><div class="bond-fill" style="width:${bond}%"></div></div>
      <div class="bond-desc">${pd.desc}</div>
      <div class="bond-dims">${Object.entries(P.bond).map(([k,v])=>`<div class="bd-item"><div class="bd-name">${k}</div><div class="bd-val">${Math.round(v)}</div></div>`).join('')}</div>
    </div>
    <div>
      <div class="psec-label">Top Topics</div>
      <div style="font-size:13px;color:var(--tx2);background:var(--s1);border:1px solid var(--b1);border-radius:var(--rs);padding:10px 12px">${tt}</div>
    </div>
    ${recentInsight?`<div class="insight"><div class="insight-title">💡 Jazz's insight about you</div><div class="insight-text">${recentInsight.text}</div></div>`:''}
    <div>
      <div class="psec-label">Daily Check-in Streak</div>
      <div style="background:var(--s1);border:1px solid var(--b1);border-radius:var(--rs);padding:12px;text-align:center">
        <span style="font-family:var(--fh);font-size:24px;color:var(--w2)">${P.checkInStreak||0}</span>
        <div style="font-size:11px;color:var(--tx3);margin-top:3px">consecutive days · ${P.checkInTotal||0} total check-ins</div>
      </div>
    </div>
    <div>
      <div class="psec-label">Personality Extras</div>
      ${tb('Humor',P.humor,'tf3')}${tb('Depth',P.depth,'tf1')}${tb('Resilience',P.resilience,'tf4')}
    </div>
    <div>
      <div class="psec-label">Stats</div>
      <div class="hgrid">
        <div class="hg-card"><div class="hg-val">${P.totalMsgs}</div><div class="hg-lbl">Messages</div></div>
        <div class="hg-card"><div class="hg-val">${P.streakDays}</div><div class="hg-lbl">Streak days</div></div>
        <div class="hg-card"><div class="hg-val">${days_since(P.joinDate)+1}</div><div class="hg-lbl">Days together</div></div>
        <div class="hg-card"><div class="hg-val">${topMood?topMood[0]:'--'}</div><div class="hg-lbl">Most common mood</div></div>
      </div>
    </div>
  `;
}

// ── PANEL: HEALTH ─────────────────────────────────────────────────
function renderHealth(){
  const h=P.health;
  const ws=healthScore();
  const moodColors={happy:'#00b894',sad:'#74b9ff',anxious:'#fdcb6e',angry:'#d63031',tired:'#636e72',excited:'#fd79a8',neutral:'#b2bec3',grieving:'#a29bfe',lonely:'#6c5ce7',grateful:'#00cec9'};
  const recentMoods=P.moodHist.slice(-20);
  const moodBars=recentMoods.map(m=>`<div class="md" style="height:${Math.random()*.6+.4}*40px;background:${moodColors[m.m]||'#b2bec3'};height:${20+Math.random()*20}px;title="${m.m}"></div>`).join('');

  document.getElementById('pb-health').innerHTML=`
    <div>
      <div class="psec-label">Wellbeing Overview</div>
      <div class="hgrid">
        <div class="hg-card"><div class="hg-val">${ws!=null?ws+'%':'--'}</div><div class="hg-lbl">Wellbeing score</div></div>
        <div class="hg-card"><div class="hg-val">${h.avgSleep!=null?h.avgSleep+'/10':'--'}</div><div class="hg-lbl">Avg sleep</div></div>
        <div class="hg-card"><div class="hg-val">${h.avgStress!=null?h.avgStress+'/10':'--'}</div><div class="hg-lbl">Avg stress</div></div>
        <div class="hg-card"><div class="hg-val">${h.avgEnergy!=null?h.avgEnergy+'/10':'--'}</div><div class="hg-lbl">Avg energy</div></div>
      </div>
    </div>
    <div>
      <div class="psec-label">Log a check-in</div>
      <div class="hm-container">
        <div class="hm-tabs">
          <div class="hm-tab active" onclick="hmTab(this,'sleep')">Sleep</div>
          <div class="hm-tab" onclick="hmTab(this,'stress')">Stress</div>
          <div class="hm-tab" onclick="hmTab(this,'energy')">Energy</div>
        </div>
        <div class="hm-body" id="hm-body">
          <div class="hm-label">Rate last night's sleep (1=terrible, 10=perfect)</div>
          <input type="range" class="hm-slider" id="hm-slider" min="1" max="10" value="5" oninput="document.getElementById('hm-val').textContent=this.value"/>
          <div style="text-align:center;font-family:var(--fh);font-size:22px;color:var(--acc2);margin:4px 0" id="hm-val">5</div>
          <div class="hm-scale"><span>1</span><span>5</span><span>10</span></div>
          <button class="ob-btn" style="margin-top:12px;padding:10px" onclick="logFromPanel()">Log it</button>
        </div>
      </div>
    </div>
    <div>
      <div class="psec-label">Mood history (last 20)</div>
      <div class="mood-hist">
        <div class="mood-dots">${recentMoods.length?recentMoods.map(m=>`<div class="md" style="height:${18+Math.random()*22}px;background:${moodColors[m.m]||'#b2bec3'};flex:1;border-radius:3px" title="${m.m}"></div>`).join(''):'<span style="font-size:12px;color:var(--tx4)">No mood data yet -- just keep talking to Jazz</span>'}</div>
      </div>
    </div>
    ${P.moodHist.length>10?`<div class="insight"><div class="insight-title">💡 Health insight</div><div class="insight-text">${getHealthInsight()}</div></div>`:''}
  `;
}

let activeHmTab='sleep';
function hmTab(el,type){
  activeHmTab=type;
  document.querySelectorAll('.hm-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  const labels={sleep:"Rate last night's sleep (1=terrible, 10=perfect)",stress:"Rate your current stress level (1=none, 10=extreme)",energy:"Rate your current energy level (1=depleted, 10=full)"};
  document.querySelector('.hm-label').textContent=labels[type];
}
function logFromPanel(){
  const val=parseInt(document.getElementById('hm-slider').value);
  logHealth(activeHmTab,val);
  toast(`${activeHmTab.charAt(0).toUpperCase()+activeHmTab.slice(1)} logged: ${val}/10 ✓`);
  renderHealth();
}
function getHealthInsight(){
  const h=P.health;
  const moodCounts=P.moodHist.reduce((a,{m})=>({...a,[m]:(a[m]||0)+1}),{});
  const topMood=Object.entries(moodCounts).sort((a,b)=>b[1]-a[1])[0];
  if(h.avgSleep&&h.avgSleep<5)return "Your sleep quality is quite low. Poor sleep is one of the biggest drivers of low mood and high stress. This might be worth addressing first.";
  if(h.avgStress&&h.avgStress>7)return "Your stress levels are consistently high. Prolonged high stress has real physical and mental effects. What's the biggest driver?";
  if(topMood&&topMood[0]==='anxious'&&topMood[1]>3)return "You've been feeling anxious quite a bit lately. Anxiety is manageable -- but it helps to identify the main sources.";
  if(topMood&&topMood[0]==='happy'&&topMood[1]>5)return "Your mood has been mostly positive lately. That's genuinely good. Keep doing what you're doing.";
  return "Keep logging your health data -- the more I know, the more I can help you understand patterns in how you're feeling.";
}

// ── PANEL: MEMORIES ───────────────────────────────────────────────
function renderMem(){
  const sorted=[...MEMS].sort((a,b)=>b.importance-a.importance).slice(0,30);
  const pinned=sorted.filter(m=>m.pinned);
  const regular=sorted.filter(m=>!m.pinned);
  const timeAgo=(ts)=>{const d=days_since(ts);return d===0?'today':d===1?'yesterday':d<7?`${d} days ago`:d<30?`${Math.floor(d/7)} weeks ago`:`${Math.floor(d/30)} months ago`;};

  document.getElementById('pb-mem').innerHTML=`
    <div style="font-size:12.5px;color:var(--tx3);background:var(--s1);border:1px solid var(--b1);border-radius:var(--rs);padding:10px 12px">
      Jazz stores important things you share -- goals, feelings, experiences. These are ${MEMS.length} things Jazz remembers about you.
    </div>
    ${pinned.length?`<div><div class="psec-label">📌 Pinned</div>${pinned.map(m=>`<div class="mem-item"><div class="mtag">${m.tags[0]||'note'} · ${m.emotion}</div>${m.text.slice(0,120)}${m.text.length>120?'...':''}<div class="mem-time">${timeAgo(m.ts)}</div></div>`).join('')}</div>`:''}
    <div>
      <div class="psec-label">Recent memories (${Math.min(regular.length,20)} of ${MEMS.length})</div>
      ${regular.length?regular.slice(0,20).map(m=>`<div class="mem-item"><div class="mtag">${m.tags[0]||'note'} · ${m.emotion}</div>${m.text.slice(0,120)}${m.text.length>120?'...':''}<div class="mem-time">${timeAgo(m.ts)}</div></div>`).join(''):'<div style="font-size:13px;color:var(--tx4);padding:12px">No memories yet -- share something meaningful with Jazz and it will be remembered here.</div>'}
    </div>
    <button onclick="if(confirm('Clear all memories?')){MEMS=[];DB.s(\'MEMS\',MEMS);renderMem();toast(\'Memories cleared\');}" style="background:rgba(214,48,49,.1);border:1px solid rgba(214,48,49,.3);color:#ff7675;border-radius:var(--rs);padding:8px 14px;font-size:12px;cursor:pointer;font-family:var(--fb)">Clear all memories</button>
  `;
}


// ── PANEL: GOALS ──────────────────────────────────────────────────
function renderGoals(){
  if(!P.goals)P.goals=[];
  const active=P.goals.filter(g=>g.status==='active');
  const done=P.goals.filter(g=>g.status==='done');
  document.getElementById('pb-goals').innerHTML=`
    <div>
      <div class="psec-label">Add a new goal</div>
      <div class="goal-form">
        <input id="g-title" placeholder="What's the goal? Be specific…"/>
        <input id="g-why" placeholder="Why does this matter to you?"/>
        <select id="g-cat">
          <option value="personal">Personal growth</option>
          <option value="career">Career / Work</option>
          <option value="health">Health & Fitness</option>
          <option value="financial">Financial</option>
          <option value="relationships">Relationships</option>
          <option value="education">Education</option>
          <option value="creative">Creative</option>
          <option value="spiritual">Spiritual</option>
        </select>
        <button class="ob-btn" style="padding:11px;font-size:14px" onclick="addGoalFromPanel()">Set this goal 🎯</button>
      </div>
    </div>
    ${active.length?`<div><div class="psec-label">Active goals (${active.length})</div>${active.map(g=>`
      <div class="goal-card">
        <div class="goal-title">${g.title}</div>
        <div class="goal-meta">
          <span>📂 ${g.category}</span>
          ${g.why?`<span>💬 ${g.why.slice(0,35)}${g.why.length>35?'...':''}</span>`:''}
          ${g.lastCheckedIn?`<span>✓ Checked ${days_since(g.lastCheckedIn)}d ago</span>`:'<span>Not yet checked in</span>'}
        </div>
        <div class="goal-prog"><div class="goal-bar" style="width:${g.progress}%"></div></div>
        <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">
          <button class="action-btn" onclick="goalAction('${g.id}','done')" style="color:var(--gn);border-color:rgba(0,184,148,.3)">✓ Mark done</button>
          <button class="action-btn" onclick="goalAction('${g.id}','checkin')">Check in</button>
          <button class="action-btn" onclick="goalAction('${g.id}','pause')" style="font-size:11px">Pause</button>
        </div>
      </div>
    `).join('')}</div>`:'<div style="font-size:13px;color:var(--tx3);padding:8px 0">No active goals yet. Add one above -- or just tell Jazz about a goal in chat. It gets tracked automatically.</div>'}
    ${done.length?`<div><div class="psec-label">Completed 🏆 (${done.length})</div>${done.map(g=>`<div class="goal-card goal-status-done"><div class="goal-title">✓ ${g.title}</div><div class="goal-meta"><span>${g.category}</span></div></div>`).join('')}</div>`:'' }
  `;
}
function addGoalFromPanel(){
  const title=document.getElementById('g-title').value.trim();
  const why=document.getElementById('g-why').value.trim();
  const cat=document.getElementById('g-cat').value;
  if(!title){toast('Add a goal title first');return;}
  createGoal(title,why,cat);
  closePanel();
  toast('Goal set! 🎯 Jazz will check in on it.');
  refreshStats();
  setTimeout(()=>{
    addMsg('b',`Goal locked in: *"${title}"*. ${why?`The reason -- "${why}" -- is what will pull you forward when motivation dips. `:''}I'll check in on this in a few days. What's the very first step?`,'et-goal');
    histAdd('b','','neutral','goals');
    setQR(getQR('goals'));
  },400);
}
function goalAction(id,action){
  const g=(P.goals||[]).find(g=>g.id==id);
  if(!g)return;
  if(action==='done'){
    updateGoal(id,{status:'done',progress:100});
    toast('Goal completed! 🏆');
    closePanel();
    setTimeout(()=>{
      addMsg('b',`YOU DID IT! 🏆 *"${g.title}"* -- DONE. That is not nothing. That is real. How does it feel?`,'et-play');
      histAdd('b','','neutral','shareGoodNews');
    },400);
  }else if(action==='pause'){
    updateGoal(id,{status:'paused'});
    toast('Goal paused');
    renderGoals();
  }else if(action==='checkin'){
    closePanel();
    const msgs=[`Let's check in on *"${g.title}"*. Where are you with it? Be honest -- progress, setbacks, all of it.`,`*"${g.title}"* -- update time. What's happened since you set this goal?`];
    addMsg('b',rnd(msgs),'et-goal');
    histAdd('b','','neutral','goalProgress');
    setQR(getQR('goalProgress'));
  }
  refreshStats();
}

function tb(label,val,cls){
  return`<div class="trt"><div class="trt-hd"><span class="trt-n">${label}</span><span class="trt-v">${Math.round(val)}</span></div><div class="trt-bar"><div class="trt-fill ${cls}" style="width:${Math.round(val)}%"></div></div></div>`;
}

function openPanel(type){
  closePanel(true);
  if(type==='profile')renderProfile();
  else if(type==='health')renderHealth();
  else if(type==='mem')renderMem();
  else if(type==='goals')renderGoals();
  else if(type==='journal')renderJournal();
  else if(type==='affirmations')renderAffirmations();
  else if(type==='bookmarks')renderBookmarksPanel();
  else if(type==='fingerprint')renderFingerprintPanel();
  else if(type==='settings')renderSettings();
  else if(type==='letter')renderLetter();
  document.getElementById(`panel-${type}`).classList.add('on');
  document.getElementById('povly').classList.add('on');
}
function closePanel(silent=false){
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('on'));
  document.getElementById('povly').classList.remove('on');
}

// ── V8 PANEL: BOOKMARKS ───────────────────────────────────────────
function renderBookmarksPanel(){
  document.getElementById('pb-bookmarks').innerHTML=`
    <div style="font-size:12.5px;color:var(--tx3);margin-bottom:14px">Messages from Jazz that you've saved. Long-press any Jazz message to save it here.</div>
    ${renderBookmarks&&renderBookmarks()}
    ${(P.bookmarks||[]).length?`<button onclick="P.bookmarks=[];saveP();renderBookmarksPanel();toast('Highlights cleared')" style="background:rgba(214,48,49,.08);border:1px solid rgba(214,48,49,.25);color:#ff7675;border-radius:var(--rs);padding:7px 14px;font-size:12px;cursor:pointer;font-family:var(--fb);margin-top:8px">Clear all</button>`:''}
  `;
}

// ── V8 PANEL: EMOTIONAL FINGERPRINT ──────────────────────────────
function renderFingerprintPanel(){
  document.getElementById('pb-fingerprint').innerHTML=`
    <div style="font-size:12.5px;color:var(--tx3);margin-bottom:16px">Your emotional fingerprint is built from everything you've shared with Jazz. It's a mirror, not a diagnosis.</div>
    <div class="fingerprint-wrap">${renderEmotionalFingerprintCard&&renderEmotionalFingerprintCard()}</div>
    ${P.totalMsgs>30?`<div class="insight" style="margin-top:14px"><div class="insight-title">What this means</div><div class="insight-text">This radar shows 6 dimensions of your emotional life as Jazz has observed them. No dimension is better or worse than another. The shape is yours.</div></div>`:''}
  `;
}

// ── MORE MENU ─────────────────────────────────────────────────────
function openMoreMenu(){
  var m = document.getElementById('more-menu');
  var o = document.getElementById('more-menu-overlay');
  if(m) m.classList.add('on');
  if(o) o.classList.add('on');
}
function closeMoreMenu(){
  var m = document.getElementById('more-menu');
  var o = document.getElementById('more-menu-overlay');
  if(m) m.classList.remove('on');
  if(o) o.classList.remove('on');
}
