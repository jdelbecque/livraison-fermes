console.log("✅ app.js – AVEC MODIFIER TOURNEE");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  let fermes = [];
  let selection = [];
  let tourneeEnEdition = null; // ⬅️ clé de la modification

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
      zone.innerHTML = "<p>❌ Erreur chargement fermes</p>";
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
      btn.style.background = selection.includes(index) ? "#34c759" : "#ffffff";

      btn.onclick = () => {
        if (selection.includes(index)) {
          selection = selection.filter(i => i !== index);
        } else {
          selection.push(index);
        }
        afficherListe(recherche.value.toLowerCase());
      };

      zone.appendChild(btn);
    });
  }

  /* =====================
     CRÉER / MODIFIER TOURNÉE
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

    let tournees = JSON.parse(localStorage.getItem("tournees") || "[]");

    if (tourneeEnEdition) {
      // ✅ MODE MODIFICATION
      tournees = tournees.map(t =>
        t.id === tourneeEnEdition.id
          ? { ...t, nom, date, fermes: selection.map(i => fermes[i]) }
          : t
      );
    } else {
      // ✅ MODE CRÉATION
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
     OUVRIR + MODIFIER TOURNÉE
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

    // ✏️ MODIFIER
    const modifier = document.createElement("button");
    modifier.textContent = "✏️ Modifier la tournée";
    modifier.onclick = () => {
      selection = [];

      tournee.fermes.forEach(f => {
        const index = fermes.findIndex(x =>
          JSON.stringify(x) === JSON.stringify(f)
        );
        if (index !== -1) selection.push(index);
      });

      tourneeEnEdition = tournee;
      afficherListe();
    };
    zone.appendChild(modifier);

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
