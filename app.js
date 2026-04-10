console.log("✅ app.js – CORRECTION FINALE FORCE AFFICHAGE");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const champRecherche = document.getElementById("recherche");

  let fermes = [];
  let selection = [];
  let tournee = [];

  // Sécurité absolue
  if (!zone) {
    alert("ERREUR : div #liste introuvable");
    return;
  }

  zone.innerHTML = "<p>Chargement des fermes…</p>";

  /* ======================
     CHARGEMENT JSON
     ====================== */
  fetch("clients_livraison.json")
    .then(res => res.json())
    .then(data => {
      console.log("✅ JSON chargé :", data.length, "fermes");
      fermes = Array.isArray(data) ? data : [];

      // ✅ FORÇAGE DIRECT DE L’AFFICHAGE
      afficherListe();
    })
    .catch(err => {
      console.error(err);
