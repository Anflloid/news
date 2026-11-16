import * as api from '../api/api';

const mockFetch = jest.fn();

function jsonResponse(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) };
}

beforeEach(() => {
  mockFetch.mockReset();
  globalThis.fetch = mockFetch as unknown as typeof fetch;
  localStorage.clear();
});

describe('api.ts', () => {
  test('додає JWT-токен у заголовок Authorization', async () => {
    localStorage.setItem(api.TOKEN_KEY, 'abc123');
    mockFetch.mockResolvedValue(jsonResponse(200, { id: 1 }));

    await api.getMe();

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/auth/me');
    expect(options.headers.Authorization).toBe('Bearer abc123');
  });

  test('без токена заголовок Authorization не додається', async () => {
    mockFetch.mockResolvedValue(jsonResponse(200, []));
    await api.getCategories();
    expect(mockFetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  test('формує рядок запиту без порожніх параметрів', async () => {
    mockFetch.mockResolvedValue(jsonResponse(200, { items: [] }));
    await api.getArticles({ category: 'sport', search: '', page: 2 });
    expect(mockFetch.mock.calls[0][0]).toBe('/api/articles?category=sport&page=2');
  });

  test('при помилці кидає ApiError з текстом від сервера', async () => {
    mockFetch.mockResolvedValue(jsonResponse(401, { message: 'Невірний email або пароль' }));
    await expect(api.login('admin@news.ua', 'wrong')).rejects.toThrow('Невірний email або пароль');
  });

  test('ApiError містить HTTP-статус', async () => {
    mockFetch.mockResolvedValue(jsonResponse(403, { message: 'Доступ лише для адміністратора' }));
    await expect(api.deleteArticle(1)).rejects.toMatchObject({ status: 403 });
  });

  test('відповідь 204 (без тіла) повертає undefined', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 204, json: jest.fn() });
    await expect(api.deleteComment(5)).resolves.toBeUndefined();
  });

  test('якщо сервер недоступний, показує зрозуміле повідомлення', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(api.getCategories()).rejects.toThrow('Немає зʼєднання з сервером');
  });

  test.each([
    ['register', () => api.register('Іван', 'ivan@test.ua', '123456'), '/api/auth/register', 'POST'],
    ['getArticle', () => api.getArticle(7), '/api/articles/7', undefined],
    [
      'createArticle',
      () => api.createArticle({ title: 'a', summary: 'b', content: 'c', categoryId: 1 }),
      '/api/articles',
      'POST',
    ],
    [
      'updateArticle',
      () => api.updateArticle(7, { title: 'a', summary: 'b', content: 'c', categoryId: 1 }),
      '/api/articles/7',
      'PUT',
    ],
    ['getComments', () => api.getComments(7), '/api/articles/7/comments', undefined],
    ['addComment', () => api.addComment(7, 'Привіт'), '/api/articles/7/comments', 'POST'],
    ['rateArticle', () => api.rateArticle(7, 5), '/api/articles/7/rating', 'POST'],
  ])('%s звертається до правильної адреси', async (_name, call, url, method) => {
    mockFetch.mockResolvedValue(jsonResponse(200, {}));
    await call();
    expect(mockFetch.mock.calls[0][0]).toBe(url);
    expect(mockFetch.mock.calls[0][1].method).toBe(method);
  });

  test('тіло POST-запиту передається у форматі JSON', async () => {
    mockFetch.mockResolvedValue(jsonResponse(201, {}));
    await api.rateArticle(3, 4);
    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({ value: 4 });
  });
});
