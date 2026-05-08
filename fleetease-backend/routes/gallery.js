const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

pool.query(`
  CREATE TABLE IF NOT EXISTS gallery (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).catch(console.error);

router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM gallery ORDER BY created_at DESC');
    res.json({ gallery: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth(['admin']), async (req, res) => {
  try {
    const { image_url, title, description } = req.body;
    const r = await pool.query(
      'INSERT INTO gallery (image_url, title, description) VALUES ($1, $2, $3) RETURNING *',
      [image_url, title || '', description || '']
    );
    res.status(201).json({ item: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM gallery WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
