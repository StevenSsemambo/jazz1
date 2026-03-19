/* ═══════════════════════════════════════════════════════
 * Jazz Buddy -- 05-send.js
 * Main send() pipeline + PWA setup
 * SayMy Tech Developers
 * ═══════════════════════════════════════════════════════ */

// ── MAIN SEND ─────────────────────────────────────────────────────
function send(){
  const text=txta.value.trim();if(!text||isTyping)return;
  txta.value='';txta.style.height='46px';sbtn.disabled=true;

  addMsg('u',text);

  const{emotion,intensity}=detectEmotion(text);
  const intent=detectIntent(text);
  if(typeof updateConvState==='function')updateConvState(intent.primary,emotion,intensity,text);
  if(typeof trackEmotionalTrajectory==='function')trackEmotionalTrajectory(emotion,intensity);
  if(typeof extractCommitment==='function')extractCommitment(text);

  // Check-in intercept
  if(typeof ciState!=="undefined"&&ciState.active){
    learn(text,emotion,intensity,intent.primary);
    histAdd('u',text,emotion,intent.primary);
    processCIStep(text);
    sbtn.disabled=false;
    return;
  }

  learn(text,emotion,intensity,intent.primary);
  histAdd('u',text,emotion,intent.primary);

  // V8 multi-state intercepts
  if(typeof morningState!=="undefined"&&morningState.active){processMorningStep(text);sbtn.disabled=false;return;}
  if(typeof eveningState!=="undefined"&&eveningState.active){processEveningStep(text);sbtn.disabled=false;return;}
  if(typeof weeklyPlanState!=="undefined"&&weeklyPlanState.active){processWeeklyPlanStep(text);sbtn.disabled=false;return;}
  if(typeof bodyScanState!=="undefined"&&bodyScanState.active){processBodyScanStep(text);sbtn.disabled=false;return;}
  if(typeof focusState!=="undefined"&&focusState.active&&text.toLowerCase().includes('done')){endFocusEarly();sbtn.disabled=false;return;}

  // Relationship letter intercept
  if(typeof relLetterState!=="undefined"&&relLetterState.active){
    learn(text,emotion,intensity,intent.primary);
    histAdd('u',text,emotion,intent.primary);
    processRelLetter(text);
    sbtn.disabled=false;
    return;
  }

  // Custom emotion detector
  const customEmo=(typeof detectCustomEmotion==='function')?detectCustomEmotion(text):null;
  if(customEmo&&typeof handleCustomEmotionResponse==='function'){
    const customResp=handleCustomEmotionResponse(customEmo);
    showTyping();
    setTimeout(()=>{hideTyping();sbtn.disabled=false;addMsg('b',customResp,'et-deep');setQR(getQR('venting'));},1000);
    return;
  }

  // Emotional suppression detector
  const suppressMsg=(typeof detectSuppression==='function')?detectSuppression(text,emotion,intensity):null;
  if(suppressMsg){
    setTimeout(()=>{hideTyping();sbtn.disabled=false;addMsg('b',suppressMsg,'et-deep');setQR([{l:'You\'re right',t:'You\'re right, I\'m not really fine'},{l:'I actually am okay',t:'I actually am okay, just tired'},{l:'Let me explain',t:'Let me explain what\'s actually going on'}]);},900);
    showTyping();return;
  }

  // Clarification when confidence is low
  const clarifyMsg=(typeof needsClarification==='function')?needsClarification(intent.primary,intent.confidence,text):null;
  if(clarifyMsg&&Math.random()>.6){
    setTimeout(()=>{hideTyping();sbtn.disabled=false;addMsg('b',clarifyMsg,'et-warm');},700);
    showTyping();return;
  }

  // Health convo intercept
  const healthLog=buildHealthConvo(intent.primary,text);

  showTyping();
  const delay=['philosophical','mentalHealth','grief','trauma','venting','askAdvice','crisis'].includes(intent.primary)?1800:['sad','lonely','selfEsteem','relationships'].includes(intent.primary)?1400:900;

  setTimeout(()=>{
    try{
    hideTyping();sbtn.disabled=false;

    if(healthLog&&healthLog.type==='health-log'){
      const responses={sleep:{low:"That's pretty rough. Poor sleep affects everything -- mood, focus, energy. What do you think's been getting in the way of sleeping?",mid:"Okay. Not terrible, not great. What's your sleep like lately -- is it consistent?",high:"That's actually good to hear! Good sleep makes everything easier. How long has it been that way?"},stress:{low:"Good -- low stress is a real gift. What's keeping you so grounded right now?",mid:"Medium stress. Manageable, but not nothing. What's the main thing driving it?",high:"That's a significant stress level. Your body and mind are working overtime. What's the biggest source?"},energy:{low:"Low energy is draining in itself. When did it start feeling this way?",mid:"Medium energy. What's it been like this week overall -- consistent or up and down?",high:"Good energy! That's great. What's been going well that's giving you that?"}};
      const cat=healthLog.val<=3?'low':healthLog.val<=7?'mid':'high';
      const resp=responses[healthLog.logged][cat];
      addMsg('b',`✓ ${healthLog.logged.charAt(0).toUpperCase()+healthLog.logged.slice(1)} logged: ${healthLog.val}/10\n\n${resp}`,'et-calm');
      histAdd('b',resp,'neutral','healthCheck');
      setQR(getQR('healthCheck'));
      refreshStats();
      return;
    }

    const{text:resp,tone}=compose(intent.primary,emotion,intensity,text);
    let resp_tone=tone;

    // Apply human layer — may override response or add addon
    const humanResult = (typeof applyHumanLayer==='function')
      ? applyHumanLayer(resp, intent.primary, emotion, text, P.name||'friend')
      : {override:null, addon:null};

    const finalResp = humanResult.override || resp;

    // Memory surface (only for meaningful exchanges, not every message)
    const rec=intent.primary!=='memory'?memRecall(text,emotion,[]):null;
    const memNote=rec&&rec.surfaced===0&&rec.importance>6?`Earlier: "${rec.text.slice(0,55)}..."`:null;

    addMsg('b',finalResp,tone,memNote);
    histAdd('b',finalResp,emotion,intent.primary);

    // Human layer addon (opinion, pattern, memory, meta)
    if(humanResult.addon){
      setTimeout(()=>addMsg('b',humanResult.addon.text,humanResult.addon.tone||'et-deep'),humanResult.addon.delay||2500);
    }

    // Crisis: show resource directory
    if(intent.primary==='crisis'){
      setTimeout(()=>{
        const crisisEl=document.createElement('div');crisisEl.innerHTML=buildCrisisCard();
        const lastMsg=chatEl.lastElementChild;
        if(lastMsg)lastMsg.querySelector('.mc')?.appendChild(crisisEl);
      },600);
    }

    // Health log prompts after health messages (occasionally)
    if(HEALTH_INTENTS.includes(intent.primary)&&P.totalMsgs%6===0){
      setTimeout(()=>{
        const prompts=["One thing that helps me understand you better -- can you rate your sleep quality lately from 1-10?","Quick check -- how would you rate your stress level right now from 1-10?","How's your energy been lately? Give me a number from 1 (empty) to 10 (full)."];
        addMsg('b',rnd(prompts),'et-calm');
      },800);
    }

    // Periodic calibration (every 20 messages)
    if(P.totalMsgs>0&&P.totalMsgs%20===0&&Date.now()-P.lastCalDate>86400000*2){
      P.lastCalDate=Date.now();saveP();
      setTimeout(()=>{
        const calQ=["Quick question -- am I responding in a way that feels right to you? Too serious? Not serious enough?","I want to make sure I'm actually helping. Is there something you wish I did differently?","Check-in: am I the kind of friend you need right now, or is there something I could do better?"];
        addMsg('b',rnd(calQ),'et-deep');
      },1200);
    }

    // ── Pattern interruption
    if(checkPatternInterruption(intent.primary)&&Math.random()>.55){
      setTimeout(()=>{addMsg('b',getPatternInterruptMsg(intent.primary,P.name||'friend'),'et-firm');},1400);
    }

    // ── Emotional arc check
    const arcMsg=checkEmotionalShift();
    if(arcMsg&&Math.random()>.7){setTimeout(()=>{addMsg('b',arcMsg,'et-deep');},1800);}

    // ── Pending challenge follow-up
    const chFollow=checkPendingChallenge();
    if(chFollow){setTimeout(()=>{addMsg('b',chFollow,'et-goal');},2200);}

    // ── Relationship nudge (occasional)
    if(P.totalMsgs%12===0){const rNudge=getRelationshipNudge();if(rNudge)setTimeout(()=>addMsg('b',rNudge,'et-care'),2500);}

    // ── Weekly report trigger (Sunday or first open after 7 days)
    const isWeekly=new Date().getDay()===0&&Date.now()-P.lastWeeklyReport>604800000;
    if(isWeekly&&P.totalMsgs%3===0){setTimeout(()=>renderWeeklyReport(),3000);}

    // ── Streak milestone check
    const milestone=checkStreakMilestone(P.streakDays);
    if(milestone)setTimeout(()=>{
      let html=`<div class="milestone-msg"><div class="milestone-num">🔥${P.streakDays}</div><div class="milestone-txt">${milestone}</div></div>`;
      addMsg('b','',  'et-warm','',html);
    },2000);

    // ── Structured exercise suggestion
    const exType=shouldSuggestExercise(intent.primary,emotion,intensity);
    if(exType&&Math.random()>.65){
      setTimeout(()=>{
        const exHtml=buildExerciseCard(exType);
        const exIntros={breathing:'Anxiety like this deserves more than words. Try this:',worstBest:'Let\'s work through this properly:',journalPrompt:'Sometimes writing it out is better than talking through it. Try this:',decisionMatrix:'Let me walk you through a proper decision framework:',gratitudeScan:'Let\'s shift gears for just two minutes:'};
        addMsg('b',exIntros[exType]||'Try this:','et-calm','',exHtml);
      },1600);
    }

    // ── Mini challenge (occasional, after meaningful exchanges)
    const deepIntents=['venting','mentalHealth','goals','stress','loneliness','grief','motivation','anxiety'];
    if(deepIntents.includes(intent.primary)&&P.totalMsgs%10===0){
      const ch=issueChallenge(intent.primary,P.name||'friend');
      if(ch){
        setTimeout(()=>{
          const html=`<div class="challenge-pill" title="Your challenge">🎯 Challenge: ${ch.txt}</div>`;
          addMsg('b','I want to give you something to do before we talk next time -- something small but real:','et-goal','',html);
        },3000);
      }
    }

    // ── Reflection card after long emotional session
    if(P.totalMsgs%8===0&&deepIntents.includes(intent.primary)){
      const refHtml=buildReflectionCard(P.name||'friend');
      if(refHtml){setTimeout(()=>{addMsg('b','Before we move on -- let me reflect back what I heard:','et-deep','',refHtml);},3500);}
    }

    // ── Mood picker (occasional)
    if(P.totalMsgs%15===0&&intent.primary!=='checkIn'){setTimeout(()=>showMoodPicker(),4000);}

    // ── Variable reward: Jazz quotes user back to themselves
    if(P.totalMsgs%11===0){const wq=quoteBackWisdom();if(wq)setTimeout(()=>addMsg('b',wq,'et-deep'),4500);}

    // ── Variable reward: mirror user phrase back
    if(P.totalMsgs%7===0&&P.userPhrases&&P.userPhrases.length>1){
      const ph=getUserPhraseMirror();
      if(ph){const phResps=[`You described something once as "${ph}" -- I've been thinking about that phrase. Does that still apply to how you're feeling?`,`"${ph}" -- you said that before. Is that where you are now?`];setTimeout(()=>addMsg('b',rnd(phResps),'et-deep'),5000);}
    }

    // ── Value injection into response (retroactive -- already done, but remind on advice)
    // done inline in compose via valueAdviceInject

    // V8: Apply personality layer
    // (already done in compose for deep bonds)

    // V8: Contradiction check
    const contradict=detectContradiction(text,emotion);
    if(contradict&&Math.random()>.6)setTimeout(()=>addMsg('b',contradict,'et-deep'),2600);

    // V8: Trajectory shift
    const trajMsg=checkTrajectoryShift();
    if(trajMsg&&Math.random()>.7)setTimeout(()=>addMsg('b',trajMsg,'et-deep'),3200);

    // V8: Nuance modifier
    const nuance=getNuanceModifier(intent.primary,text);
    if(nuance&&Math.random()>.65)setTimeout(()=>addMsg('b',nuance,'et-calm'),3800);

    // V8: Commitment check
    const commitCheck=checkPendingCommitments();
    if(commitCheck)setTimeout(()=>addMsg('b',commitCheck,'et-goal'),4200);

    // V8: Habit check
    const habitMsg=checkHabitsDue&&checkHabitsDue();
    if(habitMsg)setTimeout(()=>addMsg('b',habitMsg,'et-goal'),4800);

    // V8: Decision review
    const decReview=checkDecisionReviews&&checkDecisionReviews();
    if(decReview)setTimeout(()=>addMsg('b',decReview,'et-deep'),5000);

    // V8: Memory anniversary
    const anniv=checkMemoryAnniversaries&&checkMemoryAnniversaries();
    if(anniv)setTimeout(()=>addMsg('b',anniv,'et-deep'),5200);

    // V8: Relationship milestone
    const relMilestone=checkRelationshipMilestones&&checkRelationshipMilestones();
    if(relMilestone)setTimeout(()=>addMsg('b',relMilestone,'et-warm'),2000);

    // V8: "Jazz noticed" card (occasional)
    if(P.totalMsgs%13===0)setTimeout(()=>injectNoticedCard&&injectNoticedCard(),5500);

    // V8: Deep insight (every 18 messages)
    if(P.totalMsgs%18===0){const ins=generateDeepInsight&&generateDeepInsight();if(ins)setTimeout(()=>addMsg('b',ins,'et-deep'),6000);}

    // V8: Cognitive distortion reframe
    const distortion=detectCognitiveDistortion&&detectCognitiveDistortion(text);
    if(distortion&&Math.random()>.55)setTimeout(()=>addMsg('b',distortion.reframe,'et-firm'),2800);

    // Fun injections — Jazz keeps things alive
    if(P.totalMsgs%8===0&&!['crisis','mentalHealth','grief','trauma'].includes(intent.primary)){
      const funPool=['fact','joke','hypothetical'];
      const funType=rnd(funPool);
      setTimeout(()=>{
        let funMsg='';
        if(funType==='fact'&&typeof jazzFact==='function')funMsg='Random thing I just thought of: '+jazzFact();
        else if(funType==='joke'&&typeof jazzJoke==='function')funMsg=jazzJoke();
        else if(funType==='hypothetical'&&typeof jazzHypothetical==='function')funMsg=jazzHypothetical();
        if(funMsg)addMsg('b',funMsg,'et-play');
      },5000);
    }

    // V8: Mood music (occasional, after emotional messages)
    const emotionalIntents=['venting','anxiety','stress','sad','lonely','grief','overwhelmed'];
    if(emotionalIntents.includes(intent.primary)&&P.totalMsgs%9===0){
      const query=getMoodMusic&&getMoodMusic(emotion);
      if(query){
        setTimeout(()=>{
          const yt='https://www.youtube.com/results?search_query='+encodeURIComponent(query);
          const html='<div class="music-card" onclick="window.open(\'' +yt+ '\')">'
            +'<div class="music-icon">🎵</div>'
            +'<div><div class="music-query">'+query+'</div><div class="music-label">Search on YouTube / Spotify</div></div>'
            +'</div>';
          addMsg('b','For how you are feeling right now -- look this up:','et-calm',null,html);
        },4000);
      }
    }

    // V8: Avatar state
    if(typeof setAvatarState==='function'){
      const avState=avatarFromEmotion&&avatarFromEmotion(emotion,intent.primary);
      setTimeout(()=>setAvatarState('listening'),200);
      setTimeout(()=>setAvatarState(avState||'neutral'),2000);
    }

    // V8: Emotional skin
    if(P.mood&&typeof applyEmotionalSkin==='function')applyEmotionalSkin(P.mood);

    // V8: Haptics
    if(typeof haptic==='function')haptic(resp_tone||'et-warm');

    setQR(getQR(intent.primary));
    if(typeof refreshStatsAnimated==='function')refreshStatsAnimated();else refreshStats();
    }catch(err){
      console.error('Jazz send error:',err);
      sbtn.disabled=false;
      hideTyping();
      // Show a fallback response so user knows Jazz is there
      addMsg('b',"I'm here. Tell me more.",'et-warm');
    }
  },delay);
}

// ── PHASE 7: PWA SETUP ────────────────────────────────────────────
window.deferredPrompt=window.deferredPrompt||null;
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();window.deferredPrompt=e;
  document.getElementById('install-bar').classList.add('show');
});
var _instBtn=document.getElementById('inst-btn');
if(_instBtn){
  _instBtn.onclick=async function(){
    if(!window.deferredPrompt)return;
    window.deferredPrompt.prompt();
    var r=await window.deferredPrompt.userChoice;
    if(r.outcome==='accepted')toast('Jazz Buddy installed!');
    window.deferredPrompt=null;
    var ib=document.getElementById('install-bar');
    if(ib)ib.style.display='none';
  };
}
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').catch(()=>{});}
