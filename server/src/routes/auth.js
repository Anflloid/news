const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb, save, nextId } = require('../db');
const { createToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Заповніть ім'я, email та пароль" });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: 'Некоректний email' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Пароль має містити щонайменше 6 символів' });
  }

  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();
  if (db.users.some((u) => u.email === normalizedEmail)) {
    return res.status(409).json({ message: 'Користувач з таким email вже існує' });
  }

  const user = {
    id: nextId(db.users),
    name: name.trim(),
    email: normalizedEmail,
    password: bcrypt.hashSync(password, 10),
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  save();

  return res.status(201).json({ token: createToken(user), user: publicUser(user) });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const db = getDb();
  const user = db.users.find(
    (u) =>
      u.email ===
      String(email || '')
        .trim()
        .toLowerCase(),
  );

  if (!user || !bcrypt.compareSync(password || '', user.password)) {
    return res.status(401).json({ message: 'Невірний email або пароль' });
  }

  return res.json({ token: createToken(user), user: publicUser(user) });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const user = getDb().users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });
  return res.json(publicUser(user));
});

module.exports = router;
