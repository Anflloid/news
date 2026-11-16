import type { Article, Category } from '../types';

export const categories: Category[] = [
  { id: 1, name: 'Технології', slug: 'tech', color: '#2563eb' },
  { id: 3, name: 'Спорт', slug: 'sport', color: '#15803d' },
];

export function makeArticle(id: number, title: string, overrides: Partial<Article> = {}): Article {
  return {
    id,
    title,
    summary: 'Короткий опис новини',
    content: 'Перший абзац статті.\n\nДругий абзац статті.',
    image: '/images/tech.svg',
    categoryId: 1,
    category: categories[0],
    authorName: 'Адміністратор',
    views: 10,
    createdAt: '2026-11-10T10:00:00.000Z',
    rating: { average: 4, count: 2 },
    commentsCount: 1,
    ...overrides,
  };
}
