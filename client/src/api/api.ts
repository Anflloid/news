import type { Article, ArticleFormData, ArticlesPage, Category, Comment, Rating, SortType, User } from '../types';

// Усі запити до сервера проходять через функцію request
const API_URL = '/api';
export const TOKEN_KEY = 'news_token';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(API_URL + url, { ...options, headers });
  } catch {
    throw new ApiError('Немає зʼєднання з сервером. Перевірте інтернет.', 0);
  }

  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data.message || 'Сталася помилка', response.status);
  }
  return data as T;
}

interface AuthResponse {
  token: string;
  user: User;
}

export const login = (email: string, password: string) =>
  request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const register = (name: string, email: string, password: string) =>
  request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

export const getMe = () => request<User>('/auth/me');

export const getCategories = () => request<Category[]>('/categories');

interface ArticlesParams {
  category?: string;
  search?: string;
  sort?: SortType;
  page?: number;
  limit?: number;
}

export function getArticles(params: ArticlesParams = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  return request<ArticlesPage>(`/articles?${query.toString()}`);
}

export const getArticle = (id: number) => request<Article>(`/articles/${id}`);

export const createArticle = (data: ArticleFormData) =>
  request<Article>('/articles', { method: 'POST', body: JSON.stringify(data) });

export const updateArticle = (id: number, data: ArticleFormData) =>
  request<Article>(`/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteArticle = (id: number) => request<void>(`/articles/${id}`, { method: 'DELETE' });

export const getComments = (articleId: number) => request<Comment[]>(`/articles/${articleId}/comments`);

export const addComment = (articleId: number, text: string) =>
  request<Comment>(`/articles/${articleId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });

export const deleteComment = (id: number) => request<void>(`/comments/${id}`, { method: 'DELETE' });

export const rateArticle = (articleId: number, value: number) =>
  request<Rating & { myRating: number }>(`/articles/${articleId}/rating`, {
    method: 'POST',
    body: JSON.stringify({ value }),
  });
