// Cartographie du secteur public — logique de la page concours.html

import {
  chargerConcours,
  chargerVersants,
  chargerFilieres,
  chargerEmployeurs,
  libelleVersant,
  libelleFiliere,
  libelleSecteur,
} from "./data-loader.js";

async function afficherConcours() {
  const conteneur = document.getElementById("liste-concours");

  try {
    const [concours, versants, filieres, employeurs] = await Promise.all([
      chargerConcours(),
      chargerVersants(),
      chargerFilieres(),
      chargerEmployeurs(),
    ]);

    conteneur.textContent = "";
    concours.forEach((unConcours) => {
      conteneur.appendChild(creerCarteConcours(unConcours, versants, filieres, employeurs));
    });
  } catch (erreur) {
    conteneur.textContent = "Erreur lors du chargement des concours : " + erreur.message;
  }
}

function nomEmployeur(employeurs, id) {
  const employeur = employeurs.find((element) => element.id === id);
  return employeur ? employeur.nom : id;
}

function creerCarteConcours(concours, versants, filieres, employeurs) {
  const carte = document.createElement("article");
  carte.className = "carte-concours";

  const titre = document.createElement("h2");
  titre.textContent = concours.nom;
  carte.appendChild(titre);

  const categorie = document.createElement("p");
  categorie.textContent = "Catégorie : " + concours.categorie;
  carte.appendChild(categorie);

  const type = document.createElement("p");
  type.textContent = "Type : " + concours.type;
  carte.appendChild(type);

  const filiere = document.createElement("p");
  filiere.textContent = "Filière : " + libelleFiliere(filieres, concours.filiere);
  carte.appendChild(filiere);

  const versant = document.createElement("p");
  versant.textContent = "Versant : " + libelleVersant(versants, concours.versant);
  carte.appendChild(versant);

  const niveau = document.createElement("p");
  niveau.textContent = "Niveau requis : " + concours.niveauRequis;
  carte.appendChild(niveau);

  const secteurs = document.createElement("p");
  const libellesSecteurs = concours.secteur.map(libelleSecteur).join(", ");
  secteurs.textContent = "Secteurs : " + (libellesSecteurs || "Non renseigné");
  carte.appendChild(secteurs);

  const employeursListe = document.createElement("p");
  const nomsEmployeurs = concours.employeurs.map((id) => nomEmployeur(employeurs, id)).join(", ");
  employeursListe.textContent = "Employeurs : " + (nomsEmployeurs || "Non renseigné");
  carte.appendChild(employeursListe);

  if (concours.siteWeb) {
    const lien = document.createElement("a");
    lien.href = concours.siteWeb;
    lien.textContent = "Site web";
    lien.target = "_blank";
    lien.rel = "noopener";
    carte.appendChild(lien);
  }

  return carte;
}

document.addEventListener("DOMContentLoaded", afficherConcours);
