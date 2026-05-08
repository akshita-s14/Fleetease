const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth(['admin']), async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM drivers ORDER BY driver_id DESC');
    res.json({ drivers: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth(['admin']), async (req, res) => {
  try {
    const { user_id, name, phone, license_no, status } = req.body;
    const r = await pool.query('INSERT INTO drivers (user_id,name,phone,license_no,status) VALUES ($1,$2,$3,$4,$5) RETURNING *', [user_id || null,name,phone,license_no,status || 'active']);
    res.status(201).json({ driver: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/confirm', auth(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const r = await pool.query('UPDATE drivers SET status=$1 WHERE driver_id=$2 RETURNING *', ['active', id]);
    if (r.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json({ driver: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
