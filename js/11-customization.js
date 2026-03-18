/* ═══════════════════════════════════════════════════════
 * Jazz Buddy -- 11-customization.js
 * Customization: themes, fonts, bubbles, font size
 * SayMy Tech Developers
 * ═══════════════════════════════════════════════════════ */

// CUSTOMIZATION SYSTEM
// ══════════════════════════════════════════════════════════════════
const THEMES = {
  purple: { name: 'Jazz Purple', acc: '#6c5ce7', acc2: '#a29bfe', acc3: '#4834d4', bg: '#080810', gradient: 'linear-gradient(135deg,#6c5ce7,#a29bfe)' },
  midnight: { name: 'Midnight Blue', acc: '#0984e3', acc2: '#74b9ff', acc3: '#0652dd', bg: '#05050f', gradient: 'linear-gradient(135deg,#0984e3,#74b9ff)' },
  rose: { name: 'Rose Gold', acc: '#e84393', acc2: '#fd79a8', acc3: '#c0392b', bg: '#100810', gradient: 'linear-gradient(135deg,#e84393,#fd79a8)' },
  forest: { name: 'Forest', acc: '#00b894', acc2: '#55efc4', acc3: '#00a86b', bg: '#061210', gradient: 'linear-gradient(135deg,#00b894,#55efc4)' },
  sunset: { name: 'Sunset', acc: '#fd8a6a', acc2: '#fdcb6e', acc3: '#e17055', bg: '#100a08', gradient: 'linear-gradient(135deg,#fd8a6a,#fdcb6e)' },
  slate: { name: 'Slate', acc: '#636e72', acc2: '#b2bec3', acc3: '#2d3436', bg: '#080a0c', gradient: 'linear-gradient(135deg,#636e72,#b2bec3)' },
  teal: { name: 'Teal', acc: '#00cec9', acc2: '#81ecec', acc3: '#019695', bg: '#050f10', gradient: 'linear-gradient(135deg,#00cec9,#81ecec)' },
  amber: { name: 'Amber', acc: '#fdcb6e', acc2: '#ffeaa7', acc3: '#e17055', bg: '#100e05', gradient: 'linear-gradient(135deg,#fdcb6e,#ffeaa7)' },
};

let CUST = { theme: 'purple', fontSize: 15, bubbleStyle: 'rounded', fontFamily: 'default' };
// Load saved customization (called after DB is available)
function initCUST(){ try{ const saved=DB.g('cust',null); if(saved)CUST=saved; }catch(e){} }

function applyTheme(key) {
  const t = THEMES[key];
  if (!t) return;
  const r = document.documentElement.style;
  r.setProperty('--acc', t.acc);
  r.setProperty('--acc2', t.acc2);
  r.setProperty('--acc3', t.acc3);
  r.setProperty('--bg', t.bg);
  CUST.theme = key;
  DB.s('cust', CUST);
}

function applyFontSize(size) {
  document.body.style.fontSize = size + 'px';
  CUST.fontSize = size;
  DB.s('cust', CUST);
}

function applyBubbleStyle(style) {
  const chat = document.getElementById('chat');
  chat.dataset.bubble = style;
  CUST.bubbleStyle = style;
  DB.s('cust', CUST);
  // Apply CSS
  const rr = { rounded: '14px', sharp: '4px', pill: '22px' }[style] || '14px';
  document.documentElement.style.setProperty('--rr', rr);
}

function applyFont(family) {
  const fonts = {
    default: "'DM Sans', sans-serif",
    serif: "'Fraunces', serif",
    mono: "'Courier New', monospace",
    system: "system-ui, sans-serif",
  };
  document.body.style.fontFamily = fonts[family] || fonts.default;
  CUST.fontFamily = family;
  DB.s('cust', CUST);
}

function restoreCustomization() {
  if (!CUST) return;
  if (CUST.theme) applyTheme(CUST.theme);
  if (CUST.fontSize) applyFontSize(CUST.fontSize);
  if (CUST.bubbleStyle) applyBubbleStyle(CUST.bubbleStyle);
  if (CUST.fontFamily) applyFont(CUST.fontFamily);
}

function renderSettings() {
  document.getElementById('pb-settings').innerHTML = `
    <div class="cust-section">
      <div class="psec-label">Colour Theme</div>
      <div class="theme-grid">
        ${Object.entries(THEMES).map(([k, t]) => `
          <div class="theme-swatch ${CUST.theme === k ? 'active' : ''}"
               style="background:${t.gradient}"
               onclick="applyTheme('${k}');document.querySelectorAll('.theme-swatch').forEach(s=>s.classList.remove('active'));this.classList.add('active')"
               title="${t.name}"></div>
        `).join('')}
      </div>
    </div>
    <div class="cust-section">
      <div class="psec-label">Chat Bubble Style</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${['rounded','sharp','pill'].map(s => `
          <button class="bubble-opt ${CUST.bubbleStyle===s?'active':''}"
                  onclick="applyBubbleStyle('${s}');document.querySelectorAll('.bubble-opt').forEach(b=>b.classList.remove('active'));this.classList.add('active')">
            ${s.charAt(0).toUpperCase()+s.slice(1)}
          </button>`).join('')}
      </div>
    </div>
    <div class="cust-section">
      <div class="psec-label">Font Style</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${[['default','DM Sans'],['serif','Fraunces'],['mono','Mono'],['system','System']].map(([k,n]) => `
          <button class="font-opt ${CUST.fontFamily===k?'active':''}"
                  style="${k==='serif'?'font-family:Fraunces,serif':k==='mono'?'font-family:monospace':''}"
                  onclick="applyFont('${k}');document.querySelectorAll('.font-opt').forEach(b=>b.classList.remove('active'));this.classList.add('active')">
            ${n}
          </button>`).join('')}
      </div>
    </div>
    <div class="cust-section">
      <div class="psec-label">Text Size</div>
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:12px;color:var(--tx3)">A</span>
        <input type="range" class="vs-range" style="width:100%" min="13" max="18" step="1" value="${CUST.fontSize||15}"
          oninput="applyFontSize(parseInt(this.value));document.getElementById('fs-val').textContent=this.value+'px'"/>
        <span style="font-size:18px;color:var(--tx3)">A</span>
        <span class="vs-val" id="fs-val">${CUST.fontSize||15}px</span>
      </div>
    </div>
    ${buildVoiceSettingsHTML()}
    <div class="cust-section">
      <div class="psec-label">Notifications</div>
      <div class="voice-setting">
        <span class="vs-label">Enable push notifications</span>
        <button class="action-btn" onclick="requestNotifPerm()">Enable</button>
      </div>
    </div>
    <div class="cust-section">
      <div class="psec-label">Account</div>
      <div style="font-size:13px;color:var(--tx2);margin-bottom:8px">Signed in as: <strong style="color:var(--acc2)">${DB.g('currentUser','Guest')}</strong></div>
      <button class="signout-btn" onclick="closePanel();signOut()">Sign Out</button>
    </div>
    <div style="text-align:center;margin-top:20px;font-size:10px;color:var(--tx4);letter-spacing:.5px;text-transform:uppercase">Jazz Buddy · SayMy Tech Developers · v7</div>
  `;
}
