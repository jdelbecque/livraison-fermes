document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");

  // Marqueur visuel immédiat
  zone.innerHTML = "<h2>✅ SCRIPT ACTIF</h2>";

  fetch("clients_livraison.json")
    .then(r => r.json())
    .then(data => {
      // Affichage forcé et visible
      const info = document.createElement("div");
      info.style.border = "3px solid red";
      info.style.padding = "10px";
      info.style.margin = "10px 0";
      info.textContent = `JSON chargé : ${Array.isArray(data)} – éléments : ${data.length}`;
      zone.appendChild(info);

      // Affichage brutal des 10 premières entrées
      data.slice(0, 10).forEach((ferme, i) => {
        const div = document.createElement("div");
        div.style.border = "1px solid black";
        div.style.margin = "4px 0";
        div.style.padding = "4px";
        div.textContent = `${i + 1}. ${JSON.stringify(ferme)}`;
        zone.appendChild(div);
      });
    })
    .catch(err => {
      zone.innerHTML += "<p style='color:red'>ERREUR FETCH</p>";
      console.error(err);
    });
});
