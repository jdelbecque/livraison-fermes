console.log("✅ app.js – VERSION STABLE AVEC CALENDRIER");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const champRecherche = document.getElementById("recherche");

  let fermes = [];
  let selection = [];
  let tournee = [];
  let currentTourneeId = null;

  let tourneesSauvegardees = JSON.parse(
    localStorage.getItem("tournees") || "[]"
  );

  /* =====================
     OUTILS
     ===================== */
  function sauvegarderTournees() {
    localStorage.setItem("tournees", JSON.stringify(tourneesSauvegardees));
  }

  function mettreAJourCompteur() {
    const compteur = document.getElementById("compteur");
    if (compteur) {
      compteur.textContent = `✅ ${selection.length} ferme(s) sélectionnée(s)`;
    }
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
    .catch(() => {
      zone.innerHTML = "<p>Erreur chargement fermes</p>";
    });

  /* =====================
     LISTE PRINCIPALE
     ===================== */
  function afficherListe(filtre = "") {
    currentTourneeId = null;
    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";

    fermes.forEach((ferme, index) => {
      const texte = Object.values(ferme)
        .filter(v => typeof v === "string")
        .join(" – ");

      if (filtre && !texte.toLowerCase().includes(filtre)) return;

      const btn = document.createElement("button");
      btn.className = "ferme";
      btn.textContent = texte;

      if (selection.includes(index)) {
        btn.classList.add("selected");
      }

      btn.onclick = () => {
        if (selection.includes(index)) {
          selection = selection.filter(i => i !== index);
        } else {
          selection.push(index);
        }
        afficherListe(champRecherche.value.toLowerCase());
      };

      zone.appendChild(btn);
    });

    mettreAJourCompteur();
  }

  /* =====================
     BOUTONS PRINCIPAUX
     ===================== */
  window.nouvelleTournee = () => {
    selection = [];
    tournee = [];
    afficherListe();
  };

