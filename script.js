// Cursor
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
document.addEventListener('mousemove', (e) => {
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
  cursorDot.style.left = `${e.clientX}px`;
  cursorDot.style.top = `${e.clientY}px`;
});

// Matrix
function initMatrix(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  resize();
  window.addEventListener('resize', resize);

  const chars = 'アカサタナハマヤラワ01234567890ABCDEF!@#$%^&*<>/\\|';
  const cols = Math.floor(canvas.width / 18);
  const drops = Array(cols).fill(0);

  setInterval(() => {
    ctx.fillStyle = 'rgba(0,10,0,0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '14px Share Tech Mono,monospace';

    drops.forEach((y, i) => {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillStyle = Math.random() > 0.95 ? '#00f5ff' : '#00ff41';
      ctx.fillText(ch, i * 18, y * 18);
      drops[i] = y * 18 > canvas.height && Math.random() > 0.975 ? 0 : y + 1;
    });
  }, 60);
}

initMatrix('matrix-canvas');
initMatrix('intro-canvas');

// Intro
let pct = 0;
const pctEl = document.getElementById('introPercent');
const t = setInterval(() => {
  pct = Math.min(100, pct + Math.floor(Math.random() * 5) + 1);
  pctEl.textContent = `${pct}%`;
  if (pct >= 100) {
    clearInterval(t);
    setTimeout(launchMain, 400);
  }
}, 60);

function launchMain() {
  document.getElementById('intro-screen').classList.add('intro-fadeout');
  setTimeout(() => {
    document.getElementById('intro-screen').style.display = 'none';
    document.getElementById('main-content').classList.add('visible');
    startCounters();
    fetchGempa();
  }, 800);
}

// Clock
function updateClock() {
  document.getElementById('live-clock').textContent = new Date().toTimeString().split(' ')[0];
}

setInterval(updateClock, 1000);
updateClock();

// Counters
function animCounter(id, target, dur) {
  const el = document.getElementById(id);
  let s = null;
  const step = (ts) => {
    if (!s) s = ts;
    const p = Math.min((ts - s) / dur, 1);
    el.textContent = String(Math.floor(p * target)).padStart(2, '0');
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function startCounters() {
  animCounter('counter1', 8, 1800);
  animCounter('counter2', 7, 2000);
  animCounter('counter3', 247, 2500);
  animCounter('counter4', 32, 2200);
}

// Terminal blink
setInterval(() => {
  const el = document.getElementById('blinkCmd');
  if (el) el.textContent = el.textContent === '_' ? '' : '_';
}, 600);

// ===== GEMPA WIDGET =====
let qwCollapsed = false;

function toggleQuake() {
  qwCollapsed = !qwCollapsed;
  document.getElementById('qwBody').classList.toggle('collapsed', qwCollapsed);
  document.getElementById('qwToggle').textContent = qwCollapsed ? '▲' : '▼';
}

window.toggleQuake = toggleQuake;

function magClass(m) {
  const v = parseFloat(m);
  if (v >= 6) return 'mag-high';
  if (v >= 4.5) return 'mag-mid';
  return 'mag-low';
}

function normalizeGempaData(payload) {
  if (payload?.status && payload?.result) return payload.result;
  if (payload?.Infogempa?.gempa) {
    const g = payload.Infogempa.gempa;
    const shakemap = g.Shakemap ? `https://data.bmkg.go.id/DataMKG/TEWS/${g.Shakemap}` : '';
    return {
      Magnitude: g.Magnitude,
      Kedalaman: g.Kedalaman,
      Tanggal: g.Tanggal,
      Jam: g.Jam,
      Lintang: g.Lintang,
      Bujur: g.Bujur,
      Wilayah: g.Wilayah,
      Dirasakan: g.Dirasakan || '',
      Potensi: g.Potensi || 'Tidak ada potensi tsunami',
      Shakemap: shakemap,
    };
  }
  return null;
}

async function fetchGempaFrom(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Bad response');
  return response.json();
}

async function fetchGempa() {
  const loading = document.getElementById('qwLoading');
  const content = document.getElementById('qwContent');
  loading.style.display = 'block';
  content.style.display = 'none';

  const endpoints = [
    'https://api.nexray.eu.cc/information/gempa',
    'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json',
  ];

  try {
    let raw = null;
    for (const endpoint of endpoints) {
      try {
        raw = await fetchGempaFrom(endpoint);
        if (raw) break;
      } catch {
        raw = null;
      }
    }

    loading.style.display = 'none';
    content.style.display = 'block';

    const g = normalizeGempaData(raw);
    if (!g) {
      content.innerHTML = '<div class="qw-err">⚠ Data tidak tersedia</div>';
      return;
    }

    const mc = magClass(g.Magnitude);
    const potensiText = g.Potensi || 'Tidak ada informasi potensi';
    const isTsunami = potensiText.toLowerCase().includes('tsunami')
      && !potensiText.toLowerCase().includes('tidak');
    const fetchTime = new Date().toTimeString().split(' ')[0];

    let html = `
      <div class="qw-live-label">LIVE — BMKG AUTO DETECT</div>
      <div class="qw-mag-row">
        <span class="qw-mag-num ${mc}">${g.Magnitude || '-'}</span>
        <span class="qw-mag-unit">SR &nbsp;·&nbsp; ${g.Kedalaman || '-'}</span>
      </div>
      <div class="qw-row"><span>TANGGAL</span><span>${g.Tanggal || '-'}</span></div>
      <div class="qw-row"><span>WAKTU</span><span>${g.Jam || '-'}</span></div>
      <div class="qw-row"><span>KOORDINAT</span><span>${g.Lintang || '-'} / ${g.Bujur || '-'}</span></div>
      <div class="qw-wilayah">${g.Wilayah || 'Wilayah tidak tersedia'}</div>`;

    if (g.Dirasakan) {
      html += `<div class="qw-dirasakan">⦿ Dirasakan: ${g.Dirasakan}</div>`;
    }

    html += `
      <div class="qw-potensi ${isTsunami ? 'pot-warn' : 'pot-safe'}">
        ${isTsunami ? '⚠ ' : '✓ '}${potensiText}
      </div>`;

    if (g.Shakemap) {
      html += `<img class="qw-shakemap" src="${g.Shakemap}" alt="Shakemap" loading="lazy"
                 onclick="window.open('${g.Shakemap}','_blank')" title="Klik untuk perbesar">`;
    }

    html += `
      <hr class="qw-divider">
      <div class="qw-footer">
        <span class="qw-time">UPDATED ${fetchTime}</span>
        <span class="qw-refresh" onclick="fetchGempa()">↻ REFRESH</span>
      </div>`;

    content.innerHTML = html;
  } catch {
    loading.style.display = 'none';
    content.style.display = 'block';
    content.innerHTML = `
      <div class="qw-err">⚠ Gagal terhubung ke API</div>
      <div class="qw-footer" style="margin-top:0.4rem;">
        <span class="qw-refresh" onclick="fetchGempa()">↻ COBA LAGI</span>
      </div>`;
  }
}

window.fetchGempa = fetchGempa;

// Auto-refresh setiap 5 menit
setInterval(fetchGempa, 5 * 60 * 1000);
