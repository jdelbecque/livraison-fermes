console.log("✅ app.js – VERSION STABLE AVEC AUJOURD’HUI + SEMAINE + CONFIRMATION");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  let fermes = [];
  let selection = [];

  /* =====================
     CHARGEMENT DES FERMES
     ===================== */
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
     ❌ DÉSÉLECTION AVEC CONFIRMATION
     ===================== */
  window.toutDeselectionner = () => {
    if (selection.length === 0) return;

    if (!confirm("Voulez-vous vraiment désélectionner toutes les fermes ?")) {
      return;
    }

    selection = [];
    afficherListe(recherche.value.toLowerCase());
  };

  /* =====================
     CRÉER / ENREGISTRER TOURNÉE
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

    const tournees = JSON.parse(localStorage.getItem("tournees") || "[]");

    tournees.push({
      id: Date.now(),
      nom,
      date,
      fermes: selection.map(i => fermes[i])
    });

    localStorage.setItem("tournees", JSON.stringify(tournees));
    alert("✅ Tournée enregistrée");
  };

  /* =====================
     📅 AUJOURD’HUI
     ===================== */
  window.afficherCalendrierDuJour = () => {
    const aujourdHui = new Date().toISOString().slice(0, 10);
    const tournees = JSON.parse(localStorage.getItem("tournees") || "[]")
      .filter(t => t.date === aujourdHui);

    zone.innerHTML = `<h2>📅 Aujourd’hui — ${aujourdHui}</h2>`;

    if (tournees.length === 0) {
      zone.innerHTML += "<p>Aucune tournée prévue aujourd’hui</p>";
    } else {
      tournees.forEach(t => {
        const btn = document.createElement("button");
        btn.textContent = `🚚 ${t.nom}`;
        btn.onclick = () => afficherTournee(t.fermes);
        zone.appendChild(btn);
      });
    }

    const retour = document.createElement("button");
    retour.textContent = "↩ Retour à la liste";
    retour.onclick = afficherListe;
    zone.appendChild(retour);
  };

  /* =====================
     🗓️ SEMAINE
     ===================== */
  window.afficherCalendrierSemaine = () => {
    const today = new Date();
    const tournees = JSON.parse(localStorage.getItem("tournees") || "[]");

    zone.innerHTML = "<h2>🗓️ Cette semaine</h2>";

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dateISO = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("fr-CA", {
        weekday: "long",
        day: "numeric",
        month: "short"
      });

      zone.innerHTML += `<h3>${label}</h3>`;

      const tourneesDuJour = tournees.filter(t => t.date === dateISO);

      if (tourneesDuJour.length === 0) {
        zone.innerHTML += "<p style='opacity:.6'>Aucune tournée</p>";
      } else {
        tourneesDuJour.forEach(t => {
          const btn = document.createElement("button");
          btn.textContent = `🚚 ${t.nom}`;
          btn.onclick = () => afficherTournee(t.fermes);
          zone.appendChild(btn);
        });
      }
    }

    const retour = document.createElement("button");
    retour.textContent = "↩ Retour à la liste";
    retour.onclick = afficherListe;
    zone.appendChild(retour);
  };

  /* =====================
     AFFICHER UNE TOURNÉE
     ===================== */
  function afficherTournee(tournee) {
    zone.innerHTML = "<h2>🚚 Tournée</h2>";

    tournee.forEach(ferme => {
      const texte = Object.values(ferme)
        .filter(v => typeof v === "string")
        .join(" – ");

      const btn = document.createElement("button");
      btn.textContent = texte;
      zone.appendChild(btn);
    });

    const retour = document.createElement("button");
    retour.textContent = "↩ Retour";
    retour.onclick = afficherCalendrierDuJour;
    zone.appendChild(retour);
  }

  /* =====================
     RECHERCHE
     ===================== */
  recherche.addEventListener("input", e => {
    afficherListe(e.target.value.toLowerCase());
  });
});
