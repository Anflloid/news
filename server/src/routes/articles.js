const express = require('express');
const { getDb, save, nextId } = require('../db');
const { optionalAuth, requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

function getRating(db, articleId) {
  const list = db.ratings.filter((r) => r.articleId === articleId);
  const sum = list.reduce((acc, r) => acc + r.value, 0);
  return {
    average: list.length ? Math.round((sum / list.length) * 10) / 10 : 0,
    count: list.length,
  };
}

function withDetails(db, article) {
  const category = db.categories.find((c) => c.id === article.categoryId) || null;
  const author = db.users.find((u) => u.id === article.authorId);
  return {
    ...article,
    category,
    authorName: author ? author.name : 'Невідомий автор',
    rating: getRating(db, article.id),
    commentsCount: db.comments.filter((c) => c.articleId === article.id).length,
  };
}

function validateArticle(body, db) {
  const { title, summary, content, categoryId } = body;
  if (!title || title.trim().length < 5) return 'Заголовок має містити щонайменше 5 символів';
  if (!summary || summary.trim().length < 10) return 'Короткий опис має містити щонайменше 10 символів';
  if (!content || content.trim().length < 20) return 'Текст статті занадто короткий';
  if (!db.categories.some((c) => c.id === Number(categoryId))) return 'Оберіть категорію';
  return null;
}

// GET /api/articles?category=&search=&sort=new|popular|rating&page=&limit=
router.get('/', (req, res) => {
  const db = getDb();
  const { category, search, sort = 'new' } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 6));

  let list = db.articles.map((a) => withDetails(db, a));

  if (category) {
    list = list.filter((a) => a.category && a.category.slug === category);
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter((a) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q));
  }

  if (sort === 'popular') list.sort((a, b) => b.views - a.views);
  else if (sort === 'rating') list.sort((a, b) => b.rating.average - a.rating.average);
  else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = list.length;
  const items = list.slice((page - 1) * limit, page * limit).map((a) => {
    const { content, ...short } = a; // текст статті у списку не потрібен
    return short;
  });

  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

// GET /api/articles/:id (+1 перегляд)
router.get('/:id', optionalAuth, (req, res) => {
  const db = getDb();
  const article = db.articles.find((a) => a.id === Number(req.params.id));
  if (!article) return res.status(404).json({ message: 'Статтю не знайдено' });

  article.views += 1;
  save();

  const result = withDetails(db, article);
  if (req.user) {
    const my = db.ratings.find((r) => r.articleId === article.id && r.userId === req.user.id);
    result.myRating = my ? my.value : 0;
  }
  return res.json(result);
});

// POST /api/articles (адмін)
router.post('/', requireAuth, requireAdmin, (req, res) => {
  const db = getDb();
  const error = validateArticle(req.body, db);
  if (error) return res.status(400).json({ message: error });

  const category = db.categories.find((c) => c.id === Number(req.body.categoryId));
  const article = {
    id: nextId(db.articles),
    title: req.body.title.trim(),
    summary: req.body.summary.trim(),
    content: req.body.content.trim(),
    image: req.body.image || `/images/${category.slug}.svg`,
    categoryId: category.id,
    authorId: req.user.id,
    views: 0,
    createdAt: new Date().toISOString(),
  };
  db.articles.push(article);
  save();
  return res.status(201).json(withDetails(db, article));
});

// PUT /api/articles/:id (адмін)
router.put('/:id', requireAuth, requireAdmin, (req, res) => {
  const db = getDb();
  const article = db.articles.find((a) => a.id === Number(req.params.id));
  if (!article) return res.status(404).json({ message: 'Статтю не знайдено' });

  const error = validateArticle(req.body, db);
  if (error) return res.status(400).json({ message: error });

  article.title = req.body.title.trim();
  article.summary = req.body.summary.trim();
  article.content = req.body.content.trim();
  article.categoryId = Number(req.body.categoryId);
  if (req.body.image) article.image = req.body.image;
  save();
  return res.json(withDetails(db, article));
});

// DELETE /api/articles/:id (адмін, разом з коментарями й оцінками)
router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const db = getDb();
  if (!db.articles.some((a) => a.id === id)) {
    return res.status(404).json({ message: 'Статтю не знайдено' });
  }
  db.articles = db.articles.filter((a) => a.id !== id);
  db.comments = db.comments.filter((c) => c.articleId !== id);
  db.ratings = db.ratings.filter((r) => r.articleId !== id);
  save();
  return res.status(204).end();
});

// GET /api/articles/:id/comments
router.get('/:id/comments', (req, res) => {
  const db = getDb();
  const articleId = Number(req.params.id);
  const comments = db.comments
    .filter((c) => c.articleId === articleId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((c) => {
      const user = db.users.find((u) => u.id === c.userId);
      return { ...c, userName: user ? user.name : 'Видалений користувач' };
    });
  res.json(comments);
});

// POST /api/articles/:id/comments (авторизовані)
router.post('/:id/comments', requireAuth, (req, res) => {
  const db = getDb();
  const articleId = Number(req.params.id);
  if (!db.articles.some((a) => a.id === articleId)) {
    return res.status(404).json({ message: 'Статтю не знайдено' });
  }
  const text = String(req.body.text || '').trim();
  if (text.length < 2) return res.status(400).json({ message: 'Коментар занадто короткий' });
  if (text.length > 1000) return res.status(400).json({ message: 'Коментар занадто довгий (макс. 1000 символів)' });

  const comment = {
    id: nextId(db.comments),
    articleId,
    userId: req.user.id,
    text,
    createdAt: new Date().toISOString(),
  };
  db.comments.push(comment);
  save();

  const user = db.users.find((u) => u.id === req.user.id);
  return res.status(201).json({ ...comment, userName: user ? user.name : '' });
});

// POST /api/articles/:id/rating - оцінка 1-5; повторна замінює попередню
router.post('/:id/rating', requireAuth, (req, res) => {
  const db = getDb();
  const articleId = Number(req.params.id);
  const value = Number(req.body.value);

  if (!db.articles.some((a) => a.id === articleId)) {
    return res.status(404).json({ message: 'Статтю не знайдено' });
  }
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    return res.status(400).json({ message: 'Оцінка має бути від 1 до 5' });
  }

  const existing = db.ratings.find((r) => r.articleId === articleId && r.userId === req.user.id);
  if (existing) existing.value = value;
  else db.ratings.push({ articleId, userId: req.user.id, value });
  save();

  return res.json({ ...getRating(db, articleId), myRating: value });
});

module.exports = router;
