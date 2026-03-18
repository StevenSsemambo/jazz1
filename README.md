# Jazz Buddy 🎷
### by SayMy Tech Developers

> Your AI friend who actually gets you. Fully offline, learns continuously.

---

## 📁 Project Structure

```
jazz-buddy-pwa/
│
├── index.html              ← App shell (HTML only — 10KB, 229 lines)
│
├── css/
│   ├── base.css            ← Core layout, chat, panels, onboarding (28KB)
│   └── features.css        ← Voice, journal, auth, tour, customization (14KB)
│
├── js/                     ← JavaScript modules (load order matters)
│   ├── 01-core.js          ← Utils, storage, profile, memory, history, health
│   ├── 02-engine.js        ← Emotion + intent detection, friendship, learning
│   ├── 03-responses.js     ← Full response library (1000+ responses)
│   ├── 04-ui-panels.js     ← UI functions, onboarding, all panel renderers
│   ├── 05-send.js          ← Main send() pipeline + PWA setup
│   ├── 06-checkin-goals-crisis.js ← Daily check-in, goals, crisis resources
│   ├── 07-intelligence.js  ← Thread tracker, emotional arc, exercises, journal
│   ├── 08-voice.js         ← TTS, STT, voice mode, voice settings
│   ├── 09-auth.js          ← Login, signup, guest mode, sign out
│   ├── 10-tour.js          ← App tour (first-time users)
│   ├── 11-customization.js ← Themes, fonts, bubble styles
│   ├── 12-notifications.js ← Push notifications, proactive messages
│   ├── 13-personality.js   ← Jazz's inner life, birthday, letter, sleep stories
│   └── 14-init.js          ← App initialisation (runs last)
│
├── icons/                  ← App icons (8 sizes for all devices)
│   ├── icon-72.png
│   ├── icon-96.png
│   ├── icon-128.png
│   ├── icon-144.png
│   ├── icon-152.png
│   ├── icon-192.png
│   ├── icon-384.png
│   └── icon-512.png
│
├── manifest.json           ← PWA manifest (installable app metadata)
├── sw.js                   ← Service Worker (offline cache + notifications)
└── README.md               ← This file
```

---

## 🔧 Debugging Guide — Which file to edit

| What you want to change | Edit this file |
|-------------------------|---------------|
| App colours, layout, fonts | `css/base.css` |
| Voice UI, journal, tour styling | `css/features.css` |
| Jazz's responses to messages | `js/03-responses.js` |
| What triggers each intent | `js/02-engine.js` → `const IM` |
| How Jazz detects emotion | `js/02-engine.js` → `const EL` |
| Check-in ritual questions | `js/06-checkin-goals-crisis.js` |
| Goal tracking logic | `js/06-checkin-goals-crisis.js` |
| Crisis resources (phone numbers) | `js/06-checkin-goals-crisis.js` → `CRISIS_DB` |
| Voice settings, TTS, STT | `js/08-voice.js` |
| Login/signup/signout | `js/09-auth.js` |
| Colour themes | `js/11-customization.js` → `const THEMES` |
| Push notification messages | `js/12-notifications.js` |
| Jazz's thoughts of the day | `js/13-personality.js` → `JAZZ_THOUGHTS` |
| Birthday message | `js/13-personality.js` → `generateBirthdayMessage()` |
| Letter from Jazz | `js/13-personality.js` → `generateJazzLetter()` |
| Sleep stories | `js/13-personality.js` → `SLEEP_STORIES` |
| App tour steps | `js/10-tour.js` → `TOUR_STEPS` |
| App startup logic | `js/14-init.js` |
| HTML structure | `index.html` |
| Offline caching list | `sw.js` → `CORE_ASSETS` |

---

## 🚀 How to deploy

### Option 1 — Netlify Drop (fastest)
1. Go to **https://app.netlify.com/drop**
2. Drag the entire `jazz-buddy-pwa/` folder
3. Done — live HTTPS URL in ~10 seconds

### Option 2 — GitHub Pages
1. Create repo, upload all files keeping structure intact
2. Settings → Pages → Deploy from main branch

### Option 3 — Local dev server
```bash
cd jazz-buddy-pwa
python3 -m http.server 8080
# Open: http://localhost:8080
```
> ⚠️ Do NOT open index.html directly from Finder/Explorer. Service workers require a server.

---

## ⚠️ Important: JS file load order

The modules must load in numeric order (01 → 14). This is already set correctly in `index.html`. If you add a new module:

1. Create `js/15-yourmodule.js`
2. Add `<script src="js/15-yourmodule.js" defer></script>` to `index.html`
3. Add `'./js/15-yourmodule.js'` to `CORE_ASSETS` in `sw.js`

---

## 📋 Feature list (v7)

35+ features including: Auth, App tour, Voice mode (TTS+STT), Journal, Goals, Daily check-in, Weekly report, Letter from Jazz, Sleep stories, Birthday messages, Push notifications, 8 colour themes, Custom emotions, Relationship letters, Crisis resources (10 countries), and much more.

---

*Jazz Buddy v7 — SayMy Tech Developers*
