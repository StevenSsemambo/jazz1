/* ═══════════════════════════════════════════════════════
 * Jazz Buddy -- 03b-responses-expanded.js
 * Massively expanded human conversation library
 * Covers: deep life, relationships, ambition, identity,
 * culture, humour, wisdom, Africa, youth, adulting, love,
 * spirituality, money, politics, nature, ageing, regret,
 * success, failure, dreams, habits, time, fear, change
 * SayMy Tech Developers
 * ═══════════════════════════════════════════════════════ */

const RL3 = {

  // ── LOVE & ROMANCE ───────────────────────────────────────────────
  love: { any: [
    "Love is one of the most complicated things we do as humans. Where are you with it right now?",
    "Being in love changes you -- and falling out of it changes you again. What's your relationship with love right now?",
    "Romantic love is fascinating because it's so irrational. What's your honest experience of it?",
    "Are you the kind of person who falls fast or takes their time? And how has that worked out for you?",
    "Love languages are real. What's yours -- and do the people in your life speak it?",
    "The thing nobody tells you about love is how much work it actually is. What's your experience?",
    "Is there a difference between loving someone and being in love with them? Where do you land on that?",
    "What's the most important thing you've learned from a past relationship?",
    "Some people are better at giving love than receiving it. Which one are you?",
    "What does a good relationship actually look like to you? Describe it specifically.",
    "Do you think people can really change for love -- or does love have to accept who someone already is?",
    "The hardest part of love is the vulnerability. How comfortable are you with being truly seen?",
    "First love hits differently. What did yours teach you?",
    "Do you believe in soulmates? I want your honest answer, not the expected one.",
  ]},

  // ── AMBITION & SUCCESS ───────────────────────────────────────────
  ambition: { any: [
    "Ambition is interesting -- it drives you and sometimes consumes you. How does yours show up?",
    "What does success mean to you right now, in this chapter of your life?",
    "There's a version of success that looks great from the outside and feels empty inside. Have you seen that?",
    "What are you building right now -- even slowly?",
    "The gap between where you are and where you want to be -- how do you sit with that?",
    "Who around you pushes you to be better just by existing?",
    "What's the ambitious version of your life look like? Paint it specifically.",
    "Do you think ambition is something you're born with or something that gets activated?",
    "What's the one thing standing between you and the next level?",
    "Legacy is a big word. What do you actually want to leave behind?",
    "There's a difference between busy and productive. Where are you right now?",
    "If you achieved your biggest goal tomorrow, what would you feel -- and then what would you want next?",
    "Who is the most ambitious person you know personally -- and what do you learn from watching them?",
  ]},

  // ── FAILURE & RESILIENCE ─────────────────────────────────────────
  failure: { any: [
    "Failure teaches things that success never can. What has it taught you?",
    "The most interesting people I've talked to have all failed at something significant. What's yours?",
    "How do you bounce back? What actually works for you when things fall apart?",
    "Is there a failure you've genuinely made peace with -- or one you're still carrying?",
    "The fear of failing is often worse than the failing itself. Do you find that?",
    "What's the best decision that looked like a disaster at the time?",
    "Resilience isn't the absence of falling apart -- it's what you do after. What's yours?",
    "What did rock bottom teach you that nothing else could?",
    "Some failures are actually redirections. Has one turned out to be the best thing that happened?",
    "How do you talk to yourself when things go wrong? Be honest.",
    "There are failures we cause ourselves and failures that find us. Which is harder to recover from?",
    "What would you do differently if you could replay one specific decision?",
  ]},

  // ── FEAR & COURAGE ───────────────────────────────────────────────
  fear: { any: [
    "Fear is interesting because it usually shows you exactly what matters most. What does yours point to?",
    "What are you afraid of that you haven't told many people?",
    "Courage isn't the absence of fear -- it's doing the thing anyway. Where are you doing that right now?",
    "Is there something you keep avoiding because you're scared of what you'll find?",
    "The deepest fears are usually about love or belonging or being enough. Which one's yours?",
    "What would you do if you knew you couldn't fail?",
    "Is there a version of your life you're afraid to want because you might not get it?",
    "How has fear shaped the decisions you've made?",
    "What's something you're afraid of that you think is irrational -- but you can't shake it?",
    "When did fear stop you from doing something you later wished you'd done?",
    "The fear of judgement is real. How much does it drive what you do?",
  ]},

  // ── CHANGE & GROWTH ──────────────────────────────────────────────
  change: { any: [
    "Change is the only constant -- and most people resist it. How are you with change?",
    "Who were you five years ago -- and what would that version of you think of who you are now?",
    "Growth requires discomfort. Where are you uncomfortable right now?",
    "What's something about yourself you've actively worked to change?",
    "There are changes that happen to us and changes we choose. Which has shaped you more?",
    "What does the next version of you look like? What would they think differently?",
    "Some people grow and their old friendships stop fitting. Have you experienced that?",
    "What's one habit you've broken that you're genuinely proud of?",
    "The hardest thing to change is how we see ourselves. What belief about yourself are you working on?",
    "Growth is sometimes just learning to let go of things that used to define you. What have you let go of?",
    "What's something you've changed your mind about that surprised even you?",
  ]},

  // ── TIME & LIFE STAGES ───────────────────────────────────────────
  time: { any: [
    "Time is the thing everyone is short on and nobody talks about honestly. How are you spending yours?",
    "There are seasons in life. What season are you in right now?",
    "Adulthood is wild because nobody prepares you for what it actually feels like. How's yours going?",
    "The twenties are one thing, the thirties another. What's your experience of the age you're in?",
    "Time moves differently depending on what you're doing with it. When does it feel right?",
    "Looking back five years, what do you wish you'd known sooner?",
    "What are you doing now that future you will either thank you for or wish you hadn't?",
    "Urgency and patience are both important. Which do you struggle with more?",
    "Is there something you keep saying 'one day' about that actually needs to be now?",
    "What does a well-spent day look like for you?",
    "We're all a work in progress. Where do you feel most unfinished?",
  ]},

  // ── AFRICA & CULTURE ─────────────────────────────────────────────
  africa: { any: [
    "African culture has this incredible way of holding community and tradition together. What does that mean in your daily life?",
    "The gap between the Africa the world imagines and the one you actually live in -- how do you feel about that?",
    "Ubuntu -- 'I am because we are'. How much of that lives in how you actually move through the world?",
    "African music has taken over the world in the last decade. What does that mean to you personally?",
    "There's a particular weight that comes with being the first in your family to do something. Do you carry that?",
    "What do you think Africa's biggest strength is that the world doesn't see clearly?",
    "Family expectations in African culture are real. How do you navigate that?",
    "What part of your culture are you proudest of?",
    "The hustle culture here is real and respected. How does it sit with you?",
    "African food is some of the most underrated in the world. What's your favourite dish and what does it mean to you?",
    "There's a particular kind of resilience that gets built growing up in this part of the world. Do you feel that in you?",
    "The pressure to 'make it' -- for yourself and everyone watching. How does that feel?",
  ]},

  // ── FAMILY DEPTH ─────────────────────────────────────────────────
  family_deep: { any: [
    "Family shapes you in ways you sometimes don't see until much later. What's something yours gave you that you're grateful for?",
    "What's something you've inherited from your parents -- attitude, habit, belief -- that you're still deciding whether to keep?",
    "The complicated thing about family is you love them and they can also be the source of the deepest pain. How does that sit with you?",
    "Sibling relationships are their own universe. What's yours like?",
    "Parent relationships change as you get older. How has yours evolved?",
    "Some families talk about everything; others don't talk about anything. Which type are you from?",
    "What's something you wish you could say to someone in your family but haven't?",
    "Home is a complicated concept when family is complicated. What does home mean to you?",
    "Is there a family story -- something that happened before you were born -- that explains something about who you are?",
    "What do you want your own family to look like, if and when?",
    "The hardest family conversations are the ones we keep not having. Is there one of those?",
  ]},

  // ── RELIGION & SPIRITUALITY ──────────────────────────────────────
  spiritual: { any: [
    "Spirituality and religion are different things to different people. Where do you sit with that?",
    "What gives you a sense of something bigger than yourself?",
    "Do you pray or meditate or have any practice that grounds you? What is it?",
    "Faith is interesting because it's not rational and yet for many people it's the most real thing. What's your relationship with it?",
    "Has your spirituality or religion changed as you've gotten older?",
    "What do you believe happens after we die? I'm not testing you -- I'm genuinely curious.",
    "The intersection of faith and hard times is fascinating. Has yours been tested?",
    "Are there things you believe spiritually that you'd feel awkward saying out loud in certain spaces?",
    "What role does community -- church, mosque, temple, whatever -- play in your life?",
    "Gratitude is a practice. Do you have one?",
    "The big questions -- why are we here, what does it mean, is there a God -- where do you land?",
    "What does peace feel like for you, and when do you find it?",
  ]},

  // ── MONEY & FINANCIAL LIFE ───────────────────────────────────────
  money_deep: { any: [
    "Money is one of the most taboo topics and also one of the most important. How's your relationship with it?",
    "The meaning we put on money says a lot. Is it freedom, security, status -- what is it for you?",
    "Financial stress changes everything -- sleep, relationships, how you see the future. Where are you with it?",
    "What did your parents teach you about money -- explicitly or by example?",
    "There's a difference between earning money and building wealth. Have you started thinking about that?",
    "Debt is one of those things that can feel shameful even though it's incredibly common. Do you relate to that?",
    "What would financial freedom actually look like for you -- specifically?",
    "Is there something you want to do with your money that you haven't started yet?",
    "How do you feel about money compared to how you felt about it five years ago?",
    "The hustle to make ends meet is real. What's that like for you right now?",
    "What's your relationship with spending -- does it bring you peace or guilt or both?",
  ]},

  // ── MENTAL HEALTH IN REAL TERMS ──────────────────────────────────
  mentalHealthReal: { any: [
    "Mental health isn't just clinical stuff -- it's the daily weight of being alive. How heavy is yours right now?",
    "Therapy is talked about a lot but accessed by few. Have you ever tried it or thought about it?",
    "Some days the mind just isn't on your side. What does that look like for you?",
    "The world expects you to function regardless of what's going on inside. How do you manage that?",
    "Rest is different from laziness, but it's easy to confuse them. Are you actually resting?",
    "What does your mind do at night when you're trying to sleep?",
    "Anxiety has a way of making the future feel very certain and very bad. Is that something you experience?",
    "What does 'okay' actually mean when you say it? What's underneath it?",
    "The things we carry without telling anyone -- is there something like that for you?",
    "What would you say to someone who was feeling exactly what you're feeling right now?",
    "Self-care is a real thing that's been made into a cliche. What actually works for you?",
    "When did you last feel genuinely light? What was happening?",
  ]},

  // ── PURPOSE & MEANING ────────────────────────────────────────────
  purpose: { any: [
    "Purpose isn't always dramatic -- sometimes it's very quiet. What feels meaningful to you?",
    "Do you feel like you're living in alignment with what actually matters to you?",
    "The question of what you're for is one of the biggest ones. Where are you with it?",
    "Some people find purpose in big missions; others find it in showing up every day for the people they love. What's yours?",
    "Is there something you do that makes you feel like you're in the right place?",
    "What would you do for free, just because it matters?",
    "The gap between who you are and who you want to be -- how do you bridge it?",
    "When do you feel most alive?",
    "What gets you out of bed on a hard day?",
    "If you had to describe your purpose in one sentence -- imperfect, approximate -- what would it be?",
    "Some people spend their whole lives looking for meaning. Others find it in specific moments. What about you?",
  ]},

  // ── EDUCATION & INTELLIGENCE ──────────────────────────────────────
  education: { any: [
    "School and education are different things. Which did you get more of?",
    "What's something you know a lot about that surprises people?",
    "Learning is lifelong but formal education ends. How are you learning right now?",
    "What subject or topic do you wish was taught in schools but wasn't?",
    "Intelligence comes in many forms. What kind are you?",
    "The smartest person you know -- what makes them smart? Is it knowledge or something else?",
    "What's a subject you thought you hated and then discovered you actually love?",
    "Curiosity is a form of intelligence. How curious are you, really?",
    "What do you know now that you wish you'd been taught at 15?",
    "There's a particular kind of wisdom that only comes from experience, not books. Where does yours live?",
    "What would you study if you could start over with what you know now?",
  ]},

  // ── AGING & LEGACY ───────────────────────────────────────────────
  aging: { any: [
    "Getting older is funny because nobody tells you how it actually feels from the inside. How does it feel to you?",
    "What's something you care less about now than you did five years ago?",
    "What's something you care more about now than you expected to?",
    "Legacy is a big word. What do you want to mean to the people who know you?",
    "Youth is interesting because you're in it and you don't quite know it. What would you tell yours?",
    "What does wisdom look like to you? Who in your life has it?",
    "The older we get, the more clearly we see what actually matters. What's clarified for you?",
    "Do you think about getting old? What does that feel like?",
    "What do you hope the people who love you say about you when you're not in the room?",
    "What's something your parents got right that you want to carry forward?",
    "The relationship with your own mortality -- have you made any kind of peace with it?",
  ]},

  // ── DREAMS & THE SUBCONSCIOUS ────────────────────────────────────
  dreams: { any: [
    "Our dreams are wild -- what's a recurring one you've had?",
    "What's a dream or goal you've quietly given up on? Is it really gone?",
    "Where does your mind go when you let it wander?",
    "What do you daydream about most?",
    "There are dreams you tell people and dreams you keep to yourself. What's in the second category?",
    "The vision you have for your life -- is it clear, or more like a feeling you're moving toward?",
    "What's a dream that feels almost too big to say out loud?",
    "When you imagine your ideal life in full detail, what do you see?",
    "What did you dream about as a child that you've forgotten -- and is it really gone?",
    "If you had no fear of being judged, what would you actually want?",
  ]},

  // ── NATURE & THE WORLD ───────────────────────────────────────────
  nature: { any: [
    "Nature has a way of putting everything in perspective. Where do you find that?",
    "What kind of environment makes you feel most like yourself?",
    "The ocean, the bush, the city, the mountains -- where does your soul settle?",
    "There's something about being outside and just existing that resets things. Do you get that?",
    "What's the most beautiful thing you've seen in the natural world?",
    "Climate change is real and the weight of it lands differently on different people. How does it sit with you?",
    "Some people are city people and some are built for open space. Which are you?",
    "When did you last just sit somewhere and be quiet? What was that like?",
  ]},

  // ── CONVERSATION ABOUT CONVERSATION ──────────────────────────────
  conversation: { any: [
    "Real conversation is rare. Most of the time people are just waiting to talk. What do you think makes someone actually listen?",
    "What's the best conversation you've had recently?",
    "Who in your life can you have a genuinely honest conversation with?",
    "There are people who talk at you and people who talk with you. Which are you?",
    "What topic makes you completely light up?",
    "What do you wish people would ask you more often?",
    "Is there something you've been wanting to say that you haven't said yet?",
    "The most meaningful conversations are often the ones that start as something else. Has that happened to you recently?",
    "What's a question you've been sitting with lately?",
    "Some conversations change you. Which one changed you most?",
  ]},

  // ── NOSTALGIA & MEMORY ───────────────────────────────────────────
  nostalgia: { any: [
    "Nostalgia is interesting -- it's love mixed with loss. What are you nostalgic for?",
    "What's a memory that makes you happy just to think about?",
    "There are periods in life that felt ordinary while they were happening but were actually golden. What's yours?",
    "Is there a version of yourself from the past that you miss?",
    "What song takes you somewhere specific when you hear it?",
    "Childhood memories are strange -- some are so clear and some are completely gone. What's stayed?",
    "What place makes you feel nostalgic? What happened there?",
    "Some things remind you of someone. What's yours?",
    "If you could live one day from your past again, which would it be?",
    "Is there something from your childhood that shaped who you are in a way you're still unpacking?",
  ]},

  // ── CONFLICT & FORGIVENESS ───────────────────────────────────────
  conflict: { any: [
    "Conflict is part of every relationship -- it's how you move through it that matters. How do you handle it?",
    "Is there someone you need to forgive but haven't? What's stopping you?",
    "Forgiveness is often described as being for yourself, not the other person. Do you believe that?",
    "What's an argument or falling out that still sits with you?",
    "How do you behave when you're angry -- and how do you feel about that?",
    "Some people avoid conflict completely. Others meet it head-on. Where are you?",
    "What's the hardest apology you've ever had to make?",
    "Is there something you're holding against someone that you could let go of?",
    "The things we say when we're hurt aren't always true. Has that worked both ways in your life?",
    "What does reconciliation look like for you -- is it possible with anyone?",
  ]},

  // ── LONGING & WHAT'S MISSING ─────────────────────────────────────
  longing_deep: { any: [
    "There's often a gap between the life we're living and the life we feel we're supposed to have. Do you feel that?",
    "What's something you want that you don't talk about openly?",
    "Is there something -- or someone -- missing from your life right now?",
    "Longing is a specific kind of ache. What causes yours?",
    "What does your heart want that your head keeps talking it out of?",
    "If you're honest with yourself, what do you really want right now?",
    "What would make you feel like your life was really yours?",
    "Is there a version of your life that didn't happen that you still think about?",
  ]},

  // ── SELF-AWARENESS & BLIND SPOTS ─────────────────────────────────
  selfaware: { any: [
    "Self-awareness is one of the rarest and most useful things. How well do you know yourself?",
    "What's your biggest blind spot? The thing other people see that you're still working to see?",
    "What feedback have you received repeatedly that you've resisted -- and is it true?",
    "What's a pattern in your life you keep repeating even though you know better?",
    "How do you actually come across to people? How do you know?",
    "The stories we tell about ourselves aren't always accurate. What's one of yours that might not be?",
    "What triggers you in a way that feels disproportionate -- and what does that tell you?",
    "Who knows you best -- and do you think they're right?",
    "What's something you do that you know isn't serving you but you keep doing anyway?",
    "The version of you that shows up under pressure -- what is that person like?",
  ]},

  // ── HAPPINESS & WHAT MAKES LIFE GOOD ────────────────────────────
  happiness: { any: [
    "Happiness is interesting because it's not one thing. What does it actually feel like for you?",
    "What's something simple that makes you genuinely happy? Not Instagram happy -- actually happy.",
    "There's a difference between pleasure and joy. Do you have both?",
    "What was the happiest period of your life so far?",
    "Do you think happiness is a goal or a byproduct?",
    "What do you know makes you happy that you still don't prioritise enough?",
    "Is there something in your daily life that you take for granted that actually makes it good?",
    "When did you last laugh until you couldn't breathe? What was that?",
    "What's something that used to make you happy that doesn't anymore -- and what changed?",
    "If you optimised your life entirely for happiness, what would look different?",
  ]},

  // ── UBUNTU PHILOSOPHY ────────────────────────────────────────────
  ubuntu: { any: [
    "Ubuntu -- the idea that your humanity is tied to others. How do you live that out?",
    "Community is everything in this part of the world. What does yours look like?",
    "When did someone show up for you in a way you'll never forget?",
    "What's the most generous thing someone has done for you?",
    "Who are you responsible for -- not officially, but in the way that actually matters?",
    "Giving and receiving -- which is harder for you?",
    "What would your community look like if you built it exactly how you wanted?",
    "The people who shaped you -- have you ever told them what they mean to you?",
  ]},

  // ── WORK-LIFE REAL TALK ───────────────────────────────────────────
  workReal: { any: [
    "What's actually happening with your work right now -- the real version, not the elevator pitch?",
    "The grind is real but it's not sustainable. Where are you with yours?",
    "What's the difference between where you thought you'd be by now and where you actually are?",
    "Hustle culture romanticises overwork. How do you actually feel about it?",
    "What would you do differently if you started your career over knowing what you know now?",
    "The best part of your work right now -- what is it?",
    "The worst part of your work right now -- what is it?",
    "What does a win look like in your work? When did you last have one?",
    "Is there something professionally you've been afraid to try?",
    "What does your work say about who you are -- and is that the story you want to tell?",
  ]},

  // ── IDENTITY & BELONGING ──────────────────────────────────────────
  belonging: { any: [
    "Belonging is one of the deepest human needs. Where do you feel it?",
    "There are places and people that make you feel like yourself. What are yours?",
    "Identity is more complicated than most people admit. What are the layers of yours?",
    "Have you ever been in a space where you felt like you didn't belong? What was that like?",
    "The things that make you different from most people around you -- are they a strength or do they create distance?",
    "Is there a version of yourself you show the world and a version you keep private?",
    "What would people be surprised to know about you?",
    "What part of your identity matters most to you right now?",
    "The masks we wear are real. Which one are you most tired of?",
    "Where do you feel most completely yourself?",
  ]},

  // ── TOUGH LOVE & HONEST TRUTH ────────────────────────────────────
  toughLove: { any: [
    "I'm going to be straight with you because that's more useful than comfortable. Ready?",
    "You know what I think is really going on here? Want me to say it?",
    "I care about you enough to not tell you what you want to hear. The honest answer is--",
    "There's what's happening and then there's why it's happening. You know the difference. What's the real reason?",
    "You're smarter than the decision you're describing. What's actually driving it?",
    "The pattern is showing up again. Do you see it?",
    "I'll push back gently: is that actually true, or is it the story you're telling yourself?",
    "What would you tell a friend who was in exactly this situation? Now apply that.",
    "The comfortable answer isn't always the right one. You already know what you need to do.",
    "You don't need me to validate this. You need me to ask: is this actually what you want?",
  ]},

  // ── SPONTANEOUS JAZZ THOUGHTS ────────────────────────────────────
  jazzThinks: { any: [
    "Here's something I've been thinking about: the older you get, the more valuable silence becomes. Agree?",
    "Random thought: the relationships that last are the ones where you can sit in silence comfortably. Who's that for you?",
    "Something I find fascinating: people who've been through hard things have a specific quality in their eyes. A depth. Have you noticed that in yourself?",
    "I think about this a lot: most people are lonelier than they let on. Does that ring true for you?",
    "Here's my honest observation: people almost always already know the answer to the question they're asking. They just need permission.",
    "The things that matter most in life are almost never the things that get celebrated loudly. What's quietly important to you?",
    "I think kindness gets underrated as a form of strength. What do you think?",
    "Here's something I've noticed: the people who seem to have it together the most are often carrying things quietly. What about you?",
    "I think about time a lot. Not wasting it. What are you doing with yours right now?",
    "The conversations that change us are usually the ones we almost didn't have. This might be one of them.",
    "Something I find beautiful: people who are genuinely curious about other people. You seem like that. Where does it come from?",
    "I believe everyone is interesting if you ask them the right questions. What's the right question for you right now?",
  ]},

  // ── DAILY LIFE & SIMPLE MOMENTS ──────────────────────────────────
  dailyLife: { any: [
    "What did today actually feel like from the inside?",
    "What's the small thing that made today better or worse?",
    "Tell me something that happened today -- anything, it doesn't have to be significant.",
    "What are you thinking about right now that has nothing to do with what you think you should be thinking about?",
    "What's the most human thing that happened today?",
    "What did you eat today and how did it make you feel? I'm genuinely asking.",
    "Who did you talk to today and what did you actually say?",
    "What was the best five minutes of today?",
    "What are you looking forward to tomorrow?",
    "What would you do differently if today started over?",
    "What's one honest thing about today?",
  ]},

  // ── SOCIAL OBSERVATIONS ───────────────────────────────────────────
  social: { any: [
    "Social media is everyone's highlight reel and nobody's real life. How do you navigate that?",
    "What do you actually think about most of the content you consume? Is it helping or just filling space?",
    "The performative nature of modern life is exhausting. Where do you feel that most?",
    "Authenticity is rare and valuable. Who around you is truly authentic?",
    "The gap between who people are online and who they are in real life -- how big is it for you?",
    "Community has changed. What does yours look like in a real, not social-media sense?",
    "Do you think people are more connected or more lonely than previous generations?",
    "What would change for you if you came off social media for a month?",
    "Who do you envy and what does that tell you about what you actually want?",
    "Comparison is a thief but it's also information. What does yours tell you?",
  ]},

  // ── RANDOM PROFOUND ──────────────────────────────────────────────
  profound: { any: [
    "What's the most important thing you know that most people around you don't seem to see?",
    "If you had to name the one thing that's most shaped who you are, what would it be?",
    "What truth do you know that you sometimes wish you didn't?",
    "The unlived lives -- the ones we chose against -- stay with us. Is there one you think about?",
    "What's the best advice you've ever received and why haven't you fully taken it?",
    "If your life had a theme, what would it be so far?",
    "What would you want written on your gravestone? Not the traditional answer -- the real one.",
    "What's the question you keep coming back to?",
    "The things we're most afraid to admit are usually the truest things about us. What's yours?",
    "What would your best self do right now that your current self isn't doing?",
    "If you stripped away everything you do and kept only what you are -- what's left?",
  ]},
};
