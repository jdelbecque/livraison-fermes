console.log("✅ app.js – VERSION STABLE AVEC AFFICHAGE TOURNÉES");

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
    .catch(() => {
      zone.innerHTML = "<p>❌ Impossible de charger les fermes</p>";
    });

  /* ========= AFFICHER FERMES ========= */

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

    const tournee = {
      id: Date.now(),
      nom,
      date: new Date().toISOString().slice(0, 10),
      fermes: selection.map(i => fermes[i])
    };

    tournees.push(tournee);
    localStorage.setItem("tournees", JSON.stringify(tournees));

    selection = [];
    afficherTournees(); // ✅ AFFICHAGE IMMÉDIAT
  };

  /* ========= AFFICHER TOURNÉES ========= */

  function afficherTournees() {
    const tournees = JSON.parse(localStorage.getItem("tournees") || "[]");

    zone.innerHTML = "<h2>🚚 Tournées enregistrées</h2>";

    if (tournees.length === 0) {
      zone.innerHTML += "<p>Aucune tournée</p>";
      return;
    }

    tournees.forEach(t => {
      const div = document.createElement("div");
      div.style.border = "1px solid #ccc";
      div.style.padding = "10px";
      div.style.marginBottom = "10px";

      const titre = document.createElement("strong");
      titre.textContent = `${t.nom} (${t.date})`;
      div.appendChild(titre);

      const ul = document.createElement("ul");
      t.fermes.forEach(f => {
        const li = document.createElement("li");
        li.textContent = f.nom;
        ul.appendChild(li);
      });
      div.appendChild(ul);

      zone.appendChild(div);
    });

    const retour = document.createElement("button");
    retour.textContent = "↩ Retour aux fermes";
    retour.onclick = afficherFermes;
    zone.appendChild(retour);
  }

  /* ========= RECHERCHE ========= */

  recherche.addEventListener("input", e => {
    afficherFermes(e.target.value.toLowerCase());
  });
});
