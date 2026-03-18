/* ═══════════════════════════════════════════════════════
 * Jazz Buddy -- 08-voice.js
 * Voice engine: TTS, STT, voice mode, voice settings
 * SayMy Tech Developers
 * ═══════════════════════════════════════════════════════ */

// VOICE ENGINE v6 -- Full TTS + STT + Voice Mode
// ══════════════════════════════════════════════════════════════════

// ── Voice state ──────────────────────────────────────────────────
const VS = {
  ttsEnabled: false,          // set in initVS()
  voiceMode: false,
  listening: false,
  speaking: false,
  autoListen: false,          // set in initVS()
  pitch: 1.05,                // set in initVS()
  rate: 0.92,                 // set in initVS()
  volume: 1.0,               // set in initVS()
  selectedVoice: null,                // set in initVS()
  voices: [],
  recognition: null,
  currentUtterance: null,
};

// initVS -- called after DB is available
function initVS(){
  VS.ttsEnabled   = DB.g('vs_tts', false);
  VS.autoListen   = DB.g('vs_autoListen', false);
  VS.pitch        = DB.g('vs_pitch', 1.05);
  VS.rate         = DB.g('vs_rate', 0.92);
  VS.volume       = DB.g('vs_volume', 1.0);
  VS.selectedVoice= DB.g('vs_voice', null);
}

// ── Load voices ──────────────────────────────────────────────────
function loadVoices() {
  VS.voices = speechSynthesis.getVoices();
  // Try to pick a warm female English voice by default
  if (!VS.selectedVoice && VS.voices.length) {
    const preferred = [
      'Samantha','Karen','Moira','Tessa',          // macOS/iOS
      'Google UK English Female',                   // Chrome Android/Desktop
      'Microsoft Zira','Microsoft Hazel',           // Windows/Edge
      'en-GB','en-US',                              // fallback by lang
    ];
    let picked = null;
    for (const p of preferred) {
      picked = VS.voices.find(v => v.name.includes(p) || v.lang.startsWith(p));
      if (picked) break;
    }
    if (!picked) picked = VS.voices.find(v => v.lang.startsWith('en')) || VS.voices[0];
    if (picked) { VS.selectedVoice = picked.name; DB.s('vs_voice', picked.name); }
  }
}

// Voices load async on some browsers
if ('speechSynthesis' in window) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

// ── TTS core ─────────────────────────────────────────────────────
function cleanForSpeech(text) {
  return text
    .replace(/\*(.*?)\*/g, '$1')          // strip markdown bold/italic
    .replace(/#{1,6}\s/g, '')             // strip headers
    .replace(/\n+/g, '. ')               // newlines to pauses
    .replace(/[🎷🌅🌆🌙🔥🏆🎯📓✨☀️💭🆘🧘📊]/gu, '') // strip emojis
    .replace(/["]/g, '"')
    .replace(/[']/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function jazzSpeak(text, onEnd) {
  if (!('speechSynthesis' in window)) { if(onEnd) onEnd(); return; }
  if (!VS.ttsEnabled && !VS.voiceMode) { if(onEnd) onEnd(); return; }

  // Cancel any current speech
  speechSynthesis.cancel();

  const clean = cleanForSpeech(text);
  if (!clean) { if(onEnd) onEnd(); return; }

  // For long responses, split into sentences for more natural delivery
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];

  VS.speaking = true;
  updateVoiceUI('speaking');

  let idx = 0;
  function speakNext() {
    if (idx >= sentences.length) {
      VS.speaking = false;
      updateVoiceUI('idle');
      clearSpeakingWave();
      if (onEnd) onEnd();
      // Auto-listen after Jazz speaks in voice mode
      if (VS.voiceMode && VS.autoListen) {
        setTimeout(() => startListening(), 400);
      }
      return;
    }
    const utt = new SpeechSynthesisUtterance(sentences[idx].trim());
    // Apply stored voice
    if (VS.selectedVoice && VS.voices.length) {
      const v = VS.voices.find(v => v.name === VS.selectedVoice);
      if (v) utt.voice = v;
    }
    utt.pitch  = VS.pitch;
    utt.rate   = VS.rate;
    utt.volume = VS.volume;
    utt.lang   = 'en';
    utt.onend  = () => { idx++; speakNext(); };
    utt.onerror = () => { idx++; speakNext(); };
    VS.currentUtterance = utt;
    speechSynthesis.speak(utt);
  }
  speakNext();
}

function voiceStop() {
  speechSynthesis.cancel();
  VS.speaking = false;
  updateVoiceUI('idle');
  clearSpeakingWave();
}

// ── Speaking wave on chat bubbles ────────────────────────────────
function showSpeakingWave(msgEl) {
  clearSpeakingWave();
  const wave = msgEl.querySelector('.speaking-wave');
  if (wave) wave.classList.add('active');
}
function clearSpeakingWave() {
  document.querySelectorAll('.speaking-wave.active').forEach(w => w.classList.remove('active'));
}

// ── STT core ─────────────────────────────────────────────────────
function initRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.lang = 'en-US';
  r.continuous = false;
  r.interimResults = true;
  r.maxAlternatives = 1;

  r.onstart = () => {
    VS.listening = true;
    updateVoiceUI('listening');
  };

  r.onresult = (e) => {
    let interim = '', final = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) final += e.results[i][0].transcript;
      else interim += e.results[i][0].transcript;
    }
    // Show interim transcript
    const liveText = final || interim;
    if (VS.voiceMode) {
      document.getElementById('vmo-transcript').textContent = liveText;
    } else {
      txta.value = liveText;
      arz(txta);
    }
    // Auto-send on final result
    if (final.trim()) {
      setTimeout(() => {
        VS.listening = false;
        updateVoiceUI('idle');
        if (VS.voiceMode) {
          document.getElementById('vmo-transcript').textContent = '';
          const txt = final.trim();
          // Insert into textarea and fire send
          txta.value = txt;
          send();
        } else {
          send();
        }
      }, 350);
    }
  };

  r.onerror = (e) => {
    VS.listening = false;
    updateVoiceUI('idle');
    if (e.error === 'not-allowed') toast('Microphone permission denied');
    else if (e.error === 'network') toast('Voice input needs internet connection');
    else if (e.error !== 'aborted') toast('Voice error: ' + e.error);
  };

  r.onend = () => {
    VS.listening = false;
    updateVoiceUI(VS.speaking ? 'speaking' : 'idle');
    const micBtn = document.getElementById('mic-btn');
    if (micBtn) micBtn.className = '';
  };

  return r;
}

function toggleMic() {
  if (!VS.recognition) VS.recognition = initRecognition();
  if (!VS.recognition) { toast('Voice input not supported in this browser'); return; }

  if (VS.listening) {
    VS.recognition.stop();
    VS.listening = false;
    updateVoiceUI('idle');
  } else {
    // Stop any current speech before listening
    if (VS.speaking) voiceStop();
    try {
      VS.recognition.start();
    } catch(e) {
      // Recognition already started, restart
      VS.recognition.stop();
      setTimeout(() => { try { VS.recognition.start(); } catch(e2) {} }, 300);
    }
  }
}

function startListening() {
  if (!VS.recognition) VS.recognition = initRecognition();
  if (!VS.recognition || VS.listening) return;
  try { VS.recognition.start(); } catch(e) {}
}

// ── Voice UI updates ─────────────────────────────────────────────
function updateVoiceUI(state) {
  // Mic button
  const micBtn = document.getElementById('mic-btn');
  if (micBtn) {
    micBtn.className = state === 'listening' ? 'listening' : state === 'speaking' ? 'processing' : '';
    micBtn.textContent = state === 'listening' ? '⏹️' : '🎙️';
    micBtn.title = state === 'listening' ? 'Stop listening' : 'Voice input';
  }

  // Voice mode overlay
  const avatar  = document.getElementById('vmo-avatar');
  const status  = document.getElementById('vmo-status');
  const vmoMic  = document.getElementById('vmo-mic-btn');
  const vbar    = document.getElementById('voice-bar');

  if (avatar && status) {
    if (state === 'speaking') {
      avatar.className  = 'vmo-avatar speaking';
      status.textContent = 'Jazz is speaking…';
      if (vmoMic) vmoMic.textContent = '🎙️';
    } else if (state === 'listening') {
      avatar.className  = 'vmo-avatar listening';
      status.textContent = 'Listening…';
      if (vmoMic) { vmoMic.textContent = '⏹️'; vmoMic.classList.add('active'); }
    } else {
      avatar.className  = 'vmo-avatar';
      status.textContent = VS.voiceMode ? 'Tap mic to speak to Jazz' : 'Tap to speak';
      if (vmoMic) { vmoMic.textContent = '🎙️'; vmoMic.classList.remove('active'); }
    }
  }

  // Voice mode bar label
  if (vbar) {
    const vbarLabel = document.getElementById('vbar-label');
    if (vbarLabel) {
      if (state === 'speaking') vbarLabel.textContent = 'Jazz is speaking…';
      else if (state === 'listening') vbarLabel.textContent = 'Listening to you…';
      else vbarLabel.textContent = 'Voice mode on -- Jazz will speak every response';
    }
    vbar.className = state === 'speaking' ? 'show vbar-speaking' : state === 'listening' ? 'show vbar-listening' : 'show';
  }
}

// ── Voice mode toggle ─────────────────────────────────────────────
function toggleVoiceMode(on) {
  VS.ttsEnabled = (on === undefined) ? !VS.ttsEnabled : on;
  DB.s('vs_tts', VS.ttsEnabled);
  const vbar = document.getElementById('voice-bar');
  const btn  = document.getElementById('voice-toggle-btn');
  if (VS.ttsEnabled) {
    if (vbar) vbar.classList.add('show');
    if (btn) { btn.style.background = 'rgba(108,92,231,.2)'; btn.style.borderColor = 'var(--acc)'; btn.style.color = 'var(--acc2)'; }
    toast('🔊 Voice mode on -- Jazz will now speak every response');
  } else {
    if (vbar) vbar.classList.remove('show');
    if (btn) { btn.style.background = ''; btn.style.borderColor = ''; btn.style.color = ''; }
    voiceStop();
    toast('🔇 Voice mode off');
  }
}

// ── Full-screen voice mode ────────────────────────────────────────
function openVoiceMode() {
  VS.voiceMode = true;
  VS.ttsEnabled = true;
  document.getElementById('voice-mode-overlay').classList.add('show');
  updateVoiceUI('idle');
  // Speak a prompt to start
  setTimeout(() => {
    const nm = P.name || 'friend';
    jazzSpeak(`Hey ${nm}, voice mode is on. Tap the mic and talk to me.`);
  }, 300);
}

function closeVoiceMode() {
  VS.voiceMode = false;
  if (VS.listening) { VS.recognition?.stop(); VS.listening = false; }
  document.getElementById('voice-mode-overlay').classList.remove('show');
  updateVoiceUI('idle');
}

// ── Voice settings panel section ──────────────────────────────────
function buildVoiceSettingsHTML() {
  const voiceOptions = VS.voices.filter(v => v.lang.startsWith('en'))
    .map(v => `<option value="${v.name}" ${v.name === VS.selectedVoice ? 'selected' : ''}>${v.name.replace('Google ','').slice(0,28)}</option>`)
    .join('');
  return `
    <div style="background:var(--s1);border:1px solid var(--b1);border-radius:var(--rr);padding:14px 16px">
      <div class="psec-label" style="margin-bottom:12px">Voice Settings</div>
      <div class="voice-setting">
        <span class="vs-label">Jazz speaks responses</span>
        <label class="toggle-sw">
          <input type="checkbox" ${VS.ttsEnabled?'checked':''} onchange="toggleVoiceMode(this.checked)"/>
          <div class="toggle-track"></div>
        </label>
      </div>
      <div class="voice-setting">
        <span class="vs-label">Auto-listen after Jazz</span>
        <label class="toggle-sw">
          <input type="checkbox" ${VS.autoListen?'checked':''} onchange="VS.autoListen=this.checked;DB.s('vs_autoListen',this.checked)"/>
          <div class="toggle-track"></div>
        </label>
      </div>
      <div class="voice-setting">
        <span class="vs-label">Voice</span>
        <select class="vs-select" onchange="VS.selectedVoice=this.value;DB.s('vs_voice',this.value);previewVoice()">
          ${voiceOptions||'<option>Default</option>'}
        </select>
      </div>
      <div class="voice-setting">
        <span class="vs-label">Speed</span>
        <div class="vs-ctrl">
          <input type="range" class="vs-range" min="0.6" max="1.4" step="0.05" value="${VS.rate}"
            oninput="VS.rate=parseFloat(this.value);DB.s('vs_rate',VS.rate);document.getElementById('vs-rate-val').textContent=this.value"/>
          <span class="vs-val" id="vs-rate-val">${VS.rate}</span>
        </div>
      </div>
      <div class="voice-setting">
        <span class="vs-label">Pitch</span>
        <div class="vs-ctrl">
          <input type="range" class="vs-range" min="0.7" max="1.4" step="0.05" value="${VS.pitch}"
            oninput="VS.pitch=parseFloat(this.value);DB.s('vs_pitch',VS.pitch);document.getElementById('vs-pitch-val').textContent=this.value"/>
          <span class="vs-val" id="vs-pitch-val">${VS.pitch}</span>
        </div>
      </div>
      <div class="voice-setting">
        <span class="vs-label">Volume</span>
        <div class="vs-ctrl">
          <input type="range" class="vs-range" min="0.2" max="1" step="0.1" value="${VS.volume}"
            oninput="VS.volume=parseFloat(this.value);DB.s('vs_volume',VS.volume)"/>
        </div>
      </div>
      <button class="action-btn" style="margin-top:10px;width:100%;text-align:center" onclick="previewVoice()">
        🔊 Preview voice
      </button>
      <button class="action-btn" style="margin-top:6px;width:100%;text-align:center" onclick="openVoiceMode()">
        🎙️ Open full-screen voice mode
      </button>
    </div>
  `;
}

function previewVoice() {
  const previews = [
    `Hi, I'm Jazz. I'm here for you.`,
    `Hey! Good to hear from you. What's on your mind?`,
    `I'm listening. Tell me what's going on.`,
  ];
  jazzSpeak(rnd(previews));
}
