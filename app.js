console.log("✅ app.js final exécuté");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const champRecherche = document.getElementById("recherche");

  let fermes = [];
  let selection = [];
  let tournee = [];

  function sauvegarderEtat() {
    localStorage.setItem("livraison_state", JSON.stringify({
      selection,
      tournee
    }));
  }

  function restaurerEtat() {
    const brut = localStorage.getItem("livraison_state");
    if (!brut) return;

    const state = JSON.parse(brut);
    selection = state.selection || [];
    tournee = state.tournee || [];

    if (tournee.length > 0) {
      afficherTournee();
    } else {
      afficherListe();
    }
  }

  zone.innerHTML = "Chargement…";

  fetch("clients_livraison.json")
    .then(res => res.json())
    .then(data => {
      fermes = data;
      restaurerEtat();
      if (tournee.length === 0) afficherListe();
    });

  function afficherListe(filtre = "") {
    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";

    fermes.forEach((ferme, index) => {
      const texte = `${ferme.nom} ${ferme.ville}`.toLowerCase();
      if (filtre && !texte.includes(filtre)) return;

      const btn = document.createElement("button");
      btn.className = "ferme";
      btn.textContent = `${ferme.nom} – ${ferme.ville}`;

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
    sauvegarderEtat();
  }

  window.nouvelleTournee = function () {
    selection = [];
    tournee = [];
    afficherListe();
    sauvegarderEtat();
  };

  window.creerTournee = function () {
    if (selection.length === 0) {
      alert("Sélectionne au moins une ferme !");
      return;
    }

    tournee = selection.map(i => ({
      ...fermes[i],
      livree: false
    }));

    afficherTournee();
    sauvegarderEtat();
  };

  function afficherTournee() {
    zone.innerHTML = "<h2>🚚 Tournée en cours</h2>";

    tournee.forEach((ferme, i) => {
      const btn = document.createElement("button");
      btn.className = ferme.livree ? "ferme livree" : "ferme";
      btn.textContent = ferme.livree
        ? `✅ ${ferme.nom}`
        : `➡️ ${ferme.nom}`;

      btn.onclick = () => livrerFerme(i);
      zone.appendChild(btn);
    });
  }

  function livrerFerme(i) {
    if (!confirm("Confirmer la livraison ?")) return;
    tournee[i].livree = true;
    afficherTournee();
    sauvegarderEtat();
  }

  if (champRecherche) {
    champRecherche.addEventListener("input", e => {
      afficherListe(e.target.value.toLowerCase());
    });
  }
});