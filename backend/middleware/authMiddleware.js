const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const userResult = await db.query('SELECT status FROM users WHERE id = $1', [payload.id]);
    const user = userResult.rows[0];
    if (!user || user.status === 'blocked' || user.status === 'deleted') {
      return res.status(403).json({ error: 'User blocked or deleted' });
    }
    req.user = payload; 
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authMiddleware;

