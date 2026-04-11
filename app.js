console.log("✅ app.js – TEST SANITÉ BASE");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  let fermes = [];
  let selection = [];

  zone.innerHTML = "<p>Chargement des fermes…</p>";

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

  function afficherListe(filtre = "") {
    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";

    fermes.forEach((ferme, index) => {
      const texte = Object.values(ferme)
        .filter(v => typeof v === "string" && v.trim())
        .join(" – ");

      if (filtre && !texte.toLowerCase().includes(filtre)) return;

      const btn = document.createElement("button");
      btn.textContent = texte;

      btn.style.background = selection.includes(index)
        ? "#34c759"
        : "#ffffff";

      btn.onclick = () => {
        selection.includes(index)
          ? selection = selection.filter(i => i !== index)
          : selection.push(index);

        afficherListe(recherche.value.toLowerCase());
      };

      zone.appendChild(btn);
    });
  }

  recherche.addEventListener("input", e => {
    afficherListe(e.target.value.toLowerCase());
  });
});
