// У тестах база працює лише в пам'яті
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const { resetDb } = require('../src/db');

async function login(email, password) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token;
}

beforeEach(() => {
  resetDb();
});

describe('Автентифікація', () => {
  test('реєстрація нового користувача повертає токен', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Тест', email: 'test@test.ua', password: '123456' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe('user');
    expect(res.body.user.password).toBeUndefined();
  });

  test('не можна зареєструватися з коротким паролем', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Тест', email: 'test@test.ua', password: '123' });
    expect(res.status).toBe(400);
  });

  test('не можна зареєструватися двічі з одним email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Тест', email: 'admin@news.ua', password: '123456' });
    expect(res.status).toBe(409);
  });

  test('вхід з неправильним паролем повертає 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@news.ua', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  test('/me повертає поточного користувача за токеном', async () => {
    const token = await login('olena@news.ua', 'user123');
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('olena@news.ua');
  });
});

describe('Статті', () => {
  test('повертає список статей з пагінацією', async () => {
    const res = await request(app).get('/api/articles?limit=5');
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(5);
    expect(res.body.total).toBe(12);
    expect(res.body.pages).toBe(3);
  });

  test('фільтрує статті за категорією', async () => {
    const res = await request(app).get('/api/articles?category=sport');
    expect(res.body.items.every((a) => a.category.slug === 'sport')).toBe(true);
  });

  test('шукає статті за словом у заголовку', async () => {
    const res = await request(app).get('/api/articles?search=марафон');
    expect(res.body.total).toBe(1);
  });

  test('перегляд статті збільшує лічильник переглядів', async () => {
    const first = await request(app).get('/api/articles/1');
    const second = await request(app).get('/api/articles/1');
    expect(second.body.views).toBe(first.body.views + 1);
  });

  test('звичайний користувач не може створити статтю', async () => {
    const token = await login('olena@news.ua', 'user123');
    const res = await request(app).post('/api/articles').set('Authorization', `Bearer ${token}`).send({
      title: 'Тестова стаття',
      summary: 'Короткий опис статті',
      content: 'Текст статті достатньої довжини',
      categoryId: 1,
    });
    expect(res.status).toBe(403);
  });

  test('адміністратор створює і видаляє статтю', async () => {
    const token = await login('admin@news.ua', 'admin123');
    const created = await request(app).post('/api/articles').set('Authorization', `Bearer ${token}`).send({
      title: 'Тестова стаття',
      summary: 'Короткий опис статті',
      content: 'Текст статті достатньої довжини',
      categoryId: 1,
    });
    expect(created.status).toBe(201);

    const removed = await request(app)
      .delete(`/api/articles/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(removed.status).toBe(204);
  });
});

describe('Коментарі та рейтинг', () => {
  test('гість не може залишити коментар', async () => {
    const res = await request(app).post('/api/articles/1/comments').send({ text: 'Привіт' });
    expect(res.status).toBe(401);
  });

  test('користувач додає коментар', async () => {
    const token = await login('olena@news.ua', 'user123');
    const res = await request(app)
      .post('/api/articles/1/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Чудова стаття!' });
    expect(res.status).toBe(201);
    expect(res.body.userName).toBe('Олена Коваль');
  });

  test('користувач не може видалити чужий коментар', async () => {
    const token = await login('andrii@news.ua', 'user123');
    // коментар #1 належить Олені
    const res = await request(app).delete('/api/comments/1').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('повторна оцінка замінює попередню, а не додає нову', async () => {
    const token = await login('andrii@news.ua', 'user123');
    const auth = { Authorization: `Bearer ${token}` };
    const first = await request(app).post('/api/articles/2/rating').set(auth).send({ value: 5 });
    const second = await request(app).post('/api/articles/2/rating').set(auth).send({ value: 1 });
    expect(second.body.count).toBe(first.body.count);
    expect(second.body.myRating).toBe(1);
  });

  test('оцінка поза межами 1-5 відхиляється', async () => {
    const token = await login('andrii@news.ua', 'user123');
    const res = await request(app)
      .post('/api/articles/2/rating')
      .set('Authorization', `Bearer ${token}`)
      .send({ value: 10 });
    expect(res.status).toBe(400);
  });
});
