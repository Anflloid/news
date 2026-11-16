const express = require('express');
const { getDb, save, nextId } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories
router.get('/', (req, res) => {
  const db = getDb();
  const result = db.categories.map((c) => ({
    ...c,
    articlesCount: db.articles.filter((a) => a.categoryId === c.id).length,
  }));
  res.json(result);
});

// POST /api/categories (адмін)
router.post('/', requireAuth, requireAdmin, (req, res) => {
  const { name, slug, color } = req.body;
  if (!name || !slug) {
    return res.status(400).json({ message: 'Вкажіть назву та slug категорії' });
  }
  const db = getDb();
  if (db.categories.some((c) => c.slug === slug)) {
    return res.status(409).json({ message: 'Категорія з таким slug вже існує' });
  }
  const category = { id: nextId(db.categories), name, slug, color: color || '#64748b' };
  db.categories.push(category);
  save();
  return res.status(201).json(category);
});

// DELETE /api/categories/:id (адмін, лише порожня категорія)
router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const db = getDb();
  if (db.articles.some((a) => a.categoryId === id)) {
    return res.status(400).json({ message: 'Не можна видалити категорію, в якій є статті' });
  }
  const before = db.categories.length;
  db.categories = db.categories.filter((c) => c.id !== id);
  if (db.categories.length === before) {
    return res.status(404).json({ message: 'Категорію не знайдено' });
  }
  save();
  return res.status(204).end();
});

module.exports = router;
