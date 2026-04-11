console.log("✅ app.js – BADGE AUJOURD’HUI (X)");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");
  const btnAujourd = document.getElementById("btnAujourdHui");

  let fermes = [];
  let selection = [];
  let tourneeEnEdition = null;

  /* =====================
     BADGE AUJOURD’HUI ✅
     ===================== */
  function mettreAJourBadgeAujourdHui() {
    if (!btnAujourd) return;

    const today = new Date().toISOString().slice(0, 10);
    const tournees = JSON.parse(localStorage.getItem("tournees") || []);
    const count = tournees.filter(t => t.date === today).length;

    btnAujourd.textContent =
      count > 0
        ? `📅 Aujourd’hui (${count})`
        : "📅 Aujourd’hui";
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
        .filter(v => typeof v === "string" && v.trim())
        .join(" – ");

      if (filtre && !texte.toLowerCase().includes(filtre)) return;

      const btn = document.createElement("button");
      btn.textContent = texte;
      btn.style.background = selection.includes(index)
        ? "#34c759"
        : "#ffffff";

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
     CRÉER / MODIFIER
     ===================== */
  window.creerTournee = () => {
    if (selection.length === 0) {
      alert("Sélectionne au moins une ferme");
      return;
    }

    const nom = prompt(
      "Nom de la tournée ?",
      tourneeEnEdition ? tourneeEnEdition.nom : ""
    );
    if (!nom) return;

    const date = prompt(
      "Date (YYYY-MM-DD) ?",
      tourneeEnEdition
        ? tourneeEnEdition.date
        : new Date().toISOString().slice(0, 10)
    );
    if (!date) return;

    let tournees = JSON.parse(localStorage.getItem("tournees") || []);

    if (tourneeEnEdition) {
      tournees = tournees.map(t =>
        t.id === tourneeEnEdition.id
          ? { ...t, nom, date, fermes: selection.map(i => fermes[i]) }
          : t
      );
    } else {
      tournees.push({
        id: Date.now(),
        nom,
        date,
        fermes: selection.map(i => fermes[i])
      });
    }

    localStorage.setItem("tournees", JSON.stringify(tournees));

    selection = [];
    tourneeEnEdition = null;

    mettreAJourBadgeAujourdHui();
    afficherAujourdHui();
  };

  /* =====================
     📅 AUJOURD’HUI
     ===================== */
  window.afficherAujourdHui = () => {
    const today = new Date().toISOString().slice(0, 10);
    const tournees = JSON.parse(localStorage.getItem("tournees") || [])
      .filter(t => t.date === today);

    zone.innerHTML = `<h2>📋 Tournées du jour — ${today}</h2>`;

    if (tournees.length === 0) {
      zone.innerHTML += "<p>Aucune tournée aujourd’hui</p>";
      return;
    }

    tournees.forEach(t => {
      const btn = document.createElement("button");
      btn.textContent = `🚚 ${t.nom}`;
      btn.onclick = () => ouvrirTournee(t);
      zone.appendChild(btn);
    });
  };

  /* =====================
     SUPPRIMER
     ===================== */
  function supprimerTourneeParId(id) {
    if (!confirm("Supprimer définitivement cette tournée ?")) return;

    let tournees = JSON.parse(localStorage.getItem("tournees") || []);
    tournees = tournees.filter(t => t.id !== id);
    localStorage.setItem("tournees", JSON.stringify(tournees));

    mettreAJourBadgeAujourdHui();
    afficherAujourdHui();
  }

  /* =====================
     OUVRIR
     ===================== */
  function ouvrirTournee(tournee) {
    zone.innerHTML = `<h2>🚚 Tournée : ${tournee.nom}</h2>`;

    tournee.fermes.forEach(ferme => {
      const texte = Object.values(ferme)
        .filter(v => typeof v === "string")
        .join(" – ");
      const btn = document.createElement("button");
      btn.textContent = texte;
      zone.appendChild(btn);
    });

    const modifier = document.createElement("button");
    modifier.textContent = "✏️ Modifier la tournée";
    modifier.onclick = () => {
      selection = [];
      tournee.fermes.forEach(f => {
        const i = fermes.findIndex(x =>
          JSON.stringify(x) === JSON.stringify(f)
        );
        if (i !== -1) selection.push(i);
      });
      tourneeEnEdition = tournee;
      afficherListe();
    };
    zone.appendChild(modifier);

    const supprimer = document.createElement("button");
    supprimer.textContent = "🗑️ Supprimer la tournée";
    supprimer.onclick = () => supprimerTourneeParId(tournee.id);
    zone.appendChild(supprimer);

    const retour = document.createElement("button");
    retour.textContent = "↩ Retour à Aujourd’hui";
    retour.onclick = afficherAujourdHui;
    zone.appendChild(retour);
  }

  /* =====================
     RECHERCHE
     ===================== */
  recherche.addEventListener("input", e => {
    afficherListe(e.target.value.toLowerCase());
  });
});
