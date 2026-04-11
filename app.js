const ADRESSE_DEPOT = "840 rue du houppier, Lévis, QC";
console.log("✅ app.js – VERSION STABLE – SÉLECTION OK");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  let fermes = [];
  let selection = [];
  let tournee = [];

  /* =====================
     MODE CHAUFFEUR
     ===================== */
  function estModeChauffeur() {
    return localStorage.getItem("modeChauffeur") === "true";
  }

  window.activerModeChauffeur = () => {
    localStorage.setItem("modeChauffeur", "true");
    afficherAujourdHui();
  };

  window.desactiverModeChauffeur = () => {
    localStorage.removeItem("modeChauffeur");
    afficherListe();
  };

  /* =====================
     CHARGEMENT DES FERMES
     ===================== */
  zone.innerHTML = "<p>Chargement des fermes…</p>";

  fetch("clients_livraison.json")
    .then(r => r.json())
    .then(data => {
      fermes = Array.isArray(data) ? data : [];
      afficherListe();
    })
    .catch(() => {
      zone.innerHTML = "<p>❌ Erreur chargement fermes</p>";
    });

  /* =====================
     LISTE DES FERMES
     ===================== */
  function afficherListe(filtre = "") {
    if (estModeChauffeur()) {
      afficherAujourdHui();
      return;
    }

    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";

    fermes.forEach((ferme, index) => {
      const texte = Object.values(ferme)
        .filter(v => typeof v === "string" && v.trim() !== "")
        .join(" – ");

      if (filtre && !texte.toLowerCase().includes(filtre)) return;

      const btn = document.createElement("button");
      btn.className = "ferme";
      btn.textContent = texte;

      // ✅ RETOUR VISUEL
      if (selection.includes(index)) {
        btn.classList.add("selected");
      }

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

  /* =====================
     CRÉER TOURNÉE
     ===================== */
  window.creerTournee = () => {
    if (estModeChauffeur()) {
      alert("Mode chauffeur actif");
      return;
    }

    if (selection.length === 0) {
      alert("Sélectionne au moins une ferme");
      return;
    }

    tournee = selection.map(i => fermes[i]);
    afficherTournee();
  };

  /* =====================
     TOURNÉE
     ===================== */
  function afficherTournee() {
    zone.innerHTML = "<h2>🚚 Tournée</h2>";

    tournee.forEach(ferme => {
      const texte = Object.values(ferme)
        .filter(v => typeof v === "string")
        .join(" – ");

      const btn = document.createElement("button");
      btn.textContent = texte;
      btn.onclick = () => ouvrirGPS(texte);

      zone.appendChild(btn);
    });

    const btnGPS = document.createElement("button");
    btnGPS.textContent = "🧭 Démarrer la tournée (retour dépôt)";
    btnGPS.style.background = "#007aff";
    btnGPS.style.color = "white";
    btnGPS.onclick = ouvrirGPSTourneeComplete;
    zone.appendChild(btnGPS);

    const retour = document.createElement("button");
    retour.textContent = "↩ Retour à la liste";
    retour.onclick = afficherListe;
    zone.appendChild(retour);
  }

  /* =====================
     GPS
     ===================== */
  function ouvrirGPS(adresse) {
    window.location.href =
      "https://www.google.com/maps/dir/?api=1&destination=" +
      encodeURIComponent(adresse);
  }

  function ouvrirGPSTourneeComplete() {
    if (tournee.length === 0) return;

    const adresses = tournee.map(f =>
      Object.values(f)
        .filter(v => typeof v === "string")
        .join(" ")
    );

    const url =
      "https://www.google.com/maps/dir/?api=1" +
      "&origin=" + encodeURIComponent(ADRESSE_DEPOT) +
      "&destination=" + encodeURIComponent(ADRESSE_DEPOT) +
      "&waypoints=" + encodeURIComponent(
        "optimize:true|" + adresses.join("|")
      );

    window.location.href = url;
  }

  /* =====================
     AUJOURD’HUI (MODE CHAUFFEUR)
     ===================== */
  function afficherAujourdHui() {
    zone.innerHTML = "<h2>📅 Aujourd’hui</h2>";
    const btn = document.createElement("button");
    btn.textContent = "🚚 Démarrer tournée";
    btn.onclick = afficherTournee;
    zone.appendChild(btn);
  }

  /* =====================
     RECHERCHE
     ===================== */
  recherche.addEventListener("input", e => {
    afficherListe(e.target.value.toLowerCase());
  });
});
