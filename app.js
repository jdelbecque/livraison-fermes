console.log("✅ app.js – VERSION OR STABLE");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const champRecherche = document.getElementById("recherche");

  let fermes = [];
  let selection = [];
  let tournee = [];

  /* ========= CHARGEMENT DES DONNÉES ========= */
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

  /* ========= LISTE DES FERMES ========= */
  function afficherListe(filtre = "") {
    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";

    if (fermes.length === 0) {
      zone.innerHTML += "<p>Aucune ferme trouvée</p>";
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
  }

  function toggleSelection(index) {
    if (selection.includes(index)) {
      selection = selection.filter(i => i !== index);
    } else {
      selection.push(index);
    }
    afficherListe(champRecherche ? champRecherche.value.toLowerCase() : "");
  }

