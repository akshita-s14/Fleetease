const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.post('/maintenance', auth(['admin']), async (req, res) => {
  try {
    const { vehicle_id, service_date, description, cost } = req.body;
    if (!vehicle_id || !description) return res.status(400).json({ error: 'Missing fields' });
    const r = await pool.query('INSERT INTO maintenance (vehicle_id, service_date, description, cost) VALUES ($1,$2,$3,$4) RETURNING *', [vehicle_id, service_date || null, description, cost || 0]);
    res.status(201).json({ maintenance: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/maintenance/:vehicleId', auth(['admin','company_admin']), async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const r = await pool.query('SELECT * FROM maintenance WHERE vehicle_id=$1 ORDER BY service_date DESC', [vehicleId]);
    res.json({ maintenance: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/telemetry/:vehicleId', auth(['admin','company_admin','driver']), async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const r = await pool.query('SELECT * FROM vehicle_locations WHERE vehicle_id=$1 ORDER BY updated_at DESC LIMIT 1', [vehicleId]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'No telemetry found' });
    res.json({ telemetry: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
