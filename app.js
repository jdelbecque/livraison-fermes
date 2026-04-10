console.log("✅ app.js – VERSION FINALE AVEC COMPTEUR");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const champRecherche = document.getElementById("recherche");

  let fermes = [];
  let selection = [];
  let tournee = [];

  if (!zone) {
    document.body.innerHTML = "❌ DIV #liste INTROUVABLE";
    return;
  }

  /* =====================
     COMPTEUR
     ===================== */
  function mettreAJourCompteur() {
    const compteur = document.getElementById("compteur");
    if (compteur) {
      compteur.textContent = `✅ ${selection.length} ferme(s) sélectionnée(s)`;
    }
  }

  /* =====================
     CHARGEMENT DES FERMES
     ===================== */
  zone.innerHTML = "<p>Chargement des fermes…</p>";

  fetch("clients_livraison.json")
    .then(res => res.json())
    .then(data => {
      fermes = Array.isArray(data) ? data : [];
      afficherListe();
    })
    .catch(err => {
      console.error(err);
      zone.innerHTML = "<p>❌ Erreur chargement données</p>";
    });

  /* =====================
     LISTE DES FERMES
     ===================== */
  function afficherListe(filtre = "") {
    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";

    if (fermes.length === 0) {
      zone.innerHTML += "<p>Aucune ferme disponible</p>";
      mettreAJourCompteur();
      return;
    }

    fermes.forEach((ferme, index) => {
      const texte = Object.values(ferme)
        .filter(v => typeof v === "string" && v.trim() !== "")
        .join(" – ");

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

    mettreAJourCompteur();
  }

  function toggleSelection(index) {
    if (selection.includes(index)) {
      selection = selection.filter(i => i !== index);
    } else {
      selection.push(index);
    }

    afficherListe(champRecherche ? champRecherche.value.toLowerCase() : "");
  }

  /* =====================
     BOUTONS GLOBAUX
     ===================== */
  window.nouvelleTournee = function () {
    selection = [];
    tournee = [];
    afficherListe();
  };

  window.toutDeselectionner = function () {
    selection = [];
    afficherListe();
  };

  /* =====================
     CRÉER LA TOURNÉE
     ===================== */
  window.creerTournee = function () {
    if (selection.length === 0) {
      alert("Sélectionne au moins une ferme");
      return;
    }

    tournee = selection.map(i => ({
      ferme: fermes[i],
      livree: false
    }));

    afficherTournee();
  };

  /* =====================
     ÉCRAN TOURNÉE
     ===================== */
  function afficherTournee() {
    zone.innerHTML = "<h2>🚚 Tournée</h2>";

    tournee.forEach((item, index) => {
      const texte = Object.values(item.ferme)
        .filter(v => typeof v === "string" && v.trim() !== "")
        .join(" – ");

      const bloc = document.createElement("div");

      const btnFerme = document.createElement("button");
      btnFerme.className = item.livree ? "ferme livree" : "ferme";
      btnFerme.textContent = item.livree ? `✅ ${texte}` : texte;

      const btnGPS = document.createElement("button");
      btnGPS.textContent = "🧭 GPS";
      btnGPS.style.background = "#007aff";
      btnGPS.style.color = "white";
      btnGPS.onclick = () => ouvrirGPS(texte);

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

    const btnRetour = document.createElement("button");
    btnRetour.textContent = "↩ Retour à la liste";
    btnRetour.onclick = () => afficherListe();
    zone.appendChild(btnRetour);
  }

  /* =====================
     GPS
     ===================== */
  function ouvrirGPS(adresse) {
    const url =
      "https://www.google.com/maps/dir/?api=1&destination=" +
      encodeURIComponent(adresse);

    window.location.href = url;
  }

  /* =====================
     RECHERCHE
     ===================== */
  if (champRecherche) {
    champRecherche.addEventListener("input", e => {
      afficherListe(e.target.value.toLowerCase());
    });
  }
});
``
