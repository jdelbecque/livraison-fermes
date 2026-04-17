console.log("✅ app.js – VERSION FINALE CORRIGÉE TOUT FONCTIONNE");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  /* ========= CONFIG ========= */

  const DEPOT_LABEL = "🏢 Entrepôt MAIA Services Vétérinaires";
  const DEPOT_GPS = "46.7160,-71.3453";
  const PIN_ADMIN = "1234";

  let fermes = [];
  let selection = [];
  let tourneeEnEdition = null;

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

  /* ========= LISTE DES FERMES ========= */

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

  /* ========= CRÉER / MODIFIER TOURNÉE ========= */

  window.creerTournee = () => {
    if (!selection.length) return alert("Sélection requise");

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
        fermes: selection.map(i => fermes[i]),
        terminee: false
      });
    }

    sauverTournees(tournees);
    tourneeEnEdition = null;
    selection = [];
    afficherAujourdHui();
  };

  /* ========= AUJOURD’HUI ========= */

  window.afficherAujourdHui = () => {
    const tournees = chargerTournees().filter(t => t.date === aujourdISO());

    zone.innerHTML = "<h2>📅 Aujourd’hui</h2>";

    tournees.forEach(t => {
      const b = document.createElement("button");
      b.textContent = `🚚 ${t.nom}${t.terminee ? " ✅" : ""}`;
      b.onclick = () => ouvrirTournee(t);
      zone.appendChild(b);
    });
  };

  /* ========= SEMAINE ========= */

  window.afficherSemaine = () => {
    const tournees = chargerTournees();
    zone.innerHTML = "<h2>🗓️ Semaine</h2>";

    const debut = new Date();
    debut.setDate(debut.getDate() - debut.getDay() + 1);

    for (let i = 0; i < 7; i++) {
      const d = new Date(debut);
      d.setDate(debut.getDate() + i);
      const iso = d.toISOString().slice(0, 10);

      const h3 = document.createElement("h3");
      h3.textContent = d.toLocaleDateString("fr-CA", {
        weekday: "long",
        day: "numeric",
        month: "long"
      });
      zone.appendChild(h3);

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
``
