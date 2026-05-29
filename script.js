const apiStatus = document.getElementById("api-status");
const apiItems = document.getElementById("api-items");

const mockApiPayload = [
  { name: "User Service", uptime: "99.98%", latency: "120ms" },
  { name: "Payment Gateway", uptime: "99.91%", latency: "145ms" },
  { name: "Analytics API", uptime: "99.95%", latency: "110ms" }
];

function renderApiData(items) {
  apiItems.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "api-item";
    card.innerHTML = `
      <strong>${item.name}</strong>
      <span>Uptime: ${item.uptime}</span><br>
      <span>Latency: ${item.latency}</span>
    `;
    apiItems.appendChild(card);
  });
}

setTimeout(() => {
  renderApiData(mockApiPayload);
  apiStatus.textContent = "Aktif";
}, 450);
