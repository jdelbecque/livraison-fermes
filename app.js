console.log("✅ app.js – GPS TEST FINAL VALIDÉ");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  const ADRESSE_DEPOT = "840 Rue du Houppier, Saint-Nicolas, QC, Canada";

  let fermes = [];
  let selection = [];
  let tourneeEnEdition = null;

  /* =====================
     FORMAT ADRESSE GPS
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
    });

  /* =====================
     LISTE DES FERMES
     ===================== */
  function afficherListe(filtre = "") {
    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";

    fermes.forEach((ferme, index) => {
      if (filtre && !ferme.nom.toLowerCase().includes(filtre)) return;

      const btn = document.createElement("button");
      btn.textContent = ferme.nom;
      btn.style.background = selection.includes(index) ? "#34c759" : "#ffffff";

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
     CRÉER / MODIFIER
     ===================== */
  window.creerTournee = () => {
    if (selection.length === 0) {
      alert("Sélectionne au moins une ferme");
      return;
    }

    const nom = prompt("Nom de la tournée ?");
    if (!nom) return;

    const tournees = JSON.parse(localStorage.getItem("tournees") || []);
    tournees.push({
      id: Date.now(),
      nom,
      date: new Date().toISOString().slice(0, 10),
      fermes: selection.map(i => fermes[i])
    });

    localStorage.setItem("tournees", JSON.stringify(tournees));
    selection = [];
    afficherAujourdHui();
  };

  /* =====================
     AUJOURD’HUI
     ===================== */
  window.afficherAujourdHui = () => {
