# Foodandish

Foodandish recommends recipes from the ingredients you already have. It is a static,
zero-backend application: a weekly GitHub Actions job refreshes the recipe catalog,
then GitHub Pages serves the generated app.

Live site: https://m3hr4nn.github.io/foodandish/

## Tech Stack

- Vite for the static frontend build.
- React for UI state and rendering.
- TypeScript for typed recipe data and app logic.
- Plain CSS for the dark slot-machine interface.
- Vitest for unit tests.
- ESLint for static checks.
- GitHub Actions and GitHub Pages for deployment.

## Development

```bash
npm install
npm run dev
```

Use the values from `.env.example` as shell environment variables before running a sync
(`.env.local` is not loaded automatically by the Node script):

```bash
export THEMEALDB_API_KEY=1
npm run sync:recipes
npm run build
```

The browser never calls the provider API. The sync runs at build time, so no API key
is shipped to users. For GitHub Actions, add `THEMEALDB_API_KEY` under repository
Settings → Secrets and variables → Actions. The workflow uses `1` as a development
fallback; review TheMealDB’s current terms before using a supporter key publicly.

## Recipe catalog

The checked-in `src/data/recipes.generated.json` is the build-time catalog. The
weekly sync currently uses the official [TheMealDB API](https://www.themealdb.com/docs_api_guide.php)
and normalizes its response before the app reads it. The original source URL and
provider name are preserved for attribution.

To sync a small deterministic set locally:

```bash
THEMEALDB_MEAL_IDS=52772,53013 npm run sync:recipes
```

The application falls back to its curated starter recipes when the generated catalog
is empty, so a fresh clone remains usable before the first sync.

## Build

```bash
npm run build
```

The static output is generated in `dist/` and is ready for GitHub Pages.

## Current scope

- Recommendations, filters, pantry matching, and favorites are client-side.
- Favorites are stored only in the visitor’s browser; there is no account or database.
- The catalog is refreshed weekly, not live.
- Provider content and images remain subject to the provider’s terms and attribution requirements.
