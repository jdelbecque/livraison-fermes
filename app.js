console.log("✅ app.js – VERSION FINALE AVEC CALENDRIER");

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
     UTILITAIRES
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
  zone.innerHTML = "<p>Chargement des fermes…</p>";

  fetch("clients_livraison.json")
    .then(res => res.json())
    .then(data => {
      fermes = Array.isArray(data) ? data : [];
      afficherListe();
    });

  /* =====================
     LISTE DES FERMES
     ===================== */
  function afficherListe(filtre = "") {
    currentTourneeId = null;
    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";

    fermes.forEach((ferme, index) => {
      const texte = Object.values(ferme)
        .filter(v => typeof v === "string" && v.trim() !== "")
        .join(" – ");

      if (filtre && !texte.toLowerCase().includes(filtre)) return;

      const btn = document.createElement("button");
      btn.className = "ferme";
      btn.textContent = texte;

      if (selection.includes(index)) {
        btn.classList.add("selected");
      }

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

  window.nouvelleTournee = () => {
    selection = [];
    tournee = [];
    afficherListe();
  };

  window.toutDeselectionner = () => {
    selection = [];
    afficherListe();
  };

  /* =====================
     CRÉER LA TOURNÉE
     ===================== */
  window.creerTournee = () => {
    if (selection.length === 0) return alert("Sélectionne au moins une ferme");

    tournee = selection.map(i => ({
      ferme: fermes[i],
      livree: false
    }));

    afficherTournee();
  };

  /* =====================
     AFFICHAGE TOURNÉE
     ===================== */
  function afficherTournee() {
    zone.innerHTML = "<h2>🚚 Tournée</h2>";

    tournee.forEach((item, index) => {
      const texte = Object.values(item.ferme)
        .filter(v => typeof v === "string")
        .join(" – ");

      const btn = document.createElement("button");
      btn.textContent = `${item.livree ? "✅" : "🚚"} ${texte}`;
      btn.onclick = () => ouvrirGPS(texte);

      const livree = document.createElement("button");
      livree.textContent = "✅ Livré";
      livree.onclick = () => {
        item.livree = true;
        afficherTournee();
      };

      zone.appendChild(btn);
      zone.appendChild(livree);
    });

    const btnSave = document.createElement("button");
    btnSave.textContent = "💾 Sauvegarder la tournée";
    btnSave.onclick = () => {
      const nom = prompt("Nom de la tournée ?");
      if (!nom) return;

      const date = prompt("Date (YYYY-MM-DD) ?");
      if (!date) return;

      tourneesSauvegardees.push({
        id: Date.now(),
        nom,
        date,
        fermes: tournee,
        terminee: false
      });

      sauvegarderTournees();
      alert("✅ Tournée sauvegardée");
    };

    const btnRetour = document.createElement("button");
    btnRetour.textContent = "↩ Retour";
    btnRetour.onclick = afficherListe;

    zone.appendChild(btnSave);
    zone.appendChild(btnRetour);
  }

  /* =====================
     GPS
     ===================== */
  function ouvrirGPS(adresse) {
    window.location.href =
      "https://www.google.com/maps/dir/?api=1&destination=" +
      encodeURIComponent(adresse);
  }

  /* =====================
     📅 AUJOURD’HUI
     ===================== */
  window.afficherCalendrierDuJour = () => {
    const today = new Date().toISOString().slice(0, 10);
    zone.innerHTML = `<h2>📅 Aujourd’hui — ${today}</h2>`;

    tourneesSauvegardees
      .filter(t => t.date === today)
      .forEach(t => {
        const btn = document.createElement("button");
        btn.textContent = `${t.terminee ? "✅" : "🚚"} ${t.nom}`;
        btn.onclick = () => chargerTournee(t.id);
        zone.appendChild(btn);
      });

    const retour = document.createElement("button");
    retour.textContent = "↩ Retour";
    retour.onclick = afficherListe;
    zone.appendChild(retour);
  };

  /* =====================
     🗓️ SEMAINE
     ===================== */
  window.afficherCalendrierSemaine = () => {
    zone.innerHTML = "<h2>🗓️ Cette semaine</h2>";
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const date = d.toISOString().slice(0, 10);

      zone.innerHTML += `<h3>${d.toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "short" })}</h3>`;

      tourneesSauvegardees
        .filter(t => t.date === date)
        .forEach(t => {
          const btn = document.createElement("button");
          btn.textContent = `${t.terminee ? "✅" : "🚚"} ${t.nom}`;
          btn.onclick = () => chargerTournee(t.id);
          zone.appendChild(btn);
        });
    }

    const retour = document.createElement("button");
    retour.textContent = "↩ Retour";
    retour.onclick = afficherListe;
    zone.appendChild(retour);
  };

  function chargerTournee(id) {
    const t = tourneesSauvegardees.find(x => x.id === id);
    if (!t) return;

    currentTourneeId = id;
    tournee = t.fermes;
    afficherTournee();
  }

});
