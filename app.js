console.log("✅ app.js – VERSION FINALE STABLE (MODIFIER + SUPPRIMER OK)");

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

  /* ========= BARRE ACCUEIL ========= */

  const nav = document.createElement("div");
  nav.style.display = "flex";
  nav.style.gap = "10px";
  nav.style.marginBottom = "15px";

  const btnAccueil = document.createElement("button");
  btnAccueil.textContent = "🏠 Accueil";
  btnAccueil.onclick = afficherListe;

  const btnAujourd = document.createElement("button");
  btnAujourd.textContent = "📅 Aujourd’hui";
  btnAujourd.onclick = afficherAujourdHui;

  const btnSemaine = document.createElement("button");
  btnSemaine.textContent = "🗓️ Semaine";
  btnSemaine.onclick = afficherSemaine;

  const btnCreer = document.createElement("button");
  btnCreer.textContent = "➕ Créer tournée";
  btnCreer.onclick = creerTournee;

  nav.append(btnAccueil, btnAujourd, btnSemaine, btnCreer);
  zone.parentElement.insertBefore(nav, zone);

  /* ========= UTILITAIRES ========= */

  function demanderPIN() {
    return prompt("🔒 Code PIN admin") === PIN_ADMIN;
  }

  function formatAdresseGps(f) {
    if (f.latitude && f.longitude) {
      return `${f.latitude},${f.longitude}`;
    }
    return `${f.rue}, ${f.ville}, QC, Canada`;
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

  /* ========= CHARGEMENT FERMES ========= */

  fetch("clients_livraison.json")
    .then(r => r.json())
    .then(data => {
      fermes = Array.isArray(data) ? data : [];
      afficherListe();
    });

  /* ========= LISTE FERMES ========= */

  function afficherListe(filtre = "") {
    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";
    selection = [];

    fermes.forEach((f, i) => {
      if (filtre && !f.nom.toLowerCase().includes(filtre)) return;
      const b = document.createElement("button");
      b.textContent = f.nom;
      b.onclick = () => {
        selection.includes(i)
          ? selection = selection.filter(x => x !== i)
          : selection.push(i);
        afficherListe(recherche.value.toLowerCase());
      };
      zone.appendChild(b);
    });
  }

  /* ========= CRÉER / MODIFIER ========= */

  function creerTournee() {
    if (!selection.length) return alert("Sélection requise");

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
        date: aujourdISO(),
        fermes: selection.map(i => fermes[i])
      });
    }

    sauverTournees(tournees);
    tourneeEnEdition = null;
    afficherAujourdHui();
  }

  /* ========= AUJOURD’HUI ========= */

  function afficherAujourdHui() {
    zone.innerHTML = "<h2>📅 Aujourd’hui</h2>";
    chargerTournees()
      .filter(t => t.date === aujourdISO())
      .forEach(t => {
        const b = document.createElement("button");
        b.textContent = `🚚 ${t.nom}`;
        b.onclick = () => ouvrirTournee(t);
        zone.appendChild(b);
      });
  }

  /* ========= SEMAINE ========= */

  function afficherSemaine() {
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
        month: "long",
      });
      zone.appendChild(h);

      tournees.filter(t => t.date === iso).forEach(t => {
        const b = document.createElement("button");
        b.textContent = `🚚 ${t.nom}`;
        b.onclick = () => ouvrirTournee(t);
        zone.appendChild(b);
      });
    }
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

  recherche.addEventListener("input", e =>
    afficherListe(e.target.value.toLowerCase())
  );
});
