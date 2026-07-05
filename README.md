# Foodandish

Foodandish is a recipe lottery app. Press `Spin` and the slot reel recommends what to cook next.

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

## Import Recipes

Foodandish uses selected JSON recipes from the public GitHub dataset [`dpapathanasiou/recipes`](https://github.com/dpapathanasiou/recipes), including Iranian/Persian and international dishes. Each app record keeps the original `sourceUrl` for attribution and follow-through.

Place JSON recipe files from that repository under `data/raw/recipes/`, then run:

```bash
npm run import:recipes
```

The script writes normalized app-ready data to `src/data/recipes.generated.json`.

## Build

```bash
npm run build
```

The static output is generated in `dist/` and is ready for GitHub Pages.
