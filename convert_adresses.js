const fs = require("fs");

// Charger le fichier existant
const data = JSON.parse(
  fs.readFileSync("clients_livraison.json", "utf8")
);

// Fonction de normalisation du texte
function normaliserTexte(texte) {
  if (!texte) return "";
  return texte
    .toLowerCase()
    .replace(/\b(sa(nt|-)?)/g, match => match.charAt(0).toUpperCase() + match.slice(1))
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

// Conversion
const converti = data.map(f => ({
  id: f.id,
  nom: f.nom,
  adresse: {
    rue: f.rue.trim(),
    ville: normaliserTexte(f.ville),
    province: "QC",
    pays: "Canada"
  },
  gps: f.latitude && f.longitude
    ? { lat: f.latitude, lng: f.longitude }
    : null,
  notes: f.notes || ""
}));

// Sauvegarde du nouveau fichier
fs.writeFileSync(
  "clients_livraison_converti.json",
  JSON.stringify(converti, null, 2),
  "utf8"
);

console.log("✅ Conversion terminée : clients_livraison_converti.json");
