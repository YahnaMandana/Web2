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

// Background audio
const bgAudio = document.getElementById('bg-audio');
const BACKGROUND_AUDIO_VOLUME = 0.5;
let bgAudioRetryRegistered = false;

function removeAudioRetryListeners() {
  if (!bgAudioRetryRegistered) return;
  ['click', 'keydown', 'touchstart'].forEach((eventName) => {
    document.removeEventListener(eventName, handleAudioRetry);
  });
  bgAudioRetryRegistered = false;
}

function handleAudioRetry() {
  removeAudioRetryListeners();
  playBackgroundAudio();
}

function playBackgroundAudio() {
  if (!bgAudio) return;
  bgAudio.volume = BACKGROUND_AUDIO_VOLUME;
  bgAudio.play().catch((error) => {
    console.warn('Audio playback failed, will retry on user interaction.', error);
    if (bgAudioRetryRegistered) return;
    bgAudioRetryRegistered = true;
    ['click', 'keydown', 'touchstart'].forEach((eventName) => {
      document.addEventListener(eventName, handleAudioRetry);
    });
  });
}

window.addEventListener('load', playBackgroundAudio);

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
    startQuakeAutoRefresh();
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
      } catch (error) {
        console.warn(`Gagal fetch endpoint gempa: ${endpoint}`, error);
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
  } catch (error) {
    console.warn('Gagal memuat data gempa dari semua endpoint.', error);
    loading.style.display = 'none';
    content.style.display = 'block';
    content.innerHTML = `
      <div class="qw-err">⚠ Gagal terhubung ke layanan</div>
      <div class="qw-footer" style="margin-top:0.4rem;">
        <span class="qw-refresh" onclick="fetchGempa()">↻ COBA LAGI</span>
      </div>`;
  }
}

window.fetchGempa = fetchGempa;

let quakeRefreshIntervalId = null;
function startQuakeAutoRefresh() {
  if (quakeRefreshIntervalId) return;
  quakeRefreshIntervalId = setInterval(fetchGempa, 5 * 60 * 1000);
}

// ===== JADWAL BOLA WIDGET =====
let jbCollapsed = true;
let jbLoaded = false;
let jbLoading = false;

async function loadJadwalBolaOnce() {
  if (jbLoaded || jbLoading) return;
  jbLoading = true;
  try {
    jbLoaded = await fetchJadwalBola();
  } finally {
    jbLoading = false;
  }
}

async function retryJadwalBola() {
  if (jbLoading) return;
  jbLoading = true;
  try {
    jbLoaded = await fetchJadwalBola();
  } finally {
    jbLoading = false;
  }
}

function toggleJadwalBola() {
  jbCollapsed = !jbCollapsed;
  document.getElementById('jbBody').classList.toggle('collapsed', jbCollapsed);
  document.getElementById('jbToggle').textContent = jbCollapsed ? '▲' : '▼';
  if (!jbCollapsed) {
    loadJadwalBolaOnce();
  }
}

window.toggleJadwalBola = toggleJadwalBola;
window.retryJadwalBola = retryJadwalBola;

async function fetchJadwalBola() {
  const loading = document.getElementById('jbLoading');
  const content = document.getElementById('jbContent');
  loading.style.display = 'block';
  content.style.display = 'none';

  try {
    const response = await fetch('https://api.nexray.eu.cc/information/jadwalbola');
    if (!response.ok) throw new Error('Bad response');
    const data = await response.json();

    loading.style.display = 'none';
    content.style.display = 'block';

    if (!data?.status || !Array.isArray(data.result) || data.result.length === 0) {
      content.innerHTML = '<div class="fc-err">⚠ Data tidak tersedia</div>';
      return true;
    }

    const fetchTime = new Date().toTimeString().split(' ')[0];
    let html = '';

    data.result.forEach((item) => {
      // Format: "29 Mei 2026 - 01.45 - Ireland vs Qatar - Friendl"
      const parts = item.split(' - ');
      const date = parts[0] || '';
      const time = parts[1] || '';
      const teams = parts[2] || '';
      const comp = parts[3] || '';

      html += `
        <div class="fc-match">
          <div class="fc-match-dot"></div>
          <div class="fc-match-info">
            <div class="fc-match-time">${date} &nbsp;·&nbsp; ${time} WIB</div>
            <div class="fc-match-teams">${teams}</div>
            ${comp ? `<div class="fc-match-comp">${comp}</div>` : ''}
          </div>
        </div>`;
    });

    html += `
      <hr class="fc-divider">
      <div class="fc-footer">
        <span class="fc-time">UPDATED ${fetchTime}</span>
        <span class="fc-refresh" onclick="retryJadwalBola()">↻ REFRESH</span>
      </div>`;

    content.innerHTML = html;
    return true;
  } catch (error) {
    console.warn('Gagal memuat data jadwal bola.', error);
    loading.style.display = 'none';
    content.style.display = 'block';
    content.innerHTML = `
      <div class="fc-err">⚠ Gagal terhubung ke layanan</div>
      <div class="fc-footer" style="margin-top:0.4rem;">
        <span class="fc-refresh" onclick="retryJadwalBola()">↻ COBA LAGI</span>
      </div>`;
    return false;
  }
}

window.fetchJadwalBola = fetchJadwalBola;

// ===== PHOTO UPLOAD CARD =====
let photoCollapsed = true;
let previewObjectUrl = '';

function togglePhotoUpload() {
  photoCollapsed = !photoCollapsed;
  const body = document.getElementById('photoBody');
  const toggle = document.getElementById('photoToggle');
  if (!body || !toggle) return;
  body.classList.toggle('collapsed', photoCollapsed);
  toggle.textContent = photoCollapsed ? '▲' : '▼';
}

window.togglePhotoUpload = togglePhotoUpload;

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function initializePhotoUpload() {
  const fileInput = document.getElementById('photoFileInput');
  const uploadButton = document.getElementById('photoUploadBtn');
  const status = document.getElementById('photoUploadStatus');
  const previewWrap = document.getElementById('photoPreviewWrap');
  const previewImg = document.getElementById('photoPreviewImg');
  const photoMeta = document.getElementById('photoMeta');
  if (!fileInput || !uploadButton || !status || !previewWrap || !previewImg || !photoMeta) return;

  const resetPreview = () => {
    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl);
      previewObjectUrl = '';
    }
    previewImg.removeAttribute('src');
    photoMeta.textContent = '';
    previewWrap.style.display = 'none';
  };

  const setStatus = (message, isError = false) => {
    status.textContent = message;
    status.classList.toggle('error', isError);
  };

  uploadButton.addEventListener('click', () => {
    const selectedFile = fileInput.files?.[0];
    if (!selectedFile) {
      setStatus('Pilih foto terlebih dulu.', true);
      resetPreview();
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      setStatus('File harus berupa gambar.', true);
      resetPreview();
      return;
    }

    const maxSizeInBytes = 4 * 1024 * 1024;
    if (selectedFile.size > maxSizeInBytes) {
      setStatus('Ukuran file maksimal 4MB.', true);
      resetPreview();
      return;
    }

    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = URL.createObjectURL(selectedFile);
    previewImg.src = previewObjectUrl;
    previewWrap.style.display = 'block';
    photoMeta.textContent = `${selectedFile.name} · ${formatFileSize(selectedFile.size)}`;
    setStatus('Upload berhasil (preview lokal).');
  });

  fileInput.addEventListener('change', () => {
    setStatus('');
    if (!fileInput.files?.length) resetPreview();
  });
}

initializePhotoUpload();
