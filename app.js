console.log("✅ app.js – VERSION STABLE (TOURNÉES TOUJOURS VISIBLES)");

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
    if (f.latitude && f.longitude) return `${f.latitude},${f.longitude}`;
    return `${f.rue}, ${f.ville}, QC, Canada`;
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
    } else {
      tournees.forEach(t => {
        const b = document.createElement("button");
        b.textContent = `${t.nom} — ${t.date}`;
        b.onclick = () => ouvrirTournee(t);
        zone.appendChild(b);
      });
    }

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
          b.textContent = `${t.nom} — ${t.date}`;
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

  /* ========= LISTE DES FERMES (RECHERCHE OK) ========= */

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

    zone.appendChild(boutonModeChauffeur());
    zone.appendChild(boutonToutesTournees());
  }

  /* ========= CRÉER / MODIFIER TOURNÉE ========= */

  window.creerTournee = () => {
    if (!selection.length) {
      alert("Sélectionne au moins une ferme");
      return;
    }

    const nom = prompt("Nom de la tournée", tourneeEnEdition?.nom || "");
    if (!nom) return;

    const dateChoisie = prompt(
      "Date de la tournée (YYYY-MM-DD)",
      tourneeEnEdition ? tourneeEnEdition.date : dateISO()
    );

    if (!dateChoisie || !/^\d{4}-\d{2}-\d{2}$/.test(dateChoisie)) {
      alert("Date invalide");
      return;
    }

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
        fermes: selection.map(i => fermes[i]),
        terminee: false
      });
    }

    sauverTournees(tournees);
    selection = [];
    tourneeEnEdition = null;

    // ✅ TOUJOURS montrer les tournées après création
    afficherToutesLesTournees();
  };

  /* ========= TOUTES LES TOURNÉES (GLOBAL) ========= */

  function afficherToutesLesTournees() {
    const tournees = chargerTournees();
    zone.innerHTML = "<h2>🚚 Toutes les tournées</h2>";

    if (!tournees.length) {
      zone.innerHTML += "<p>Aucune tournée</p>";
    }

    tournees.forEach(t => {
      const b = document.createElement("button");
      b.textContent = `${t.nom} — ${t.date}`;
      b.onclick = () => ouvrirTournee(t);
      zone.appendChild(b);
    });

    zone.appendChild(boutonAccueil());
  }
  window.afficherToutesLesTournees = afficherToutesLesTournees;

  /* ========= OUVRIR TOURNÉE ========= */

  function ouvrirTournee(t) {
    zone.innerHTML = `<h2>🚚 ${t.nom}</h2>`;

    const badge = document.createElement("span");
    badge.textContent = t.terminee ? "ARRIVÉE ✅" : "DÉPART";
    badge.style.background = t.terminee ? "#34c759" : "#007AFF";
    badge.style.color = "#fff";
    badge.style.padding = "4px 10px";
    badge.style.borderRadius = "12px";
    zone.appendChild(badge);

    zone.appendChild(boutonToutesTournees());
    zone.appendChild(boutonAccueil());
  }

  /* ========= RECHERCHE ========= */

  recherche.addEventListener("input", e => {
    afficherFermes(e.target.value.toLowerCase());
  });
});
