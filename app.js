console.log("✅ app.js – VERSION STABLE AVEC BARRE D’ACTIONS");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  let fermes = [];
  let selection = [];

  /* =====================
     BARRE D’ACTIONS
     ===================== */
  function afficherActions() {
    const actions = document.createElement("div");
    actions.style.display = "grid";
    actions.style.gridTemplateColumns = "repeat(4, 1fr)";
    actions.style.gap = "6px";
    actions.style.marginBottom = "10px";

    const btnListe = document.createElement("button");
    btnListe.textContent = "📋 Liste";
    btnListe.onclick = () => afficherListe();

    const btnAujourd = document.createElement("button");
    btnAujourd.textContent = "📅 Aujourd’hui";
    btnAujourd.onclick = () => afficherAujourdHui();

    const btnCreer = document.createElement("button");
    btnCreer.textContent = "➕ Créer";
    btnCreer.onclick = () => creerTournee();

    const btnClear = document.createElement("button");
    btnClear.textContent = "❌ Désélectionner";
    btnClear.onclick = () => {
      if (selection.length === 0) return;
      if (!confirm("Désélectionner toutes les fermes ?")) return;
      selection = [];
      afficherListe(recherche.value.toLowerCase());
    };

    actions.appendChild(btnListe);
    actions.appendChild(btnAujourd);
    actions.appendChild(btnCreer);
    actions.appendChild(btnClear);

    zone.appendChild(actions);
  }

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
    zone.innerHTML = "";
    afficherActions();

    const titre = document.createElement("h2");
    titre.textContent = "📋 Liste des fermes";
    zone.appendChild(titre);

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
     CRÉER + SAUVEGARDER TOURNÉE
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
     📅 AUJOURD’HUI
     ===================== */
  window.afficherAujourdHui = () => {
    zone.innerHTML = "";
    afficherActions();

    const today = new Date().toISOString().slice(0, 10);
    const titre = document.createElement("h2");
    titre.textContent = `📋 Tournées du jour — ${today}`;
    zone.appendChild(titre);

    const tournees = JSON.parse(localStorage.getItem("tournees") || [])
      .filter(t => t.date === today);

    if (tournees.length === 0) {
      const p = document.createElement("p");
      p.textContent = "Aucune tournée aujourd’hui";
      zone.appendChild(p);
    } else {
      tournees.forEach(t => {
        const btn = document.createElement("button");
        btn.textContent = `🚚 ${t.nom}`;
        btn.onclick = () => ouvrirTournee(t);
        zone.appendChild(btn);
      });
    }
  };

  /* =====================
     OUVRIR TOURNÉE
     ===================== */
  function ouvrirTournee(tournee) {
    zone.innerHTML = "";
    afficherActions();

    const titre = document.createElement("h2");
    titre.textContent = `🚚 Tournée : ${tournee.nom}`;
    zone.appendChild(titre);

    tournee.fermes.forEach(ferme => {
      const texte = Object.values(ferme)
        .filter(v => typeof v === "string")
        .join(" – ");

      const btn = document.createElement("button");
      btn.textContent = texte;
      zone.appendChild(btn);
    });
  }

  /* =====================
     RECHERCHE
     ===================== */
  recherche.addEventListener("input", e => {
    afficherListe(e.target.value.toLowerCase());
  });
});
