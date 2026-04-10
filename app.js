document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");

  if (!zone) {
    document.body.innerHTML = "❌ DIV #liste INTROUVABLE";
    return;
  }

  zone.innerHTML = `
    <h2>✅ TEST ULTIME</h2>
    <p>Si tu vois ce texte, app.js est BIEN exécuté.</p>
  `;
});
