import type { Recipe } from '../types';

export const recipes: Recipe[] = [
  {
    id: 'a-1-chicken-soup',
    title: 'A-1 Chicken Soup',
    tags: ['chicken', 'soup'],
    ingredients: [
      '2 tablespoons vegetable oil',
      '2 skinless chicken leg quarters',
      '1/2 cup chopped onion',
      '2 quarts water',
      '3 cubes chicken bouillon',
      '1 stalk celery',
      '3 carrots',
      '1 clove roasted garlic',
      'salt and pepper',
      '1 package thin egg noodles'
    ],
    directions: [
      'Brown chicken, add onion, water, and bouillon, then simmer.',
      'Add vegetables and noodles, return chicken meat, and serve warm.'
    ],
    source: 'allrecipes.com',
    sourceUrl: 'http://allrecipes.com/recipe/25651/a-1-chicken-soup/',
    language: 'en-US'
  },
  {
    id: 'fragrant-spicy-rice',
    title: 'Fragrant Spicy Rice',
    tags: ['rice', 'spicy', 'vegetarian'],
    ingredients: ['rice', 'spices', 'vegetables'],
    directions: ['Cook rice with aromatics and spices until tender.'],
    source: 'sample',
    sourceUrl: '#recipe-fragrant-spicy-rice',
    language: 'en-US'
  },
  {
    id: 'acorn-squash-risotto',
    title: 'Acorn Squash Risotto',
    tags: ['vegetarian', 'risotto', 'squash'],
    ingredients: ['acorn squash', 'rice', 'stock', 'parmesan'],
    directions: ['Stir rice with stock and squash until creamy.'],
    source: 'sample',
    sourceUrl: '#recipe-acorn-squash-risotto',
    language: 'en-US'
  },
  {
    id: 'chicken-parmesan',
    title: '20 Minute Chicken Parmesan',
    tags: ['chicken', 'quick'],
    ingredients: ['chicken', 'tomato sauce', 'mozzarella', 'parmesan'],
    directions: ['Cook chicken, top with sauce and cheese, then melt.'],
    source: 'sample',
    sourceUrl: '#recipe-chicken-parmesan',
    language: 'en-US'
  }
];
