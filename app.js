console.log("✅ app.js FINAL – version robuste");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const champRecherche = document.getElementById("recherche");

  let tournee = [];
  let fermes = [];
  let selection = [];

  /* ===== CHARGEMENT JSON ===== */
  fetch("clients_livraison.json")
    .then(res => res.json())
    .then(data => {
      fermes = Array.isArray(data) ? data : [];
      afficherListe();
    })
    .catch(err => {
      console.error(err);
      zone.innerHTML = "<p>Erreur chargement données</p>";
    });

  /* ===== AFFICHAGE LISTE ===== */
  function afficherListe(filtre = "") {
    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";

    if (fermes.length === 0) {
      zone.innerHTML += "<p>Aucune ferme trouvée</p>";
      return;
    }

    fermes.forEach((ferme, index) => {

      // ✅ Construire un texte lisible à partir des champs texte existants
      const texte = Object.values(ferme)
        .filter(v => typeof v === "string" && v.trim() !== "")
        .join(" – ");

      if (!texte) return;
      if (filtre && !texte.toLowerCase().includes(filtre)) return;

      const btn = document.createElement("button");
      btn.className = "ferme";
      btn.textContent = texte;

      if (selection.includes(index)) {
        btn.classList.add("selected");
      }

      btn.onclick = () => toggleSelection(index);
      zone.appendChild(btn);
    });
  }

  function toggleSelection(index) {
    if (selection.includes(index)) {
      selection = selection.filter(i => i !== index);
    } else {
      selection.push(index);
    }

    afficherListe(champRecherche ? champRecherche.value.toLowerCase() : "");
  }

  /* ===== BOUTONS ===== */
  window.nouvelleTournee = function () {
    selection = [];
    afficherListe();
  };

  window.creerTournee = function () {
  if (selection.length === 0) {
    alert("Sélectionne au moins une ferme");
    return;
  }

  // Construire la tournée à partir des fermes sélectionnées
  tournee = selection.map(i => ({
    data: fermes[i],
    livree: false
  }));

  function afficherTournee() {
  zone.innerHTML = "<h2>🚚 Tournée en cours</h2>";

  tournee.forEach((item, index) => {
    const ferme = item.data;

    const texte = Object.values(ferme)
      .filter(v => typeof v === "string")
      .join(" – ");

    const bloc = document.createElement("div");

    // Bouton info ferme
    const btnFerme = document.createElement("button");
    btnFerme.className = item.livree ? "ferme livree" : "ferme";
    btnFerme.textContent = item.livree ? `✅ ${texte}` : texte;

    // Bouton GPS
    const btnGPS = document.createElement("button");
    btnGPS.textContent = "🧭 GPS";
    btnGPS.style.background = "#007aff";
    btnGPS.style.color = "white";
    btnGPS.onclick = () => ouvrirGPS(texte);

    // Bouton livré
    const btnLivre = document.createElement("button");
    btnLivre.textContent = "✅ Livré";
    btnLivre.onclick = () => {
      if (confirm("Confirmer la livraison ?")) {
        tournee[index].livree = true;
        afficherTournee();
      }
    };

    bloc.appendChild(btnFerme);
    bloc.appendChild(btnGPS);
    bloc.appendChild(btnLivre);

    zone.appendChild(bloc);
  });

  // Bouton retour
  const retour = document.createElement("button");
  retour.textContent = "↩ Retour à la liste";
  retour.onclick = () => afficherListe();
  zone.appendChild(retour);
}


    zone.innerHTML = "<h2>🚚 Tournée</h2>";

    selection.forEach(i => {
      const ferme = fermes[i];
      const texte = Object.values(ferme)
        .filter(v => typeof v === "string")
        .join(" ");

      const btn = document.createElement("button");
      btn.className = "ferme";
      btn.textContent = "🧭 " + texte;

      btn.onclick = () => ouvrirGPS(texte);
      zone.appendChild(btn);
    });
  };

  /* ===== GPS ===== */
  function ouvrirGPS(adresseTexte) {
    const url =
      "https://www.google.com/maps/dir/?api=1&destination=" +
      encodeURIComponent(adresseTexte);

    window.location.href = url;
  }

  /* ===== RECHERCHE ===== */
  if (champRecherche) {
    champRecherche.addEventListener("input", e => {
      afficherListe(e.target.value.toLowerCase());
    });
  }
});
