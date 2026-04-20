console.log("✅ app.js – VERSION STABLE (MODIFIER + SUPPRIMER AJOUTÉS)");

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
      b.textContent = t.nom;
      b.onclick = () => ouvrirTournee(t);
      zone.appendChild(b);
    });

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
        b.textContent = t.nom;
        b.onclick = () => ouvrirTournee(t);
        zone.appendChild(b);
      });
    }

    zone.appendChild(boutonAccueil());
  }
  window.afficherSemaine = afficherSemaine;

  /* ========= LISTE DES FERMES ========= */

  function afficherFermes(filtre = "") {
    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";

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

    /* ✏️ MODIFIER */
    const modif = document.createElement("button");
    modif.textContent = "✏️ Modifier";
    modif.onclick = () => {
      selection = t.fermes.map(f =>
        fermes.findIndex(x => x.nom === f.nom)
      );
      tourneeEnEdition = t;
      afficherAccueil();
    };
    zone.appendChild(modif);

    /* 🗑️ SUPPRIMER */
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

  /* ========= CRÉER / MODIFIER ========= */

  window.creerTournee = () => {
    if (!selection.length) return alert("Sélectionne une ferme");

    const nom = prompt("Nom de la tournée", tourneeEnEdition?.nom || "");
    if (!nom) return;

    const tournees = chargerTournees();

    if (tourneeEnEdition) {
      tournees.forEach(t => {
        if (t.id === tourneeEnEdition.id) {
          t.nom = nom;
          t.fermes = selection.map(i => fermes[i]);
        }
      });
    } else {
      tournees.push({
        id: Date.now(),
        nom,
        date: dateISO(),
        heureDebut: heureLocale(),
        fermes: selection.map(i => fermes[i])
      });
    }

    sauverTournees(tournees);
    selection = [];
    tourneeEnEdition = null;
    afficherToutesLesTournees();
  };

  /* ========= TOUTES LES TOURNÉES ========= */

  function afficherToutesLesTournees() {
    zone.innerHTML = "<h2>🚚 Toutes les tournées</h2>";

    chargerTournees().forEach(t => {
      const b = document.createElement("button");
      b.textContent = t.nom;
      b.onclick = () => ouvrirTournee(t);
      zone.appendChild(b);
    });

    zone.appendChild(boutonAccueil());
  }
  window.afficherToutesLesTournees = afficherToutesLesTournees;

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
