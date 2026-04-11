console.log("✅ app.js – VERSION SAINE AVEC CRUD COMPLET");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  let fermes = [];
  let selection = [];
  let tourneeEnEditionId = null;

  /* =====================
     CHARGEMENT DES FERMES
     ===================== */
  fetch("clients_livraison.json")
    .then(res => res.json())
    .then(data => {
      fermes = Array.isArray(data) ? data : [];
      afficherListe();
    })
    .catch(err => {
      zone.innerHTML = "<p>❌ Erreur chargement fermes</p>";
      console.error(err);
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
        afficherListe(recherche.value.toLowerCase());
      };

      zone.appendChild(btn);
    });
  }

  /* =====================
     ❌ DÉSÉLECTION
     ===================== */
  window.toutDeselectionner = () => {
    if (selection.length === 0) return;
    if (!confirm("Désélectionner toutes les fermes ?")) return;
    selection = [];
    afficherListe(recherche.value.toLowerCase());
  };

  /* =====================
     CRÉER / MODIFIER TOURNÉE
     ===================== */
  window.creerTournee = () => {
    if (selection.length === 0) {
      alert("Sélectionne au moins une ferme");
      return;
    }

    const nom = prompt("Nom de la tournée ?");
    if (!nom) return;

    const date = prompt(
      "Date (YYYY-MM-DD) ?",
      new Date().toISOString().slice(0, 10)
    );
    if (!date) return;

    let tournees = JSON.parse(localStorage.getItem("tournees") || "[]");

    if (tourneeEnEditionId) {
      tournees = tournees.map(t =>
        t.id === tourneeEnEditionId
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
    alert(tourneeEnEditionId ? "✅ Tournée modifiée" : "✅ Tournée enregistrée");

    selection = [];
    tourneeEnEditionId = null;
    afficherCalendrierDuJour();
  };

  /* =====================
     📅 AUJOURD’HUI
     ===================== */
  window.afficherCalendrierDuJour = () => {
    const today = new Date().toISOString().slice(0, 10);
    const tournees = JSON.parse(localStorage.getItem("tournees") || "[]")
      .filter(t => t.date === today);

    zone.innerHTML = `<h2>📅 Aujourd’hui — ${today}</h2>`;

    if (tournees.length === 0) {
      zone.innerHTML += "<p>Aucune tournée aujourd’hui</p>";
    } else {
      tournees.forEach(t => {
        const btn = document.createElement("button");
        btn.textContent = `🚚 ${t.nom}`;
        btn.onclick = () => afficherTournee(t);
        zone.appendChild(btn);
      });
    }

    ajouterRetourListe();
  };

  /* =====================
     🗓️ SEMAINE
     ===================== */
  window.afficherCalendrierSemaine = () => {
    const base = new Date();
    const tournees = JSON.parse(localStorage.getItem("tournees") || "[]");

    zone.innerHTML = "<h2>🗓️ Cette semaine</h2>";

    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);

      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("fr-CA", {
        weekday: "long",
        day: "numeric",
        month: "short"
      });

      zone.innerHTML += `<h3>${label}</h3>`;

      tournees.filter(t => t.date === iso).forEach(t => {
        const btn = document.createElement("button");
        btn.textContent = `🚚 ${t.nom}`;
        btn.onclick = () => afficherTournee(t);
        zone.appendChild(btn);
      });
    }

    ajouterRetourListe();
  };

  /* =====================
     AFFICHER / MODIFIER / SUPPRIMER
     ===================== */
  function afficherTournee(tournee) {
    zone.innerHTML = "<h2>🚚 Tournée</h2>";

    tournee.fermes.forEach(ferme => {
      const texte = Object.values(ferme)
        .filter(v => typeof v === "string")
        .join(" – ");
      const btn = document.createElement("button");
      btn.textContent = texte;
      zone.appendChild(btn);
    });

    const modifier = document.createElement("button");
    modifier.textContent = "✏️ Modifier cette tournée";
    modifier.onclick = () => {
      selection = [];
      tournee.fermes.forEach(f => {
        const index = fermes.findIndex(x =>
          JSON.stringify(x) === JSON.stringify(f)
        );
        if (index !== -1) selection.push(index);
      });
      tourneeEnEditionId = tournee.id;
      afficherListe();
    };
    zone.appendChild(modifier);

    const supprimer = document.createElement("button");
    supprimer.textContent = "🗑️ Supprimer cette tournée";
    supprimer.onclick = () => {
      if (!confirm("Supprimer définitivement cette tournée ?")) return;
      let tournees = JSON.parse(localStorage.getItem("tournees") || "[]");
      tournees = tournees.filter(t => t.id !== tournee.id);
      localStorage.setItem("tournees", JSON.stringify(tournees));
      afficherCalendrierDuJour();
    };
    zone.appendChild(supprimer);

    const retour = document.createElement("button");
    retour.textContent = "↩ Retour";
    retour.onclick = afficherCalendrierDuJour;
    zone.appendChild(retour);
  }

  function ajouterRetourListe() {
    const retour = document.createElement("button");
    retour.textContent = "↩ Retour à la liste";
    retour.onclick = afficherListe;
    zone.appendChild(retour);
  }

  /* =====================
     RECHERCHE
     ===================== */
  recherche.addEventListener("input", e => {
    afficherListe(e.target.value.toLowerCase());
  });
});
