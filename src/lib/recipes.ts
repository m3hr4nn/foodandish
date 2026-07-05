import type { Recipe } from '../types';

export function pickRandomRecipe(
  recipes: Recipe[],
  previousId?: string,
  random = Math.random
): Recipe {
  if (recipes.length === 0) {
    throw new Error('Cannot pick a recipe from an empty list.');
  }

  if (recipes.length === 1) {
    return recipes[0];
  }

  const candidates = recipes.filter((recipe) => recipe.id !== previousId);
  const index = Math.floor(random() * candidates.length);
  return candidates[index];
}

export function getReelItems(recipes: Recipe[], selected: Recipe): Recipe[] {
  const filler = recipes.filter((recipe) => recipe.id !== selected.id);
  const cycle = [...filler, selected];
  return [...cycle, ...cycle, ...cycle, ...cycle, selected];
}
