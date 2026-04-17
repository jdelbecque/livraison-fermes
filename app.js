console.log("✅ app.js – VERSION STABLE AVEC VUE TOURNÉES");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  const DEPOT_LABEL = "🏢 Entrepôt MAIA Services Vétérinaires";
  const DEPOT_GPS = "46.7160,-71.3453";
  const PIN_ADMIN = "1";

  let fermes = [];
  let selection = [];
  let tourneeEnEdition = null;

  /* ========= UTILITAIRES ========= */

  function aujourdISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function chargerTournees() {
    return JSON.parse(localStorage.getItem("tournees") || "[]");
  }

  function sauverTournees(liste) {
    localStorage.setItem("tournees", JSON.stringify(liste));
  }

  function demanderPIN() {
    return prompt("🔒 Code PIN admin") === PIN_ADMIN;
  }

  function formatAdresseGps(f) {
    if (f.latitude && f.longitude) {
      return `${f.latitude},${f.longitude}`;
    }
    return `${f.rue}, ${f.ville}, QC, Canada`;
  }

  /* ========= CHARGEMENT DES FERMES ========= */

  fetch("clients_livraison.json")
    .then(r => r.json())
    .then(data => {
      fermes = Array.isArray(data) ? data : [];
      afficherFermes();
    })
    .catch(() => {
      zone.innerHTML = "<p>❌ Impossible de charger les fermes</p>";
    });

  /* ========= LISTE DES FERMES ========= */

  function afficherFermes(filtre = "") {
    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";
    selection = [];

    fermes.forEach((f, i) => {
      if (filtre && !f.nom.toLowerCase().includes(filtre)) return;

      const b = document.createElement("button");
      b.textContent = f.nom;
      b.style.background = "#fff";

      b.onclick = () => {
        if (selection.includes(i)) {
          selection = selection.filter(x => x !== i);
          b.style.background = "#fff";
        } else {
          selection.push(i);
          b.style.background = "#34c759";
        }
      };

      zone.appendChild(b);
    });
  }

  /* ========= CRÉER TOURNÉE ========= */

  window.creerTournee = () => {
    if (selection.length === 0) {
      alert("Sélectionne au moins une ferme");
      return;
    }

    const nom = prompt("Nom de la tournée");
    if (!nom) return;

    const tournees = chargerTournees();

    const tournee = {
      id: Date.now(),
      nom,
      date: aujourdISO(),
      fermes: selection.map(i => fermes[i])
    };

    tournees.push(tournee);
    sauverTournees(tournees);

    selection = [];
    afficherToutesLesTournees();
  };

  /* ========= VUE TOUTES LES TOURNÉES ========= */

  function afficherToutesLesTournees() {
    const tournees = chargerTournees();
    zone.innerHTML = "<h2>🚚 Toutes les tournées</h2>";

    if (tournees.length === 0) {
      zone.innerHTML += "<p>Aucune tournée enregistrée</p>";
      return;
    }

    tournees.forEach(t => {
      const bloc = document.createElement("div");
      bloc.style.border = "1px solid #ccc";
      bloc.style.padding = "10px";
      bloc.style.marginBottom = "10px";

      const titre = document.createElement("strong");
      titre.textContent = `${t.nom} — ${t.date}`;
      bloc.appendChild(titre);

      const ul = document.createElement("ul");
      t.fermes.forEach(f => {
        const li = document.createElement("li");
        li.textContent = f.nom;
        ul.appendChild(li);
      });
      bloc.appendChild(ul);

      const ouvrir = document.createElement("button");
      ouvrir.textContent = "Ouvrir";
      ouvrir.onclick = () => ouvrirTournee(t);
      bloc.appendChild(ouvrir);

      zone.appendChild(bloc);
    });

    const retour = document.createElement("button");
    retour.textContent = "↩ Retour aux fermes";
    retour.onclick = afficherFermes;
    zone.appendChild(retour);
  }

  /* ========= OUVRIR TOURNÉE ========= */

  function ouvrirTournee(t) {
    zone.innerHTML = `<h2>🚚 ${t.nom}</h2>`;

    const depot = document.createElement("div");
    depot.textContent = DEPOT_LABEL;
    depot.style.fontWeight = "bold";
    zone.appendChild(depot);

    const badge = document.createElement("span");
    badge.textContent = "DÉPART";
    badge.style.background = "#007AFF";
    badge.style.color = "#fff";
    badge.style.padding = "4px 10px";
    badge.style.borderRadius = "12px";
    zone.appendChild(badge);

    zone.appendChild(document.createElement("hr"));

    t.fermes.forEach(f => {
      const b = document.createElement("button");
      b.textContent = f.nom;
      zone.appendChild(b);
    });

    const gps = document.createElement("button");
    gps.textContent = "🧭 Lancer GPS";
    gps.onclick = () => lancerGPS(t);
    zone.appendChild(gps);

    const suppr = document.createElement("button");
    suppr.textContent = "🗑️ Supprimer";
    suppr.onclick = () => {
      if (!demanderPIN()) return;
      sauverTournees(chargerTournees().filter(x => x.id !== t.id));
      afficherToutesLesTournees();
    };
    zone.appendChild(suppr);
  }

  /* ========= GPS ========= */

  function lancerGPS(t) {
    const points = [
      DEPOT_GPS,
      ...t.fermes.map(formatAdresseGps),
      DEPOT_GPS
    ];

    window.open(
      "https://www.google.com/maps/dir/" +
        points.map(encodeURIComponent).join("/"),
      "_blank"
    );
  }

  /* ========= RECHERCHE ========= */

  recherche.addEventListener("input", e => {
    afficherFermes(e.target.value.toLowerCase());
  });
});
