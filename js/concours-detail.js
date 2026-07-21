// Cartographie du secteur public — logique de la page concours-detail.html

import {
  chargerConcours,
  chargerVersants,
  chargerFilieres,
  chargerCategories,
  chargerSecteurs,
  chargerEmployeurs,
  libelleVersant,
  libelleFiliere,
  libelleCategorie,
  libelleSecteur,
} from "./data-loader.js";

async function afficherFicheConcours() {
  const conteneur = document.getElementById("fiche-concours");
  const idConcours = new URLSearchParams(window.location.search).get("id");

  try {
    const [concoursListe, versants, filieres, categories, secteurs, employeurs] = await Promise.all([
      chargerConcours(),
      chargerVersants(),
      chargerFilieres(),
      chargerCategories(),
      chargerSecteurs(),
      chargerEmployeurs(),
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

  const type = document.createElement("p");
  type.textContent = "Type : " + concours.type;
  fiche.appendChild(type);

  const filiere = document.createElement("p");
  filiere.textContent = "Filière : " + libelleFiliere(filieres, concours.filiere);
  fiche.appendChild(filiere);

  const versant = document.createElement("p");
  versant.textContent = "Versant : " + libelleVersant(versants, concours.versant);
  fiche.appendChild(versant);

  const niveau = document.createElement("p");
  niveau.textContent = "Niveau requis : " + concours.niveauRequis;
  fiche.appendChild(niveau);

  const secteurs = document.createElement("p");
  const libellesSecteurs = concours.secteur.map((id) => libelleSecteur(secteursRef, id)).join(", ");
  secteurs.textContent = "Secteurs : " + (libellesSecteurs || "Non renseigné");
  fiche.appendChild(secteurs);

  const description = document.createElement("p");
  description.textContent = "Description : " + (concours.description || "Non renseignée");
  fiche.appendChild(description);

  if (concours.siteWeb) {
    const lien = document.createElement("a");
    lien.className = "lien-siteweb";
    lien.href = concours.siteWeb;
    lien.textContent = "Site web";
    lien.target = "_blank";
    lien.rel = "noopener";
    fiche.appendChild(lien);
  }

  return fiche;
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
