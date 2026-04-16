const fs = require("fs");

// 🔹 Charger le fichier actuel
const data = JSON.parse(
  fs.readFileSync("clients_livraison.json", "utf8")
);

// 🔹 Fonction nettoyage adresse
function nettoyerAdresse(adresse, nom) {
  let resultat = adresse;

  // enlever le nom de la ferme s’il est présent
  if (nom) {
    const regex = new RegExp(nom, "i");
    resultat = resultat.replace(regex, "");
  }

  // nettoyage espaces
  resultat = resultat.replace(/\s+/g, " ").trim();

  return resultat;
}

// 🔹 Conversion
const converti = data.map(f => {
  const adressePropre = nettoyerAdresse(f.adresse, f.nom);

  return {
    nom: f.nom,
    adresse: {
      rue: adressePropre,
      ville: f.ville || "Lévis",
      province: "QC",
      pays: "Canada"
    }
  };
});

// 🔹 Sauvegarde
fs.writeFileSync(
  "clients_livraison_converti.json",
  JSON.stringify(converti, null, 2),
  "utf8"
);

console.log("✅ Conversion terminée → clients_livraison_converti.json");
