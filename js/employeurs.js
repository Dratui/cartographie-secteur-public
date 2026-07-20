// Cartographie du secteur public — logique de la page employeurs.html

import {
  chargerEmployeurs,
  chargerVersants,
  chargerTypesEmployeurs,
  libelleVersant,
  libelleTypeEmployeur,
  libelleSecteur,
} from "./data-loader.js";

async function afficherEmployeurs() {
  const conteneur = document.getElementById("liste-employeurs");

  try {
    const [employeurs, versants, types] = await Promise.all([
      chargerEmployeurs(),
      chargerVersants(),
      chargerTypesEmployeurs(),
    ]);

    conteneur.textContent = "";
    employeurs.forEach((employeur) => {
      conteneur.appendChild(creerCarteEmployeur(employeur, versants, types));
    });
  } catch (erreur) {
    conteneur.textContent = "Erreur lors du chargement des employeurs : " + erreur.message;
  }
}

function creerCarteEmployeur(employeur, versants, types) {
  const carte = document.createElement("article");
  carte.className = "carte-employeur";

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
  const libellesSecteurs = employeur.secteur.map(libelleSecteur).join(", ");
  secteurs.textContent = "Secteurs : " + (libellesSecteurs || "Non renseigné");
  carte.appendChild(secteurs);

  if (employeur.siteWeb) {
    const lien = document.createElement("a");
    lien.href = employeur.siteWeb;
    lien.textContent = "Site web";
    lien.target = "_blank";
    lien.rel = "noopener";
    carte.appendChild(lien);
  }

  return carte;
}

document.addEventListener("DOMContentLoaded", afficherEmployeurs);
