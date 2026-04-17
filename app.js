console.log("✅ app.js – VERSION FINALE STABLE LABEL + GPS");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  // ✅ LABEL HUMAIN (interface)
  const DEPOT_LABEL = "🏢 Entrepôt MAIA Services Vétérinaires";

  // ✅ GPS RÉEL (utilisé par Google Maps)
  const DEPOT_GPS = "46.7160,-71.3453";

  const PIN_ADMIN = "1234";

  let fermes = [];
  let selection = [];
  let tourneeEnEdition = null;

  /* ========= UTILS ========= */

  function demanderPIN() {
    return prompt("🔒 Code PIN admin") === PIN_ADMIN;
  }

  function formatAdresseGps(ferme) {
    if (ferme.latitude && ferme.longitude) {
      return `${ferme.latitude},${ferme.longitude}`;
    }
    return `${ferme.rue}, ${ferme.ville}, QC, Canada`;
  }

  function maintenant() {
    return new Date().toLocaleString("fr-CA");
  }

  function chargerTournees() {
    return JSON.parse(localStorage.getItem("tournees") || "[]");
  }

  function sauverTournees(liste) {
    localStorage.setItem("tournees", JSON.stringify(liste));
  }

  /* ========= CHARGEMENT DES FERMES ========= */

  fetch("clients_livraison.json")
    .then(res => res.json())
    .then(data => {
      fermes = Array.isArray(data) ? data : [];
      afficherListe();
    })
    .catch(() => {
      zone.innerHTML = "<p>❌ Impossible de charger les fermes</p>";
    });

  /* ========= LISTE DES FERMES ========= */

  function afficherListe(filtre = "") {
    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";

    fermes.forEach((ferme, index) => {
