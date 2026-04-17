console.log("✅ app.js – VERSION PRO FINALE + SEMAINE + CRUD + RETOUR DEPOT");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  const ADRESSE_DEPOT = "840 Rue du Houppier, Saint-Nicolas, QC, Canada";
  const PIN_ADMIN = "1234";

  let fermes = [];
  let selection = [];
  let modeChauffeur = false;
  let tourneeEnEdition = null;

  /* ========= UTILS ========= */

  function demanderPIN() {
    const pin = prompt("🔒 Code PIN admin");
    return pin === PIN_ADMIN;
  }

  function formatAdresseGps(ferme) {
    if (ferme.latitude && ferme.longitude) {
      return `${ferme.latitude},${ferme.longitude}`;
    }
    return `${ferme.rue}, ${ferme.ville}, QC, Canada`;
  }

  function maintenant() {
    return new Date().toLocaleString("fr-CA");
  }

  function sauverTournees(liste) {
    localStorage.setItem("tournees", JSON.stringify(liste));
  }

  function chargerTournees() {
    return JSON.parse(localStorage.getItem("tournees") || "[]");
  }

  /* ========= LOAD CLIENTS ========= */

  fetch("clients_livraison.json")
    .then(r => r.json())
    .then(data => {
      fermes = data;
      afficherListe();
    });

  /* ========= LISTE FERMES ========= */

  function afficherListe(filtre = "") {
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
        afficherListe(recherche.value.toLowerCase());
      };

      zone.appendChild(b);
    });
  }

  /* ========= CRÉER / MODIFIER TOURNÉE ========= */

  window.creerTournee = () => {
    if (modeChauffeur) return alert("🚚 Mode chauffeur actif");
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
        date: new Date().toISOString().slice(0, 10),
        terminee: false,
        heureDebut: null,
        heureFin: null,
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
    const d = new Date().toISOString().slice(0, 10);
    const t = chargerTournees().filter(x => x.date === d);

    zone.innerHTML = "<h2>📅 Aujourd’hui</h2>";

    t.forEach(x => {
      const b = document.createElement("button");
      b.textContent = `${x.nom} ${x.terminee ? "✅" : ""}`;
      b.onclick = () => ouvrirTournee(x);
      zone.appendChild(b);
    });
  };

  /* ========= 🗓️ SEMAINE ========= */

  window.afficherSemaine = () => {
    const tournees = chargerTournees();

    const aujourd = new Date();
    const jour = aujourd.getDay() || 7;
    const lundi = new Date(aujourd);
    lundi.setDate(aujourd.getDate() - (jour - 1));

    zone.innerHTML = "<h2>🗓️ Cette semaine</h2>";

    for (let i = 0; i < 7; i++) {
      const d = new Date(lundi);
      d.setDate(lundi.getDate() + i);
      const iso = d.toISOString().slice(0, 10);

      const h3 = document.createElement("h3");
      h3.textContent = d.toLocaleDateString("fr-CA", {
        weekday: "long",
        day: "numeric",
        month: "long"
      });
      zone.appendChild(h3);

      const tj = tournees.filter(t => t.date === iso);

      if (!tj.length) {
        const p = document.createElement("p");
        p.textContent = "Aucune tournée";
        zone.appendChild(p);
      } else {
        tj.forEach(t => {
          const b = document.createElement("button");
          b.textContent = `🚚 ${t.nom}`;
          b.onclick = () => ouvrirTournee(t);
          zone.appendChild(b);
        });
      }
    }

    const retour = document.createElement("button");
    retour.textContent = "↩ Retour Aujourd’hui";
    retour.onclick = afficherAujourdHui;
    zone.appendChild(retour);
  };

  /* ========= OUVRIR TOURNÉE ========= */

  function ouvrirTournee(t) {
    zone.innerHTML = `<h2>🚚 ${t.nom}</h2>`;

    if (!t.heureDebut) {
      t.heureDebut = maintenant();
      sauverTournees(chargerTournees().map(x => x.id === t.id ? t : x));
    }

    t.fermes.forEach(f => {
      const b = document.createElement("button");
      b.textContent = f.nom;
      zone.appendChild(b);
    });

    const gps = document.createElement("button");
    gps.textContent = "🧭 GPS (retour dépôt)";
    gps.onclick = () => lancerGPS(t);
    zone.appendChild(gps);

    if (!modeChauffeur) {
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

    const fin = document.createElement("button");
    fin.textContent = "✅ Marquer terminée";
    fin.onclick = () => {
      t.terminee = true;
      t.heureFin = maintenant();
      sauverTournees(chargerTournees().map(x => x.id === t.id ? t : x));
      afficherAujourdHui();
    };
    zone.appendChild(fin);

    const retour = document.createElement("button");
    retour.textContent = "↩ Retour";
    retour.onclick = afficherAujourdHui;
    zone.appendChild(retour);
  }

  /* ========= GPS AVEC RETOUR DEPOT ✅ ========= */

  function lancerGPS(t) {
    const arrets = t.fermes
      .map(formatAdresseGps)
      .filter(a => a && a.length > 10);

    if (!arrets.length) {
      alert("❌ Aucune adresse GPS valide");
      return;
    }

    // ✅ Dépôt → fermes → dépôt
    const points = [
      ADRESSE_DEPOT,
      ...arrets,
      ADRESSE_DEPOT
    ];

    const url =
      "https://www.google.com/maps/dir/" +
      points.map(encodeURIComponent).join("/");

    window.open(url, "_blank");
  }

  /* ========= MODE CHAUFFEUR ========= */

  window.activerModeChauffeur = () => {
    if (!demanderPIN()) return;
    modeChauffeur = true;
    alert("🚚 Mode chauffeur activé");
  };

  window.desactiverModeChauffeur = () => {
    if (!demanderPIN()) return;
    modeChauffeur = false;
    alert("🔓 Mode admin");
  };

  recherche.addEventListener("input", e =>
    afficherListe(e.target.value.toLowerCase())
  );
});
