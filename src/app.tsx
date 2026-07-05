import { useMemo, useState } from 'react';
import { recipes } from './data/recipes';
import { getReelItems, pickRandomRecipe } from './lib/recipes';
import type { Recipe } from './types';

const spinDurationMs = 3000;

export default function App() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(recipes[0]);
  const [visibleRecipe, setVisibleRecipe] = useState<Recipe>(recipes[0]);
  const [isSpinning, setIsSpinning] = useState(false);

  const reelItems = useMemo(
    () => getReelItems(recipes, selectedRecipe),
    [selectedRecipe]
  );

  function spin() {
    if (isSpinning) {
      return;
    }

    const nextRecipe = pickRandomRecipe(recipes, selectedRecipe.id);
    setSelectedRecipe(nextRecipe);
    setIsSpinning(true);

    window.setTimeout(() => {
      setVisibleRecipe(nextRecipe);
      setIsSpinning(false);
    }, spinDurationMs);
  }

  return (
    <main className="page-shell">
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">Foodandish</p>
        <h1 id="page-title">Spin the reel. Find your next dish.</h1>
        <p className="intro">
          A recipe lottery for the moments when deciding what to cook takes
          longer than cooking.
        </p>

        <div className="slot-machine" aria-live="polite">
          <div className="slot-window">
            <div
              className={isSpinning ? 'reel reel-spinning' : 'reel'}
              style={{ ['--reel-items' as string]: reelItems.length }}
            >
              {reelItems.map((recipe, index) => (
                <div className="reel-item" key={`${recipe.id}-${index}`}>
                  <span>{recipe.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="result-panel">
            <span className="result-label">
              {isSpinning ? 'Finding a dish...' : 'Recommended dish'}
            </span>
            <strong>{isSpinning ? 'Reel is spinning' : visibleRecipe.title}</strong>
            <p>
              {isSpinning
                ? 'Your answer lands in 3 seconds.'
                : visibleRecipe.tags.join(' / ')}
            </p>
          </div>
        </div>

        <div className="actions">
          <button type="button" onClick={spin} disabled={isSpinning}>
            {isSpinning ? 'Spinning...' : 'Spin'}
          </button>
          <a
            className={isSpinning ? 'recipe-link disabled' : 'recipe-link'}
            href="#recipe-detail"
            aria-disabled={isSpinning}
            onClick={(event) => {
              if (isSpinning) {
                event.preventDefault();
              }
            }}
          >
            Get recipe
          </a>
        </div>

        <article className="recipe-detail" id="recipe-detail">
          <div>
            <span className="result-label">Recipe</span>
            <h2>{visibleRecipe.title}</h2>
            <p>{visibleRecipe.tags.join(' / ')}</p>
          </div>

          <div className="recipe-grid">
            <section>
              <h3>Ingredients</h3>
              <ul>
                {visibleRecipe.ingredients.map((ingredient) => (
                  <li key={ingredient}>{ingredient}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3>Directions</h3>
              <ol>
                {visibleRecipe.directions.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>
          </div>

          {visibleRecipe.sourceUrl.startsWith('http') ? (
            <a className="source-link" href={visibleRecipe.sourceUrl}>
              View original source on {visibleRecipe.source}
            </a>
          ) : null}
        </article>
      </section>
    </main>
  );
}
