/* ═══════════════════════════════════════════════════════
 * Jazz Buddy — 14-init.js
 * App initialisation: auth check, greeting, tour trigger
 * SayMy Tech Developers
 * ═══════════════════════════════════════════════════════ */

// ── INIT ──────────────────────────────────────────────────────────
function init(){
  // AUTH CHECK — show splash if no current user
  const currentUser = DB.g('currentUser', null);
  if (!currentUser) {
    // Show splash
    return; // splash already visible by default
  }
  // Load user profile
  window._userPrefix = 'jb4_' + currentUser + '_';
  const storedP = localStorage.getItem(window._userPrefix + 'P');
  if (storedP) { try { Object.assign(P, JSON.parse(storedP)); } catch(e) {} }
  // Load user MEMS and HIST
  const storedMems = localStorage.getItem(window._userPrefix + 'MEMS');
  if (storedMems) { try { MEMS = JSON.parse(storedMems); } catch(e) {} }
  const storedHist = localStorage.getItem(window._userPrefix + 'HIST');
  if (storedHist) { try { HIST = JSON.parse(storedHist); } catch(e) {} }

  // Hide splash
  document.getElementById('splash').style.display = 'none';

  if(DB.g('onboarded',false)){
    document.getElementById('ob').style.display='none';
    document.getElementById('app').style.display='flex';
    refreshStats();
    restoreCustomization();

    // Restore voice mode state
    if(VS.ttsEnabled){
      setTimeout(()=>{
        document.getElementById('voice-bar').classList.add('show');
        const btn=document.getElementById('voice-toggle-btn');
        if(btn){btn.style.background='rgba(108,92,231,.2)';btn.style.borderColor='var(--acc)';btn.style.color='var(--acc2)';}
      },500);
    }

    // Daily check-in nudge
    const todayStr_ci=new Date().toDateString();
    if((P.lastCheckInDate||'')!==todayStr_ci){
      setTimeout(()=>document.getElementById('ci-nudge').classList.add('show'),1500);
    }

    // Check birthday
    checkBirthday();
    // Proactive notifications check
    checkProactiveNotifs();

    // Weekly report on Sunday if not seen this week
    const dayOfWeek=new Date().getDay();
    const weeklyDue=dayOfWeek===0&&Date.now()-P.lastWeeklyReport>604800000;
    if(weeklyDue){setTimeout(()=>renderWeeklyReport(),3000);}

    // Smart returning greeting based on time away
    const h=(Date.now()-P.lastSeen)/3600000;
    const nm=P.name||'friend';
    let msg;
    if(h<0.5)msg=`Hey ${nm}! You're back. What's on your mind?`;
    // V8: Use predictive greeting if enough history
    else if(HIST&&HIST.length>10&&typeof getPredictiveGreeting==='function')msg=getPredictiveGreeting(nm);
    else if(h<3)msg=`${nm}! Good to see you again. How has the day been since we last talked?`;
    else if(h<24)msg=`Hey ${nm}! How has the rest of your day been?`;
    else if(h<48)msg=`${nm}! It's been a day. I've been thinking about you. How are you doing?`;
    else if(h<96)msg=`${nm}! It's been a couple of days. What's been happening in your world?`;
    else if(h<168)msg=`${nm}! A whole week. I've genuinely missed you. What have I missed?`;
    else msg=`${nm}! It's been a while. I'm really glad you came back. What's been going on in your life?`;

    // Check for unresolved conversation threads
    const lastU=lastUserMsg();
    if(lastU){
      const daysSinceLast=days_since(lastU.ts);
      if(daysSinceLast>0&&daysSinceLast<7&&['venting','mentalHealth','grief','goals','relationships'].includes(lastU.intent)){
        msg+=` Last time we spoke, you were going through something with ${lastU.intent==='goals'?'your goals':lastU.intent==='relationships'?'a relationship situation':lastU.intent==='grief'?'grief':'something difficult'}. How has that been?`;
      }
    }

    // Add goal check to greeting if applicable
    const overdueGoals=(P.goals||[]).filter(g=>g.status==='active'&&g.nextCheckIn&&g.nextCheckIn<Date.now());
    if(overdueGoals.length>0&&((Date.now()-P.lastSeen)/3600000)>12){
      msg+=` Also — I want to check in on ${overdueGoals.length===1?`your goal: "${overdueGoals[0].title}"`:`${overdueGoals.length} of your goals`} when you're ready.`;
    }
    // Jazz thought of the day (every 3rd open)
    P.sessionCount=(P.sessionCount||0)+1;saveP();
    const showThought=P.sessionCount%3===0&&P.totalMsgs>5;
    setTimeout(()=>{
      addMsg('b',msg,'et-warm');
      histAdd('b',msg,'neutral','greeting');
      if(showThought){
        setTimeout(()=>{
          const thought=getJazzThought();
          addMsg('b',`Something I've been thinking about:

*"${thought}"*

What does that bring up for you?`,'et-deep');
        },1800);
      }
      // Wisdom recall (occasional)
      const wisdom=quoteBackWisdom();
      if(wisdom&&!showThought&&Math.random()>.6){
        setTimeout(()=>addMsg('b',wisdom,'et-deep'),2200);
      }
      setQR(getQR('greeting'));
    },200);

    // Tour for new users who haven't seen it
    if(!DB.g('tourDone',false)){
      setTimeout(()=>startTour(),3500);
    }
  }else{
    renderOB();
  }
}

init();
