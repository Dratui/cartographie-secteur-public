// Cartographie du secteur public — combinaison de critères de filtrage
// ET entre critères différents, OU entre valeurs d'un même critère à choix multiple

export function filtrerParCriteres(items, predicats) {
  return items.filter((item) => predicats.every((predicat) => predicat(item)));
}

// Filtre à valeur unique (select) : ignoré si valeurSelectionnee est vide
export function creerPredicatEgalite(champ, valeurSelectionnee) {
  return (item) => !valeurSelectionnee || item[champ] === valeurSelectionnee;
}

// Filtre à choix multiple (checkboxes) sur un champ tableau : OU entre les valeurs sélectionnées,
// ignoré si aucune valeur n'est sélectionnée
export function creerPredicatIntersection(champ, valeursSelectionnees) {
  return (item) =>
    valeursSelectionnees.length === 0 ||
    item[champ].some((valeur) => valeursSelectionnees.includes(valeur));
}
