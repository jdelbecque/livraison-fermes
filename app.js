document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");

  if (!zone) {
    document.body.innerHTML = "❌ DIV #liste INTROUVABLE";
    return;
  }

  zone.innerHTML = "<h2>✅ TEST LECTURE JSON</h2>";

  fetch("clients_livraison.json")
    .then(res => res.json())
    .then(data => {
      zone.innerHTML += `<p>Type: ${Array.isArray(data) ? "ARRAY ✅" : "PAS ARRAY ❌"}</p>`;
      zone.innerHTML += `<p>Nombre d'éléments: ${data.length ?? "inconnu"}</p>`;

      if (!Array.isArray(data)) {
