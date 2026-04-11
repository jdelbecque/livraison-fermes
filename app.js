const ADRESSE_DEPOT = "840 rue du houppier Levis G7A3X4, QC";
console.log("✅ app.js – VERSION FINALE STABLE");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  let fermes = [];
  let selection = [];
  let tournee = [];

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

  fetch("clients_livraison.json")
    .then(r => r.json())
    .then(data => {
      fermes = Array.isArray(data) ? data : [];
      afficherListe();
    });

  function afficherListe(filtre = "") {
    if (estModeChauffeur()) {
      afficherAujourdHui();
      return;
    }

    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";
    fermes.forEach((ferme, i) => {
      const texte = Object.values(ferme)
        .filter(v => typeof v === "string")
        .join(" – ");

      if (filtre && !texte.toLowerCase().includes(filtre)) return;

      const b = document.createElement("button");
      b.textContent = texte;
      b.onclick = () => {
        selection.includes(i)
          ? selection = selection.filter(x => x !== i)
          : selection.push(i);
        afficherListe(recherche.value.toLowerCase());
      };
      zone.appendChild(b);
    });
  }

  window.creerTournee = () => {
    if (estModeChauffeur()) return alert("Mode chauffeur");
    tournee = selection.map(i => fermes[i]);
    afficherTournee();
  };

  function afficherTournee() {
    zone.innerHTML = "<h2>🚚 Tournée</h2>";

    tournee.forEach(f => {
      const txt = Object.values(f).filter(v => typeof v === "string").join(" – ");
      const b = document.createElement("button");
      b.textContent = txt;
      b.onclick = () => gpsSimple(txt);
      zone.appendChild(b);
    });

    const bGps = document.createElement("button");
    bGps.textContent = "🧭 Démarrer la tournée (retour dépôt)";
    bGps.onclick = gpsTourneeComplete;
    zone.appendChild(bGps);

    const retour = document.createElement("button");
    retour.textContent = "↩ Retour";
    retour.onclick = afficherListe;
    zone.appendChild(retour);
  }

  function gpsSimple(adresse) {
    window.location.href =
      "https://www.google.com/maps/dir/?api=1&destination=" +
      encodeURIComponent(adresse);
  }

  function gpsTourneeComplete() {
    const adresses = tournee.map(f =>
      Object.values(f).filter(v => typeof v === "string").join(" ")
    );

    const url =
      "https://www.google.com/maps/dir/?api=1" +
      "&origin=" + encodeURIComponent(ADRESSE_DEPOT) +
      "&destination=" + encodeURIComponent(ADRESSE_DEPOT) +
      "&waypoints=" + encodeURIComponent("optimize:true|" + adresses.join("|"));

    window.location.href = url;
  }

  function afficherAujourdHui() {
    zone.innerHTML = "<h2>📅 Aujourd’hui</h2>";
    const b = document.createElement("button");
    b.textContent = "🚚 Démarrer tournée";
    b.onclick = afficherTournee;
    zone.appendChild(b);
  }

  recherche.addEventListener("input", e => {
    afficherListe(e.target.value.toLowerCase());
  });
});
