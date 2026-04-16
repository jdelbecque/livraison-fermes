console.log("✅ app.js chargé");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  let fermes = [];

  fetch("clients_livraison.json")
    .then(res => res.json())
    .then(data => {
      console.log("Fermes chargées :", data);
      fermes = data;
      afficherListe();
    })
    .catch(err => {
      console.error(err);
      zone.innerHTML = "<p>Erreur chargement JSON</p>";
    });

  function afficherListe(filtre = "") {
    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";

    fermes.forEach(ferme => {
      if (
        filtre &&
        ferme.nom &&
        !ferme.nom.toLowerCase().includes(filtre)
      ) return;

      const btn = document.createElement("button");
      btn.textContent = ferme.nom || "Ferme sans nom";
      zone.appendChild(btn);
    });
  }

  recherche.addEventListener("input", e => {
    afficherListe(e.target.value.toLowerCase());
  });
});
