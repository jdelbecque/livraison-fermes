console.log("✅ app.js – VERSION STABLE MINIMALE (CRÉER TOURNÉE OK)");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  let fermes = [];
  let selection = [];

  /* ========= CHARGEMENT DES FERMES ========= */

  fetch("clients_livraison.json")
    .then(res => res.json())
    .then(data => {
      fermes = Array.isArray(data) ? data : [];
      afficherFermes();
    })
    .catch(err => {
      console.error(err);
      zone.innerHTML = "<p>❌ Impossible de charger les fermes</p>";
    });

  /* ========= AFFICHAGE DES FERMES ========= */

  function afficherFermes(filtre = "") {
    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";
    selection = [];

    fermes.forEach((f, index) => {
      if (filtre && !f.nom.toLowerCase().includes(filtre)) return;

      const btn = document.createElement("button");
      btn.textContent = f.nom;
      btn.style.background = "#fff";

      btn.onclick = () => {
        if (selection.includes(index)) {
          selection = selection.filter(i => i !== index);
          btn.style.background = "#fff";
        } else {
          selection.push(index);
          btn.style.background = "#34c759";
        }
      };

      zone.appendChild(btn);
    });
  }

  /* ========= CRÉER TOURNÉE ========= */

  window.creerTournee = () => {
    if (selection.length === 0) {
      alert("Sélectionne au moins une ferme");
      return;
    }

    const nom = prompt("Nom de la tournée");
    if (!nom) return;

    const tournees = JSON.parse(localStorage.getItem("tournees") || "[]");

    tournees.push({
      id: Date.now(),
      nom,
      date: new Date().toISOString().slice(0, 10),
      fermes: selection.map(i => fermes[i])
    });

    localStorage.setItem("tournees", JSON.stringify(tournees));

    alert("✅ Tournée créée");
    selection = [];
    afficherFermes();
  };

  /* ========= RECHERCHE ========= */

  recherche.addEventListener("input", e => {
    afficherFermes(e.target.value.toLowerCase());
  });
});
