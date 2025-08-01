const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');



router.use(authMiddleware);
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, status, last_login FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});



router.post('/block', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No user IDs provided' });
  }
  try {
    await db.query(
      'UPDATE users SET status = $1 WHERE id = ANY($2::int[]) AND status != $1',
      ['blocked', ids]
    );
    res.json({ message: 'Users blocked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to block users' });
  }
});


router.post('/unblock', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No user IDs provided' });
  }
  try {
    await db.query(
      'UPDATE users SET status = $1 WHERE id = ANY($2::int[]) AND status != $1',
      ['active', ids]
    );
    res.json({ message: 'Users unblocked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to unblock users' });
  }
});


router.post('/delete', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No user IDs provided' });
  }
  try {
    await db.query(
      'UPDATE users SET status = $1 WHERE id = ANY($2::int[]) AND status != $1',
      ['deleted', ids]
    );
    res.json({ message: 'Users deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete users' });
  }
});

module.exports = router;




