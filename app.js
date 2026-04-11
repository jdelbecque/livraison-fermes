console.log("🧪 TEST SELECTION ACTIVE");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  zone.innerHTML = "<p>Chargement…</p>";

  let fermes = [];
  let selection = [];

  fetch("clients_livraison.json")
    .then(r => r.json())
    .then(data => {
      fermes = data;
      afficher();
    });

  function afficher(filtre = "") {
    zone.innerHTML = "<h2>TEST : clic = vert</h2>";

    fermes.forEach((ferme, index) => {
      const texte = Object.values(ferme)
        .filter(v => typeof v === "string")
        .join(" – ");

      if (filtre && !texte.toLowerCase().includes(filtre)) return;

      const btn = document.createElement("button");
      btn.textContent = texte;

      // STYLE FORCÉ POUR ÉLIMINER LE CSS
      btn.style.backgroundColor = selection.includes(index)
        ? "#34c759"
        : "#ffffff";
      btn.style.color = selection.includes(index)
        ? "white"
        : "black";
      btn.style.border = "1px solid #000";

      btn.addEventListener("click", () => {
        console.log("clic ferme", index);

        if (selection.includes(index)) {
          selection = selection.filter(i => i !== index);
        } else {
          selection.push(index);
        }
        afficher(recherche.value.toLowerCase());
      });

      zone.appendChild(btn);
    });
  }

  recherche.addEventListener("input", e => {
    afficher(e.target.value.toLowerCase());
  });
});
