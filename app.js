console.log("✅ app.js – VERSION STABLE (AUJOURD’HUI + SEMAINE OK)");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const recherche = document.getElementById("recherche");

  let fermes = [];
  let selection = [];

  /* ========= OUTILS ========= */

  function dateISO(d = new Date()) {
    return d.toISOString().slice(0, 10);
  }

  function chargerTournees() {
    return JSON.parse(localStorage.getItem("tournees") || "[]");
  }

  function sauverTournees(liste) {
    localStorage.setItem("tournees", JSON.stringify(liste));
  }

  /* ========= NAVIGATION ========= */

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

  /* ========= ACCUEIL ========= */

  function afficherAccueil() {
    selection = [];
    afficherFermes(recherche.value.toLowerCase());
  }
  window.afficherAccueil = afficherAccueil;

  /* ========= AUJOURD’HUI ✅ ========= */

  function afficherAujourdHui() {
    const today = dateISO();
    const tournees = chargerTournees().filter(t => t.date === today);

    zone.innerHTML = "<h2>📅 Aujourd’hui</h2>";

    if (!tournees.length) {
      zone.innerHTML += "<p>Aucune tournée aujourd’hui</p>";
    } else {
      tournees.forEach(t => {
        const b = document.createElement("button");
        b.textContent = `${t.nom} — ${t.date}`;
        b.onclick = () => ouvrirTournee(t);
        zone.appendChild(b);
      });
    }

    zone.appendChild(boutonToutesTournees());
    zone.appendChild(boutonAccueil());
  }
  window.afficherAujourdHui = afficherAujourdHui;

  /* ========= SEMAINE ✅ ========= */

  function afficherSemaine() {
    const tournees = chargerTournees();
    const lundi = new Date();
    lundi.setDate(lundi.getDate() - lundi.getDay() + 1);

    zone.innerHTML = "<h2>🗓️ Semaine</h2>";

    for (let i = 0; i < 7; i++) {
      const d = new Date(lundi);
      d.setDate(lundi.getDate() + i);
      const iso = dateISO(d);

      const h3 = document.createElement("h3");
      h3.textContent = d.toLocaleDateString("fr-CA", {
        weekday: "long",
        day: "numeric",
        month: "long"
      });
      zone.appendChild(h3);

      tournees
        .filter(t => t.date === iso)
        .forEach(t => {
          const b = document.createElement("button");
          b.textContent = `${t.nom} — ${t.date}`;
          b.onclick = () => ouvrirTournee(t);
          zone.appendChild(b);
        });
    }

    zone.appendChild(boutonToutesTournees());
    zone.appendChild(boutonAccueil());
  }
  window.afficherSemaine = afficherSemaine;

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

    fermes.forEach((f, i) => {
      if (filtre && !f.nom.toLowerCase().includes(filtre)) return;

      const b = document.createElement("button");
      b.textContent = f.nom;
      b.style.background = selection.includes(i) ? "#34c759" : "#fff";

      b.onclick = () => {
        if (selection.includes(i)) {
          selection = selection.filter(x => x !== i);
          b.style.background = "#fff";
        } else {
          selection.push(i);
          b.style.background = "#34c759";
        }
      };

      zone.appendChild(b);
    });

    zone.appendChild(boutonToutesTournees());
  }

  /* ========= CRÉER TOURNÉE ========= */

  window.creerTournee = () => {
    if (!selection.length) {
      alert("Sélectionne au moins une ferme");
      return;
    }

    const nom = prompt("Nom de la tournée");
    if (!nom) return;

    const dateChoisie = prompt("Date (YYYY-MM-DD)", dateISO());
    if (!dateChoisie || !/^\d{4}-\d{2}-\d{2}$/.test(dateChoisie)) {
      alert("Date invalide");
      return;
    }

    const tournees = chargerTournees();
    tournees.push({
      id: Date.now(),
      nom,
      date: dateChoisie,
      fermes: selection.map(i => fermes[i])
    });

    sauverTournees(tournees);
    selection = [];
    afficherToutesLesTournees();
  };

  /* ========= TOUTES LES TOURNÉES ========= */

  function afficherToutesLesTournees() {
    const tournees = chargerTournees();

    zone.innerHTML = "<h2>🚚 Toutes les tournées</h2>";

    if (!tournees.length) {
      zone.innerHTML += "<p>Aucune tournée</p>";
    }

    tournees.forEach(t => {
      const b = document.createElement("button");
      b.textContent = `${t.nom} — ${t.date}`;
      b.onclick = () => ouvrirTournee(t);
      zone.appendChild(b);
    });

    zone.appendChild(boutonAccueil());
  }
  window.afficherToutesLesTournees = afficherToutesLesTournees;

  /* ========= OUVRIR TOURNÉE ========= */

  function ouvrirTournee(t) {
    zone.innerHTML = `<h2>🚚 ${t.nom}</h2>`;

    const ul = document.createElement("ul");
    t.fermes.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f.nom;
      ul.appendChild(li);
    });
    zone.appendChild(ul);

    zone.appendChild(boutonToutesTournees());
    zone.appendChild(boutonAccueil());
  }

  /* ========= RECHERCHE ========= */

  recherche.addEventListener("input", e => {
    afficherFermes(e.target.value.toLowerCase());
  });
});
