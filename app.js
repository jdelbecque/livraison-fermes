const ADRESSE_DEPOT = "Montréal, QC";
console.log("✅ app.js – VERSION STABLE FINALE AVEC RETOUR DEPOT");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const champRecherche = document.getElementById("recherche");

  let fermes = [];
  let selection = [];
  let tournee = [];

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

  function mettreAJourBadgeAujourdHui() {
    const btn = document.getElementById("btnAujourdHui");
    if (!btn) return;

    const today = new Date().toISOString().slice(0, 10);
    const count = tourneesSauvegardees.filter(
      t => t.date === today && !t.terminee
    ).length;

    btn.textContent = `📅 Aujourd’hui (${count})`;
  }

  /* =====================
     CHARGEMENT DES FERMES
     ===================== */
  fetch("clients_livraison.json")
    .then(res => res.json())
    .then(data => {
      fermes = Array.isArray(data) ? data : [];
      afficherListe();
      mettreAJourBadgeAujourdHui();
    });

  /* =====================
     LISTE DES FERMES
     ===================== */
  function afficherListe(filtre = "") {
    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";

    fermes.forEach((ferme, index) => {
      const texte = Object.values(ferme)
        .filter(v => typeof v === "string" && v.trim() !== "")
        .join(" – ");

      if (filtre && !texte.toLowerCase().includes(filtre)) return;

      const btn = document.createElement("button");
      btn.className = "ferme";
      btn.textContent = texte;

      if (selection.includes(index)) btn.classList.add("selected");

      btn.onclick = () => {
        selection.includes(index)
          ? selection = selection.filter(i => i !== index)
          : selection.push(index);
        afficherListe(champRecherche.value.toLowerCase());
      };

      zone.appendChild(btn);
    });

    mettreAJourCompteur();
  }

  /* =====================
     BOUTONS
     ===================== */
  window.nouvelleTournee = () => {
    selection = [];
    tournee = [];
    afficherListe();
  };

  window.toutDeselectionner = () => {
    selection = [];
    afficherListe();
  };

  window.creerTournee = () => {
    if (selection.length === 0) {
      alert("Sélectionne au moins une ferme");
      return;
    }

    tournee = selection.map(i => ({
      ferme: fermes[i],
      livree: false
    }));

    afficherTournee();
  };

  /* =====================
     GPS TOURNÉE COMPLETE AVEC RETOUR DEPOT ✅
     ===================== */
  function ouvrirGPSTourneeComplete() {
    if (tournee.length === 0) {
      alert("Aucune ferme dans la tournée");
      return;
    }

    const fermesAdresses = tournee.map(item =>
      Object.values(item.ferme)
        .filter(v => typeof v === "string" && v.trim() !== "")
        .join(" ")
    );

    const waypoints = fermesAdresses.join("|");

    const url =
      "https://www.google.com/maps/dir/?api=1" +
      "&origin=" + encodeURIComponent(ADRESSE_DEPOT) +
      "&destination=" + encodeURIComponent(ADRESSE_DEPOT) +
      "&waypoints=" + encodeURIComponent("optimize:true|" + waypoints);

    window.location.href = url;
  }

  /* =====================
     AFFICHAGE TOURNÉE
     ===================== */
  function afficherTournee() {
    zone.innerHTML = "<h2>🚚 Tournée</h2>";

    tournee.forEach(item => {
      const texte = Object.values(item.ferme)
        .filter(v => typeof v === "string")
        .join(" – ");

      const btn = document.createElement("button");
      btn.textContent = texte;
      zone.appendChild(btn);
    });

    const btnGPS = document.createElement("button");
    btnGPS.textContent = "🧭 Démarrer la tournée (retour dépôt)";
    btnGPS.style.background = "#007aff";
    btnGPS.style.color = "white";
    btnGPS.onclick = ouvrirGPSTourneeComplete;

    zone.appendChild(btnGPS);

    const retour = document.createElement("button");
    retour.textContent = "↩ Retour à la liste";
    retour.onclick = afficherListe;
    zone.appendChild(retour);
  }

});
