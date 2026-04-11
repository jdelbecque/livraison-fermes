console.log("✅ app.js – VERSION STABLE AVEC CALENDRIER + BADGE");

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste");
  const champRecherche = document.getElementById("recherche");

  let fermes = [];
  let selection = [];
  let tournee = [];

  let tourneesSauvegardees = JSON.parse(
    localStorage.getItem("tournees") || "[]"
  );

  /* =====================
     OUTILS
     ===================== */
  function sauvegarderTournees() {
    localStorage.setItem("tournees", JSON.stringify(tourneesSauvegardees));
  }

  function mettreAJourCompteur() {
    const compteur = document.getElementById("compteur");
    if (compteur) {
      compteur.textContent = `✅ ${selection.length} ferme(s) sélectionnée(s)`;
    }
  }

  function mettreAJourBadgeAujourdHui() {
    const btn = document.getElementById("btnAujourdHui");
    if (!btn) return;

    const today = new Date().toISOString().slice(0, 10);
    const count = tourneesSauvegardees.filter(
      t => t.date === today && !t.terminee
    ).length;

    btn.textContent = `📅 Aujourd’hui (${count})`;
  }

  /* =====================
     CHARGEMENT DES FERMES
     ===================== */
  fetch("clients_livraison.json")
    .then(res => res.json())
    .then(data => {
      fermes = Array.isArray(data) ? data : [];
      afficherListe();
      mettreAJourBadgeAujourdHui();
    })
    .catch(() => {
      zone.innerHTML = "<p>Erreur chargement fermes</p>";
    });

  /* =====================
     LISTE DES FERMES
     ===================== */
  function afficherListe(filtre = "") {
    zone.innerHTML = "<h2>📋 Liste des fermes</h2>";

    fermes.forEach((ferme, index) => {
      const texte = Object.values(ferme)
        .filter(v => typeof v === "string" && v.trim())
        .join(" – ");

      if (filtre && !texte.toLowerCase().includes(filtre)) return;

      const btn = document.createElement("button");
      btn.className = "ferme";
      btn.textContent = texte;

      if (selection.includes(index)) {
        btn.classList.add("selected");
      }

      btn.onclick = () => {
        if (selection.includes(index)) {
          selection = selection.filter(i => i !== index);
        } else {
          selection.push(index);
        }
        afficherListe(champRecherche.value.toLowerCase());
      };

      zone.appendChild(btn);
    });

    mettreAJourCompteur();
  }

  /* =====================
     BOUTONS
     ===================== */
  window.creerTournee = () => {
    if (selection.length === 0) {
      alert("Sélectionne au moins une ferme");
      return;
    }

    tournee = selection.map(i => ({
      ferme: fermes[i],
      livree: false
    }));

    afficherTournee();
  };

  /* =====================
     TOURNÉE
     ===================== */
  function afficherTournee() {
    zone.innerHTML = "<h2>🚚 Tournée</h2>";

    tournee.forEach(item => {
      const texte = Object.values(item.ferme)
        .filter(v => typeof v === "string")
        .join(" – ");

      const btn = document.createElement("button");
      btn.textContent = texte;

      zone.appendChild(btn);
    });

    const save = document.createElement("button");
    save.textContent = "💾 Sauvegarder la tournée";
    save.onclick = () => {
      const nom = prompt("Nom de la tournée ?");
      if (!nom) return;

      const date = prompt(
        "Date (YYYY-MM-DD) ?",
        new Date().toISOString().slice(0, 10)
      );
      if (!date) return;

      tourneesSauvegardees.push({
        id: Date.now(),
        nom,
        date,
        fermes: tournee,
        terminee: false
      });

      sauvegarderTournees();
      mettreAJourBadgeAujourdHui();
      alert("✅ Tournée sauvegardée");
    };
    zone.appendChild(save);

    const retour = document.createElement("button");
    retour.textContent = "↩ Retour à la liste";
    retour.onclick = afficherListe;
    zone.appendChild(retour);
  }

  /* =====================
     📅 AUJOURD’HUI
     ===================== */
  window.afficherCalendrierDuJour = () => {
    const today = new Date().toISOString().slice(0, 10);
    zone.innerHTML = `<h2>📅 Aujourd’hui — ${today}</h2>`;

    tourneesSauvegardees
      .filter(t => t.date === today)
      .forEach(t => {
        const btn = document.createElement("button");
        btn.textContent = `🚚 ${t.nom}`;
        btn.onclick = () => {
          tournee = t.fermes;
          afficherTournee();
        };
        zone.appendChild(btn);
      });

    const retour = document.createElement("button");
    retour.textContent = "↩ Retour";
    retour.onclick = afficherListe;
    zone.appendChild(retour);
  };

  /* =====================
     🗓️ SEMAINE
     ===================== */
  window.afficherCalendrierSemaine = () => {
    zone.innerHTML = "<h2>🗓️ Cette semaine</h2>";
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const date = d.toISOString().slice(0, 10);

      zone.innerHTML += `<h3>${d.toLocaleDateString("fr-CA", {
        weekday: "long",
        day: "numeric",
        month: "short"
      })}</h3>`;

      tourneesSauvegardees
        .filter(t => t.date === date)
        .forEach(t => {
          const btn = document.createElement("button");
          btn.textContent = `🚚 ${t.nom}`;
          btn.onclick = () => {
            tournee = t.fermes;
            afficherTournee();
          };
          zone.appendChild(btn);
        });
    }

    const retour = document.createElement("button");
    retour.textContent = "↩ Retour";
    retour.onclick = afficherListe;
    zone.appendChild(retour);
  };
window.afficherCalendrierDuJour = function () {
  const aujourdHui = new Date().toISOString().slice(0, 10);

  listeDiv.innerHTML = `<h2>📅 Aujourd’hui — ${aujourdHui}</h2>`;

  const tournees = JSON.parse(
    localStorage.getItem("tournees") || "[]"
  ).filter(t => t.date === aujourdHui);

  if (tournees.length === 0) {
    listeDiv.innerHTML += "<p>Aucune tournée prévue aujourd’hui</p>";
  } else {
    tournees.forEach(t => {
      const btn = document.createElement("button");
      btn.textContent = `🚚 ${t.nom}`;
      btn.onclick = () => {
        afficherTournee(t.fermes);
      };
      listeDiv.appendChild(btn);
    });
  }

  const retour = document.createElement("button");
  retour.textContent = "↩ Retour à la liste";
  retour.onclick = () => afficherListe();
  listeDiv.appendChild(retour);
};
  /* =====================
     RECHERCHE
     ===================== */
  champRecherche.addEventListener("input", e => {
    afficherListe(e.target.value.toLowerCase());
  });
});
