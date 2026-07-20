// Cartographie du secteur public — logique de la page employeur-detail.html

import {
  chargerEmployeurs,
  chargerVersants,
  chargerTypesEmployeurs,
  chargerConcours,
  libelleVersant,
  libelleTypeEmployeur,
  libelleSecteur,
} from "./data-loader.js";

async function afficherFicheEmployeur() {
  const conteneur = document.getElementById("fiche-employeur");
  const idEmployeur = new URLSearchParams(window.location.search).get("id");

  try {
    const [employeurs, versants, types, concours] = await Promise.all([
      chargerEmployeurs(),
      chargerVersants(),
      chargerTypesEmployeurs(),
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
    conteneur.appendChild(creerSectionConcours(employeur, concours));
  } catch (erreur) {
    conteneur.textContent = "Erreur lors du chargement de la fiche : " + erreur.message;
  }
}

function afficherEmployeurIntrouvable(conteneur) {
  conteneur.textContent = "";

  const message = document.createElement("p");
  message.textContent = "Employeur introuvable.";
  conteneur.appendChild(message);

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

  const secteurs = document.createElement("p");
  const libellesSecteurs = employeur.secteur.map(libelleSecteur).join(", ");
  secteurs.textContent = "Secteurs : " + (libellesSecteurs || "Non renseigné");
  fiche.appendChild(secteurs);

  const description = document.createElement("p");
  description.textContent = "Description : " + (employeur.description || "Non renseignée");
  fiche.appendChild(description);

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
