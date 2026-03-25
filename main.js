/* ════════════════════════════════════════════════
   MediCare AI+ — main.js
   Handles: landing page, login auth, dashboard
════════════════════════════════════════════════ */

const PAGE = document.body.classList.contains('login-page')
  ? 'login'
  : document.body.classList.contains('dash-page')
  ? 'dashboard'
  : 'landing';

/* ════════════════════
   PATIENT DATA (inline — works on file:// without a server)
════════════════════ */
const PATIENTS = [
  {
    id:"P001", email:"john@medicare.com", password:"patient123", role:"patient",
    profile:{ firstName:"John", lastName:"Dela Cruz", dob:"1990-03-15", age:35, gender:"Male",
      bloodType:"O+", height:"175 cm", weight:"68 kg", phone:"+63 912 345 6789",
      address:"Makati City, Metro Manila", avatar:"JD", avatarColor:"#2563eb" },
    medicalHistory:{
      diagnoses:[{ condition:"Hypertension", year:2021, status:"Ongoing" }],
      allergies:["Penicillin"],
      medications:[{ name:"Amlodipine", dose:"5mg", frequency:"Once daily" }],
      familyHistory:["Diabetes (Father)","Hypertension (Mother)"],
      emergencyContact:{ name:"Maria Dela Cruz", relation:"Spouse", phone:"+63 917 654 3210" }
    },
    vitals:{ current:{ heartRate:74, spo2:97.8, riskScore:14 },
      history:[
        { date:"2026-03-24", hr:74, spo2:97.8, risk:14 },
        { date:"2026-03-23", hr:78, spo2:97.2, risk:18 },
        { date:"2026-03-22", hr:69, spo2:98.5, risk:8  },
        { date:"2026-03-21", hr:82, spo2:96.9, risk:22 },
        { date:"2026-03-20", hr:77, spo2:97.6, risk:15 },
        { date:"2026-03-19", hr:71, spo2:98.1, risk:11 },
        { date:"2026-03-18", hr:85, spo2:95.8, risk:31 }
      ]
    },
    reports:[
      { id:"R001", title:"CBC Panel – March 2026", date:"2026-03-10", type:"Blood Test",
        summary:"Haemoglobin is 11.2 g/dL (slightly below normal 13.5–17.5), suggesting mild anaemia. White blood cell count 7.2 × 10³/μL (normal). Platelets 245 × 10³/μL (normal). <strong>Recommendation:</strong> Consider iron supplementation and re-test in 4 weeks.",
        raw:"Hgb: 11.2 g/dL | WBC: 7.2 ×10³/μL | PLT: 245 ×10³/μL | RBC: 4.1 M/μL" },
      { id:"R002", title:"Lipid Profile – Feb 2026", date:"2026-02-14", type:"Blood Test",
        summary:"Total cholesterol 198 mg/dL (borderline). LDL 122 mg/dL (slightly elevated — target &lt;100 for hypertension patients). HDL 48 mg/dL (acceptable). Triglycerides 142 mg/dL (normal). <strong>Recommendation:</strong> Lifestyle modification advised.",
        raw:"Total Chol: 198 | LDL: 122 | HDL: 48 | TG: 142 mg/dL" }
    ],
    appointments:[
      { id:"A001", doctor:"Dr. Maria Santos", date:"2026-03-28", time:"10:00 AM", type:"Cardiology Follow-up", status:"Upcoming" },
      { id:"A002", doctor:"Dr. Jose Reyes",   date:"2026-02-20", time:"2:00 PM",  type:"General Check-up",     status:"Completed" }
    ],
    chatHistory:[
      { sender:"bot",  text:"Hello John! I'm your MediCare AI+ health assistant. I can answer questions based on your own medical records and live vitals. How can I help you today?" },
      { sender:"user", text:"Is my blood pressure medication working?" },
      { sender:"bot",  text:"Based on your EHR, you are on Amlodipine 5mg (2021). Your sensor data shows stable heart rate this week (69–85 BPM range). Continue your medication and attend your Cardiology Follow-up on March 28." }
    ]
  },
  {
    id:"P002", email:"ana@medicare.com", password:"patient123", role:"patient",
    profile:{ firstName:"Ana", lastName:"Reyes", dob:"1995-07-22", age:30, gender:"Female",
      bloodType:"A+", height:"162 cm", weight:"55 kg", phone:"+63 920 111 2233",
      address:"Quezon City, Metro Manila", avatar:"AR", avatarColor:"#7c3aed" },
    medicalHistory:{
      diagnoses:[{ condition:"Type 2 Diabetes", year:2023, status:"Managed" }],
      allergies:["Sulfa drugs","Aspirin"],
      medications:[{ name:"Metformin", dose:"500mg", frequency:"Twice daily with meals" }],
      familyHistory:["Diabetes (Both parents)","Heart Disease (Grandfather)"],
      emergencyContact:{ name:"Carlos Reyes", relation:"Brother", phone:"+63 918 999 0011" }
    },
    vitals:{ current:{ heartRate:81, spo2:99.1, riskScore:19 },
      history:[
        { date:"2026-03-24", hr:81, spo2:99.1, risk:19 },
        { date:"2026-03-23", hr:76, spo2:98.7, risk:12 },
        { date:"2026-03-22", hr:88, spo2:97.9, risk:26 },
        { date:"2026-03-21", hr:73, spo2:99.2, risk:9  },
        { date:"2026-03-20", hr:79, spo2:98.4, risk:16 },
        { date:"2026-03-19", hr:92, spo2:94.1, risk:58 },
        { date:"2026-03-18", hr:75, spo2:98.8, risk:13 }
      ]
    },
    reports:[
      { id:"R003", title:"HbA1c Test – March 2026", date:"2026-03-05", type:"Blood Test",
        summary:"HbA1c is 7.1% — just above the target of &lt;7% for diabetes management. Blood glucose control is improving but needs slight adjustment. Fasting blood sugar was 128 mg/dL. <strong>Recommendation:</strong> Continue Metformin and dietary modifications. Follow-up in 3 months.",
        raw:"HbA1c: 7.1% | FBS: 128 mg/dL | Creatinine: 0.8 mg/dL" }
    ],
    appointments:[
      { id:"A003", doctor:"Dr. Liza Cruz", date:"2026-04-02", time:"9:00 AM", type:"Endocrinology Review", status:"Upcoming" }
    ],
    chatHistory:[
      { sender:"bot", text:"Hello Ana! I'm your MediCare AI+ health assistant. I can answer questions based on your own medical records and live vitals. What would you like to know today?" }
    ]
  }
];

/* ════════════════════
   AUTH HELPERS
════════════════════ */
function saveSession(patient) {
  sessionStorage.setItem('mc_patient', JSON.stringify(patient));
}
function getSession() {
  try { return JSON.parse(sessionStorage.getItem('mc_patient')); } catch { return null; }
}
function clearSession() {
  sessionStorage.removeItem('mc_patient');
}

// Guard dashboard — redirect to login if not authenticated
if (PAGE === 'dashboard' && !getSession()) {
  window.location.href = 'login.html';
}
// Redirect if already logged in and visiting login
if (PAGE === 'login' && getSession()) {
  window.location.href = 'dashboard.html';
}

/* ════════════════════
   CANVAS CHART UTIL
════════════════════ */
function drawChart(canvas, datasets, opts = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth || canvas.clientWidth || 400;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  datasets.forEach(({ data, color }) => {
    if (!data || data.length < 2) return;
    const allVals = data.filter(v => v != null);
    const min = opts.min ?? (Math.min(...allVals) - 4);
    const max = opts.max ?? (Math.max(...allVals) + 4);
    const range = max - min || 1;
    const step  = W / (data.length - 1);
    const pad   = H * 0.1;

    const getY = v => H - pad - ((v - min) / range) * (H - pad * 2);

    // Fill gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0,   color + '28');
    grad.addColorStop(0.8, color + '04');
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i * step, y = getY(v);
      if (i === 0) ctx.moveTo(x, y);
      else {
        const px = (i-1)*step, py = getY(data[i-1]);
        ctx.bezierCurveTo(px+step*0.45, py, x-step*0.45, y, x, y);
      }
    });
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();

    // Line
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i * step, y = getY(v);
      if (i === 0) ctx.moveTo(x, y);
      else {
        const px = (i-1)*step, py = getY(data[i-1]);
        ctx.bezierCurveTo(px+step*0.45, py, x-step*0.45, y, x, y);
      }
    });
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();

    // Live dot
    const lx = (data.length-1) * step, ly = getY(data[data.length-1]);
    ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI*2);
    ctx.fillStyle = color; ctx.fill();
    ctx.beginPath(); ctx.arc(lx, ly, 7, 0, Math.PI*2);
    ctx.fillStyle = color + '30'; ctx.fill();
  });
}

/* ════════════════════
   LANDING PAGE
════════════════════ */
if (PAGE === 'landing') {

  // Navbar scroll
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Hamburger
  const ham = document.getElementById('hamburger');
  const drawer = document.getElementById('mobileDrawer');
  ham?.addEventListener('click', () => drawer?.classList.toggle('open'));
  drawer?.addEventListener('click', e => { if (e.target === drawer) drawer.classList.remove('open'); });

  // Fade-up on scroll
  const fadeEls = document.querySelectorAll('.feat-card, .flow-item, .role-card');
  fadeEls.forEach(el => el.classList.add('fade-up'));
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  fadeEls.forEach(el => obs.observe(el));

  // Live vitals simulation on hero card
  let heroHR = 74, heroSPO = 97.8, heroRisk = 14;
  const heroHRData = Array.from({length:20}, () => 68 + Math.random()*14);
  const heroCanvas = document.getElementById('heroChart');
  const featCanvas = document.getElementById('featChart');
  const featData   = Array.from({length:20}, () => 66 + Math.random()*20);

  function updateHero() {
    heroHR   = Math.max(58, Math.min(120, heroHR + (Math.random()-.5)*5));
    heroSPO  = Math.max(90, Math.min(100, heroSPO + (Math.random()-.48)*.6));
    const h  = Math.round(heroHR), s = heroSPO.toFixed(1);
    const hrRisk = heroHR>100?(heroHR-100)*2:heroHR<60?(60-heroHR)*3:0;
    heroRisk = Math.round(Math.min(99, hrRisk + (100-heroSPO)*7 + Math.random()*3));

    const el = n => document.getElementById(n);
    if(el('heroHR'))   el('heroHR').innerHTML   = `${h} <small>BPM</small>`;
    if(el('heroSPO'))  el('heroSPO').innerHTML  = `${s} <small>%</small>`;
    if(el('heroRisk')) el('heroRisk').innerHTML = `${heroRisk} <small>%</small>`;

    const badge = el('heroRiskBadge');
    if (badge) {
      badge.textContent = heroRisk>=60?'High Risk':heroRisk>=30?'Moderate':'Low';
      badge.className   = heroRisk>=60?'badge-red':heroRisk>=30?'badge-orange':'badge-green';
    }

    heroHRData.push(h); heroHRData.shift();
    featData.push(h); featData.shift();
    if(heroCanvas) drawChart(heroCanvas, [{data: heroHRData, color:'#2563eb'}], {min:50,max:130});
    if(featCanvas) drawChart(featCanvas, [{data: featData,   color:'#2563eb'}], {min:50,max:130});
  }
  updateHero();
  setInterval(updateHero, 2500);
  window.addEventListener('resize', () => {
    if(heroCanvas) drawChart(heroCanvas, [{data:heroHRData,color:'#2563eb'}], {min:50,max:130});
    if(featCanvas) drawChart(featCanvas, [{data:featData,  color:'#2563eb'}], {min:50,max:130});
  });
}

/* ════════════════════
   LOGIN PAGE
════════════════════ */
if (PAGE === 'login') {

  const form    = document.getElementById('loginForm');
  const errorEl = document.getElementById('loginError');
  const errMsg  = document.getElementById('loginErrorMsg');
  const spinner = document.getElementById('signInSpinner');
  const btnText = document.getElementById('signInBtnText');
  const pwInput = document.getElementById('passwordInput');
  const eyeBtn  = document.getElementById('togglePw');

  // Toggle password visibility
  eyeBtn?.addEventListener('click', () => {
    const show = pwInput.type === 'password';
    pwInput.type = show ? 'text' : 'password';
    eyeBtn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.style.display  = 'none';
    spinner.style.display  = 'inline-block';
    btnText.textContent    = 'Signing in…';

    const email    = document.getElementById('emailInput').value.trim().toLowerCase();
    const password = document.getElementById('passwordInput').value;

    // Simulate a brief network delay for realism
    await new Promise(r => setTimeout(r, 800));

    // Authenticate against inline patient data (works on file:// with no server)
    const patient = PATIENTS.find(
      p => p.email.toLowerCase() === email && p.password === password
    );

    if (!patient) {
      errorEl.style.display = 'flex';
      errMsg.textContent    = 'Incorrect email or password. Try the demo accounts shown above.';
      spinner.style.display = 'none';
      btnText.textContent   = 'Sign In';
      document.getElementById('emailInput').classList.add('input-error');
      document.getElementById('passwordInput').classList.add('input-error');
      return;
    }

    // Successful login — save session and redirect
    saveSession(patient);
    btnText.textContent = '✓ Welcome, ' + patient.profile.firstName + '!';
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 500);
  });
}

/* ════════════════════
   DASHBOARD PAGE
════════════════════ */
if (PAGE === 'dashboard') {
  const patient = getSession();
  const p       = patient.profile;
  const med     = patient.medicalHistory;

  // ── Populate user info ──
  const $ = id => document.getElementById(id);
  const setT = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  const setH = (id, v) => { const el = $(id); if (el) el.innerHTML  = v; };

  setT('topnavName',     `${p.firstName} ${p.lastName}`);
  setT('sidebarName',   `${p.firstName} ${p.lastName}`);
  setT('sidebarSub',    `Patient · ID: ${patient.id}`);
  setT('greetName',     p.firstName);
  setT('topnavAvatar',  p.avatar);
  setT('sidebarAvatar', p.avatar);

  // Today's date
  const now = new Date();
  setT('todayDate', now.toLocaleDateString('en-PH', {weekday:'long', year:'numeric',month:'long',day:'numeric'}));

  // ── Live vitals state (start from patient's current values) ──
  let liveHR   = patient.vitals.current.heartRate;
  let liveSPO  = patient.vitals.current.spo2;
  let liveRisk = patient.vitals.current.riskScore;
  const hrHistory  = Array.from({length:30}, () => liveHR  + (Math.random()-.5)*6);
  const spoHistory = Array.from({length:30}, () => liveSPO + (Math.random()-.48)*.5);

  // ── Risk calc ──
  function calcRisk(hr, spo) {
    const r = (hr>100?(hr-100)*2:hr<60?(60-hr)*3:0) + (spo<95?(95-spo)*8:0);
    return Math.round(Math.min(99, Math.max(2, r + Math.random()*4)));
  }
  function riskLabel(r) { return r>=60?'High':r>=30?'Moderate':'Low'; }
  function riskBadgeClass(r) { return r>=60?'badge-red':r>=30?'badge-orange':'badge-green'; }
  function riskPill(r)   {
    const cls = riskBadgeClass(r);
    return `<span class="${cls}">${riskLabel(r)} Risk</span>`;
  }

  // ── Update all live elements ──
  function updateAllVitals() {
    const hr   = Math.round(liveHR);
    const spo  = liveSPO.toFixed(1);
    const risk = liveRisk;
    const hrOK  = hr  >= 60 && hr  <= 100;
    const spoOK = parseFloat(spo) >= 95;
    const rOK   = risk < 30;

    const hrBadge  = hrOK  ? '<span class="badge-green">Normal</span>' : '<span class="badge-red">Abnormal</span>';
    const spoBadge = spoOK ? '<span class="badge-green">Normal</span>' : '<span class="badge-orange">Low</span>';
    const rkBadge  = riskPill(risk);

    // Overview
    setT('ovHR',   hr);  setH('ovHRBadge',  hrOK  ? 'Normal' : 'Abnormal');
    setT('ovSPO',  spo); setH('ovSPOBadge', spoOK ? 'Normal' : 'Low');
    setT('ovRisk', risk);
    const ovRiskBadge = $('ovRiskBadge');
    if (ovRiskBadge) { ovRiskBadge.textContent = riskLabel(risk) + ' Risk'; ovRiskBadge.className = riskBadgeClass(risk); }
    const ovHRBar = $('ovHRBar'), ovSPOBar = $('ovSPOBar'), ovRiskBar = $('ovRiskBar');
    if(ovHRBar)   ovHRBar.style.width   = Math.min(100,(hr-40)/120*100) + '%';
    if(ovSPOBar)  ovSPOBar.style.width  = parseFloat(spo) + '%';
    if(ovRiskBar) ovRiskBar.style.width = risk + '%';
    if(ovRiskBar) ovRiskBar.style.background = risk>=60?'linear-gradient(90deg,#dc2626,#ef4444)':risk>=30?'linear-gradient(90deg,#ea580c,#facc15)':'linear-gradient(90deg,#16a34a,#4ade80)';

    // Vitals panel
    setT('vHR',  hr);  
    setT('vSPO', spo); 
    setT('vRisk', risk);
    const vHRs = $('vHRStatus'), vSPOs = $('vSPOStatus'), vRs = $('vRiskStatus');
    if(vHRs)  { vHRs.textContent  = hrOK?'Normal':'Abnormal';  vHRs.className  = 'vlive-status ' + (hrOK?'badge-green':'badge-red'); }
    if(vSPOs) { vSPOs.textContent = spoOK?'Normal':'Low';       vSPOs.className = 'vlive-status ' + (spoOK?'badge-green':'badge-orange'); }
    if(vRs)   { vRs.textContent   = riskLabel(risk);            vRs.className   = 'vlive-status ' + riskBadgeClass(risk); }

    // Sidebar risk
    setT('sidebarRisk',      risk + '%');
    setT('sidebarRiskLabel', riskLabel(risk));
    const riskPillEl = $('sidebarRiskPill');
    if (riskPillEl) riskPillEl.style.background = risk>=60?'#fef2f2':risk>=30?'#fff7ed':'#f0fdf4';
  }

  // ── Charts ──
  const mainHRChart   = $('mainHRChart');
  const vitalsChartEl = $('vitalsChartMain');

  function renderDashCharts() {
    if(mainHRChart) drawChart(mainHRChart, [{data: hrHistory, color:'#2563eb'}], {min:50,max:130});
    if(vitalsChartEl) drawChart(vitalsChartEl, [
      {data: hrHistory, color:'#2563eb'},
      {data: spoHistory, color:'#16a34a'}
    ], {min:50,max:110});
  }

  // ── Live loop ──
  function vitalsStep() {
    liveHR   = Math.max(55, Math.min(130, liveHR  + (Math.random()-.5)*4));
    liveSPO  = Math.max(88, Math.min(100, liveSPO + (Math.random()-.48)*.7));
    liveRisk = calcRisk(liveHR, liveSPO);
    hrHistory.push(Math.round(liveHR));  hrHistory.shift();
    spoHistory.push(liveSPO);            spoHistory.shift();
    updateAllVitals();
    renderDashCharts();
  }
  updateAllVitals();
  setTimeout(renderDashCharts, 80);
  const vitalsInterval = setInterval(vitalsStep, 2000);
  window.addEventListener('resize', renderDashCharts);

  // ── Vitals history table ──
  function renderVitalsTable() {
    const tbody = $('vitalsHistBody');
    if (!tbody) return;
    tbody.innerHTML = patient.vitals.history.map(h => {
      const status = h.risk >= 60 ? '<span class="badge-red">High Risk</span>' :
                     h.risk >= 30 ? '<span class="badge-orange">Moderate</span>' :
                                    '<span class="badge-green">Normal</span>';
      const d = new Date(h.date).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'});
      return `<tr><td>${d}</td><td>${h.hr} BPM</td><td>${h.spo2}%</td><td>${h.risk}%</td><td>${status}</td></tr>`;
    }).join('');
  }
  renderVitalsTable();

  // ── EHR ──
  function renderEHR() {
    const dem = $('ehrDemographics');
    if (dem) dem.innerHTML = [
      ['Full Name',       `${p.firstName} ${p.lastName}`],
      ['Date of Birth',   new Date(p.dob).toLocaleDateString('en-PH',{year:'numeric',month:'long',day:'numeric'})],
      ['Age',             p.age + ' years'],
      ['Gender',          p.gender],
      ['Blood Type',      p.bloodType],
      ['Height / Weight', `${p.height} / ${p.weight}`],
      ['Phone',           p.phone],
      ['Address',         p.address],
    ].map(([l,v]) => `<div class="ehr-row"><span class="ehr-label">${l}</span><span class="ehr-val">${v}</span></div>`).join('');

    const diagEl = $('ehrDiagnoses');
    if (diagEl) diagEl.innerHTML = med.diagnoses.map(d =>
      `<div class="diag-item"><span>${d.condition} <small style="color:#64748b">(${d.year})</small></span><span class="badge-${d.status==='Ongoing'?'orange':'green'}">${d.status}</span></div>`
    ).join('');

    const medEl = $('ehrMedications');
    if (medEl) medEl.innerHTML = med.medications.map(m =>
      `<div class="med-item"><div class="med-name">${m.name} — ${m.dose}</div><div class="med-details">${m.frequency}</div></div>`
    ).join('');

    const allEl = $('ehrAllergies');
    if (allEl) allEl.innerHTML =
      `<div class="ehr-row"><span class="ehr-label">Allergies</span><div class="ehr-tag-list">${med.allergies.map(a=>`<span class="ehr-tag">${a}</span>`).join('')}</div></div>
       <div class="ehr-row" style="margin-top:10px"><span class="ehr-label">Family History</span><div class="ehr-tag-list">${med.familyHistory.map(f=>`<span class="ehr-tag ehr-tag-blue">${f}</span>`).join('')}</div></div>`;

    const emEl = $('ehrEmergency');
    if (emEl) {
      const ec = med.emergencyContact;
      emEl.innerHTML = `<div class="em-row"><div class="em-ico">🚨</div><div><div class="em-name">${ec.name} (${ec.relation})</div><div class="em-details">${ec.phone}</div></div></div>`;
    }
  }
  renderEHR();

  // ── Reports ──
  function renderReports() {
    const list = $('reportsList');
    if (!list) return;
    list.innerHTML = patient.reports.map(r => {
      const typeBadge = `<span class="badge-blue">${r.type}</span>`;
      const date = new Date(r.date).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'});
      return `<div class="report-item">
        <div class="report-item-header">
          <div>
            <div class="report-title">${r.title}</div>
            <div class="report-meta">${date} · Raw: ${r.raw}</div>
          </div>
          ${typeBadge}
        </div>
        <div class="report-summary-label">🤖 AI Summary</div>
        <div class="report-summary-text">${r.summary}</div>
      </div>`;
    }).join('');
  }
  renderReports();

  // File upload demo
  const fileInput = $('reportFileInput');
  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const list = $('reportsList');
    const tempCard = document.createElement('div');
    tempCard.className = 'report-item';
    tempCard.innerHTML = `<div class="report-item-header"><div><div class="report-title">📄 ${file.name}</div><div class="report-meta">Just uploaded</div></div><span class="badge-blue">Pending</span></div><div class="report-summary-text" style="color:#64748b">⏳ AI is analysing your report…</div>`;
    list?.prepend(tempCard);
    setTimeout(() => {
      tempCard.innerHTML = `<div class="report-item-header"><div><div class="report-title">📄 ${file.name}</div><div class="report-meta">Just uploaded</div></div><span class="badge-blue">Blood Test</span></div><div class="report-summary-label">🤖 AI Summary</div><div class="report-summary-text">Your uploaded report has been analysed. Key values appear within normal ranges. Please consult your physician for a full interpretation.</div>`;
    }, 2200);
  });

  // ── Appointments ──
  function renderAppointments() {
    const list = $('appointmentsList');
    if (!list) return;
    list.innerHTML = patient.appointments.map(a => {
      const d = new Date(a.date).toLocaleDateString('en-PH',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
      const b = a.status==='Upcoming' ? 'badge-green':'badge-blue';
      return `<div class="appt-item">
        <div class="appt-icon">${a.status==='Upcoming'?'📅':'✅'}</div>
        <div class="appt-info">
          <div class="appt-title">${a.type}</div>
          <div class="appt-doctor">${a.doctor}</div>
        </div>
        <div class="appt-meta">
          <div class="appt-date">${d}</div>
          <div style="margin-top:4px">${a.time} &nbsp;<span class="${b}">${a.status}</span></div>
        </div>
      </div>`;
    }).join('');
  }
  renderAppointments();

  // ── AI Chatbot ──
  const chatWindow = $('chatWindow');
  const chatInput  = $('chatInput');

  function addMsg(text, sender='bot') {
    if (!chatWindow) return;
    const msg = document.createElement('div');
    msg.className = 'chat-msg' + (sender==='user' ? ' user' : '');
    const avCls  = sender==='bot' ? 'chat-av chat-av-bot' : 'chat-av chat-av-user';
    const bubCls = sender==='bot' ? 'chat-bubble chat-bubble-bot' : 'chat-bubble chat-bubble-user';
    msg.innerHTML = `<div class="${avCls}">${sender==='bot'?'🤖':p.avatar}</div><div class="${bubCls}">${text}</div>`;
    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function addTyping() {
    const t = document.createElement('div');
    t.className = 'chat-msg'; t.id = 'typingEl';
    t.innerHTML = `<div class="chat-av chat-av-bot">🤖</div><div class="chat-bubble chat-bubble-bot typing-dots"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>`;
    chatWindow?.appendChild(t);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
  function removeTyping() { $('typingEl')?.remove(); }

  function getBotReply(q) {
    const lq = q.toLowerCase();
    const hr = Math.round(liveHR), spo = liveSPO.toFixed(1), risk = liveRisk;
    if (lq.includes('risk'))
      return `Your current ML risk score is <strong>${risk}%</strong> — <strong>${riskLabel(risk)} Risk</strong>. ${risk>=60?'⚠️ Please contact your doctor immediately.':risk>=30?'Keep monitoring your vitals closely.':'You\'re in great shape! Keep it up ✅'}`;
    if (lq.includes('spo') || lq.includes('oxygen'))
      return `Your SpO₂ is <strong>${spo}%</strong>. Normal range is 95–100%. ${parseFloat(spo)>=95?'You are within normal range ✅':'⚠️ Below normal — rest and breathe deeply, and consider calling your doctor.'}`;
    if (lq.includes('heart') || lq.includes('bpm') || lq.includes('pulse'))
      return hr<60 ? `Your heart rate is <strong>${hr} BPM</strong> — below normal (60–100). This may indicate bradycardia. Contact your physician.`
           : hr>100? `Your heart rate is <strong>${hr} BPM</strong> — elevated above normal (60–100). Rest and hydrate.`
           : `Your heart rate is <strong>${hr} BPM</strong> — perfectly normal ✅`;
    if (lq.includes('medic'))
      return `You are currently on: <strong>${med.medications.map(m=>`${m.name} ${m.dose} (${m.frequency})`).join(', ')}</strong>. Always take as prescribed.`;
    if (lq.includes('allerg'))
      return `Your recorded allergies are: <strong>${med.allergies.join(', ')}</strong>. Always inform healthcare providers before any procedure.`;
    if (lq.includes('appointment') || lq.includes('next'))
      return (() => {
        const upcoming = patient.appointments.filter(a=>a.status==='Upcoming')[0];
        return upcoming
          ? `Your next appointment is with <strong>${upcoming.doctor}</strong> for <strong>${upcoming.type}</strong> on <strong>${new Date(upcoming.date).toLocaleDateString('en-PH',{weekday:'long',month:'long',day:'numeric'})}</strong> at ${upcoming.time}.`
          : 'You have no upcoming appointments scheduled. Would you like to book one?';
      })();
    if (lq.includes('blood type') || lq.includes('blood group'))
      return `Your blood type is <strong>${p.bloodType}</strong> according to your health records.`;
    if (lq.includes('diagnos') || lq.includes('condition'))
      return `Your recorded diagnoses: <strong>${med.diagnoses.map(d=>`${d.condition} (${d.year}, ${d.status})`).join('; ')}</strong>.`;
    return `Based on your health records, your current vitals are: HR <strong>${hr} BPM</strong>, SpO₂ <strong>${spo}%</strong>, Risk Score <strong>${risk}%</strong>. I can answer questions about your vitals, medications, allergies, appointments, or diagnoses — just ask!`;
  }

  // Pre-load chat history
  patient.chatHistory.forEach(m => addMsg(m.text, m.sender));

  function sendChat(override) {
    const msg = override || chatInput?.value.trim();
    if (!msg) return;
    if (chatInput) chatInput.value = '';
    addMsg(msg, 'user');
    addTyping();
    setTimeout(() => {
      removeTyping();
      addMsg(getBotReply(msg), 'bot');
    }, 900 + Math.random()*500);
  }

  $('chatSendBtn')?.addEventListener('click', () => sendChat());
  chatInput?.addEventListener('keydown', e => { if(e.key==='Enter') sendChat(); });
  window.dashAskQ = q => { if(chatInput) chatInput.value=q; sendChat(q); };

  // ── Sidebar nav ──
  const snavItems = document.querySelectorAll('.snav-item[data-panel]');
  const panels    = document.querySelectorAll('.panel');

  function switchPanel(name) {
    snavItems.forEach(i => i.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    document.querySelector(`[data-panel="${name}"]`)?.classList.add('active');
    $(`panel-${name}`)?.classList.add('active');
    setT('navBreadcrumb', name.replace(/-./g,c=>c[1].toUpperCase()).replace(/^./, c=>c.toUpperCase()).replace('Ehr','Health Records'));
    if (['overview','vitals'].includes(name)) setTimeout(renderDashCharts, 60);
  }

  snavItems.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      switchPanel(item.dataset.panel);
      // Close sidebar on mobile
      if (window.innerWidth < 768) {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
      }
    });
  });
  switchPanel('overview');

  // ── Sidebar toggle (mobile) ──
  const sidebar = $('dashSidebar');
  const overlay = $('sidebarOverlay');
  $('sidebarToggle')?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });
  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });

  // ── Logout ──
  $('logoutBtn')?.addEventListener('click', () => {
    clearSession();
    window.location.href = 'login.html';
  });
}
