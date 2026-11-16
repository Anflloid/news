export type Role = 'user' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  articlesCount?: number;
}

export interface Rating {
  average: number;
  count: number;
}

export interface Article {
  id: number;
  title: string;
  summary: string;
  content?: string; // у списку статей не передається
  image: string;
  categoryId: number;
  category: Category | null;
  authorName: string;
  views: number;
  createdAt: string;
  rating: Rating;
  commentsCount: number;
  myRating?: number;
}

export interface Comment {
  id: number;
  articleId: number;
  userId: number;
  userName: string;
  text: string;
  createdAt: string;
}

export interface ArticlesPage {
  items: Article[];
  total: number;
  page: number;
  pages: number;
}

export type SortType = 'new' | 'popular' | 'rating';

export interface ArticleFormData {
  title: string;
  summary: string;
  content: string;
  categoryId: number;
}
