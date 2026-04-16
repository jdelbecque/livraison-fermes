console.log("✅ app.js – SÉLECTION + GPS CORRIGÉS");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  const ADRESSE_DEPOT = "840 Rue du Houppier, Saint-Nicolas, QC, Canada";

  let fermes = [];
  let selection = [];

  /* =====================
     FORMAT ADRESSE GPS ✅
     (adapté à TES données)
     ===================== */
  function formatAdresseGPS(ferme) {
    if (!ferme.rue || !ferme.ville) return "";
    return `${ferme.rue}, ${ferme.ville}, QC, Canada`;
  }

  /* =====================
     CHARGEMENT DES FERMES
     ===================== */
  fetch("clients_livraison.json")
    .then(res => res.json())
    .then(data => {
      fermes = Array.isArray(data) ? data : [];
      afficherListe();
    })
    .catch(err => {
      console.error(err);
      zone.innerHTML = "<p>❌ Erreur chargement fermes</p>";
    });

  /* =====================
     LISTE DES FERMES ✅
     ===================== */
  function afficherListe(filtre = "") {
    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";

    fermes.forEach((ferme, index) => {
      if (
        filtre &&
        ferme.nom &&
        !ferme.nom.toLowerCase().includes(filtre)
      ) return;

      const btn = document.createElement("button");
      btn.textContent = ferme.nom;
      btn.dataset.index = index;

      if (selection.includes(index)) {
        btn.style.background = "#34c759";
        btn.style.color = "#fff";
      } else {
        btn.style.background = "#ffffff";
        btn.style.color = "#000";
      }

      btn.onclick = e => {
        const i = Number(e.currentTarget.dataset.index);

        if (selection.includes(i)) {
          selection = selection.filter(x => x !== i);
        } else {
          selection.push(i);
        }

        afficherListe(recherche.value.toLowerCase());
      };

      zone.appendChild(btn);
    });
  }

  /* =====================
     CRÉER TOURNÉE ✅
     ===================== */
  window.creerTournee = () => {
    if (selection.length === 0) {
      alert("Sélectionne au moins une ferme");
      return;
    }

    const nom = prompt("Nom de la tournée ?");
    if (!nom) return;

    const tournees = JSON.parse(localStorage.getItem("tournees") || []);
    tournees.push({
      id: Date.now(),
      nom,
      date: new Date().toISOString().slice(0, 10),
      fermes: selection.map(i => fermes[i])
    });

    localStorage.setItem("tournees", JSON.stringify(tournees));
    selection = [];
    afficherAujourdHui();
  };

  /* =====================
     📅 AUJOURD’HUI
     ===================== */
  window.afficherAujourdHui = () => {
    const today = new Date().toISOString().slice(0, 10);
    const tournees = JSON.parse(localStorage.getItem("tournees") || [])
      .filter(t => t.date === today);

    zone.innerHTML = `<h2>📋 Tournées du jour — ${today}</h2>`;

    if (tournees.length === 0) {
      zone.innerHTML += "<p>Aucune tournée aujourd’hui</p>";
      return;
    }

    tournees.forEach(t => {
      const btn = document.createElement("button");
      btn.textContent = `🚚 ${t.nom}`;
      btn.onclick = () => ouvrirTournee(t);
      zone.appendChild(btn);
    });
  };

  /* =====================
     GPS ✅ (fonctionnel)
     ===================== */
  function lancerGPS(tournee) {
    const arrets = tournee.fermes
      .map(f => formatAdresseGPS(f))
      .filter(a => a.length > 0);

    if (arrets.length === 0) {
      alert("❌ Aucune adresse GPS valide");
      return;
    }

    const url =
      "https://www.google.com/maps/dir/?api=1" +
      "&origin=" + encodeURIComponent(ADRESSE_DEPOT) +
      "&destination=" + encodeURIComponent(ADRESSE_DEPOT) +
      "&waypoints=" +
      encodeURIComponent("optimize:true|" + arrets.join("|"));

    window.open(url, "_blank");
  }

  /* =====================
     OUVRIR TOURNÉE
     ===================== */
  function ouvrirTournee(tournee) {
    zone.innerHTML = `<h2>🚚 Tournée : ${tournee.nom}</h2>`;

    tournee.fermes.forEach(f => {
      const btn = document.createElement("button");
      btn.textContent = f.nom;
      zone.appendChild(btn);
    });

    const gps = document.createElement("button");
    gps.textContent = "🧭 Ouvrir dans Google Maps";
    gps.onclick = () => lancerGPS(tournee);
    zone.appendChild(gps);

    const retour = document.createElement("button");
    retour.textContent = "↩ Retour";
    retour.onclick = afficherAujourdHui;
    zone.appendChild(retour);
  }

  /* =====================
     RECHERCHE
     ===================== */
  recherche.addEventListener("input", e => {
    afficherListe(e.target.value.toLowerCase());
  });
});
