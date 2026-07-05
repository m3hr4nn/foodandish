import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const args = parseArgs(process.argv.slice(2));
const inputDir = path.resolve(args.input ?? 'data/raw/recipes');
const outputFile = path.resolve(args.output ?? 'src/data/recipes.generated.json');
const limit = Number(args.limit ?? 500);

const tagRules = {
  beef: ['beef', 'steak'],
  chicken: ['chicken'],
  dessert: ['cake', 'cookie', 'pudding', 'dessert', 'ice cream'],
  pasta: ['pasta', 'noodle', 'spaghetti', 'macaroni'],
  rice: ['rice', 'risotto'],
  seafood: ['fish', 'salmon', 'shrimp', 'tuna', 'cod'],
  soup: ['soup', 'stew'],
  vegetarian: ['vegetable', 'mushroom', 'squash', 'lentil', 'tofu']
};

const files = await findJsonFiles(inputDir);
const recipes = [];

for (const file of files) {
  if (recipes.length >= limit) {
    break;
  }

  const rawRecipe = JSON.parse(await readFile(file, 'utf8'));
  const recipe = normalizeRecipe(rawRecipe, file);

  if (recipe) {
    recipes.push(recipe);
  }
}

await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(recipes, null, 2)}\n`);

console.log(`Imported ${recipes.length} recipes into ${outputFile}`);

async function findJsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await findJsonFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(entryPath);
    }
  }

  return files.sort();
}

function normalizeRecipe(rawRecipe, file) {
  const title = asText(rawRecipe.title);
  const sourceUrl = asText(rawRecipe.url);

  if (!title || !sourceUrl) {
    return null;
  }

  const ingredients = asTextArray(rawRecipe.ingredients);
  const directions = asTextArray(rawRecipe.directions);

  return {
    id: slugify(path.basename(file, '.json') || title),
    title,
    tags: inferTags([...asTextArray(rawRecipe.tags), title, ...ingredients]),
    ingredients,
    directions,
    source: asText(rawRecipe.source) || getHostname(sourceUrl),
    sourceUrl,
    language: asText(rawRecipe.language) || 'en-US'
  };
}

function inferTags(values) {
  const text = values.join(' ').toLowerCase();
  const tags = new Set();

  for (const [tag, patterns] of Object.entries(tagRules)) {
    if (patterns.some((pattern) => text.includes(pattern))) {
      tags.add(tag);
    }
  }

  return [...tags].sort();
}

function asText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function asTextArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item) => typeof item === 'string').map((item) => item.trim());
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getHostname(value) {
  try {
    return new URL(value).hostname;
  } catch {
    return 'unknown';
  }
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith('--')) {
      continue;
    }

    parsed[token.slice(2)] = argv[index + 1];
    index += 1;
  }

  return parsed;
}
