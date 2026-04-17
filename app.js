console.log("✅ app.js – VERSION STABLE SANS CONFLIT UI");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  /* ========= CONFIG ========= */

  const DEPOT_LABEL = "🏢 Entrepôt MAIA Services Vétérinaires";
  const DEPOT_GPS = "46.7160,-71.3453";
  const PIN_ADMIN = "1";

  let fermes = [];
  let selection = [];
  let tourneeEnEdition = null;

  /* ========= UTILITAIRES ========= */

  function demanderPIN() {
    return prompt("🔒 Code PIN admin") === PIN_ADMIN;
  }

  function aujourdISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function chargerTournees() {
    return JSON.parse(localStorage.getItem("tournees") || "[]");
  }

  function sauverTournees(liste) {
    localStorage.setItem("tournees", JSON.stringify(liste));
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
      afficherListe();
    })
    .catch(() => {
      zone.innerHTML = "<p>❌ Impossible de charger les fermes</p>";
    });

  /* ========= LISTE DES FERMES (ACCUEIL) ========= */

  function afficherListe(filtre = "") {
    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";

    fermes.forEach((f, index) => {
      if (filtre && !f.nom.toLowerCase().includes(filtre)) return;

      const b = document.createElement("button");
      b.textContent = f.nom;
      b.style.background = selection.includes(index) ? "#34c759" : "#fff";

      b.onclick = () => {
        selection.includes(index)
          ? selection = selection.filter(i => i !== index)
          : selection.push(index);
        afficherListe(recherche.value.toLowerCase());
      };

      zone.appendChild(b);
    });
  }

  window.afficherAccueil = () => {
    selection = [];
    tourneeEnEdition = null;
    afficherListe();
  };

  /* ========= CRÉER / MODIFIER TOURNÉE ✅ ========= */

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
        date: aujourdISO(),
        fermes: selection.map(i => fermes[i])
      });
    }

    sauverTournees(tournees);
    selection = [];
    tourneeEnEdition = null;
    afficherAujourdHui();
  };

  /* ========= AUJOURD’HUI ========= */

  window.afficherAujourdHui = () => {
    zone.innerHTML = "<h2>📅 Aujourd’hui</h2>";

    chargerTournees()
      .filter(t => t.date === aujourdISO())
      .forEach(t => {
        const b = document.createElement("button");
        b.textContent = `🚚 ${t.nom}`;
        b.onclick = () => ouvrirTournee(t);
        zone.appendChild(b);
      });
  };

  /* ========= SEMAINE ========= */

  window.afficherSemaine = () => {
    zone.innerHTML = "<h2>🗓️ Semaine</h2>";

    const tournees = chargerTournees();
    const debut = new Date();
    debut.setDate(debut.getDate() - debut.getDay() + 1);

    for (let i = 0; i < 7; i++) {
      const d = new Date(debut);
      d.setDate(debut.getDate() + i);
      const iso = d.toISOString().slice(0, 10);

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
          b.textContent = `🚚 ${t.nom}`;
          b.onclick = () => ouvrirTournee(t);
          zone.appendChild(b);
        });
    }
  };

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
    badge.style.display = "inline-block";
    badge.style.marginBottom = "12px";
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
      afficherListe();
    };
    zone.appendChild(modif);

    const suppr = document.createElement("button");
    suppr.textContent = "🗑️ Supprimer";
    suppr.onclick = () => {
      if (!demanderPIN()) return;
      sauverTournees(chargerTournees().filter(x => x.id !== t.id));
      afficherAujourdHui();
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
    afficherListe(e.target.value.toLowerCase())
  );
});
