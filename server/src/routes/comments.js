const express = require('express');
const { getDb, save } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// DELETE /api/comments/:id (автор коментаря або адмін)
router.delete('/:id', requireAuth, (req, res) => {
  const db = getDb();
  const comment = db.comments.find((c) => c.id === Number(req.params.id));
  if (!comment) return res.status(404).json({ message: 'Коментар не знайдено' });

  if (comment.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Можна видаляти лише власні коментарі' });
  }

  db.comments = db.comments.filter((c) => c.id !== comment.id);
  save();
  return res.status(204).end();
});

module.exports = router;
