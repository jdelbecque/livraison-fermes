console.log("✅ app.js – VERSION FINALE STABLE (SELECTION FIXEE)");

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

  function dateISO(d = new Date()) {
    return d.toISOString().slice(0, 10);
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

    fermes.forEach((f, i) => {
      if (filtre && !f.nom.toLowerCase().includes(filtre)) return;

      const b = document.createElement("button");
      b.textContent = f.nom;
      b.style.background = selection.includes(i) ? "#34c759" : "#fff";

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

  /* ========= CREER / MODIFIER TOURNEE ========= */

  window.creerTournee = () => {
    if (!selection.length) {
      alert("Sélectionne au moins une ferme");
      return;
    }

    const nom = prompt(
      "Nom de la tournée",
      tourneeEnEdition ? tourneeEnEdition.nom : ""
    );
    if (!nom) return;

    let tournees = chargerTournees();

    if (tourneeEnEdition) {
      tournees = tournees.map(t =>
        t.id === tourneeEnEdition.id
          ? { ...t, nom, fermes: selection.map(i => fermes[i]) }
          : t
      );
    } else {
      tournees.push({
        id: Date.now(),
        nom,
        date: dateISO(),
        fermes: selection.map(i => fermes[i])
      });
    }

    sauverTournees(tournees);
    selection = [];
    tourneeEnEdition = null;
    afficherToutesLesTournees();
  };

  /* ========= TOUTES LES TOURNEES ========= */

  function afficherToutesLesTournees() {
    const tournees = chargerTournees();
    zone.innerHTML = "<h2>🚚 Toutes les tournées</h2>";

    if (!tournees.length) {
      zone.innerHTML += "<p>Aucune tournée</p>";
      return;
    }

    tournees.forEach(t => {
      const b = document.createElement("button");
      b.textContent = `${t.nom} — ${t.date}`;
      b.onclick = () => ouvrirTournee(t);
      zone.appendChild(b);
    });
  }

  /* ========= AUJOURD’HUI ========= */

  window.afficherAujourdHui = () => {
    const today = dateISO();
    const tournees = chargerTournees().filter(t => t.date === today);

    zone.innerHTML = "<h2>📅 Aujourd’hui</h2>";

    if (!tournees.length) {
      zone.innerHTML += "<p>Aucune tournée aujourd’hui</p>";
      return;
    }

    tournees.forEach(t => {
      const b = document.createElement("button");
      b.textContent = t.nom;
      b.onclick = () => ouvrirTournee(t);
      zone.appendChild(b);
    });
  };

  /* ========= SEMAINE ========= */

  window.afficherSemaine = () => {
    const tournees = chargerTournees();
    const lundi = new Date();
    lundi.setDate(lundi.getDate() - lundi.getDay() + 1);

    zone.innerHTML = "<h2>🗓️ Semaine</h2>";

    for (let i = 0; i < 7; i++) {
      const d = new Date(lundi);
      d.setDate(lundi.getDate() + i);
      const iso = dateISO(d);

      const h = document.createElement("h3");
      h.textContent = d.toLocaleDateString("fr-CA", {
        weekday: "long",
        day: "numeric",
        month: "long"
      });
      zone.appendChild(h);

      tournees
        .filter(t => t.date === iso)
        .forEach(t => {
          const b = document.createElement("button");
          b.textContent = t.nom;
          b.onclick = () => ouvrirTournee(t);
          zone.appendChild(b);
        });
    }
  };

  /* ========= OUVRIR TOURNEE ========= */

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

    const modif = document.createElement("button");
    modif.textContent = "✏️ Modifier";
    modif.onclick = () => {
      selection = t.fermes.map(f =>
        fermes.findIndex(x => x.nom === f.nom)
      );
      tourneeEnEdition = t;
      afficherFermes();
    };
    zone.appendChild(modif);

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

  recherche.addEventListener("input", e =>
    afficherFermes(e.target.value.toLowerCase())
  );
});
``
