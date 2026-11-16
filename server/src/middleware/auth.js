const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-for-coursework';

// Токен містить id і роль користувача, діє 7 днів
function createToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function getUserFromRequest(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

function optionalAuth(req, res, next) {
  req.user = getUserFromRequest(req);
  next();
}

function requireAuth(req, res, next) {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ message: 'Потрібно увійти в акаунт' });
  }
  req.user = user;
  return next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Доступ лише для адміністратора' });
  }
  return next();
}

module.exports = { createToken, optionalAuth, requireAuth, requireAdmin };
