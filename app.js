console.log("✅ app.js – VERSION FINALE GARANTIE");

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
    return prompt("🔒 Code PIN admin") === PIN_ADMIN;
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

  function chargerTournees() {
    return JSON.parse(localStorage.getItem("tournees") || "[]");
  }

  function sauverTournees(liste) {
    localStorage.setItem("tournees", JSON.stringify(liste));
  }

  /* ========= CHARGEMENT DES FERMES ========= */

  fetch("clients_livraison.json")
    .then(res => res.json())
    .then(data => {
      fermes = Array.isArray(data) ? data : [];
      afficherListe();
    })
    .catch(err => {
      console.error(err);
      zone.innerHTML = "<p>❌ Impossible de charger les fermes</p>";
    });

  /* ========= LISTE DES FERMES ========= */

  function afficherListe(filtre = "") {
    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";

    fermes.forEach((ferme, index) => {
      if (filtre && !ferme.nom.toLowerCase().includes(filtre)) return;

      const btn = document.createElement("button");
      btn.textContent = ferme.nom;
      btn.style.background = selection.includes(index) ? "#34c759" : "#fff";

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
    const aujourd = new Date().toISOString().slice(0, 10);
    const tournees = chargerTournees().filter(t => t.date === aujourd);

    zone.innerHTML = "<h2>📅 Aujourd’hui</h2>";

    tournees.forEach(t => {
      const b = document.createElement("button");
      b.textContent = `${t.nom}${t.terminee ? " ✅" : ""}`;
      b.onclick = () => ouvrirTournee(t);
      zone.appendChild(b);
    });
  };

  /* ========= VUE SEMAINE ========= */

  window.afficherSemaine = () => {
    const tournees = chargerTournees();
    const today = new Date();
    const day = today.getDay() || 7;
    const lundi = new Date(today);
    lundi.setDate(today.getDate() - (day - 1));

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

      const td = tournees.filter(t => t.date === iso);

      if (!td.length) {
        zone.appendChild(document.createTextNode("Aucune tournée"));
      } else {
        td.forEach(t => {
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
    gps.textContent = "🧭 GPS (retour entrepôt)";
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

  /* ========= GPS AVEC RETOUR ENTREPÔT ========= */

  function lancerGPS(t) {
    const arrets = t.fermes.map(formatAdresseGps).filter(Boolean);

    const points = [
      ADRESSE_DEPOT,
      ...arrets,
      ADRESSE_DEPOT + " (retour entrepôt)"
    ];

    const url = "https://www.google.com/maps/dir/" +
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
