# Foodandish

Foodandish is a recipe lottery app. Press `Spin`, wait three seconds, and the slot reel recommends what to cook next.

## Development

```bash
npm install
npm run dev
```

## Import Recipes

Place JSON recipe files from `dpapathanasiou/recipes` under `data/raw/recipes/`, then run:

```bash
npm run import:recipes
```

The script writes normalized app-ready data to `src/data/recipes.generated.json`.

## Build

```bash
npm run build
```

The static output is generated in `dist/` and is ready for GitHub Pages. The app uses `public/CNAME` for `foodandish.ir`; remove or edit that file if deploying without the custom domain.
