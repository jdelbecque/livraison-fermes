console.log("✅ app.js – VERSION FINALE AVEC TERMINÉE + ARRIVÉE + MODE CHAUFFEUR");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  const DEPOT_LABEL = "🏢 Entrepôt MAIA Services Vétérinaires";
  const DEPOT_GPS = "46.7160,-71.3453";
  const PIN_ADMIN = "1";

  let fermes = [];
  let selection = [];
  let tourneeEnEdition = null;
  let modeChauffeur = false;

  /* ========= UTILITAIRES ========= */

  function dateISO(d = new Date()) {
    return d.toISOString().slice(0, 10);
  }

  function heureLocale() {
    return new Date().toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
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
    if (f.latitude && f.longitude) return `${f.latitude},${f.longitude}`;
    return `${f.rue}, ${f.ville}, QC, Canada`;
  }

  function boutonAccueil() {
    const b = document.createElement("button");
    b.textContent = "🏠 Accueil";
    b.onclick = afficherFermes;
    return b;
  }

  function boutonModeChauffeur() {
    const b = document.createElement("button");
    b.textContent = modeChauffeur ? "🔓 Mode admin" : "🚚 Mode chauffeur";
    b.onclick = () => {
      if (modeChauffeur && !demanderPIN()) return;
      modeChauffeur = !modeChauffeur;
      alert(modeChauffeur ? "🚚 Mode chauffeur activé" : "🔓 Mode admin activé");
    };
    return b;
  }

  /* ========= CHARGEMENT DES FERMES ========= */

  fetch("clients_livraison.json")
    .then(r => r.json())
    .then(data => {
      fermes = Array.isArray(data) ? data : [];
      afficherFermes();
    });

  /* ========= LISTE DES FERMES ========= */

  function afficherFermes() {
    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";
    selection = [];

    fermes.forEach((f, i) => {
      const b = document.createElement("button");
      b.textContent = f.nom;
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

    zone.appendChild(boutonModeChauffeur());
  }

  /* ========= CRÉER / MODIFIER TOURNÉE ========= */

  window.creerTournee = () => {
    if (!selection.length) {
      alert("Sélectionne au moins une ferme");
      return;
    }

    const nom = prompt("Nom de la tournée", tourneeEnEdition?.nom || "");
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
        heureDebut: heureLocale(),
        fermes: selection.map(i => fermes[i]),
        terminee: false
      });
    }

    sauverTournees(tournees);
    tourneeEnEdition = null;
    selection = [];
    afficherToutesLesTournees();
  };

  /* ========= TOUTES LES TOURNÉES ========= */

  function afficherToutesLesTournees() {
    const tournees = chargerTournees();
    zone.innerHTML = "<h2>🚚 Toutes les tournées</h2>";

    tournees.forEach(t => {
      const b = document.createElement("button");
      b.textContent = `${t.nom} — ${t.terminee ? "✅ Terminée" : "⏳ En cours"}`;
      b.onclick = () => ouvrirTournee(t);
      zone.appendChild(b);
    });

    zone.appendChild(boutonAccueil());
  }

  /* ========= OUVRIR TOURNÉE ========= */

  function ouvrirTournee(t) {
    zone.innerHTML = `<h2>🚚 ${t.nom}</h2>`;

    const depot = document.createElement("div");
    depot.textContent = DEPOT_LABEL;
    depot.style.fontWeight = "bold";
    zone.appendChild(depot);

    const badge = document.createElement("span");
    badge.textContent = t.terminee ? "ARRIVÉE ✅" : "DÉPART";
    badge.style.background = t.terminee ? "#34c759" : "#007AFF";
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

    if (!modeChauffeur && !t.terminee) {
      const terminer = document.createElement("button");
      terminer.textContent = "✅ Marquer tournée terminée";
      terminer.onclick = () => {
        let tournees = chargerTournees().map(x =>
          x.id === t.id
            ? { ...x, terminee: true, heureFin: heureLocale() }
            : x
        );
        sauverTournees(tournees);
        afficherToutesLesTournees();
      };
      zone.appendChild(terminer);
    }

    if (!modeChauffeur) {
      const modif = document.createElement("button");
      modif.textContent = "✏️ Modifier";
      modif.onclick = () => {
        selection = t.fermes.map(f => fermes.findIndex(x => x.nom === f.nom));
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

    zone.appendChild(boutonAccueil());
    zone.appendChild(boutonModeChauffeur());
  }

  /* ========= GPS ========= */

  function lancerGPS(t) {
    const points = [
      DEPOT_GPS,
      ...t.fermes.map(formatAdresseGps),
      DEPOT_GPS
    ];
    window.open("https://www.google.com/maps/dir/" + points.map(encodeURIComponent).join("/"), "_blank");
  }
});
``
