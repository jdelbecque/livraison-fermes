console.log("✅ app.js – VERSION FINALE GPS STABLE");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  const ADRESSE_DEPOT = "840 Rue du Houppier, Saint-Nicolas, QC, Canada";

  let fermes = [];
  let selection = [];
  let tourneeEnEdition = null;

  /* =====================
     FORMAT ADRESSE GPS ✅
     ===================== */
  function formatAdresseGPS(adresse) {
    return `${adresse.rue}, ${adresse.ville}, ${adresse.province}, ${adresse.pays}`;
  }

  /* =====================
     CHARGEMENT DES FERMES
     ===================== */
  fetch("clients_livraison.json")
    .then(res => res.json())
    .then(data => {
      fermes = Array.isArray(data) ? data : [];
      afficherListe();
    })
    .catch(() => {
      zone.innerHTML = "<p>❌ Erreur chargement fermes</p>";
    });

  /* =====================
     LISTE DES FERMES
     ===================== */
  function afficherListe(filtre = "") {
    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";

    fermes.forEach((ferme, index) => {
      const texte = ferme.nom;

      if (filtre && !texte.toLowerCase().includes(filtre)) return;

      const btn = document.createElement("button");
      btn.textContent = texte;
      btn.style.background = selection.includes(index) ? "#34c759" : "#fff";

      btn.onclick = () => {
        selection.includes(index)
          ? selection = selection.filter(i => i !== index)
          : selection.push(index);
        afficherListe(recherche.value.toLowerCase());
      };

      zone.appendChild(btn);
    });
  }

  /* =====================
     CRÉER / MODIFIER TOURNÉE
     ===================== */
  window.creerTournee = () => {
    if (selection.length === 0) {
      alert("Sélectionne au moins une ferme");
      return;
    }

    const nom = prompt(
      "Nom de la tournée ?",
      tourneeEnEdition ? tourneeEnEdition.nom : ""
    );
    if (!nom) return;

    const date = prompt(
      "Date (YYYY-MM-DD) ?",
      tourneeEnEdition
        ? tourneeEnEdition.date
        : new Date().toISOString().slice(0, 10)
    );
    if (!date) return;

    let tournees = JSON.parse(localStorage.getItem("tournees") || []);

    if (tourneeEnEdition) {
      tournees = tournees.map(t =>
        t.id === tourneeEnEdition.id
