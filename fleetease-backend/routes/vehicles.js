const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth(['admin','company_admin']), async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM vehicles ORDER BY vehicle_id DESC');
    res.json({ vehicles: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth(['admin']), async (req, res) => {
  try {
    const { vehicle_number, type, capacity, status, assigned_driver_id } = req.body;
    const r = await pool.query('INSERT INTO vehicles (vehicle_number,type,capacity,status,assigned_driver_id) VALUES ($1,$2,$3,$4,$5) RETURNING *', [vehicle_number,type,capacity || 0,status || 'available',assigned_driver_id || null]);
    res.status(201).json({ vehicle: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
