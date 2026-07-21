// Cartographie du secteur public — logique de la page concours.html

import {
  chargerConcours,
  chargerVersants,
  chargerFilieres,
  chargerEmployeurs,
  chargerCategories,
  chargerTypesConcours,
  chargerSecteurs,
  libelleVersant,
  libelleFiliere,
  libelleSecteur,
} from "./data-loader.js";
import { filtrerParCriteres, creerPredicatEgalite, creerPredicatIntersection } from "./filtres.js";

let tousLesConcours = [];
let versantsRef = [];
let filieresRef = [];
let employeursRef = [];
let secteursRef = [];

async function afficherConcours() {
  const conteneur = document.getElementById("liste-concours");

  try {
    const [concours, versants, filieres, employeurs, categories, typesConcours, secteurs] = await Promise.all([
      chargerConcours(),
      chargerVersants(),
      chargerFilieres(),
      chargerEmployeurs(),
      chargerCategories(),
      chargerTypesConcours(),
      chargerSecteurs(),
    ]);

    tousLesConcours = concours;
    versantsRef = versants;
    filieresRef = filieres;
    employeursRef = employeurs;
    secteursRef = secteurs;

    initialiserFiltres(filieres, versants, categories, typesConcours, secteurs);
    appliquerFiltres();
  } catch (erreur) {
    conteneur.textContent = "Erreur lors du chargement des concours : " + erreur.message;
  }
}

function rendererCartes(liste) {
  const conteneur = document.getElementById("liste-concours");
  conteneur.textContent = "";

  document.getElementById("compteur-concours").textContent =
    liste.length + (liste.length > 1 ? " concours affichés" : " concours affiché");

  if (liste.length === 0) {
    const message = document.createElement("p");
    message.textContent = "Aucun résultat ne correspond à ces critères.";
    conteneur.appendChild(message);
    return;
  }

  liste.forEach((unConcours) => {
    conteneur.appendChild(creerCarteConcours(unConcours, versantsRef, filieresRef, employeursRef, secteursRef));
  });
}

function nomEmployeur(employeurs, id) {
  const employeur = employeurs.find((element) => element.id === id);
  return employeur ? employeur.nom : id;
}

function creerCarteConcours(concours, versants, filieres, employeurs, secteursRef) {
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
  const libellesSecteurs = concours.secteur.map((id) => libelleSecteur(secteursRef, id)).join(", ");
  secteurs.textContent = "Secteurs : " + (libellesSecteurs || "Non renseigné");
  carte.appendChild(secteurs);

  const employeursListe = document.createElement("p");
  const nomsEmployeurs = concours.employeurs.map((id) => nomEmployeur(employeurs, id)).join(", ");
  employeursListe.textContent = "Employeurs : " + (nomsEmployeurs || "Non renseigné");
  carte.appendChild(employeursListe);

  return carte;
}

// --- Contrôles de filtre ---

function initialiserFiltres(filieres, versants, categories, typesConcours, secteurs) {
  remplirSelect(document.getElementById("filtre-filiere"), filieres);
  remplirSelect(document.getElementById("filtre-versant"), versants);
  remplirSelect(document.getElementById("filtre-categorie"), categories);
  remplirSelect(document.getElementById("filtre-type"), typesConcours);
  remplirCasesSecteurs(document.getElementById("filtre-secteurs"), secteurs);

  document.getElementById("filtre-filiere").addEventListener("change", appliquerFiltres);
  document.getElementById("filtre-versant").addEventListener("change", appliquerFiltres);
  document.getElementById("filtre-categorie").addEventListener("change", appliquerFiltres);
  document.getElementById("filtre-type").addEventListener("change", appliquerFiltres);
  document.getElementById("filtre-secteurs").addEventListener("change", appliquerFiltres);
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

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + secteur.libelle));

    fieldset.appendChild(label);
  });
}

function obtenirSecteursSelectionnes() {
  return Array.from(
    document.querySelectorAll('#filtre-secteurs input[name="secteur"]:checked')
  ).map((checkbox) => checkbox.value);
}

function appliquerFiltres() {
  const filiere = document.getElementById("filtre-filiere").value;
  const versant = document.getElementById("filtre-versant").value;
  const categorie = document.getElementById("filtre-categorie").value;
  const type = document.getElementById("filtre-type").value;
  const secteurs = obtenirSecteursSelectionnes();

  const predicats = [
    creerPredicatEgalite("filiere", filiere),
    creerPredicatEgalite("versant", versant),
    creerPredicatEgalite("categorie", categorie),
    creerPredicatEgalite("type", type),
    creerPredicatIntersection("secteur", secteurs),
  ];

  rendererCartes(filtrerParCriteres(tousLesConcours, predicats));
}

function reinitialiserFiltres() {
  document.getElementById("filtre-filiere").value = "";
  document.getElementById("filtre-versant").value = "";
  document.getElementById("filtre-categorie").value = "";
  document.getElementById("filtre-type").value = "";
  document.querySelectorAll('#filtre-secteurs input[name="secteur"]').forEach((checkbox) => {
    checkbox.checked = false;
  });
  appliquerFiltres();
}

document.addEventListener("DOMContentLoaded", afficherConcours);
