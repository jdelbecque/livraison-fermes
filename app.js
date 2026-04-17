console.log("✅ app.js – VERSION PRO FINALE");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  const ADRESSE_DEPOT = "840 Rue du Houppier, Saint-Nicolas, QC, Canada";
  const PIN_ADMIN = "1234";

  let fermes = [];
  let selection = [];
  let modeChauffeur = false;

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

  /* ========= CRÉER TOURNÉE ========= */

  window.creerTournee = () => {
    if (modeChauffeur) return alert("Mode chauffeur actif");
    if (!selection.length) return alert("Sélection requise");

    const nom = prompt("Nom de la tournée");
    if (!nom) return;

    const t = JSON.parse(localStorage.getItem("tournees") || "[]");
    t.push({
      id: Date.now(),
      nom,
      date: new Date().toISOString().slice(0,10),
      terminee: false,
      heureDebut: null,
      heureFin: null,
      fermes: selection.map(i => fermes[i])
    });

    localStorage.setItem("tournees", JSON.stringify(t));
    selection = [];
    afficherAujourdHui();
  };

  /* ========= AUJOURD’HUI ========= */

  window.afficherAujourdHui = () => {
    const d = new Date().toISOString().slice(0,10);
    const t = JSON.parse(localStorage.getItem("tournees") || "[]")
      .filter(x => x.date === d);

    zone.innerHTML = `<h2>📅 Aujourd’hui</h2>`;

    t.forEach(x => {
      const b = document.createElement("button");
      b.textContent = `${x.nom} ${x.terminee ? "✅" : ""}`;
      b.onclick = () => ouvrirTournee(x);
      zone.appendChild(b);
    });
  };

  /* ========= OUVRIR TOURNÉE ========= */

  function ouvrirTournee(t) {
    zone.innerHTML = `<h2>🚚 ${t.nom}</h2>`;

    if (!t.heureDebut) {
      t.heureDebut = maintenant();
      sauverTournee(t);
    }

    t.fermes.forEach(f => {
      const b = document.createElement("button");
      b.textContent = f.nom;
      zone.appendChild(b);
    });

    const gps = document.createElement("button");
    gps.textContent = "🧭 GPS";
    gps.onclick = () => lancerGPS(t);
    zone.appendChild(gps);

    const fin = document.createElement("button");
    fin.textContent = "✅ Marquer terminée";
    fin.onclick = () => {
      t.terminee = true;
      t.heureFin = maintenant();
      sauverTournee(t);
      afficherAujourdHui();
    };
    zone.appendChild(fin);

    const retour = document.createElement("button");
    retour.textContent = "↩ Retour";
    retour.onclick = afficherAujourdHui;
    zone.appendChild(retour);
  }

  function sauverTournee(t) {
    let liste = JSON.parse(localStorage.getItem("tournees") || "[]");
    liste = liste.map(x => x.id === t.id ? t : x);
    localStorage.setItem("tournees", JSON.stringify(liste));
  }

  /* ========= GPS ========= */

  function lancerGPS(t) {
    const points = [ADRESSE_DEPOT, ...t.fermes.map(formatAdresseGps)];
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
