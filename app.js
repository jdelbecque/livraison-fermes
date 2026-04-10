console.log("✅ app.js – VERSION FINALE AVEC COMPTEUR");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const champRecherche = document.getElementById("recherche");

  let fermes = [];
  let selection = [];
  let tournee = [];

  if (!zone) {
    document.body.innerHTML = "❌ DIV #liste INTROUVABLE";
    return;
  }

  /* =====================
     COMPTEUR
     ===================== */
  function mettreAJourCompteur() {
    const compteur = document.getElementById("compteur");
    if (compteur) {
      compteur.textContent = `✅ ${selection.length} ferme(s) sélectionnée(s)`;
    }
  }

  /* =====================
     CHARGEMENT DES FERMES
     ===================== */
  zone.innerHTML = "<p>Chargement des fermes…</p>";

  fetch("clients_livraison.json")
    .then(res => res.json())
