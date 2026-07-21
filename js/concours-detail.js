// Cartographie du secteur public — logique de la page concours-detail.html

import {
  chargerConcours,
  chargerVersants,
  chargerFilieres,
  chargerCategories,
  chargerSecteurs,
  chargerEmployeurs,
  chargerTypesConcours,
  libelleVersant,
  libelleFiliere,
  libelleCategorie,
  libelleSecteur,
  libelleTypeConcours,
} from "./data-loader.js";

async function afficherFicheConcours() {
  const conteneur = document.getElementById("fiche-concours");
  const idConcours = new URLSearchParams(window.location.search).get("id");

  try {
    const [concoursListe, versants, filieres, categories, secteurs, employeurs, typesConcours] = await Promise.all([
      chargerConcours(),
      chargerVersants(),
      chargerFilieres(),
      chargerCategories(),
      chargerSecteurs(),
      chargerEmployeurs(),
      chargerTypesConcours(),
    ]);

    const concours = concoursListe.find((element) => element.id === idConcours);

    if (!concours) {
      document.getElementById("fil-ariane-nom").textContent = "Concours introuvable";
      afficherConcoursIntrouvable(conteneur);
      return;
    }

    document.title = concours.nom + " — Cartographie du secteur public";
    document.getElementById("fil-ariane-nom").textContent = concours.nom;

    conteneur.textContent = "";
    conteneur.appendChild(creerFiche(concours, versants, filieres, categories, secteurs));
    conteneur.appendChild(creerSectionVoiesAcces(concours, typesConcours));
    conteneur.appendChild(creerSectionEmployeurs(concours, employeurs));
  } catch (erreur) {
    conteneur.textContent = "Erreur lors du chargement de la fiche : " + erreur.message;
  }
}

function afficherConcoursIntrouvable(conteneur) {
  conteneur.textContent = "";

  const titre = document.createElement("h1");
  titre.textContent = "Concours introuvable";
  conteneur.appendChild(titre);

  const lien = document.createElement("a");
  lien.href = "concours.html";
  lien.textContent = "Retour à la liste des concours";
  conteneur.appendChild(lien);
}

function creerFiche(concours, versants, filieres, categories, secteursRef) {
  const fiche = document.createElement("section");
  fiche.className = "fiche";

  const titre = document.createElement("h1");
  titre.textContent = concours.nom;
  fiche.appendChild(titre);

  const categorie = document.createElement("p");
  categorie.textContent = "Catégorie : " + libelleCategorie(categories, concours.categorie);
  fiche.appendChild(categorie);

  const filiere = document.createElement("p");
  filiere.textContent = "Filière : " + libelleFiliere(filieres, concours.filiere);
  fiche.appendChild(filiere);

  const versant = document.createElement("p");
  versant.textContent = "Versant : " + libelleVersant(versants, concours.versant);
  fiche.appendChild(versant);

  const secteurs = document.createElement("p");
  const libellesSecteurs = concours.secteur.map((id) => libelleSecteur(secteursRef, id)).join(", ");
  secteurs.textContent = "Secteurs : " + (libellesSecteurs || "Non renseigné");
  fiche.appendChild(secteurs);

  fiche.appendChild(creerBlocDescription(concours.descriptionDetaillee));

  if (concours.siteWeb) {
    const lien = document.createElement("a");
    lien.className = "lien-siteweb";
    lien.href = concours.siteWeb;
    lien.textContent = "Site web du corps";
    lien.target = "_blank";
    lien.rel = "noopener";
    fiche.appendChild(lien);
  }

  return fiche;
}

// Rendu de la description longue : un paragraphe par bloc séparé par un
// saut de ligne double ("\n\n"), pour permettre une mise en forme lisible
// sans avoir besoin de markdown.
function creerBlocDescription(descriptionDetaillee) {
  const bloc = document.createElement("div");
  bloc.className = "description-detaillee";

  if (!descriptionDetaillee || descriptionDetaillee.trim() === "") {
    const vide = document.createElement("p");
    vide.textContent = "Description : Non renseignée";
    bloc.appendChild(vide);
    return bloc;
  }

  const paragraphes = descriptionDetaillee.split(/\n{2,}/).map((segment) => segment.trim()).filter(Boolean);
  paragraphes.forEach((texte) => {
    const paragraphe = document.createElement("p");
    paragraphe.textContent = texte;
    bloc.appendChild(paragraphe);
  });

  return bloc;
}

function creerSectionVoiesAcces(concours, typesConcours) {
  const section = document.createElement("section");
  section.className = "fiche-liens";

  const titre = document.createElement("h2");
  titre.textContent = "Voies d'accès";
  section.appendChild(titre);

  if (!concours.voiesAcces || concours.voiesAcces.length === 0) {
    const message = document.createElement("p");
    message.textContent = "Aucune voie d'accès renseignée pour l'instant.";
    section.appendChild(message);
    return section;
  }

  const liste = document.createElement("ul");
  liste.className = "liste-voies-acces";

  concours.voiesAcces.forEach((voie) => {
    const item = document.createElement("li");
    item.className = "voie-acces";

    const nom = document.createElement("p");
    nom.className = "voie-acces-nom";
    nom.textContent = voie.nomConcours;
    item.appendChild(nom);

    const type = document.createElement("p");
    type.textContent = "Type : " + libelleTypeConcours(typesConcours, voie.type);
    item.appendChild(type);

    const niveau = document.createElement("p");
    niveau.textContent = "Niveau requis : " + (voie.niveauRequis || "Non renseigné");
    item.appendChild(niveau);

    if (voie.siteWebConcours) {
      const lien = document.createElement("a");
      lien.className = "lien-siteweb";
      lien.href = voie.siteWebConcours;
      lien.textContent = "Page officielle de cette voie";
      lien.target = "_blank";
      lien.rel = "noopener";
      item.appendChild(lien);
    }

    liste.appendChild(item);
  });

  section.appendChild(liste);
  return section;
}

function creerSectionEmployeurs(concours, employeurs) {
  const section = document.createElement("section");
  section.className = "fiche-liens";

  const titre = document.createElement("h2");
  titre.textContent = "Employeurs liés";
  section.appendChild(titre);

  const employeursLies = concours.employeurs
    .map((id) => employeurs.find((employeur) => employeur.id === id))
    .filter(Boolean);

  if (employeursLies.length === 0) {
    const message = document.createElement("p");
    message.textContent = "Aucun employeur connu n'est lié à ce concours pour l'instant.";
    section.appendChild(message);
    return section;
  }

  const liste = document.createElement("ul");
  employeursLies.forEach((employeur) => {
    const item = document.createElement("li");
    const lien = document.createElement("a");
    lien.href = "employeur-detail.html?id=" + encodeURIComponent(employeur.id);
    lien.textContent = employeur.nom;
    item.appendChild(lien);
    liste.appendChild(item);
  });
  section.appendChild(liste);

  return section;
}

document.addEventListener("DOMContentLoaded", afficherFicheConcours);
