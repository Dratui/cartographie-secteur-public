// Cartographie du secteur public — comportement du menu déroulant "Secteurs"
// Le panneau (fieldset) reste la source de vérité pour les cases à cocher :
// ce module ne fait qu'ouvrir/fermer son affichage et mettre à jour le libellé du bouton.

export function initialiserMenuSecteurs(bouton, panneau) {
  function fermerPanneau() {
    panneau.hidden = true;
    bouton.setAttribute("aria-expanded", "false");
  }

  function ouvrirPanneau() {
    panneau.hidden = false;
    bouton.setAttribute("aria-expanded", "true");
  }

  bouton.addEventListener("click", (evenement) => {
    evenement.stopPropagation();
    if (panneau.hidden) {
      ouvrirPanneau();
    } else {
      fermerPanneau();
    }
  });

  panneau.addEventListener("click", (evenement) => evenement.stopPropagation());

  document.addEventListener("click", () => {
    if (!panneau.hidden) {
      fermerPanneau();
    }
  });

  document.addEventListener("keydown", (evenement) => {
    if (evenement.key === "Escape" && !panneau.hidden) {
      fermerPanneau();
      bouton.focus();
    }
  });
}

export function mettreAJourLibelleBoutonSecteurs(bouton, nombreSelectionnes) {
  if (nombreSelectionnes === 0) {
    bouton.textContent = "Secteurs";
  } else if (nombreSelectionnes === 1) {
    bouton.textContent = "1 secteur sélectionné";
  } else {
    bouton.textContent = nombreSelectionnes + " secteurs sélectionnés";
  }
}
