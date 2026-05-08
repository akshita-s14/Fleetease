const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    await pool.query('CREATE TABLE IF NOT EXISTS testimonials (id SERIAL PRIMARY KEY, name TEXT, rating INT CHECK (rating BETWEEN 1 AND 5), comment TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
    const r = await pool.query('SELECT * FROM testimonials ORDER BY created_at DESC');
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to list testimonials', details: e.message });
  }
});

router.post('/', async (req, res) => {
  const { name, rating, comment } = req.body;
  if (!name || !rating || !comment) return res.status(400).json({ error: 'Missing fields' });
  try {
    await pool.query('CREATE TABLE IF NOT EXISTS testimonials (id SERIAL PRIMARY KEY, name TEXT, rating INT CHECK (rating BETWEEN 1 AND 5), comment TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
    const r = await pool.query('INSERT INTO testimonials (name,rating,comment) VALUES ($1,$2,$3) RETURNING *', [name, rating, comment]);
    res.json({ ok: true, item: r.rows[0] });
  } catch (e) {
    res.status(500).json({ error: 'Failed to add testimonial', details: e.message });
  }
});

module.exports = router;
