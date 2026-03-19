/* ═══════════════════════════════════════════════════════
 * Jazz Buddy -- 01-core.js
 * Core utilities, storage, profile, memory, history, health
 * SayMy Tech Developers
 * ═══════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════
   JAZZ BUDDY -- COMPLETE ENGINE  (All 8 Phases)
   Phase 1: Core chat + rule engine
   Phase 2: Personality profile + deep onboarding
   Phase 3: Weighted multi-signal intent detection + rich response library
   Phase 4: Health module -- mood, sleep, stress, wellbeing scoring
   Phase 5: Memory system -- extraction, indexing, intelligent surfacing
   Phase 6: Friendship depth -- 8-dimension bond + relationship evolution
   Phase 7: PWA packaging -- installable, offline-ready
   Phase 8: Polish -- edge cases, calibration, insights, anti-patterns
═══════════════════════════════════════════════════════════════════ */

// ── UTILS ─────────────────────────────────────────────────────────
const lerp=(a,b,t)=>a+(b-a)*t;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const rnd=(arr)=>arr[Math.floor(Math.random()*arr.length)];
const fmt_time=()=>new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
const days_since=(ts)=>Math.floor((Date.now()-ts)/86400000);

// ── STORAGE ───────────────────────────────────────────────────────
const DB={
  g:(k,d=null)=>{try{const v=localStorage.getItem('jb3_'+k);return v!=null?JSON.parse(v):d}catch{return d}},
  s:(k,v)=>{try{localStorage.setItem('jb3_'+k,JSON.stringify(v))}catch{}},
  del:(k)=>{try{localStorage.removeItem('jb3_'+k)}catch{}}
};

// ── USER PROFILE (Big Five + custom) ─────────────────────────────
let P=DB.g('P',{
  name:'',age:null,
  joinDate:Date.now(),lastSeen:Date.now(),
  streakDays:1,totalMsgs:0,sessionCount:0,
  // Big Five
  O:50,C:50,E:50,A:50,N:50,
  // Custom
  humor:50,depth:50,direct:50,empathy:50,resilience:50,
  // State
  mood:null,moodHist:[],
  sleepScores:[],stressScores:[],energyScores:[],wellbeingScores:[],
  // Preferences (learned)
  prefShort:false,likesChallenged:false,needsValidation:false,
  prefTone:'balanced', // warm/deep/playful/honest
  // Topics
  topics:{},
  // Calibration flags
  calCount:0,lastCalDate:0,
  // Relationship phase
  phase:0, // 0=new 1=acquaint 2=friend 3=close 4=deep 5=soul
  phaseHist:[{phase:0,date:Date.now()}],
  // Anti-repeat tracking
  lastIntents:[],
  // Health profile
  health:{
    avgSleep:null,avgStress:null,avgEnergy:null,avgWellbeing:null,
    conditions:[],medications:[],concerns:[],
    lastCheckIn:null,
    weeklyPattern:{}, // day→{mood,energy}
  },
  // Bond dimensions
  bond:{trust:0,vuln:0,humor:0,consist:0,support:0,mem:0,growth:0,depth:0},
  // Insights generated
  insights:[],
  // First message date per day (streak tracking)
  activeDays:[],
});
// Ensure P is always an object
if(!P||typeof P!=='object')P={};


// ── SANITIZE P — ensure all required fields exist after loading ───
function sanitizeP(){
  if(!P.moodHist)P.moodHist=[];
  if(!P.topics)P.topics={};
  if(!P.lastIntents)P.lastIntents=[];
  if(!P.activeDays)P.activeDays=[];
  if(!P.goals)P.goals=[];
  if(!P.bond)P.bond={trust:0,vuln:0,humor:0,consist:0,support:0,mem:0,growth:0,depth:0};
  if(!P.activeThread)P.activeThread={intent:null,ts:0,count:0,topic:''};
  if(!P.sessionEmotions)P.sessionEmotions=[];
  if(!P.relationships)P.relationships=[];
  if(!P.insights)P.insights=[];
  if(!P.affirmations)P.affirmations=[];
  if(!P.userPhrases)P.userPhrases=[];
  if(!P.sleepScores)P.sleepScores=[];
  if(!P.stressScores)P.stressScores=[];
  if(!P.energyScores)P.energyScores=[];
  if(!P.wellbeingScores)P.wellbeingScores=[];
  if(!P.wisdomQuotes)P.wisdomQuotes=[];
  if(P.prefShort===undefined)P.prefShort=false;
  if(P.likesChallenged===undefined)P.likesChallenged=false;
  if(P.needsValidation===undefined)P.needsValidation=false;
  if(!P.prefTone)P.prefTone='balanced';
  if(!P.totalMsgs)P.totalMsgs=0;
  if(!P.streakDays)P.streakDays=1;
  if(!P.sessionCount)P.sessionCount=0;
}

const saveP=()=>DB.s('P',P);

// ── MEMORIES ──────────────────────────────────────────────────────
let MEMS=DB.g('MEMS',[]);
// {id,text,tags,emotion,intent,ts,importance,surfaced,pinned}
const IMP={mentalHealth:10,selfEsteem:9,goals:9,relationships:9,shareBadNews:8,grief:9,trauma:9,shareGoodNews:7,health:7,work:6,family:9,venting:6,general:3};

function memAdd(text,tags,emotion,intent){
  const imp=IMP[intent]||IMP.general;
  MEMS.push({id:Date.now(),text:text.slice(0,300),tags:[...new Set([intent,emotion,...tags])],emotion,intent,ts:Date.now(),importance:imp,surfaced:0,pinned:false});
  if(MEMS.length>600)MEMS=MEMS.sort((a,b)=>b.importance-a.importance).slice(0,500);
  DB.s('MEMS',MEMS);
}

function memRecall(input,emotion,exclude=[]){
  const words=input.toLowerCase().split(/\W+/).filter(w=>w.length>3);
  const scored=MEMS
    .filter(m=>!exclude.includes(m.id))
    .map(m=>{
      let s=0;
      words.forEach(w=>{if(m.tags.some(t=>t.includes(w)||w.includes(t)))s+=3;if(m.text.toLowerCase().includes(w))s+=1;});
      if(m.emotion===emotion)s+=2;
      s+=m.importance*.5;
      s-=m.surfaced*2;
      if(days_since(m.ts)<7)s+=1.5;
      if(days_since(m.ts)>30)s-=1;
      return{m,s};
    })
    .filter(x=>x.s>3)
    .sort((a,b)=>b.s-a.s);
  return scored.length?scored[0].m:null;
}

// ── HISTORY ───────────────────────────────────────────────────────
let HIST=DB.g('HIST',[]);
function histAdd(role,text,emotion,intent){
  HIST.push({role,text:text.slice(0,400),emotion,intent,ts:Date.now()});
  if(HIST.length>150)HIST=HIST.slice(-120);
  DB.s('HIST',HIST);
}
function lastBotMsg(){return[...HIST].reverse().find(h=>h.role==='b');}
function lastUserMsg(){return[...HIST].reverse().find(h=>h.role==='u');}

// ── PHASE 4: HEALTH MODULE ────────────────────────────────────────
const HEALTH_INTENTS=['healthCheck','sleep','stress','mentalHealth','energy','pain','anxiety','depression','nutrition','exercise'];

function healthScore(){
  const h=P.health;
  const scores=[];
  if(h.avgSleep!=null)scores.push(h.avgSleep*10);
  if(h.avgStress!=null)scores.push((10-h.avgStress)*10);
  if(h.avgEnergy!=null)scores.push(h.avgEnergy*10);
  if(!scores.length)return null;
  return Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);
}

function logHealth(type,val){
  const h=P.health;
  if(type==='sleep'){P.sleepScores.push({v:val,ts:Date.now()});if(P.sleepScores.length>30)P.sleepScores.shift();h.avgSleep=+(P.sleepScores.reduce((a,b)=>a+b.v,0)/P.sleepScores.length).toFixed(1);}
  else if(type==='stress'){P.stressScores.push({v:val,ts:Date.now()});if(P.stressScores.length>30)P.stressScores.shift();h.avgStress=+(P.stressScores.reduce((a,b)=>a+b.v,0)/P.stressScores.length).toFixed(1);}
  else if(type==='energy'){P.energyScores.push({v:val,ts:Date.now()});if(P.energyScores.length>30)P.energyScores.shift();h.avgEnergy=+(P.energyScores.reduce((a,b)=>a+b.v,0)/P.energyScores.length).toFixed(1);}
  h.lastCheckIn=Date.now();
  const day=new Date().getDay();
  if(!h.weeklyPattern[day])h.weeklyPattern[day]={moods:[],energies:[]};
  if(P.mood)h.weeklyPattern[day].moods.push(P.mood);
  if(type==='energy')h.weeklyPattern[day].energies.push(val);
  saveP();
}

// ── PHASE 5: EMOTION ENGINE ───────────────────────────────────────
const EL={
  happy:['happy','great','amazing','wonderful','joy','love','fantastic','awesome','brilliant','good','smile','laugh','fun','yay','blessed','grateful','thrilled','glad','delighted','ecstatic','overjoyed','excited','pumped','stoked','hyped','pleased','content','proud','relieved'],
  sad:['sad','unhappy','depressed','down','low','cry','tears','hopeless','empty','alone','miss','lost','hurt','pain','heartbroken','lonely','grief','terrible','awful','miserable','devastated','gutted','broken','shattered','numb','hollow','crushed','despairing'],
  anxious:['anxious','worried','nervous','scared','fear','panic','stress','overwhelmed','dread','uneasy','restless','tense','overthink','what if','freaking out','on edge','apprehensive','dreading','spiraling','catastrophizing','cant breathe','heart racing'],
  angry:['angry','mad','furious','annoyed','frustrated','irritated','hate','rage','pissed','fed up','sick of','cant stand','fuming','livid','seething','boiling','resentful','bitter','infuriated'],
  tired:['tired','exhausted','drained','sleepy','fatigued','no energy','burnout','worn out','spent','depleted','wiped','running on empty','dead on my feet','zombie'],
  excited:['excited','cant wait','thrilled','pumped','hyped','stoked','fired up','amazing news','great news','incredible','unbelievable','cant believe'],
  confused:['confused','lost','dont understand','unsure','not sure','idk','what do i','torn','conflicted','cant decide','going in circles'],
  grateful:['thank','grateful','appreciate','means a lot','blessed','lucky','fortunate','thankful','touched','moved'],
  grieving:['died','passed away','lost someone','funeral','grief','mourning','miss them so much','gone forever','death'],
  lonely:['lonely','alone','no one','nobody','isolated','no friends','no one cares','invisible'],
  neutral:[]
};

function detectEmotion(txt){
  const t=txt.toLowerCase();
  const scores={};
  Object.entries(EL).forEach(([e,ws])=>{scores[e]=ws.filter(w=>t.includes(w)).length;});
  // Negation
  if(t.match(/not (happy|great|good|fine|okay|well)/)){scores.sad=(scores.sad||0)+2;scores.happy=Math.max(0,(scores.happy||0)-2);}
  if(t.match(/not (sad|bad|terrible|depressed)/)){scores.happy=(scores.happy||0)+2;}
  // Intensifiers
  const intense=['very','so','really','extremely','incredibly','absolutely','utterly','completely'];
  const hasIntense=intense.some(i=>t.includes(i));
  const best=Object.entries(scores).filter(([k])=>k!=='neutral').sort((a,b)=>b[1]-a[1]);
  if(!best.length||best[0][1]===0)return{emotion:'neutral',intensity:1};
  return{emotion:best[0][0],intensity:clamp(best[0][1]*(hasIntense?1.5:1)+(txt.includes('!')?1:0),1,10)};
}

// ── PHASE 3: INTENT ENGINE (60+ signals) ─────────────────────────
const IM={
  greeting:{w:8,s:['hi','hello','hey','hiya','sup','wassup','good morning','good afternoon','good evening','morning','evening','howdy','yo ','hi there','hey there','greetings','hi jazz','hey jazz','hello jazz']},
  farewell:{w:10,s:['bye','goodbye','see you','see ya','later','gotta go','take care','night','goodnight','good night','talk later','cya','gtg','leaving now','heading out','ttyl']},
  howAreYou:{w:11,s:['how are you','how are u','you okay','you good','how r u','hows it going','how is it going','hows your day','how was your day','how are things','you doing okay','you alright','you doing well']},
  askName:{w:10,s:['your name','who are you','what are you','what is your name','what are you called','call you','who am i talking to','introduce yourself']},
  myName:{w:9,s:['my name is','i am called','call me','im called','name is','people call me','you can call me','known as']},
  venting:{w:9,s:['i feel','feeling','so stressed','cant handle','falling apart','breaking down','too much','overwhelmed','cant cope','im done','had enough','everything is','nothing is right','i just need','i dont know what','cant take it','really struggling','having a hard time','rough day','rough week','rough time']},
  askAdvice:{w:11,s:['what should i do','what do i do now','need advice','give me advice','advise me','what would you do','help me decide','i dont know what to do','what is the right thing','should i do this','help me choose','need your advice','i need guidance','not sure what to do','what do you think i should do','help me figure out','what are my options']},
  shareGoodNews:{w:9,s:['guess what','i got','i made it','i passed','i won','promotion','accepted','they said yes','it worked','i did it','great news','exciting news','amazing news','i got in','i got the','i finally','i just found out','big news']},
  shareBadNews:{w:9,s:['bad news','terrible news','failed my exam','failed my test','failed my interview','got rejected','lost my job','didnt get the job','awful thing happened','went wrong today','things fell apart','disaster happened','catastrophe','something bad happened','terrible day']},
  healthCheck:{w:9,s:['not feeling well','feeling sick','headache','stomachache','cant sleep','sleep','body pain','need a doctor','my health','feeling ill','unwell','nauseous','dizzy','flu','fever','cold','ache','sore throat','chest pain','back pain']},
  mentalHealth:{w:12,s:['mental health','not okay','feeling empty','feel numb','want to disappear','cant cope anymore','feeling hopeless','lost the will','no point anymore','feeling worthless','suicidal thoughts','self harm','i have depression','i am depressed','i think i have depression','i have anxiety disorder','struggling mentally','mental illness','breakdown']},
  sleep:{w:9,s:['cant sleep','insomnia','trouble sleeping','sleep issues','woke up','wake up','sleeping too much','oversleeping','tired all the time','exhausted all day','never rested','nightmares','sleep schedule','bed time','falling asleep']},
  stress:{w:8,s:['stressed','so much stress','under pressure','too much pressure','too much going on','cant handle the pressure','pressure at work','pressure at school','pressure from','so much on my plate']},
  energy:{w:7,s:['no energy','so tired','low energy','high energy','feeling energetic','drained','cant get up','motivation to do anything','get out of bed']},
  anxiety:{w:9,s:['panic attack','anxiety attack','heart racing','cant breathe','chest tight','spiraling','catastrophizing','worst case scenario','something bad will happen','going to fail','everyone hates me']},
  motivation:{w:11,s:['motivate me','i need motivation','i am not motivated','i feel unmotivated','no motivation','lack motivation','push me','dont feel like doing anything','cant get started','procrastinating','need a push','need encouragement','keep going','need to keep going','i need some motivation','give me motivation','feeling unmotivated']},
  relationships:{w:9,s:['my relationship','my friend and i','my boyfriend','my girlfriend','my partner','toxic relationship','my best friend','relationship advice','relationship problem','relationship issue','dealing with my friend','friend situation','friends with']},
  family:{w:9,s:['my mom','my dad','my parents','my family','my sister','my brother','my son','my daughter','my husband','my wife','my children','home problems','family problems','family drama','parent issues']},
  goals:{w:8,s:['goal','dream','want to be','plan to','future plans','career goals','life goals','want to achieve','my ambition','aspire to','working towards','saving for','building towards','long term']},
  gratitude:{w:7,s:['thank you','thanks jazz','appreciate you','you helped','love talking to you','glad i have you','you always understand','you make me feel','you are amazing','means a lot']},
  joke:{w:8,s:['joke','humor me','entertain me']},
  philosophical:{w:10,s:['meaning of life','why are we here','existence','consciousness','free will','what is reality','truth of life','justice','morality','ethics','soul exist','universe meaning','is there a god','religion vs science','what is death','is there afterlife','philosophy','what is the meaning']},
  bored:{w:7,s:['bored','nothing to do','so bored','boring day','killing time','entertain me','what should i do','nothing is happening','nothing interesting']},
  selfEsteem:{w:10,s:['im ugly','im fat','im stupid','im worthless','im not good enough','i hate myself','im a failure','nobody likes me','im terrible','im useless','im pathetic','im so bad at everything','cant do anything right','not worth it','no one would miss me','not smart enough','not attractive','never good enough']},
  work:{w:7,s:['work','job','boss','office','deadline','meeting','presentation','colleague','fired','promotion','career','workplace','coworker','resign','quit my job','toxic workplace','overworked','underpaid']},
  money:{w:9,s:['money problem','financial stress','money stress','i am in debt','i have debt','serious debt','cant afford','no money','financial problem','money issues','struggling financially','broke financially','loan repayment','bills i cant pay','running out of money']},
  grief:{w:10,s:['someone died','passed away','lost someone','death of','funeral','grief','mourning','miss them so much','gone forever','they died','she died','he died','my pet died','losing someone']},
  trauma:{w:13,s:['trauma','traumatic experience','traumatised','ptsd','flashbacks','abuse i suffered','i was abused','i was assaulted','i was violated','childhood abuse','something traumatic happened','bad things in my past','i survived something terrible','cant forget what they did','still haunted by','sexual abuse','domestic violence','something terrible happened to me','terrible thing happened to me','horrible thing done to me']},
  loneliness:{w:9,s:['so lonely','feel alone','no friends','nobody cares','invisible','no one talks to me','isolated','left out','excluded','dont belong','no one understands','no one to talk to']},
  identity:{w:8,s:['who am i','dont know who i am','finding myself','lost myself','identity','gender','sexuality','dont fit in','feel different','not like others','feel like im different']},
  growth:{w:7,s:['want to grow','self improvement','getting better','working on myself','personal development','becoming better','new habits','better version of myself']},
  memory:{w:8,s:['remember when','do you remember','we talked about','you told me','last time','you said','you mentioned','didnt i tell you','i told you before']},
  checkIn:{w:6,s:['show my stats','my profile','how am i doing','check in','my progress','bond score','what do you know about me','what have you learned']},
  compliment:{w:6,s:['you are amazing','you understand me','best friend','you really get me','love you jazz','youre incredible','you always know','you are so helpful']},

  heartbreak:{w:12,s:['broke up with me','she broke up','he broke up','my girlfriend broke up','my boyfriend broke up','broken heart','got dumped','they left me','cant get over my ex','still love my ex','relationship ended badly','they ended it with me','miss my ex','heartbroken','my heart is broken','we broke up','just broke up']},
  goalProgress:{w:9,s:['progress on my goal','update on my goal','working on my goal','goal is going','how my goal is','made progress','completed my goal','finished my goal','achieved my goal','goal update','i did the goal','stuck on my goal','goal check in','how am i doing on my goal']},
  imposterSyndrome:{w:8,s:['imposter','dont deserve','got lucky','not qualified','they will find out','not as smart','fraud','fake','dont belong here','out of my depth','imposter syndrome','not good enough for this position']},
  bigDecision:{w:8,s:['big decision','life changing decision','dont know what to do','crossroads','big choice','major decision','which path','should i leave','should i stay','move or stay','take the job','take the risk','start the business','quit or stay']},
  comparison:{w:7,s:['everyone else','other people','compared to','not as good as','they have','why do they','why cant i','other people seem','everyone around me','peers are doing better','behind everyone','left behind']},
  perfectionism:{w:7,s:['not perfect','not good enough yet','have to be perfect','perfectionist','everything has to be','scared to fail','afraid of mistakes','impossible standard','hard on myself','nothing i do is enough','standards too high']},
  longing:{w:7,s:['i wish','i miss','if only','should have','could have','would have','regret','wish things were different','want things back','miss how things were','wish i could go back','things used to be']},
  faith:{w:8,s:['crisis of faith','losing my faith','questioning my faith','i dont know if god exists','do you believe in god','is there a god','religion question','faith and doubt','i left the church','stopped believing','atheism','agnostic','what happens when we die']},
  addiction:{w:9,s:['addicted','addiction','cant stop','substance','alcohol','drinking too much','drugs','smoking','relapse','sobriety','clean','recovery','trying to quit','cant stop drinking','dependent on']},
  sleepStory:{w:10,s:['sleep story','help me sleep tonight','story to help me sleep','night time story','send me to sleep','story before bed','sleepy story','sleep time story']},
  relLetter:{w:9,s:['write a letter','unsent letter','letter to my','write to my','help me write to','letter for my','never sent','things i never said']},
  birthday:{w:8,s:['my birthday','born on','date of birth','dob','birthday is','i turn','turning \d']},
  weeklyReport:{w:9,s:['weekly report','weekly insight','week in review','how was my week','weekly summary','weekly check','my week at a glance']},
  moodCheck:{w:8,s:['how am i feeling','pick my mood','mood check','log my mood','what is my mood']},
  affirmationReq:{w:8,s:['affirmation','affirmations','something positive','remind me','encourage me','say something nice','lift me up','i need encouragement']},
  journalReq:{w:8,s:['journal','write something','need to write','journaling','write in my journal','open my journal']},

  // ── CASUAL & LIFE TOPICS ──────────────────────────────────────────
  food:{w:7,s:['food','eat','hungry','meal','cook','recipe','restaurant','pizza','breakfast','lunch','dinner','snack','taste','delicious','yummy','cooking','bake','drink','coffee','tea','hungry']},
  music:{w:10,s:['music','song','playlist','album','artist','concert','music genre','my favourite artist','music taste','listening to music','what music','song recommendation','afrobeats','hip hop','reggae','jazz music','gospel music','lets talk about music','music discussion','new music']},
  movies:{w:7,s:['movie','film','watch','series','show','netflix','episode','actor','cinema','documentary','tv show','anime','drama','comedy','horror','binge','streaming']},
  sports:{w:10,s:['football','soccer','basketball','tennis','cricket','rugby','follow sport','sports fan','my team','favourite team','match result','sports game','the league','world cup','champions league','nba','nfl','premier league','watching sport','playing sport']},
  travel:{w:10,s:['travel','travelling','trip abroad','vacation','holiday destination','visited','flight booking','hotel','abroad','new country','destination','tourist','passport','backpacking','went to a country','new places to visit']},
  tech:{w:11,s:['social media','instagram','twitter','tiktok','youtube','internet','computer','laptop','screen time','technology','gaming online','wifi','digital life','smartphone','phone addiction','apps and tech','streaming service','what do you think about social','thoughts on technology','online world','tech industry']},
  books:{w:6,s:['book','read','reading','novel','story','author','library','learn','podcast','study','knowledge','chapter','fiction']},
  career:{w:7,s:['career','job','work','profession','salary','interview','office','boss','colleague','cv','resume','promotion','business','entrepreneurship','startup']},
  creative:{w:6,s:['art','draw','paint','write','music','dance','create','design','hobby','craft','photography','film','poetry','creative','sketch','play']},
  friendship:{w:7,s:['friend','friends','friendship','best friend','buddy','hang out','social','party','group','mate','pal','companion','crew','squad']},
  lifePhilosophy:{w:7,s:['life','purpose','meaning','believe','opinion','philosophy','mind','think','perspective','view','lesson','wisdom','truth','change','grow']},
  playful:{w:6,s:['haha','lol','random thought','bored game','silly question','weird question','crazy question','ridiculous','pineapple on pizza']},
  morning:{w:8,s:['good morning','morning','wake up','just woke','start of day','early','today is going to']},
  evening:{w:8,s:['good evening','evening','tonight','night time','end of day','winding down','before bed','good night']},
  world:{w:6,s:['world','news','politics','society','humanity','global','current events','happening','country','government','economy']},
  opinion:{w:7,s:['what do you think','your opinion','agree','disagree','hot take','unpopular opinion','debate','argue','perspective']},
  casual:{w:3,s:['just chatting','nothing much','random','talk','chat','whats up','sup','wassup']},

  // ── DEEP LIFE TOPICS ──────────────────────────────────────────────
  love:{w:8,s:['love','in love','relationship','partner','crush','romantic','dating','heartfelt','feelings for','fall in love','soulmate','together','broke up with','my boyfriend','my girlfriend','my husband','my wife','my ex']},
  ambition:{w:10,s:['ambition','success','achieve greatness','hustle','grind hard','dream big','level up my life','build an empire','make it big','legacy','my vision for life','i want to be great','want to achieve','building something big']},
  failure:{w:11,s:['i keep failing','pattern of failure','dealing with failure','afraid of failure','bouncing back from failure','what failure taught me','i feel like a failure','never succeed','always failing','cant stop failing','failed at something really important','failed at something important to me','i failed badly at something','my biggest failure','failed miserably','failed at life','i have been failing']},
  fear:{w:8,s:['scared','afraid','fear','terrified','anxious','nervous','worried','phobia','dread','what if something','panic']},
  change:{w:7,s:['change','changing','different','new chapter','grow','evolving','transforming','let go','moving on','turning point']},
  time:{w:6,s:['time flies','getting older','adulting','years go by','this year','quarter life','midlife','deadline','running out of time','life stage']},
  africa:{w:9,s:['tell me about africa','about african culture','african history','african economy','african politics','growing up in africa','life in africa','african identity','africa rising','love africa','proud to be african','african community','pan africanism','african continent']},
  spiritual:{w:11,s:['i am spiritual','i believe in god','i pray to god','i pray every day','i go to church','i go to mosque','my faith in god','my relationship with god','spiritual growth','spiritual practice','i meditate daily','god is real to me','divine','blessing in my life','god has been good','trusting god']},
  money_deep:{w:8,s:['savings','invest','financial freedom','budget plan','build wealth','wealth building','financial advice','how to save money','my salary','salary increase','passive income','financial independence']},
  mentalHealthReal:{w:7,s:['therapy','therapist','counsellor','mental health','depression','anxiety','burnout','overwhelmed','breaking point','emotional']},
  purpose:{w:11,s:['my purpose in life','what is my purpose','finding my purpose','sense of purpose','why am i here','what am i here for','my calling','meaning of my existence','what am i meant to do','life has no meaning','pointless','what is the point of my life']},
  education:{w:6,s:['school','university','college','degree','study','exam','student','teacher','class','lecture','learn','knowledge','graduate','education']},
  aging:{w:6,s:['getting older','years','age','mature','adult','30s','20s','40s','youth','elderly','legacy','life is short']},
  nostalgia:{w:11,s:['remember when','back in those days','the old days','i miss how things used to be','i miss my old life','grew up differently','when i was young','throwback','good old times','used to be so different','simpler times','miss those days','reminiscing','when i was growing up','miss the old days','i miss those times','childhood memories','things were better back then','back when i was a child']},
  conflict:{w:7,s:['fight','argument','conflict','disagree','forgive','forgiveness','let go','grudge','resentment','apologise','made up','fell out']},
  belonging:{w:7,s:['belong','fit in','identity','who am i','outsider','community','tribe','roots','home','where i come from','my people']},
  selfaware:{w:7,s:['self aware','know myself','blind spot','pattern','triggers','therapy','reflection','introspect','honest with myself']},
  happiness:{w:7,s:['happy','happiness','joy','content','fulfilled','life is good','enjoying','grateful','blessed','peace']},
  dailyLife:{w:4,s:['today','my day','this morning','just got','earlier','on my way','right now','at the moment','currently']},
  profound:{w:6,s:['meaning of life','why we exist','what is truth','big picture','perspective','life lesson','realisation','epiphany']},
  dreams:{w:7,s:['dream','daydream','imagine','wish','aspire','hope','one day','vision','someday','future self']},
  nature:{w:6,s:['nature','outside','fresh air','trees','ocean','mountains','sunset','sunrise','sky','beach','rain','weather','earth']},
  conversation:{w:5,s:['lets talk','talk to me','i want to discuss','have you ever thought','deep conversation','real talk','honest question']},
  workReal:{w:7,s:['work is','job is','career is','my boss','my manager','colleagues','office politics','promotion','salary raise','job hunt','resign','fired','burnout at work']},
  family_deep:{w:7,s:['my mom','my dad','my parents','raised me','grew up with','family pressure','toxic family','family trauma','siblings','relatives','home life']},
  longing_deep:{w:7,s:['i wish','i miss','what could have been','different path','what if i had','regret not','never got to','missed opportunity']},
  toughLove:{w:5,s:['be honest with me','give it to me straight','no sugarcoat','real talk','truth is','brutal honesty']},
  ubuntu:{w:7,s:['community','helping others','giving back','ubuntu','together','solidarity','support system','circle','my people looked out']},
  social:{w:6,s:['social media','instagram','twitter','tiktok','followers','online','comparison','highlight reel','performance','authentic']},
  jazzThinks:{w:3,s:['what do you think','jazz what','your opinion','do you believe']},

  // ── FUN & COMEDY INTENTS ──────────────────────────────────────────
  tellJoke:{w:18,s:['tell me a joke','make me laugh','say something funny','cheer me up','i need a laugh','got any jokes','joke please','funny','make me smile','crack a joke','joke time','tell me something funny','be funny']},
  tellStory:{w:9,s:['tell me a story','tell a story','tell me some story','share a story with me','story time','tell me something','entertain me with a story']},
  boredFix:{w:9,s:['so bored','bored out','nothing to do','killing time','bored as','bored af','dying of boredom','entertain me','boredom','got nothing']},
  moodLift:{w:9,s:['cheer me up','lift my mood','make me feel better','i need something positive','brighten my day','boost my mood','i need cheering','feeling low','need a pick me up']},
  wildFact:{w:8,s:['fun fact','tell me a fact','random fact','did you know','something interesting','blow my mind','wow me','amaze me','interesting fact','weird fact']},
  wouldYouRather:{w:9,s:['would you rather','wyr','either or','pick one','choose between','versus','vs ']},
  hotTake:{w:8,s:['hot take','unpopular opinion','controversial opinion','spicy take','fight me','change my mind','debate','i think that','strong opinion']},
  playGame:{w:8,s:['lets play','play a game','game time','challenge me','quiz me','test me','give me a challenge','let us play']},
  roastMe:{w:9,s:['roast me','call me out','read me','be honest about me','what do you really think of me','am i being']},
  hypothetical:{w:8,s:['hypothetically','what if','imagine if','suppose','scenario','if you could','if i could','if the world']},

  // ── STORY & FACT INTENTS ─────────────────────────────────────────
  kidsBedtime:{w:15,s:['bedtime story for my child','bedtime story for my kid','story for my child','story for my son','story for my daughter','story for my baby','story for my toddler','tell my child a story','tell my kid a story','kids bedtime story','childrens bedtime story','put my child to sleep with a story','goodnight story for child','read my child a story','read my kid a story','story for my child','bedtime my child','my child a story']},
  kidsAdventure:{w:14,s:['adventure story for kids','exciting story for my child','exciting story for kids','fun story for kids','action story for children','tell my kid an exciting story','kids adventure story','children adventure story','adventure for my child']},
  adultBedtime:{w:12,s:['help me sleep','i cannot sleep','i cant sleep','story to help me sleep','adult sleep story','just for me bedtime story','story before bed tonight','calm me down with a story','wind me down','sleep story for adults','story to wind down','bedtime story please','tell me a bedtime story']},
  motivationalStory:{w:13,s:['tell me a motivational story','motivational story','inspire me with a story','inspiring story about','story about overcoming','story about someone who succeeded','success story','comeback story','story about resilience','story about strength','uplift me with a story','encourage me with a story','motivate me with a story']},
  funnyStory:{w:13,s:['tell me a funny story','funny story','make me laugh with a story','amusing story','hilarious story','comic story','absurd story','funny true story','tell me something funny that happened','funny thing that happened']},
  africanStory:{w:13,s:['tell me an african story','african story','tell me some african folklore','african folklore','african tale','african legend','story from africa','traditional african story','african bedtime story','african wisdom story','ancestor story']},
  historicalStory:{w:13,s:['tell me a true story from history','historical story','true story from history','real historical story','story from history','something that happened in history','historical event story','tell me about a historical event','real story that really happened']},
  loveStory:{w:13,s:['tell me a love story','love story','romantic story','story about love','heartwarming story','touching story','beautiful love story','story about romance','love and relationship story']},
  wildFactRequest:{w:14,s:['wild fact','tell me a wild fact','crazy fact','mind blowing fact','unbelievable fact','insane fact','tell me a random fact','blow my mind','fun fact','did you know','amaze me with a fact','give me a fact','interesting fact','tell me something i didnt know']},
  crisis:{w:15,s:['want to end it','dont want to live','no reason to live','want to disappear','what is the point of living','cant do this anymore','ending everything','final goodbye','saying goodbye','last message']},
};

function detectIntent(txt){
  const t=txt.toLowerCase();
  const scores={};
  Object.entries(IM).forEach(([intent,data])=>{
    let s=0;
    data.s.forEach(sig=>{
      if(t.includes(sig))s+=data.w;
      else if(sig.split(' ').length>1&&t.includes(sig.split(' ')[0])&&sig.split(' ').filter(w=>w.length>4&&t.includes(w)).length>=2)s+=data.w*.2;
    });
    scores[intent]=s;
  });
  // Context boost from last bot message
  const lastB=lastBotMsg();
  if(lastB){
    const lb=lastB.text.toLowerCase();
    if(lb.includes('sleep')||lb.includes('rest'))scores.sleep=(scores.sleep||0)+8;
    if(lb.includes('feel')&&lb.includes('?'))scores.venting=(scores.venting||0)+5;
    if(lb.includes('stress'))scores.stress=(scores.stress||0)+6;
    if(lb.includes('goal'))scores.goals=(scores.goals||0)+6;
    if(lb.includes('work'))scores.work=(scores.work||0)+5;
    if(lb.includes('family'))scores.family=(scores.family||0)+6;
    if(lb.includes('what happened'))scores.venting=(scores.venting||0)+4;
  }
  // Boost based on personality
  if(P.depth>65)scores.philosophical=(scores.philosophical||0)+3;
  if(P.N>65)scores.venting=(scores.venting||0)+2;
  // Anti-repeat: penalise last 3 intents
  // Anti-repeat: penalise last 3 intents (but not fun intents — user may want more)
  const _noRepeatPenalty=['tellJoke','wouldYouRather','playGame','hotTake','hypothetical','wildFactRequest','roastMe','moodLift','boredFix','tellStory','kidsBedtime','kidsAdventure','motivationalStory','funnyStory','africanStory','historicalStory','loveStory'];
  P.lastIntents.slice(-3).forEach((li,i)=>{ if(scores[li]&&!_noRepeatPenalty.includes(li))scores[li]-=(3-i)*2; });

  const boostedScores=(typeof getThreadBoost==="function")?getThreadBoost(scores):scores;
  const sorted=Object.entries(boostedScores).sort((a,b)=>b[1]-a[1]);
  const primary=sorted[0][0];
  const secondary=(sorted[1]&&sorted[1][1]>sorted[0][1]*.55)?sorted[1][0]:null;
  return{primary,secondary,confidence:sorted[0][1]};
}

// ── PHASE 6: FRIENDSHIP DEPTH SYSTEM ─────────────────────────────
const PHASES=[
  {name:'Strangers',desc:"Just getting acquainted",min:0},
  {name:'Acquaintances',desc:"Something is forming here",min:8},
  {name:'Friends',desc:"A real bond is growing",min:20},
  {name:'Close friends',desc:"You trust each other deeply",min:38},
  {name:'Confidants',desc:"Jazz really, truly gets you",min:58},
  {name:'Soul friends',desc:"An unbreakable connection",min:78},
];

function bondScore(){
  const v=Object.values(P.bond);
  return Math.round(v.reduce((a,b)=>a+b,0)/v.length);
}
function getPhaseData(){
  const s=bondScore();
  let pd=PHASES[0];
  PHASES.forEach(ph=>{if(s>=ph.min)pd=ph;});
  return{...pd,score:s};
}
function updatePhase(){
  const pd=getPhaseData();
  const phIdx=PHASES.indexOf(PHASES.find(p=>p.name===pd.name));
  if(phIdx>P.phase){
    P.phase=phIdx;
    P.phaseHist.push({phase:phIdx,date:Date.now()});
    saveP();
    return PHASES[phIdx].name; // Return new phase name for notification
  }
  return null;
}

function updateBond(intent,emotion,intensity){
  const b=P.bond;
  // Trust: consistent use + vulnerability
  b.trust=clamp(b.trust+0.4,0,100);
  if(['venting','mentalHealth','selfEsteem','grief','trauma','loneliness'].includes(intent))b.trust=clamp(b.trust+2.5,0,100);
  // Vulnerability
  if(['mentalHealth','selfEsteem','grief','trauma','venting','loneliness','identity'].includes(intent))b.vuln=clamp(b.vuln+3,0,100);
  // Humor
  if(intent==='joke'||emotion==='happy')b.humor=clamp(b.humor+1.5,0,100);
  if(intent==='bored'&&emotion==='happy')b.humor=clamp(b.humor+2,0,100);
  // Consistency: every message
  b.consist=clamp(b.consist+0.25,0,100);
  // Support
  if(['askAdvice','motivation','goals','grief'].includes(intent))b.support=clamp(b.support+2.5,0,100);
  // Shared memories
  if(intent==='memory')b.mem=clamp(b.mem+3,0,100);
  // Growth
  if(['goals','growth','motivation','identity'].includes(intent))b.growth=clamp(b.growth+2,0,100);
  // Depth
  if(['philosophical','venting','mentalHealth','grief','trauma','identity'].includes(intent))b.depth=clamp(b.depth+2.5,0,100);
  // Intensity bonus
  if(intensity>6){b.vuln=clamp(b.vuln+1,0,100);b.depth=clamp(b.depth+1,0,100);}
  P.bond=b;

}
