import type { Recipe } from '../types';

export type RecommendationFilters = {
  ingredients: string[];
  cuisine: 'all' | Recipe['cuisine'];
  tag: string;
  maxTime: number | null;
};

export type Recommendation = {
  recipe: Recipe;
  matchedIngredients: string[];
  missingIngredients: string[];
  score: number;
};

const normalize = (value: string) => value.trim().toLowerCase();

export function recommendRecipes(
  recipes: Recipe[],
  filters: RecommendationFilters
): Recommendation[] {
  const wanted = filters.ingredients.map(normalize).filter(Boolean);

  return recipes
    .filter((recipe) => {
      if (filters.cuisine !== 'all' && recipe.cuisine !== filters.cuisine) {
        return false;
      }
      if (filters.tag && !recipe.tags.includes(filters.tag)) {
        return false;
      }
      return filters.maxTime === null ||
        (recipe.timeMinutes !== undefined && recipe.timeMinutes <= filters.maxTime);
    })
    .map((recipe) => {
      const ingredientText = recipe.ingredients.map(normalize);
      const matchedIngredients = wanted.filter((item) =>
        ingredientText.some((ingredient) => ingredient.includes(item))
      );
      const missingIngredients = ingredientText
        .filter((ingredient) => wanted.length > 0 && !wanted.some((item) => ingredient.includes(item)))
        .slice(0, 5);
      const score = wanted.length === 0
        ? 0
        : Math.round((matchedIngredients.length / wanted.length) * 100);

      return { recipe, matchedIngredients, missingIngredients, score };
    })
    .sort((left, right) => right.score - left.score || left.recipe.title.localeCompare(right.recipe.title));
}

export function getRecipeTags(recipes: Recipe[]): string[] {
  return [...new Set(recipes.flatMap((recipe) => recipe.tags))].sort();
}
