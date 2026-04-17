console.log("✅ app.js – VERSION STABLE (GPS + MODIFIER + SUPPRIMER)");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  const PIN_ADMIN = "1";
  const DEPOT_GPS = "46.7160,-71.3453";

  let fermes = [];
  let selection = [];
  let tourneeEnEdition = null;

  /* ========= OUTILS ========= */

  function dateISO(d = new Date()) {
    return d.toISOString().slice(0, 10);
  }

  function heureLocale() {
    return new Date().toLocaleTimeString("fr-CA", {
      hour: "2-digit",
      minute: "2-digit"
    });
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
    return encodeURIComponent(`${f.rue}, ${f.ville}, QC, Canada`);
  }

  /* ========= NAVIGATION ========= */

  function boutonAccueil() {
    const b = document.createElement("button");
    b.textContent = "🏠 Accueil";
    b.onclick = afficherAccueil;
    return b;
  }

  function boutonToutesTournees() {
    const b = document.createElement("button");
    b.textContent = "📋 Toutes les tournées";
    b.onclick = afficherToutesLesTournees;
    return b;
  }

  /* ========= ACCUEIL ========= */

  function afficherAccueil() {
    selection = [];
    tourneeEnEdition = null;
    afficherFermes(recherche.value.toLowerCase());
  }
  window.afficherAccueil = afficherAccueil;

  /* ========= AUJOURD’HUI ========= */

  function afficherAujourdHui() {
    const today = dateISO();
    const tournees = chargerTournees().filter(t => t.date === today);

    zone.innerHTML = "<h2>📅 Aujourd’hui</h2>";

    if (!tournees.length) {
      zone.innerHTML += "<p>Aucune tournée aujourd’hui</p>";
    }

    tournees.forEach(t => {
      const b = document.createElement("button");
      b.textContent = `🚚 ${t.nom} (${t.fermes.length} arrêts)`;
      b.onclick = () => ouvrirTournee(t);
      zone.appendChild(b);
    });

    zone.appendChild(boutonToutesTournees());
    zone.appendChild(boutonAccueil());
  }
  window.afficherAujourdHui = afficherAujourdHui;

  /* ========= SEMAINE ========= */

  function afficherSemaine() {
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
          b.textContent = `🚚 ${t.nom} (${t.fermes.length} arrêts)`;
          b.onclick = () => ouvrirTournee(t);
          zone.appendChild(b);
        });
    }

    zone.appendChild(boutonToutesTournees());
    zone.appendChild(boutonAccueil());
  }
  window.afficherSemaine = afficherSemaine;

  /* ========= CHARGEMENT DES FERMES ========= */

  fetch("clients_livraison.json")
    .then(r => r.json())
    .then(data => {
      fermes = Array.isArray(data) ? data : [];
      afficherAccueil();
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
        selection.includes(i)
          ? selection = selection.filter(x => x !== i)
          : selection.push(i);
        afficherFermes(recherche.value.toLowerCase());
      };

      zone.appendChild(b);
    });

    zone.appendChild(boutonToutesTournees());
  }

  /* ========= CRÉER / MODIFIER ========= */

  window.creerTournee = () => {
    if (!selection.length) {
      alert("Sélectionne au moins une ferme");
      return;
    }

    const nom = prompt("Nom de la tournée", tourneeEnEdition?.nom || "");
    if (!nom) return;

    const dateChoisie = prompt(
      "Date (YYYY-MM-DD)",
      tourneeEnEdition ? tourneeEnEdition.date : dateISO()
    );
    if (!dateChoisie || !/^\d{4}-\d{2}-\d{2}$/.test(dateChoisie)) return;

    let tournees = chargerTournees();

    if (tourneeEnEdition) {
      tournees = tournees.map(t =>
        t.id === tourneeEnEdition.id
          ? { ...t, nom, date: dateChoisie, fermes: selection.map(i => fermes[i]) }
          : t
      );
    } else {
      tournees.push({
        id: Date.now(),
        nom,
        date: dateChoisie,
        heureDebut: heureLocale(),
        fermes: selection.map(i => fermes[i])
      });
    }

    sauverTournees(tournees);
    selection = [];
    tourneeEnEdition = null;
    afficherToutesLesTournees();
  };

  /* ========= TOUTES LES TOURNÉES ========= */

  function afficherToutesLesTournees() {
    const tournees = chargerTournees();
    zone.innerHTML = "<h2>🚚 Toutes les tournées</h2>";

    tournees.forEach(t => {
      const b = document.createElement("button");
      b.textContent = `🚚 ${t.nom} — ${t.date} (${t.fermes.length} arrêts)`;
      b.onclick = () => ouvrirTournee(t);
      zone.appendChild(b);
    });

    zone.appendChild(boutonAccueil());
  }
  window.afficherToutesLesTournees = afficherToutesLesTournees;

  /* ========= OUVRIR TOURNÉE ========= */

  function ouvrirTournee(t) {
    zone.innerHTML = `<h2>🚚 ${t.nom}</h2>`;

    const info = document.createElement("p");
    info.textContent =
      `📍 Arrêts : ${t.fermes.length} | 🕒 Début : ${t.heureDebut || "—"} | 🕒 Fin : ${t.heureFin || "En cours"}`;
    zone.appendChild(info);

    const ol = document.createElement("ol");
    t.fermes.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f.nom;
      ol.appendChild(li);
    });
    zone.appendChild(ol);

    const gps = document.createElement("button");
    gps.textContent = "🧭 Lancer le GPS";
    gps.onclick = () => {
      const points = [
        DEPOT_GPS,
        ...t.fermes.map(formatAdresseGps),
        DEPOT_GPS
      ];
      window.open(
        "https://www.google.com/maps/dir/" + points.join("/"),
        "_blank"
      );
    };
    zone.appendChild(gps);

    const modifier = document.createElement("button");
    modifier.textContent = "✏️ Modifier";
    modifier.onclick = () => {
      selection = t.fermes.map(f =>
        fermes.findIndex(x => x.nom === f.nom)
      );
      tourneeEnEdition = t;
      afficherFermes();
    };
    zone.appendChild(modifier);

    const suppr = document.createElement("button");
    suppr.textContent = "🗑️ Supprimer";
    suppr.onclick = () => {
      if (!demanderPIN()) return;
      sauverTournees(chargerTournees().filter(x => x.id !== t.id));
      afficherToutesLesTournees();
    };
    zone.appendChild(suppr);

    zone.appendChild(boutonToutesTournees());
    zone.appendChild(boutonAccueil());
  }

  /* ========= RECHERCHE ========= */

  recherche.addEventListener("input", e => {
    afficherFermes(e.target.value.toLowerCase());
  });
});
