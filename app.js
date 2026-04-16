console.log("✅ app.js – STABLE FERMES + GPS OK");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  const ADRESSE_DEPOT = "840 Rue du Houppier, Saint-Nicolas, QC, Canada";

  let fermes = [];
  let selection = [];

  /* =====================
     FORMAT ADRESSE GPS
     ===================== */
  function formatAdresseGPS(adresse) {
    if (!adresse) return "";
    return `${adresse.rue}, ${adresse.ville}, ${adresse.province}, ${adresse.pays}`;
  }

  /* =====================
     CHARGEMENT DES FERMES
     ===================== */
  fetch("clients_livraison.json")
    .then(res => res.json())
    .then(data => {
      fermes = Array.isArray(data) ? data : [];
      afficherListe();
    })
    .catch(err => {
      console.error(err);
      zone.innerHTML = "<p>❌ Erreur chargement fermes</p>";
    });

  /* =====================
     LISTE DES FERMES
     ===================== */
  function afficherListe(filtre = "") {
