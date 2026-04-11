console.log("✅ app.js – OUVERTURE DE TOURNEE GARANTIE");

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
      btn.textContent = texte;
      btn.style.background = selection.includes(index) ? "#34c759" : "#fff";

      btn.addEventListener("click", () => {
        selection.includes(index)
          ? selection = selection.filter(i => i !== index)
          : selection.push(index);
        afficherListe(recherche.value.toLowerCase());
      });

      zone.appendChild(btn);
    });
  }

  /* =====================
     CREER TOURNEE
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
    selection = [];
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

    if (tournees.length === 0) {
      zone.innerHTML += "<p>Aucune tournée aujourd’hui</p>";
    } else {
      tournees.forEach(tournee => {
        const btn = document.createElement("button");
        btn.textContent = `🚚 ${tournee.nom}`;

        // ✅ CLIC DEFINITIF
        btn.addEventListener("click", () => {
          ouvrirTournee(tournee);
        });

        zone.appendChild(btn);
      });
    }

    const retour = document.createElement("button");
    retour.textContent = "↩ Retour";
    retour.onclick = afficherListe;
    zone.appendChild(retour);
  };

  /* =====================
     ✅ OUVERTURE DE TOURNEE
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

    const retour = document.createElement("button");
    retour.textContent = "↩ Retour Aujourd’hui";
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
