import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const apiKey = process.env.THEMEALDB_API_KEY || '1';
const outputFile = path.resolve(process.env.RECIPES_OUTPUT ?? 'src/data/recipes.generated.json');
const mealIds = (process.env.THEMEALDB_MEAL_IDS ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const baseUrl = `https://www.themealdb.com/api/json/v1/${encodeURIComponent(apiKey)}`;

const meals = mealIds.length > 0
  ? (await Promise.all(mealIds.map((id) => fetchJson(`${baseUrl}/lookup.php?i=${encodeURIComponent(id)}`)))).flat()
  : (await Promise.all('abcdefghijklmnopqrstuvwxyz'.split('').map((letter) =>
      fetchJson(`${baseUrl}/search.php?f=${letter}`)
    ))).flat();

const recipes = dedupe(meals.map(normalizeMeal).filter(Boolean));

if (recipes.length === 0) {
  throw new Error('Recipe sync returned no valid recipes; keeping the existing dataset.');
}

await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(recipes, null, 2)}\n`);
console.log(`Synced ${recipes.length} recipes into ${outputFile}`);

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Recipe provider returned HTTP ${response.status}`);
    }
    const payload = await response.json();
    return payload.meals ?? [];
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeMeal(meal) {
  if (!meal?.idMeal || !meal.strMeal) {
    return null;
  }

  const ingredients = [];
  for (let index = 1; index <= 20; index += 1) {
    const name = meal[`strIngredient${index}`]?.trim();
    const measure = meal[`strMeasure${index}`]?.trim();
    if (name) {
      ingredients.push(measure ? `${measure} ${name}` : name);
    }
  }

  const tags = (meal.strTags ?? '')
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  return {
    id: `themealdb-${meal.idMeal}`,
    title: meal.strMeal.trim(),
    cuisine: meal.strArea === 'Iranian' || meal.strArea === 'Persian' ? 'Iranian' : 'International',
    tags: [...new Set([...tags, meal.strCategory?.toLowerCase()].filter(Boolean))].sort(),
    ingredients,
    directions: String(meal.strInstructions ?? '').split(/\r?\n/).map((step) => step.trim()).filter(Boolean),
    source: 'TheMealDB',
    sourceUrl: meal.strSource || `https://www.themealdb.com/meal/${meal.idMeal}`,
    language: 'en-US',
    imageUrl: meal.strMealThumb || undefined
  };
}

function dedupe(recipes) {
  return [...new Map(recipes.map((recipe) => [recipe.id, recipe])).values()];
}
