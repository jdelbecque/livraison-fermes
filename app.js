console.log("✅ app.js – VERSION STABLE CORRIGÉE (FERMES + CONTACT OK)");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  const PIN_ADMIN = "1";
  const DEPOT_GPS = "46.7160,-71.3453";

  const contacts = [
    { nom: "Jérôme Delbecque", tel: "4189513565" },
    { nom: "Aurélie Mousnier", tel: "4185762110" },
    { nom: "Raphaël Bonneau", tel: "4186548068" },
    { nom: "Martin Bonneau", tel: "4185767253" },
    { nom: "Entrepôt Houppier", tel: "4189297886" }
  ];

  let fermes = [];
  let selection = [];
  let tourneeEnEdition = null;

  /* ========= UTILITAIRES ========= */

  function dateISO(d = new Date()) {
    return d.toISOString().slice(0, 10);
  }

  function heureLocale() {
    return new Date().toLocaleTimeString("fr-CA", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function chargerTournees() {
    return JSON.parse(localStorage.getItem("tournees") || "[]");
  }

  function sauverTournees(liste) {
    localStorage.setItem("tournees", JSON.stringify(liste));
  }

  function demanderPIN() {
    return prompt("🔒 Code PIN admin") === PIN_ADMIN;
  }

  function formatAdresseGps(f) {
    if (f.latitude && f.longitude) return `${f.latitude},${f.longitude}`;
    return encodeURIComponent(`${f.rue}, ${f.ville}, QC, Canada`);
  }

  /* ========= BOUTONS ========= */

  function boutonAccueil() {
    const b = document.createElement("button");
    b.textContent = "🏠 Accueil";
    b.onclick = afficherAccueil;
    return b;
  }

  function boutonContact() {
    const b = document.createElement("button");
    b.textContent = "📞 Contact";
    b.onclick = afficherContacts;
    return b;
  }

  function boutonToutesTournees() {
    const b = document.createElement("button");
    b.textContent = "📋 Toutes les tournées";
    b.onclick = afficherToutesLesTournees;
    return b;
  }

  /* ========= CONTACTS ========= */

  function afficherContacts() {
    zone.innerHTML = "<h2>📞 Contacts bureau</h2>";

    contacts.forEach(c => {
      const div = document.createElement("div");
      div.style.marginBottom = "12px";

      div.innerHTML = `<strong>${c.nom}</strong><br>📱 ${c.tel}`;
      const a = document.createElement("a");
      a.href = `tel:${c.tel}`;
      a.textContent = "📞 Appeler";

      div.appendChild(document.createElement("br"));
      div.appendChild(a);
      zone.appendChild(div);
    });

    zone.appendChild(boutonAccueil());
  }

  /* ========= ACCUEIL ========= */

  function afficherAccueil() {
    selection = [];
    tourneeEnEdition = null;
    afficherFermes(recherche.value.toLowerCase());
  }
  window.afficherAccueil = afficherAccueil;

  /* ========= LISTE DES FERMES ========= */

  function afficherFermes(filtre = "") {
    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";

    // ✅ CONTACT juste sous "Créer la tournée"
    zone.appendChild(boutonContact());

    fermes.forEach((f, i) => {
      if (filtre && !f.nom.toLowerCase().includes(filtre)) return;

      const b = document.createElement("button");
      b.textContent = f.nom;
      b.style.background = selection.includes(i) ? "#34c759" : "#fff";

      b.onclick = () => {
        selection.includes(i)
          ? selection = selection.filter(x => x !== i)
          : selection.push(i);
        afficherFermes(recherche.value.toLowerCase());
      };

      zone.appendChild(b);
    });

    zone.appendChild(boutonToutesTournees());
  }

  /* ========= TOUTES LES TOURNÉES ========= */

  function afficherToutesLesTournees() {
    zone.innerHTML = "<h2>🚚 Toutes les tournées</h2>";

    chargerTournees().forEach(t => {
      const b = document.createElement("button");
      b.textContent = `${t.nom} — ${t.date}`;
      b.onclick = () => ouvrirTournee(t);
      zone.appendChild(b);
    });

    zone.appendChild(boutonAccueil());
  }

  /* ========= OUVRIR TOURNÉE ========= */

  function ouvrirTournee(t) {
    zone.innerHTML = `<h2>🚚 ${t.nom}</h2>`;

    const ol = document.createElement("ol");
    t.fermes.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f.nom;
      ol.appendChild(li);
    });
    zone.appendChild(ol);

    const gps = document.createElement("button");
    gps.textContent = "🧭 Lancer le GPS";
    gps.onclick = () => {
      const points = [DEPOT_GPS, ...t.fermes.map(formatAdresseGps), DEPOT_GPS];
      window.open("https://www.google.com/maps/dir/" + points.join("/"), "_blank");
    };
    zone.appendChild(gps);

    const modif = document.createElement("button");
    modif.textContent = "✏️ Modifier";
    modif.onclick = () => {
      selection = t.fermes.map(f => fermes.findIndex(x => x.nom === f.nom));
      tourneeEnEdition = t;
      afficherAccueil();
    };
    zone.appendChild(modif);

    const suppr = document.createElement("button");
    suppr.textContent = "🗑️ Supprimer";
    suppr.onclick = () => {
      if (!demanderPIN()) return;
      sauverTournees(chargerTournees().filter(x => x.id !== t.id));
      afficherToutesLesTournees();
    };
    zone.appendChild(suppr);

    zone.appendChild(boutonAccueil());
  }

  /* ========= CRÉER TOURNÉE ========= */

  window.creerTournee = () => {
    if (!selection.length) {
      alert("Sélectionne au moins une ferme");
      return;
    }

    const nom = prompt("Nom de la tournée");
    if (!nom) return;

    const tournees = chargerTournees();
    tournees.push({
      id: Date.now(),
      nom,
      date: dateISO(),
      heureDebut: heureLocale(),
      fermes: selection.map(i => fermes[i])
    });

    sauverTournees(tournees);
    selection = [];
    afficherToutesLesTournees();
  };

  /* ========= CHARGEMENT DES FERMES ========= */

  fetch("clients_livraison.json")
    .then(r => r.json())
    .then(data => {
      fermes = Array.isArray(data) ? data : [];
      afficherAccueil();
    });

  /* ========= RECHERCHE ========= */

  recherche.addEventListener("input", e => {
    afficherFermes(e.target.value.toLowerCase());
  });
});
