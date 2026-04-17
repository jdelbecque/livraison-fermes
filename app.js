console.log("✅ app.js – VERSION FINALE STABLE + BADGE DÉPART");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  // ✅ LABEL HUMAIN (interface)
  const DEPOT_LABEL = "🏢 Entrepôt MAIA Services Vétérinaires";

  // ✅ GPS RÉEL (Google Maps)
  const DEPOT_GPS = "46.7160,-71.3453";

  let fermes = [];
  let selection = [];

  /* ========= UTILITAIRES ========= */

  function formatAdresseGps(ferme) {
    if (ferme.latitude && ferme.longitude) {
      return `${ferme.latitude},${ferme.longitude}`;
    }
    return `${ferme.rue}, ${ferme.ville}, QC, Canada`;
  }

  /* ========= CHARGEMENT FERMES ========= */

  fetch("clients_livraison.json")
    .then(res => res.json())
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

    fermes.forEach((ferme, index) => {
      if (filtre && !ferme.nom.toLowerCase().includes(filtre)) return;

      const btn = document.createElement("button");
      btn.textContent = ferme.nom;
      btn.style.background = selection.includes(index) ? "#34c759" : "#fff";

      btn.onclick = () => {
        selection.includes(index)
          ? selection = selection.filter(i => i !== index)
          : selection.push(index);
        afficherListe(recherche.value.toLowerCase());
      };

      zone.appendChild(btn);
    });
  }

  /* ========= AUJOURD’HUI ========= */

  window.afficherAujourdHui = () => {
    const today = new Date().toISOString().slice(0, 10);
    const tournees = JSON.parse(localStorage.getItem("tournees") || [])
      .filter(t => t.date === today);

    zone.innerHTML = "<h2>📅 Aujourd’hui</h2>";

    tournees.forEach(t => {
      const b = document.createElement("button");
      b.textContent = `🚚 ${t.nom}`;
      b.onclick = () => ouvrirTournee(t);
      zone.appendChild(b);
    });
  };

  /* ========= OUVRIR TOURNÉE ========= */

  function ouvrirTournee(tournee) {
    zone.innerHTML = `<h2>🚚 ${tournee.nom}</h2>`;

    // ✅ LABEL ENTREPÔT
    const depot = document.createElement("div");
    depot.textContent = DEPOT_LABEL;
    depot.style.fontWeight = "bold";
    depot.style.marginTop = "10px";
    zone.appendChild(depot);

    // ✅ BADGE DÉPART
    const badge = document.createElement("span");
    badge.textContent = "DÉPART";
    badge.style.display = "inline-block";
    badge.style.background = "#007AFF";
    badge.style.color = "#fff";
    badge.style.fontSize = "12px";
    badge.style.fontWeight = "700";
    badge.style.padding = "4px 10px";
    badge.style.borderRadius = "12px";
    badge.style.marginTop = "4px";
    badge.style.marginBottom = "12px";
    zone.appendChild(badge);

    zone.appendChild(document.createElement("hr"));

    // ✅ LISTE DES FERMES
    tournee.fermes.forEach(f => {
      const b = document.createElement("button");
      b.textContent = f.nom;
      zone.appendChild(b);
    });

    const gps = document.createElement("button");
    gps.textContent = "🧭 Lancer GPS (retour entrepôt)";
    gps.onclick = () => lancerGPS(tournee);
    zone.appendChild(gps);

    const retour = document.createElement("button");
    retour.textContent = "↩ Retour";
    retour.onclick = afficherAujourdHui;
    zone.appendChild(retour);
  }

  /* ========= GPS ========= */

  function lancerGPS(tournee) {
    const arrets = tournee.fermes.map(formatAdresseGps).filter(Boolean);

    const points = [
      DEPOT_GPS,
      ...arrets,
      DEPOT_GPS
    ];

    const url =
      "https://www.google.com/maps/dir/" +
      points.map(encodeURIComponent).join("/");

    window.open(url, "_blank");
  }

  recherche.addEventListener("input", e =>
    afficherListe(e.target.value.toLowerCase())
  );
});
``
