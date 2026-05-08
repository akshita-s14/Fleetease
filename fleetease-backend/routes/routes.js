const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth(['admin','company_admin']), async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM routes ORDER BY route_id DESC');
    res.json({ routes: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Public search endpoint for customers (no auth required)
router.get('/search', async (req, res) => {
  try {
    const { source, destination } = req.query;
    const result = await pool.query(
      `SELECT * FROM routes
       WHERE ($1::text IS NULL OR LOWER(source) LIKE LOWER('%' || $1 || '%'))
         AND ($2::text IS NULL OR LOWER(destination) LIKE LOWER('%' || $2 || '%'))
       ORDER BY route_id DESC`,
      [source || null, destination || null]
    );
    res.json({ routes: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth(['admin']), async (req, res) => {
  try {
    const { source, destination, distance_km, fare_per_km } = req.body;
    const r = await pool.query('INSERT INTO routes (source,destination,distance_km,fare_per_km) VALUES ($1,$2,$3,$4) RETURNING *', [source,destination,distance_km,fare_per_km]);
    res.status(201).json({ route: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
