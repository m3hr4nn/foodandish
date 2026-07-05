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
  const reelOffset = `-${(reelItems.length - 1) * 104}px`;

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

        <div className="slot-machine" aria-busy={isSpinning} aria-live="polite">
          <div className="slot-top" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="slot-title">
            <span>Tonight's table</span>
          </div>

          <div className="slot-window">
            <div
              className={isSpinning ? 'reel reel-spinning' : 'reel'}
              style={{ ['--reel-offset' as string]: reelOffset }}
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
              {isSpinning ? 'Rolling' : 'Recommended dish'}
            </span>
            <strong>{isSpinning ? 'Shuffling dishes' : visibleRecipe.title}</strong>
            <p>
              {isSpinning
                ? 'Watch the reel lock onto a plate.'
                : `${visibleRecipe.cuisine} / ${visibleRecipe.tags.slice(0, 4).join(' / ')}`}
            </p>
          </div>

          <div className="slot-handle" aria-hidden="true">
            <span />
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
            <p>
              <span className="cuisine-badge">{visibleRecipe.cuisine}</span>
              {visibleRecipe.tags.slice(0, 6).join(' / ')}
            </p>
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
