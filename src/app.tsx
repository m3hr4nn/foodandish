import { useMemo, useState, type FormEvent } from 'react';
import { recipes } from './data/recipes';
import { getReelItems, pickRandomRecipe } from './lib/recipes';
import { getRecipeTags, recommendRecipes, type Recommendation } from './lib/recommend';
import type { Recipe } from './types';

const spinDurationMs = 900;

export default function App() {
  const [pantryInput, setPantryInput] = useState('');
  const [pantryIngredients, setPantryIngredients] = useState<string[]>([]);
  const [cuisine, setCuisine] = useState<'all' | Recipe['cuisine']>('all');
  const [tag, setTag] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(recipes[0] ?? null);
  const [visibleRecommendation, setVisibleRecommendation] = useState<Recommendation | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('foodandish:favorites') ?? '[]');
    } catch {
      return [];
    }
  });

  const tags = useMemo(() => getRecipeTags(recipes), []);
  const recommendations = useMemo(
    () => recommendRecipes(recipes, { ingredients: pantryIngredients, cuisine, tag, maxTime: null }),
    [pantryIngredients, cuisine, tag]
  );
  const reelItems = useMemo(
    () => selectedRecipe ? getReelItems(recipes, selectedRecipe) : [],
    [selectedRecipe]
  );
  const reelOffset = reelItems.length > 0 ? `-${(reelItems.length - 1) * 104}px` : '0px';
  const activeRecipe = visibleRecommendation?.recipe ?? null;

  function addPantryIngredient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = pantryInput.split(',').map((item) => item.trim()).filter(Boolean);
    setPantryIngredients((current) => [...new Set([...current, ...next])]);
    setPantryInput('');
  }

  function removePantryIngredient(value: string) {
    setPantryIngredients((current) => current.filter((item) => item !== value));
  }

  function spin() {
    if (isSpinning || recommendations.length === 0) return;
    const candidatePool = recommendations.slice(0, Math.min(5, recommendations.length));
    const next = pickRandomRecipe(candidatePool.map((item) => item.recipe), selectedRecipe?.id);
    const recommendation = recommendations.find((item) => item.recipe.id === next.id) ?? recommendations[0];
    setSelectedRecipe(next);
    setVisibleRecommendation(null);
    setIsSpinning(true);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(() => {
      setVisibleRecommendation(recommendation);
      setIsSpinning(false);
    }, reducedMotion ? 20 : spinDurationMs);
  }

  function toggleFavorite(recipe: Recipe) {
    setFavorites((current) => {
      const next = current.includes(recipe.id)
        ? current.filter((id) => id !== recipe.id)
        : [...current, recipe.id];
      localStorage.setItem('foodandish:favorites', JSON.stringify(next));
      return next;
    });
  }

  return (
    <main className="page-shell">
      <section className="hero" aria-labelledby="page-title">
        <header className="compact-hero">
          <p className="eyebrow">Foodandish</p>
          <h1 id="page-title">Cook something you already have.</h1>
          <p className="intro">Add a few ingredients and get a practical recipe recommendation.</p>
        </header>

        <section className="planner-card" aria-labelledby="planner-title">
          <div className="section-heading">
            <div><span className="result-label">Your kitchen</span><h2 id="planner-title">What should we use?</h2></div>
            <span className="catalog-note">{recipes.length} recipes in the catalog</span>
          </div>
          <form className="pantry-form" onSubmit={addPantryIngredient}>
            <label htmlFor="pantry-input">Ingredients you have</label>
            <div className="input-row">
              <input id="pantry-input" value={pantryInput} onChange={(event) => setPantryInput(event.target.value)} placeholder="rice, chicken, onion" />
              <button type="submit" className="secondary-button">Add</button>
            </div>
            <p className="helper-text">Separate ingredients with commas. Leave empty to explore everything.</p>
          </form>
          {pantryIngredients.length > 0 ? <div className="ingredient-list" aria-label="Selected ingredients">
            {pantryIngredients.map((ingredient) => <button type="button" className="ingredient-chip" key={ingredient} onClick={() => removePantryIngredient(ingredient)}>{ingredient} <span aria-hidden="true">×</span></button>)}
          </div> : null}
          <div className="filters">
            <label>Cuisine<select value={cuisine} onChange={(event) => setCuisine(event.target.value as typeof cuisine)}><option value="all">Any cuisine</option><option value="Iranian">Iranian</option><option value="International">International</option></select></label>
            <label>Category<select value={tag} onChange={(event) => setTag(event.target.value)}><option value="">Any category</option>{tags.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          </div>
        </section>

        <section className="slot-machine" aria-busy={isSpinning} aria-labelledby="reel-title">
          <div className="slot-top" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /></div>
          <div className="slot-title" id="reel-title">Tonight&apos;s table</div>
          <div className="slot-window"><div className={isSpinning ? 'reel reel-spinning' : 'reel'} style={{ ['--reel-offset' as string]: reelOffset }}>{reelItems.map((recipe, index) => <div className="reel-item" key={`${recipe.id}-${index}`}><span>{recipe.title}</span></div>)}</div></div>
          <div className="result-panel" aria-live="polite">
            <span className="result-label">{isSpinning ? 'Finding a match' : 'Recommendation'}</span>
            <strong>{isSpinning ? 'Shuffling dishes' : activeRecipe?.title ?? 'Ready when you are'}</strong>
            <p>{isSpinning ? 'Locking onto a recipe from your filters.' : activeRecipe ? `${visibleRecommendation?.score ?? 0}% ingredient match` : `${recommendations.length} recipes match your filters.`}</p>
          </div>
          <div className="slot-handle" aria-hidden="true"><span /></div>
        </section>

        <div className="actions">
          <button type="button" onClick={spin} disabled={isSpinning || recommendations.length === 0}>{isSpinning ? 'Finding...' : 'Recommend a recipe'}</button>
          {activeRecipe ? <button type="button" className="secondary-button" onClick={() => toggleFavorite(activeRecipe)}>{favorites.includes(activeRecipe.id) ? 'Saved' : 'Save recipe'}</button> : null}
        </div>
        {activeRecipe && visibleRecommendation ? <RecipeDetail recommendation={visibleRecommendation} isFavorite={favorites.includes(activeRecipe.id)} onFavorite={() => toggleFavorite(activeRecipe)} /> : <p className="empty-state">Your recommendation will appear here. The catalog is refreshed weekly.</p>}
      </section>
    </main>
  );
}

function RecipeDetail({ recommendation, isFavorite, onFavorite }: { recommendation: Recommendation; isFavorite: boolean; onFavorite: () => void }) {
  const { recipe, matchedIngredients, missingIngredients } = recommendation;
  return <article className="recipe-detail" id="recipe-detail" aria-labelledby="recipe-title">
    <div className="detail-heading"><div><span className="result-label">Recipe</span><h2 id="recipe-title">{recipe.title}</h2><p><span className="cuisine-badge">{recipe.cuisine}</span>{recipe.tags.slice(0, 6).join(' / ')}</p></div><button type="button" className="text-button" onClick={onFavorite}>{isFavorite ? 'Remove saved recipe' : 'Save recipe'}</button></div>
    {matchedIngredients.length > 0 ? <p className="match-note">Uses: {matchedIngredients.join(', ')}</p> : null}
    {missingIngredients.length > 0 ? <p className="missing-note">You may need: {missingIngredients.join(', ')}</p> : null}
    <div className="recipe-grid"><section><h3>Ingredients</h3><ul>{recipe.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}</ul></section><section><h3>Directions</h3><ol>{recipe.directions.map((step) => <li key={step}>{step}</li>)}</ol></section></div>
    {recipe.sourceUrl.startsWith('http') ? <a className="source-link" href={recipe.sourceUrl}>View original source on {recipe.source}</a> : null}
  </article>;
}
