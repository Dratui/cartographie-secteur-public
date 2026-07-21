// Cartographie du secteur public — logique de la page employeurs.html

import {
  chargerEmployeurs,
  chargerVersants,
  chargerTypesEmployeurs,
  chargerSecteurs,
  libelleVersant,
  libelleTypeEmployeur,
  libelleSecteur,
} from "./data-loader.js";
import { filtrerParCriteres, creerPredicatEgalite, creerPredicatIntersection } from "./filtres.js";

let tousLesEmployeurs = [];
let versantsRef = [];
let typesRef = [];
let secteursRef = [];

async function afficherEmployeurs() {
  const conteneur = document.getElementById("liste-employeurs");

  try {
    const [employeurs, versants, types, secteurs] = await Promise.all([
      chargerEmployeurs(),
      chargerVersants(),
      chargerTypesEmployeurs(),
      chargerSecteurs(),
    ]);

    tousLesEmployeurs = employeurs;
    versantsRef = versants;
    typesRef = types;
    secteursRef = secteurs;

    initialiserFiltres(types, versants, secteurs);
    appliquerFiltres();
  } catch (erreur) {
    conteneur.textContent = "Erreur lors du chargement des employeurs : " + erreur.message;
  }
}

function rendererCartes(liste) {
  const conteneur = document.getElementById("liste-employeurs");
  conteneur.textContent = "";

  document.getElementById("compteur-employeurs").textContent =
    liste.length + (liste.length > 1 ? " employeurs affichés" : " employeur affiché");

  if (liste.length === 0) {
    const message = document.createElement("p");
    message.textContent = "Aucun résultat ne correspond à ces critères.";
    conteneur.appendChild(message);
    return;
  }

  liste.forEach((employeur) => {
    conteneur.appendChild(creerCarteEmployeur(employeur, versantsRef, typesRef, secteursRef));
  });
}

function creerCarteEmployeur(employeur, versants, types, secteursRef) {
  const carte = document.createElement("a");
  carte.className = "carte-employeur";
  carte.href = "employeur-detail.html?id=" + encodeURIComponent(employeur.id);
  carte.setAttribute("aria-label", employeur.nom);

  const titre = document.createElement("h2");
  titre.textContent = employeur.nom;
  carte.appendChild(titre);

  const type = document.createElement("p");
  type.textContent = "Type : " + libelleTypeEmployeur(types, employeur.type);
  carte.appendChild(type);

  const versant = document.createElement("p");
  versant.textContent = "Versant : " + libelleVersant(versants, employeur.versant);
  carte.appendChild(versant);

  const secteurs = document.createElement("p");
  const libellesSecteurs = employeur.secteur.map((id) => libelleSecteur(secteursRef, id)).join(", ");
  secteurs.textContent = "Secteurs : " + (libellesSecteurs || "Non renseigné");
  carte.appendChild(secteurs);

  return carte;
}

// --- Contrôles de filtre ---

function initialiserFiltres(types, versants, secteurs) {
  remplirSelect(document.getElementById("filtre-type"), types);
  remplirSelect(document.getElementById("filtre-versant"), versants);
  remplirCasesSecteurs(document.getElementById("filtre-secteurs"), secteurs);

  document.getElementById("filtre-type").addEventListener("change", appliquerFiltres);
  document.getElementById("filtre-versant").addEventListener("change", appliquerFiltres);
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
  const type = document.getElementById("filtre-type").value;
  const versant = document.getElementById("filtre-versant").value;
  const secteurs = obtenirSecteursSelectionnes();

  const predicats = [
    creerPredicatEgalite("type", type),
    creerPredicatEgalite("versant", versant),
    creerPredicatIntersection("secteur", secteurs),
  ];

  rendererCartes(filtrerParCriteres(tousLesEmployeurs, predicats));
}

function reinitialiserFiltres() {
  document.getElementById("filtre-type").value = "";
  document.getElementById("filtre-versant").value = "";
  document.querySelectorAll('#filtre-secteurs input[name="secteur"]').forEach((checkbox) => {
    checkbox.checked = false;
  });
  appliquerFiltres();
}

document.addEventListener("DOMContentLoaded", afficherEmployeurs);
