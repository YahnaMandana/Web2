const INTRO_DURATION = 2500;
const intro = document.getElementById("intro");
const GEMPA_ENDPOINT = "https://api.cuki.biz.id/api/info/bmkg?apikey=cuki-x";
const GEMPA_REFRESH_MS = 60000;

const gempaStatus = document.getElementById("gempaStatus");
const gempaData = document.getElementById("gempaData");

const gempaFields = {
  waktu: document.getElementById("gempaWaktu"),
  magnitude: document.getElementById("gempaMagnitude"),
  kedalaman: document.getElementById("gempaKedalaman"),
  koordinat: document.getElementById("gempaKoordinat"),
  wilayah: document.getElementById("gempaWilayah"),
  potensi: document.getElementById("gempaPotensi"),
  dirasakan: document.getElementById("gempaDirasakan"),
};

const safeText = (value) => (typeof value === "string" && value.trim() ? value : "-");

const renderGempa = (gempa) => {
  if (!gempaData) return;

  gempaFields.waktu.textContent = `${safeText(gempa.Tanggal)} ${safeText(gempa.Jam)}`;
  gempaFields.magnitude.textContent = safeText(gempa.Magnitude);
  gempaFields.kedalaman.textContent = safeText(gempa.Kedalaman);
  gempaFields.koordinat.textContent = safeText(gempa.Coordinates);
  gempaFields.wilayah.textContent = safeText(gempa.Wilayah);
  gempaFields.potensi.textContent = safeText(gempa.Potensi);
  gempaFields.dirasakan.textContent = safeText(gempa.Dirasakan);
  gempaData.hidden = false;
};

const loadGempaInfo = async () => {
  if (!gempaStatus) return;

  gempaStatus.textContent = "Memuat info gempa terbaru...";

  try {
    const response = await fetch(GEMPA_ENDPOINT, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    const gempa = result?.data?.auto?.Infogempa?.gempa;

    if (!gempa) {
      throw new Error("Data gempa tidak tersedia");
    }

    renderGempa(gempa);
    gempaStatus.textContent = `Update terakhir: ${safeText(gempa.Tanggal)} ${safeText(gempa.Jam)}`;
  } catch (error) {
    if (gempaData) {
      gempaData.hidden = true;
    }
    gempaStatus.textContent = "Gagal memuat info gempa. Mencoba lagi otomatis.";
  }
};

window.addEventListener("load", () => {
  if (!intro) {
    document.body.classList.add("loaded");
  } else {
    setTimeout(() => {
      document.body.classList.add("loaded");
      intro.remove();
    }, INTRO_DURATION);
  }

  loadGempaInfo();
  setInterval(loadGempaInfo, GEMPA_REFRESH_MS);
});
