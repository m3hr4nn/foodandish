import { describe, expect, it } from 'vitest';
import { getReelItems, pickRandomRecipe } from './recipes';
import type { Recipe } from '../types';

const recipes: Recipe[] = [
  recipe('one', 'One'),
  recipe('two', 'Two'),
  recipe('three', 'Three')
];

describe('pickRandomRecipe', () => {
  it('returns a recipe from the list', () => {
    expect(pickRandomRecipe(recipes, undefined, () => 0.6).id).toBe('two');
  });

  it('avoids repeating the previous recipe when alternatives exist', () => {
    expect(pickRandomRecipe(recipes, 'one', () => 0).id).toBe('two');
  });

  it('throws for an empty list', () => {
    expect(() => pickRandomRecipe([])).toThrow('empty list');
  });
});

describe('getReelItems', () => {
  it('places the selected recipe last so the reel lands on it', () => {
    expect(getReelItems(recipes, recipes[1]).at(-1)?.id).toBe('two');
  });
});

function recipe(id: string, title: string): Recipe {
  return {
    id,
    title,
    cuisine: 'International',
    tags: [],
    ingredients: [],
    directions: [],
    source: 'test',
    sourceUrl: '#',
    language: 'en-US'
  };
}
