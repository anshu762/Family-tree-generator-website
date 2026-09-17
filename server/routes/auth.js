import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Auth middleware (moved to top)
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, hash]
    );
    const token = jwt.sign({ userId: rows[0].id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: rows[0] });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!rows.length) throw new Error('Invalid credentials');
    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) throw new Error('Invalid credentials');
    const token = jwt.sign({ userId: rows[0].id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: rows[0].id, email: rows[0].email, created_at: rows[0].created_at } });
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );
    if (!rows.length) throw new Error('User not found');
    res.json({ user: rows[0] });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/me', auth, async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (!rows.length) throw new Error('User not found');
    const user = rows[0];

    let newEmail = email || user.email;
    if (email && email !== user.email) {
      await pool.query('UPDATE users SET email = $1 WHERE id = $2', [newEmail, userId]);
    }

    if (newPassword) {
      if (!currentPassword) throw new Error('Current password is required');
      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid) throw new Error('Current password is incorrect');
      const hash = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, userId]);
    }

    const { rows: updated } = await pool.query(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [userId]
    );
    res.json({ user: updated[0] });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/me', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.user.userId]);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;