// Cartographie du secteur public — logique de la page employeur-detail.html

import {
  chargerEmployeurs,
  chargerVersants,
  chargerTypesEmployeurs,
  chargerSecteurs,
  chargerConcours,
  libelleVersant,
  libelleTypeEmployeur,
  libelleSecteur,
} from "./data-loader.js";

async function afficherFicheEmployeur() {
  const conteneur = document.getElementById("fiche-employeur");
  const idEmployeur = new URLSearchParams(window.location.search).get("id");

  try {
    const [employeurs, versants, types, secteurs, concours] = await Promise.all([
      chargerEmployeurs(),
      chargerVersants(),
      chargerTypesEmployeurs(),
      chargerSecteurs(),
      chargerConcours(),
    ]);

    const employeur = employeurs.find((element) => element.id === idEmployeur);

    if (!employeur) {
      document.getElementById("fil-ariane-nom").textContent = "Employeur introuvable";
      afficherEmployeurIntrouvable(conteneur);
      return;
    }

    document.title = employeur.nom + " — Cartographie du secteur public";
    document.getElementById("fil-ariane-nom").textContent = employeur.nom;

    conteneur.textContent = "";
    conteneur.appendChild(creerFiche(employeur, versants, types));
    conteneur.appendChild(creerSectionSecteurs(employeur.secteur, secteurs));
    conteneur.appendChild(creerSectionDescription(employeur.description));
    conteneur.appendChild(creerSectionConcours(employeur, concours));
  } catch (erreur) {
    conteneur.textContent = "Erreur lors du chargement de la fiche : " + erreur.message;
  }
}

function afficherEmployeurIntrouvable(conteneur) {
  conteneur.textContent = "";

  const titre = document.createElement("h1");
  titre.textContent = "Employeur introuvable";
  conteneur.appendChild(titre);

  const lien = document.createElement("a");
  lien.href = "employeurs.html";
  lien.textContent = "Retour à la liste des employeurs";
  conteneur.appendChild(lien);
}

function creerFiche(employeur, versants, types) {
  const fiche = document.createElement("section");
  fiche.className = "fiche";

  const titre = document.createElement("h1");
  titre.textContent = employeur.nom;
  fiche.appendChild(titre);

  const type = document.createElement("p");
  type.textContent = "Type : " + libelleTypeEmployeur(types, employeur.type);
  fiche.appendChild(type);

  const versant = document.createElement("p");
  versant.textContent = "Versant : " + libelleVersant(versants, employeur.versant);
  fiche.appendChild(versant);

  if (employeur.siteWeb) {
    const lien = document.createElement("a");
    lien.className = "lien-siteweb";
    lien.href = employeur.siteWeb;
    lien.textContent = "Site web";
    lien.target = "_blank";
    lien.rel = "noopener";
    fiche.appendChild(lien);
  }

  return fiche;
}

function creerSectionSecteurs(secteurIds, secteursRef) {
  const section = document.createElement("section");
  section.className = "fiche-liens";

  const titre = document.createElement("h2");
  titre.textContent = "Secteurs";
  section.appendChild(titre);

  if (!secteurIds || secteurIds.length === 0) {
    const message = document.createElement("p");
    message.textContent = "Non renseigné";
    section.appendChild(message);
    return section;
  }

  const liste = document.createElement("ul");
  secteurIds.forEach((id) => {
    const item = document.createElement("li");
    item.textContent = libelleSecteur(secteursRef, id);
    liste.appendChild(item);
  });
  section.appendChild(liste);

  return section;
}

function creerSectionDescription(description) {
  const section = document.createElement("section");
  section.className = "fiche-liens";

  const titre = document.createElement("h2");
  titre.textContent = "Description";
  section.appendChild(titre);

  section.appendChild(creerBlocDescription(description));

  return section;
}

// Rendu de la description : un paragraphe par bloc séparé par un saut de
// ligne double ("\n\n"), pour permettre une mise en forme lisible sans
// avoir besoin de markdown.
function creerBlocDescription(description) {
  const bloc = document.createElement("div");
  bloc.className = "description-detaillee";

  if (!description || description.trim() === "") {
    const vide = document.createElement("p");
    vide.textContent = "Non renseignée";
    bloc.appendChild(vide);
    return bloc;
  }

  const paragraphes = description.split(/\n{2,}/).map((segment) => segment.trim()).filter(Boolean);
  paragraphes.forEach((texte) => {
    const paragraphe = document.createElement("p");
    paragraphe.textContent = texte;
    bloc.appendChild(paragraphe);
  });

  return bloc;
}

function creerSectionConcours(employeur, concours) {
  const section = document.createElement("section");
  section.className = "fiche-liens";

  const titre = document.createElement("h2");
  titre.textContent = "Concours menant à cet employeur";
  section.appendChild(titre);

  const concoursLies = concours.filter((unConcours) => unConcours.employeurs.includes(employeur.id));

  if (concoursLies.length === 0) {
    const message = document.createElement("p");
    message.textContent = "Aucun concours connu ne mène à cet employeur pour l'instant.";
    section.appendChild(message);
    return section;
  }

  const liste = document.createElement("ul");
  concoursLies.forEach((unConcours) => {
    const item = document.createElement("li");
    const lien = document.createElement("a");
    lien.href = "concours-detail.html?id=" + encodeURIComponent(unConcours.id);
    lien.textContent = unConcours.nom;
    item.appendChild(lien);
    liste.appendChild(item);
  });
  section.appendChild(liste);

  return section;
}

document.addEventListener("DOMContentLoaded", afficherFicheEmployeur);
