// Cartographie du secteur public — chargement et mise en forme des données JSON

const CHEMIN_DATA = "data/";

async function chargerJSON(nomFichier) {
  const url = `${CHEMIN_DATA}${nomFichier}`;
  let reponse;
  try {
    reponse = await fetch(url, { cache: "no-store" });
  } catch (erreur) {
    throw new Error(`Impossible de contacter ${url} : ${erreur.message}`);
  }
  if (!reponse.ok) {
    throw new Error(`Erreur ${reponse.status} en chargeant ${url}`);
  }
  try {
    return await reponse.json();
  } catch (erreur) {
    throw new Error(`Le fichier ${url} ne contient pas du JSON valide : ${erreur.message}`);
  }
}

export async function chargerEmployeurs() {
  return chargerJSON("employeurs.json");
}

export async function chargerConcours() {
  return chargerJSON("concours.json");
}

export async function chargerSecteurs() {
  const donnees = await chargerJSON("secteurs.json");
  return donnees.secteurs;
}

export async function chargerVersants() {
  const donnees = await chargerJSON("versants.json");
  return donnees.versants;
}

export async function chargerTypesEmployeurs() {
  const donnees = await chargerJSON("types-employeurs.json");
  return donnees.types;
}

export async function chargerFilieres() {
  const donnees = await chargerJSON("filieres.json");
  return donnees.filieres;
}

export async function chargerCategories() {
  const donnees = await chargerJSON("categories.json");
  return donnees.categories;
}

export async function chargerTypesConcours() {
  const donnees = await chargerJSON("types-concours.json");
  return donnees.types;
}

// --- Fonctions utilitaires : conversion id -> libellé ---

function trouverLibelle(liste, id) {
  const item = liste.find((element) => element.id === id);
  return item ? item.libelle : id;
}

export function libelleVersant(versants, id) {
  return trouverLibelle(versants, id);
}

export function libelleTypeEmployeur(types, id) {
  return trouverLibelle(types, id);
}

export function libelleFiliere(filieres, id) {
  return trouverLibelle(filieres, id);
}

export function libelleCategorie(categories, id) {
  return trouverLibelle(categories, id);
}

export function libelleSecteur(secteurs, id) {
  const secteur = secteurs.find((element) => element.id === id);
  if (!secteur) {
    return id;
  }
  return secteur.emoji ? `${secteur.emoji} ${secteur.libelle}` : secteur.libelle;
}
