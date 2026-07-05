export type Recipe = {
  id: string;
  title: string;
  cuisine: 'Iranian' | 'International';
  tags: string[];
  ingredients: string[];
  directions: string[];
  source: string;
  sourceUrl: string;
  language: string;
};
