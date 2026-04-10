console.log("✅ app.js FINAL – affichage robuste");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const champRecherche = document.getElementById("recherche");

  let fermes = [];
  let selection = [];

  /* ===============================
     CHARGEMENT JSON
     =============================== */
  fetch("clients_livraison.json")
    .then(res => res.json())
    .then(data => {
      fermes = data;
      afficherListe();
    })
    .catch(err => {
      console.error(err);
      zone.innerHTML = "<p>Erreur chargement données</p>";
    });

  /* ===============================
     AFFICHAGE ROBUSTE (peu importe les champs)
     =============================== */
  function afficherListe(filtre = "") {
    zone.innerHTML = "<h2>📋 Fermes</h2>";

    fermes.forEach((ferme, index) => {

      // ✅ Construire un texte lisible à partir de TOUS les champs
