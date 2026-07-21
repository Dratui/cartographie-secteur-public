// Cartographie du secteur public — logique de la page concours.html

import {
  chargerConcours,
  chargerVersants,
  chargerFilieres,
  chargerEmployeurs,
  chargerCategories,
  chargerSecteurs,
  libelleVersant,
} from "./data-loader.js";
import { filtrerParCriteres, creerPredicatEgalite, creerPredicatIntersection } from "./filtres.js";
import { initialiserMenuSecteurs, mettreAJourLibelleBoutonSecteurs } from "./menu-secteurs.js";

let tousLesConcours = [];
let versantsRef = [];

async function afficherConcours() {
  const conteneur = document.getElementById("liste-concours");

  try {
    const [concours, versants, filieres, employeurs, categories, secteurs] = await Promise.all([
      chargerConcours(),
      chargerVersants(),
      chargerFilieres(),
      chargerEmployeurs(),
      chargerCategories(),
      chargerSecteurs(),
    ]);

    tousLesConcours = concours;
    versantsRef = versants;

    initialiserFiltres(filieres, versants, categories, secteurs);
    appliquerFiltres();
  } catch (erreur) {
    conteneur.textContent = "Erreur lors du chargement des concours : " + erreur.message;
  }
}

function rendererCartes(liste) {
  const conteneur = document.getElementById("liste-concours");
  conteneur.textContent = "";

  document.getElementById("compteur-concours").textContent =
    liste.length + (liste.length > 1 ? " corps affichés" : " corps affiché");

  if (liste.length === 0) {
    const message = document.createElement("p");
    message.textContent = "Aucun résultat ne correspond à ces critères.";
    conteneur.appendChild(message);
    return;
  }

  liste.forEach((unConcours) => {
    conteneur.appendChild(creerCarteConcours(unConcours));
  });
}

// La carte reste volontairement minimale (nom, catégorie, versant) :
// tout le détail (voies d'accès, secteurs, employeurs, description) est sur la fiche.
function creerCarteConcours(concours) {
  const carte = document.createElement("a");
  carte.className = "carte-concours";
  carte.href = "concours-detail.html?id=" + encodeURIComponent(concours.id);
  carte.setAttribute("aria-label", concours.nom);

  const titre = document.createElement("h2");
  titre.textContent = concours.nom;
  carte.appendChild(titre);

  const categorie = document.createElement("p");
  categorie.textContent = "Catégorie : " + concours.categorie;
  carte.appendChild(categorie);

  const versant = document.createElement("p");
  versant.textContent = "Versant : " + libelleVersant(versantsRef, concours.versant);
  carte.appendChild(versant);

  return carte;
}

// --- Contrôles de filtre ---

function initialiserFiltres(filieres, versants, categories, secteurs) {
  remplirSelect(document.getElementById("filtre-filiere"), filieres);
  remplirSelect(document.getElementById("filtre-versant"), versants);
  remplirSelect(document.getElementById("filtre-categorie"), categories);
  remplirCasesSecteurs(document.getElementById("cases-secteurs"), secteurs);
  initialiserMenuSecteurs(document.getElementById("bouton-secteurs"), document.getElementById("filtre-secteurs"));

  document.getElementById("filtre-filiere").addEventListener("change", appliquerFiltres);
  document.getElementById("filtre-versant").addEventListener("change", appliquerFiltres);
  document.getElementById("filtre-categorie").addEventListener("change", appliquerFiltres);
  document.getElementById("filtre-secteurs").addEventListener("change", () => {
    mettreAJourLibelleBoutonSecteurs(document.getElementById("bouton-secteurs"), obtenirSecteursSelectionnes().length);
    appliquerFiltres();
  });
  document.getElementById("reinitialiser-secteurs").addEventListener("click", () => {
    viderSecteurs();
    appliquerFiltres();
  });
  document.getElementById("reinitialiser-filtres").addEventListener("click", reinitialiserFiltres);
}

function remplirSelect(select, options) {
  options.forEach((option) => {
    const elementOption = document.createElement("option");
    elementOption.value = option.id;
    elementOption.textContent = option.libelle;
    select.appendChild(elementOption);
  });
}

function remplirCasesSecteurs(fieldset, secteurs) {
  secteurs.forEach((secteur) => {
    const label = document.createElement("label");
    label.className = "case-secteur";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "secteur";
    checkbox.value = secteur.id;

    const libelleAffiche = secteur.emoji ? secteur.emoji + " " + secteur.libelle : secteur.libelle;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + libelleAffiche));

    fieldset.appendChild(label);
  });
}

function obtenirSecteursSelectionnes() {
  return Array.from(
    document.querySelectorAll('#filtre-secteurs input[name="secteur"]:checked')
  ).map((checkbox) => checkbox.value);
}

function viderSecteurs() {
  document.querySelectorAll('#filtre-secteurs input[name="secteur"]').forEach((checkbox) => {
    checkbox.checked = false;
  });
  mettreAJourLibelleBoutonSecteurs(document.getElementById("bouton-secteurs"), 0);
}

function appliquerFiltres() {
  const filiere = document.getElementById("filtre-filiere").value;
  const versant = document.getElementById("filtre-versant").value;
  const categorie = document.getElementById("filtre-categorie").value;
  const secteurs = obtenirSecteursSelectionnes();

  const predicats = [
    creerPredicatEgalite("filiere", filiere),
    creerPredicatEgalite("versant", versant),
    creerPredicatEgalite("categorie", categorie),
    creerPredicatIntersection("secteur", secteurs),
  ];

  rendererCartes(filtrerParCriteres(tousLesConcours, predicats));
}

function reinitialiserFiltres() {
  document.getElementById("filtre-filiere").value = "";
  document.getElementById("filtre-versant").value = "";
  document.getElementById("filtre-categorie").value = "";
  viderSecteurs();
  appliquerFiltres();
}

document.addEventListener("DOMContentLoaded", afficherConcours);
