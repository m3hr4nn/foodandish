import { describe, expect, it } from 'vitest';
import { recommendRecipes } from './recommend';
import type { Recipe } from '../types';

const recipe = (id: string, title: string, ingredients: string[], tags: string[] = []): Recipe => ({
  id,
  title,
  cuisine: 'International',
  tags,
  ingredients,
  directions: [],
  source: 'test',
  sourceUrl: 'https://example.test',
  language: 'en-US'
});

describe('recommendRecipes', () => {
  it('ranks recipes by matching pantry ingredients', () => {
    const results = recommendRecipes([
      recipe('a', 'Rice bowl', ['rice', 'egg']),
      recipe('b', 'Toast', ['bread'])
    ], { ingredients: ['rice'], cuisine: 'all', tag: '', maxTime: null });

    expect(results[0].recipe.id).toBe('a');
    expect(results[0].matchedIngredients).toEqual(['rice']);
  });

  it('applies cuisine and tag filters', () => {
    expect(recommendRecipes([recipe('a', 'Soup', ['water'], ['soup'])], {
      ingredients: [], cuisine: 'Iranian', tag: 'soup', maxTime: null
    })).toHaveLength(0);
  });
});
