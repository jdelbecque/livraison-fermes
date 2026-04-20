console.log("✅ app.js – VERSION FINALE STABLE (ACCUEIL + CONTACT + MODIFIER + SUPPRIMER)");

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

  function boutonToutesTournees() {
    const b = document.createElement("button");
    b.textContent = "📋 Toutes les tournées";
    b.onclick = afficherToutesLesTournees;
    return b;
  }

  function boutonContact() {
    const b = document.createElement("button");
    b.textContent = "📞 Contact";
    b.onclick = afficherContacts;
    return b;
  }

  /* ========= CONTACT ========= */

  function afficherContacts() {
    zone.innerHTML = "<h2>📞 Contacts bureau</h2>";

    contacts.forEach(c => {
      const bloc = document.createElement("div");
      bloc.style.marginBottom = "12px";

      bloc.innerHTML = `<strong>${c.nom}</strong><br/>📱 ${c.tel}`;
      const a = document.createElement("a");
      a.href = `tel:${c.tel}`;
      a.textContent = "📞 Appeler";
      a.style.display = "inline-block";
      a.style.marginTop = "4px";

      bloc.appendChild(document.createElement("br"));
      bloc.appendChild(a);
      zone.appendChild(bloc);
    });

    zone.appendChild(boutonAccueil());
  }

  /* ========= ACCUEIL ========= */

  function afficherAccueil() {
  selection = [];
  tourneeEnEdition = null;

  // Affiche la liste normale des fermes
  afficherFermes(recherche.value.toLowerCase());

  // ✅ Force CONTACT comme bouton visible sur la 1ère page
  const contactBtn = boutonContact();
  zone.insertBefore(contactBtn, zone.firstChild);
}

  /* ========= AUJOURD’HUI ========= */

  function afficherAujourdHui() {
    const today = dateISO();
    const tournees = chargerTournees().filter(t => t.date === today);

    zone.innerHTML = "<h2>📅 Aujourd’hui</h2>";

    if (!tournees.length) {
      zone.innerHTML += "<p>Aucune tournée aujourd’hui</p>";
    }

    tournees.forEach(t => {
      const b = document.createElement("button");
      b.textContent = `🚚 ${t.nom} (${t.fermes.length} arrêts)`;
      b.onclick = () => ouvrirTournee(t);
      zone.appendChild(b);
    });

    zone.appendChild(boutonToutesTournees());
    zone.appendChild(boutonAccueil());
  }
  window.afficherAujourdHui = afficherAujourdHui;

  /* ========= SEMAINE ========= */

  function afficherSemaine() {
    const tournees = chargerTournees();
    const lundi = new Date();
    lundi.setDate(lundi.getDate() - lundi.getDay() + 1);

    zone.innerHTML = "<h2>🗓️ Semaine</h2>";

    for (let i = 0; i < 7; i++) {
      const d = new Date(lundi);
      d.setDate(lundi.getDate() + i);
      const iso = dateISO(d);

      const h = document.createElement("h3");
      h.textContent = d.toLocaleDateString("fr-CA", {
        weekday: "long",
        day: "numeric",
        month: "long"
      });
      zone.appendChild(h);

      tournees.filter(t => t.date === iso).forEach(t => {
        const b = document.createElement("button");
        b.textContent = `🚚 ${t.nom}`;
        b.onclick = () => ouvrirTournee(t);
        zone.appendChild(b);
      });
    }

    zone.appendChild(boutonToutesTournees());
    zone.appendChild(boutonAccueil());
  }
  window.afficherSemaine = afficherSemaine;

  /* ========= CRÉER / MODIFIER TOURNEE ========= */

  window.creerTournee = () => {
    if (!selection.length) {
      alert("Sélectionne au moins une ferme");
      return;
    }

    const nom = prompt("Nom de la tournée", tourneeEnEdition?.nom || "");
    if (!nom) return;

    const dateChoisie = prompt(
      "Date (YYYY-MM-DD)",
      tourneeEnEdition ? tourneeEnEdition.date : dateISO()
    );
    if (!dateChoisie || !/^\d{4}-\d{2}-\d{2}$/.test(dateChoisie)) return;

    let tournees = chargerTournees();

    if (tourneeEnEdition) {
      tournees = tournees.map(t =>
        t.id === tourneeEnEdition.id
          ? { ...t, nom, date: dateChoisie, fermes: selection.map(i => fermes[i]) }
          : t
      );
    } else {
      tournees.push({
        id: Date.now(),
        nom,
        date: dateChoisie,
        heureDebut: heureLocale(),
        fermes: selection.map(i => fermes[i])
      });
    }

    sauverTournees(tournees);
    selection = [];
    tourneeEnEdition = null;
    afficherToutesLesTournees();
  };

  /* ========= CHARGEMENT DES FERMES ========= */

  fetch("clients_livraison.json")
    .then(r => r.json())
    .then(data => {
      fermes = Array.isArray(data) ? data : [];
      afficherAccueil();
    });

  /* ========= LISTE DES FERMES ========= */

  function afficherFermes(filtre = "") {
  zone.innerHTML = "<h2>📋 Liste des fermes</h2>";

  // ✅ CONTACT JUSTE SOUS "CRÉER LA TOURNÉE"
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

    // ✅ CONTACT SUR LA PREMIÈRE PAGE
    zone.appendChild(boutonContact());
    zone.appendChild(boutonToutesTournees());
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

    // GPS
    const gps = document.createElement("button");
    gps.textContent = "🧭 Lancer le GPS";
    gps.onclick = () => {
      const points = [
        DEPOT_GPS,
        ...t.fermes.map(formatAdresseGps),
        DEPOT_GPS
      ];
      window.open("https://www.google.com/maps/dir/" + points.join("/"), "_blank");
    };
    zone.appendChild(gps);

    // MODIFIER
    const modif = document.createElement("button");
    modif.textContent = "✏️ Modifier";
    modif.onclick = () => {
      selection = t.fermes.map(f => fermes.findIndex(x => x.nom === f.nom));
      tourneeEnEdition = t;
      afficherAccueil();
    };
    zone.appendChild(modif);

    // SUPPRIMER
    const suppr = document.createElement("button");
    suppr.textContent = "🗑️ Supprimer";
    suppr.onclick = () => {
      if (!demanderPIN()) return;
      sauverTournees(chargerTournees().filter(x => x.id !== t.id));
      afficherToutesLesTournees();
    };
    zone.appendChild(suppr);

    zone.appendChild(boutonAccueil());
    zone.appendChild(boutonContact());
    zone.appendChild(boutonToutesTournees());
  }

  /* ========= RECHERCHE ========= */

  recherche.addEventListener("input", e => {
    afficherFermes(e.target.value.toLowerCase());
  });
});
