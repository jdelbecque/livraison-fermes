console.log("✅ app.js – VERSION FINALE PRO (CRUD + GPS + CHAUFFEUR)");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  const ADRESSE_DEPOT = "840 rue du houppier, Lévis, QC";

  let fermes = [];
  let selection = [];
  let tourneeEnEdition = null;

  function estModeChauffeur() {
    return localStorage.getItem("modeChauffeur") === "true";
  }

  window.activerModeChauffeur = () => {
    localStorage.setItem("modeChauffeur", "true");
    afficherAujourdHui();
  };

  window.desactiverModeChauffeur = () => {
    localStorage.removeItem("modeChauffeur");
    afficherListe();
  };

  /* =====================
     CHARGEMENT DES FERMES
     ===================== */
  fetch("clients_livraison.json")
    .then(r => r.json())
    .then(data => {
      fermes = Array.isArray(data) ? data : [];
      afficherListe();
    });

  /* =====================
     LISTE DES FERMES
     ===================== */
  function afficherListe(filtre = "") {
    if (estModeChauffeur()) {
      afficherAujourdHui();
      return;
    }

    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";

    fermes.forEach((ferme, index) => {
      const texte = Object.values(ferme)
        .filter(v => typeof v === "string")
        .join(" – ");

      if (filtre && !texte.toLowerCase().includes(filtre)) return;

      const btn = document.createElement("button");
      btn.textContent = texte;
      btn.style.background = selection.includes(index) ? "#34c759" : "#fff";

      btn.onclick = () => {
        selection.includes(index)
          ? selection = selection.filter(i => i !== index)
          : selection.push(index);
        afficherListe(recherche.value.toLowerCase());
      };

      zone.appendChild(btn);
    });
  }

  /* =====================
     CRÉER / MODIFIER TOURNÉE
     ===================== */
  window.creerTournee = () => {
    if (estModeChauffeur()) return;

    if (selection.length === 0) {
      alert("Sélectionne au moins une ferme");
      return;
    }

    const nom = prompt("Nom de la tournée ?", tourneeEnEdition?.nom || "");
    if (!nom) return;

    const date = prompt(
      "Date (YYYY-MM-DD) ?",
      tourneeEnEdition?.date || new Date().toISOString().slice(0, 10)
    );
    if (!date) return;

    let tournees = JSON.parse(localStorage.getItem("tournees") || "[]");

    if (tourneeEnEdition) {
      tournees = tournees.filter(t => t.id !== tourneeEnEdition.id);
    }

    tournees.push({
      id: Date.now(),
      nom,
      date,
      fermes: selection.map(i => fermes[i])
    });

    localStorage.setItem("tournees", JSON.stringify(tournees));

    selection = [];
    tourneeEnEdition = null;
    afficherAujourdHui();
  };

  /* =====================
     AUJOURD'HUI
     ===================== */
  window.afficherAujourdHui = () => {
    const today = new Date().toISOString().slice(0, 10);
    const tournees = JSON.parse(localStorage.getItem("tournees") || [])
      .filter(t => t.date === today);

    zone.innerHTML = `<h2>📅 Aujourd’hui — ${today}</h2>`;

    tournees.forEach(t => {
      const btn = document.createElement("button");
      btn.textContent = `🚚 ${t.nom}`;
      btn.onclick = () => ouvrirTournee(t);
      zone.appendChild(btn);
    });
  };

  /* =====================
     OUVRIR TOURNÉE
     ===================== */
  function ouvrirTournee(tournee) {
    zone.innerHTML = `<h2>🚚 ${tournee.nom}</h2>`;

    tournee.fermes.forEach(f => {
      const texte = Object.values(f).filter(v => typeof v === "string").join(" – ");
      const btn = document.createElement("button");
      btn.textContent = texte;
      zone.appendChild(btn);
    });

    const gps = document.createElement("button");
    gps.textContent = "🧭 Démarrer la tournée";
    gps.onclick = () => lancerGPSTournee(tournee);
    zone.appendChild(gps);

    if (!estModeChauffeur()) {
      const modifier = document.createElement("button");
      modifier.textContent = "✏️ Modifier";
      modifier.onclick = () => {
        selection = [];
        tournee.fermes.forEach(f => {
          const i = fermes.findIndex(x => JSON.stringify(x) === JSON.stringify(f));
          if (i >= 0) selection.push(i);
        });
        tourneeEnEdition = tournee;
        afficherListe();
      };
      zone.appendChild(modifier);

      const supprimer = document.createElement("button");
      supprimer.textContent = "🗑️ Supprimer";
      supprimer.onclick = () => {
        if (!confirm("Supprimer cette tournée ?")) return;
        let tournees = JSON.parse(localStorage.getItem("tournees") || []);
        tournees = tournees.filter(t => t.id !== tournee.id);
        localStorage.setItem("tournees", JSON.stringify(tournees));
        afficherAujourdHui();
      };
      zone.appendChild(supprimer);
    }

    const retour = document.createElement("button");
    retour.textContent = "↩ Retour";
    retour.onclick = afficherAujourdHui;
    zone.appendChild(retour);
  }

  /* =====================
     GPS ENCHAÎNÉ
     ===================== */
  function lancerGPSTournee(tournee) {
    const points = tournee.fermes.map(f =>
      Object.values(f).filter(v => typeof v === "string").join(" ")
    );

    const url =
      "https://www.google.com/maps/dir/?api=1" +
      "&origin=" + encodeURIComponent(ADRESSE_DEPOT) +
      "&destination=" + encodeURIComponent(ADRESSE_DEPOT) +
      "&waypoints=" +
      encodeURIComponent("optimize:true|" + points.join("|"));

    window.location.href = url;
  }

  /* =====================
     RECHERCHE
     ===================== */
  recherche.addEventListener("input", e => {
    afficherListe(e.target.value.toLowerCase());
  });
});
