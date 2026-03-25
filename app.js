/* ──────────────────────────────────────────────
   MediCare AI+ – app.js
   Presentation-ready prototype
──────────────────────────────────────────────── */

// ── NAVBAR SCROLL ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 30) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});

// ── HAMBURGER ──
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
  navLinks.style.flexDirection = 'column';
  navLinks.style.position = 'absolute';
  navLinks.style.top = '70px'; navLinks.style.left = '0'; navLinks.style.right = '0';
  navLinks.style.background = 'rgba(9,15,30,0.98)';
  navLinks.style.padding = '20px 24px';
  navLinks.style.borderBottom = '1px solid rgba(255,255,255,0.07)';
});

// ── PARTICLES ──
(function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const count = 30;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3 + 1;
    p.style.width  = size + 'px';
    p.style.height = size + 'px';
    p.style.left   = Math.random() * 100 + '%';
    p.style.bottom = '-10px';
    const dur = Math.random() * 12 + 8;
    p.style.animationDelay    = Math.random() * 12 + 's';
    p.style.animationDuration = dur + 's';
    // Randomise colour
    const cols = ['14,240,200', '59,130,246', '139,92,246'];
    const col = cols[Math.floor(Math.random() * cols.length)];
    p.style.background = `rgba(${col},0.8)`;
    container.appendChild(p);
  }
})();

// ── FADE-UP OBSERVER ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.feature-card, .flow-step, .role-card, .vital-card').forEach(el => {
  el.classList.add('fade-up');
  observer.observe(el);
});

// ── LIVE VITALS SIMULATION ──
let hr = 72, spo2 = 98, risk = 12;
const hrEl       = document.getElementById('heartRate');
const spo2El     = document.getElementById('spo2');
const riskEl     = document.getElementById('riskScore');
const hrBar      = document.getElementById('hrBar');
const spo2Bar    = document.getElementById('spo2Bar');
const riskBar    = document.getElementById('riskBar');
const riskCard   = document.getElementById('riskCard');
const riskStatus = document.getElementById('riskStatus');
const alertWarn  = document.getElementById('alertWarn');

// Dashboard refs
const dashHR      = document.getElementById('dashHR');
const dashSPO     = document.getElementById('dashSPO');
const dashRisk    = document.getElementById('dashRisk');
const dashRiskBadge = document.getElementById('dashRiskBadge');
const tblHR       = document.getElementById('tblHR');
const tblSPO      = document.getElementById('tblSPO');
const tblRisk     = document.getElementById('tblRisk');
const tblRiskBadge = document.getElementById('tblRiskBadge');
const gaugeBar    = document.getElementById('gaugeBar');
const riskPct     = document.getElementById('riskPct');
const riskBadge   = document.getElementById('riskBadge');

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function updateVitals() {
  // Drift HR naturally
  hr   = clamp(hr   + (Math.random() - 0.5) * 4, 58, 130);
  spo2 = clamp(spo2 + (Math.random() - 0.48) * 0.8, 88, 100);

  // ML risk = simple heuristic based on HR and SpO2
  const hrRisk   = hr   > 100 ? (hr  - 100) * 2   : hr < 60 ? (60  - hr) * 3   : 0;
  const spo2Risk = spo2 < 95  ? (95  - spo2) * 8  : 0;
  risk = clamp(Math.round(hrRisk + spo2Risk + Math.random() * 4), 2, 99);

  const hrV   = Math.round(hr);
  const spoV  = spo2.toFixed(1);
  const rkV   = risk;

  // Update strip
  if (hrEl)    hrEl.textContent   = hrV;
  if (spo2El)  spo2El.textContent = spoV;
  if (riskEl)  riskEl.textContent = rkV;
  if (hrBar)   hrBar.style.width  = clamp((hrV - 40) / 120 * 100, 5, 100) + '%';
  if (spo2Bar) spo2Bar.style.width = spoV + '%';
  if (riskBar) riskBar.style.width = rkV + '%';

  // Risk badge
  let statusText = 'Low Risk', statusClass = 'status-low';
  let badgeText = 'LOW', badgeClass = 'risk-badge-low', dashBadge = 'badge-green';
  if (rkV >= 60)      { statusText = 'High Risk'; statusClass = 'status-danger'; badgeText = 'HIGH'; badgeClass = 'risk-badge-high'; dashBadge = 'badge-red'; }
  else if (rkV >= 30) { statusText = 'Moderate';  statusClass = 'status-warn';   badgeText = 'MED';  badgeClass = 'risk-badge-warn'; dashBadge = 'badge-warn'; }

  if (riskStatus) { riskStatus.textContent = statusText; riskStatus.className = 'vital-status ' + statusClass; }
  if (riskBadge)  { riskBadge.textContent  = badgeText;  riskBadge.className  = badgeClass; }
  if (gaugeBar)   gaugeBar.style.width = rkV + '%';
  if (riskPct)    riskPct.textContent  = rkV + '%';

  // Update dashboard
  if (dashHR)   dashHR.textContent  = hrV + ' BPM';
  if (dashSPO)  dashSPO.textContent = spoV + '%';
  if (dashRisk) dashRisk.textContent = rkV + '%';
  if (dashRiskBadge) { dashRiskBadge.textContent = statusText; dashRiskBadge.className = 'dash-stat-badge ' + dashBadge; }
  if (tblHR)    tblHR.textContent   = hrV + ' BPM';
  if (tblSPO)   tblSPO.textContent  = spoV + '%';
  if (tblRisk)  tblRisk.textContent = rkV + '%';
  if (tblRiskBadge) { tblRiskBadge.textContent = statusText; tblRiskBadge.className = 'dash-stat-badge ' + dashBadge; }

  // Warning alert
  if (alertWarn) alertWarn.style.display = (spo2 < 92 || risk >= 60) ? 'flex' : 'none';
}

// ── CHART.JS-LIKE CANVAS CHARTS (pure canvas, no lib) ──
let mainChartData = Array.from({length: 30}, () => 68 + Math.random() * 12);
let vitalsChartHR = [...mainChartData];
let vitalsChartO2 = Array.from({length: 30}, () => 96 + Math.random() * 3);

function drawLineChart(canvas, datasets, opts = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width  = canvas.offsetWidth  || canvas.width;
  const H = canvas.height = canvas.offsetHeight || canvas.height;
  ctx.clearRect(0, 0, W, H);

  datasets.forEach(({data, color, label}) => {
    const min = opts.min ?? Math.min(...data) - 5;
    const max = opts.max ?? Math.max(...data) + 5;
    const range = max - min || 1;
    const step  = W / (data.length - 1);

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0,   color + '30');
    grad.addColorStop(0.7, color + '06');
    grad.addColorStop(1,   color + '00');

    // Draw fill
    ctx.beginPath();
    ctx.moveTo(0, H - ((data[0] - min) / range) * H * 0.85 - H * 0.07);
    data.forEach((v, i) => {
      const x = i * step;
      const y = H - ((v - min) / range) * H * 0.85 - H * 0.07;
      if (i === 0) ctx.moveTo(x, y);
      else {
        const px = (i - 1) * step, py = H - ((data[i-1] - min) / range) * H * 0.85 - H * 0.07;
        const cpx1 = px + step * 0.4, cpy1 = py, cpx2 = x - step * 0.4, cpy2 = y;
        ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, x, y);
      }
    });
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();

    // Draw line
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i * step;
      const y = H - ((v - min) / range) * H * 0.85 - H * 0.07;
      if (i === 0) ctx.moveTo(x, y);
      else {
        const px = (i - 1) * step, py = H - ((data[i-1] - min) / range) * H * 0.85 - H * 0.07;
        ctx.bezierCurveTo(px + step*0.4, py, x - step*0.4, y, x, y);
      }
    });
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
  });
}

function drawMiniChart(canvas, data, color) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width  = canvas.offsetWidth  || 220;
  const H = canvas.height = canvas.offsetHeight || 60;
  ctx.clearRect(0, 0, W, H);
  const min = Math.min(...data) - 4, max = Math.max(...data) + 4;
  const range = max - min || 1;
  const step  = W / (data.length - 1);

  ctx.beginPath();
  data.forEach((v, i) => {
    const x = i * step;
    const y = H - ((v - min) / range) * H * 0.8 - H * 0.05;
    if (i === 0) ctx.moveTo(x, y);
    else {
      const px = (i-1)*step, py = H - ((data[i-1]-min)/range)*H*0.8 - H*0.05;
      ctx.bezierCurveTo(px+step*0.4, py, x-step*0.4, y, x, y);
    }
  });
  ctx.strokeStyle = color; ctx.lineWidth = 1.8; ctx.stroke();

  // Dots at latest
  const last = data.length - 1;
  const lx = last * step;
  const ly = H - ((data[last] - min) / range) * H * 0.8 - H * 0.05;
  ctx.beginPath(); ctx.arc(lx, ly, 3, 0, Math.PI * 2);
  ctx.fillStyle = color; ctx.fill();
}

// ── MINI CHART ──
const mini1Data = Array.from({length: 20}, () => 65 + Math.random() * 20);
const miniCanvas1 = document.getElementById('miniChart1');
function renderMini() {
  drawMiniChart(miniCanvas1, mini1Data, '#0ef0c8');
}
renderMini();

// ── MAIN & VITALS CHART ──
const mainCanvas   = document.getElementById('mainChart');
const vitalsCanvas = document.getElementById('vitalsChart');

function renderCharts() {
  if (mainCanvas) {
    mainCanvas.width = mainCanvas.offsetWidth;
    drawLineChart(mainCanvas,
      [{ data: mainChartData, color: '#0ef0c8' }],
      { min: 55, max: 130 }
    );
  }
  if (vitalsCanvas) {
    vitalsCanvas.width = vitalsCanvas.offsetWidth;
    drawLineChart(vitalsCanvas,
      [
        { data: vitalsChartHR, color: '#0ef0c8', label: 'HR' },
        { data: vitalsChartO2, color: '#3b82f6', label: 'SpO2' }
      ],
      { min: 50, max: 110 }
    );
  }
}
renderCharts();
window.addEventListener('resize', renderCharts);

// ── MAIN LOOP: update every 2s ──
setInterval(() => {
  updateVitals();

  // Push to charts
  mainChartData.push(hr); mainChartData.shift();
  vitalsChartHR.push(hr); vitalsChartHR.shift();
  vitalsChartO2.push(spo2); vitalsChartO2.shift();
  mini1Data.push(hr); mini1Data.shift();

  renderCharts();
  renderMini();
}, 2000);
updateVitals();

// ── DASHBOARD NAV ──
const navItems = document.querySelectorAll('.sidebar-nav-item');
const panels   = document.querySelectorAll('.dash-panel');
const panelMap = { 'nav-overview': 'panel-overview', 'nav-vitals': 'panel-vitals', 'nav-ehr': 'panel-ehr', 'nav-reports': 'panel-reports', 'nav-chat': 'panel-chat' };

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    navItems.forEach(n => n.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    item.classList.add('active');
    const target = panelMap[item.id];
    if (target) {
      const panel = document.getElementById(target);
      if (panel) {
        panel.classList.add('active');
        setTimeout(renderCharts, 50);
      }
    }
  });
});

// ── NLP DEMO BUTTON ──
const uploadDemoBtn = document.getElementById('uploadDemoBtn');
const reportSummary = document.getElementById('reportSummary');
if (uploadDemoBtn && reportSummary) {
  uploadDemoBtn.addEventListener('click', () => {
    uploadDemoBtn.textContent = '⏳ Processing...';
    uploadDemoBtn.disabled = true;
    setTimeout(() => {
      reportSummary.style.display = 'block';
      uploadDemoBtn.textContent = '✅ Done! Summarised';
    }, 1800);
  });
}

// ── AI CHATBOT ──
const BotReplies = {
  'what is my current risk level?': [
    'Based on your latest sensor readings, your ML risk score is ',
    '%. ',
    { low:  'That puts you in the LOW risk category — great job keeping your health in check!',
      mid:  'That is a MODERATE risk level. Consider resting and monitoring closely.',
      high: '⚠️ High risk detected! Please contact your doctor immediately or call emergency services.' }
  ],
  'what does my spo₂ mean?': () => `Your SpO₂ (blood oxygen saturation) is currently ${spo2.toFixed(1)}%. The normal range is 95–100%. Your level is ${spo2 >= 95 ? 'within normal range ✅' : '⚠️ slightly below normal — please rest and breathe slowly.'}`,
  'should i be worried about my heart rate?': () => {
    const hrV = Math.round(hr);
    if (hrV < 60)  return `Your heart rate is ${hrV} BPM, which is below the normal range (60–100). This may indicate bradycardia. Please consult your physician.`;
    if (hrV > 100) return `Your heart rate is ${hrV} BPM, which is elevated above normal (60–100). This is called tachycardia. Rest, stay hydrated, and monitor closely.`;
    return `Your heart rate is ${hrV} BPM — perfectly normal! The normal range is 60–100 BPM. Keep up your current healthy routine.`;
  },
  'default': (q) => `Based on your health records, I don't have a specific answer for "${q.slice(0,40)}..." right now. I can tell you that your current vitals are: HR ${Math.round(hr)} BPM, SpO₂ ${spo2.toFixed(1)}%, and risk score ${risk}%. Would you like to know more about any of these?`
};

function addChatMsg(text, sender = 'bot') {
  const chatWindow = document.getElementById('chatWindow');
  if (!chatWindow) return;
  const msg  = document.createElement('div');
  msg.className = 'chat-msg' + (sender === 'user' ? ' user-chat' : '');
  const avatar = document.createElement('div');
  avatar.className = 'chat-avatar' + (sender === 'user' ? ' user-avatar' : '');
  avatar.textContent = sender === 'user' ? 'JD' : '🤖';
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble' + (sender === 'user' ? ' user-bubble' : '');
  bubble.innerHTML = text;
  if (sender === 'user') { msg.appendChild(bubble); msg.appendChild(avatar); }
  else                   { msg.appendChild(avatar); msg.appendChild(bubble); }
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function getBotReply(input) {
  const q = input.toLowerCase().trim();
  if (q.includes('risk')) {
    const lvl = risk >= 60 ? 'high' : risk >= 30 ? 'mid' : 'low';
    const msgs = {
      low:  `Based on your latest sensor readings, your ML risk score is <strong>${risk}%</strong>. That puts you in the <strong>LOW risk</strong> category — great job keeping your health in check! ✅`,
      mid:  `Based on your latest sensor readings, your ML risk score is <strong>${risk}%</strong>. That is a <strong>MODERATE</strong> risk level. Consider resting and monitoring closely. ⚠️`,
      high: `⚠️ Your risk score is <strong>${risk}%</strong> — <strong>HIGH RISK</strong>! Please contact your doctor immediately.`
    };
    return msgs[lvl];
  }
  if (q.includes('spo') || q.includes('oxygen')) {
    const spoV = spo2.toFixed(1);
    return `Your SpO₂ (blood oxygen saturation) is currently <strong>${spoV}%</strong>. The normal range is 95–100%. ${parseFloat(spoV) >= 95 ? 'You are within the normal range ✅' : '⚠️ Slightly below normal — please rest and breathe slowly.'}`;
  }
  if (q.includes('heart rate') || q.includes('bpm') || q.includes('pulse')) {
    const hrV = Math.round(hr);
    if (hrV < 60)  return `Your heart rate is <strong>${hrV} BPM</strong>, below the normal 60–100 range. This may indicate bradycardia — please consult your physician.`;
    if (hrV > 100) return `Your heart rate is <strong>${hrV} BPM</strong>, elevated above normal (60–100). Rest, stay hydrated, and monitor closely.`;
    return `Your heart rate is <strong>${hrV} BPM</strong> — perfectly normal! Keep up your healthy routine ✅`;
  }
  if (q.includes('allerg')) return `According to your EHR, you have a documented allergy to <strong>Penicillin</strong>. Always inform healthcare providers before any procedure.`;
  if (q.includes('medic')) return `Your current medication is <strong>Amlodipine 5mg</strong>, prescribed for hypertension. Please take it as directed and don't skip doses.`;
  if (q.includes('blood type') || q.includes('blood group')) return `Your blood type is <strong>O+</strong> (O Positive), according to your health records.`;
  return `Based on your health data, I'd recommend monitoring your vitals closely. Your current readings: HR <strong>${Math.round(hr)} BPM</strong>, SpO₂ <strong>${spo2.toFixed(1)}%</strong>, Risk Score <strong>${risk}%</strong>. Is there a specific concern you'd like me to address?`;
}

window.askQuestion = function(q) {
  const chatInput = document.getElementById('chatInput');
  if (chatInput) chatInput.value = q;
  sendChat(q);
};

function sendChat(override = null) {
  const chatInput = document.getElementById('chatInput');
  const chatWindow = document.getElementById('chatWindow');
  if (!chatInput || !chatWindow) return;
  const msg = override || chatInput.value.trim();
  if (!msg) return;
  chatInput.value = '';
  addChatMsg(msg, 'user');

  // Simulate typing
  const typingEl = document.createElement('div');
  typingEl.className = 'chat-msg';
  typingEl.innerHTML = `<div class="chat-avatar">🤖</div><div class="chat-bubble" style="display:flex;gap:5px;align-items:center;padding:12px 16px">
    ${[1,2,3].map(i => `<span style="width:7px;height:7px;border-radius:50%;background:#94a3b8;animation:typingBounce 1.2s ${(i-1)*0.15}s ease infinite;display:inline-block"></span>`).join('')}
  </div>`;
  chatWindow.appendChild(typingEl);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  setTimeout(() => {
    chatWindow.removeChild(typingEl);
    addChatMsg(getBotReply(msg), 'bot');
  }, 1200 + Math.random() * 600);
}

const chatSendBtn = document.getElementById('chatSendBtn');
const chatInput   = document.getElementById('chatInput');
if (chatSendBtn) chatSendBtn.addEventListener('click', () => sendChat());
if (chatInput)   chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChat(); });

// ── SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// ── SECTION REVEAL ON SCROLL ──
const revObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08 });
document.querySelectorAll('.flow-step, .role-card').forEach(el => revObserver.observe(el));

// ── CANVAS RESIZE ──
window.addEventListener('resize', () => {
  setTimeout(renderCharts, 100);
  renderMini();
});
