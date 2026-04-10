console.log("✅ app.js PROD – version finale chargée");

/* ======================================================
   APPLICATION LIVRAISON FERMES – VERSION STABLE
   ====================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const champRecherche = document.getElementById("recherche");

  let fermes = [];
  let selection = [];

  /* ============================
     CHARGEMENT DES FERMES (JSON)
     ============================ */
  fetch("clients_livraison.json")
    .then(res => res.json())
    .then(data => {
      fermes = data;
      afficherListe();
    })
    .catch(err => {
      console.error("Erreur chargement JSON", err);
      zone.innerHTML = "<p>Erreur de chargement des fermes</p>";
    });

  /* ============================
     AFFICHAGE LISTE DES FERMES
     ============================ */
  function afficherListe(filtre = "") {
    zone.innerHTML = "<h2>📋 Fermes</h2>";

    fermes.forEach((ferme, index) => {
      const texte = `${ferme.nom} ${ferme.ville}`.toLowerCase();
