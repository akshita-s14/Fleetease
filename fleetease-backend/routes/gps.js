const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.post('/update', auth(['driver']), async (req, res) => {
  try {
    const { vehicle_id, latitude, longitude, speed_kmph, fuel_level } = req.body;
    if (!vehicle_id || !latitude || !longitude) return res.status(400).json({ error: 'Missing fields' });

    const r = await pool.query('INSERT INTO vehicle_locations (vehicle_id, latitude, longitude, speed_kmph, fuel_level, updated_at) VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING *', [vehicle_id, latitude, longitude, speed_kmph || null, fuel_level || null]);

    const io = req.app.get('io');
    if (io) {
      io.to(`vehicle_${vehicle_id}`).emit('location_update', r.rows[0]);
    }

    res.status(201).json({ location: r.rows[0] });
  } catch (err) {
    console.error('Error updating GPS:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:vehicleId', auth(['admin','company_admin','customer','driver']), async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const r = await pool.query('SELECT * FROM vehicle_locations WHERE vehicle_id=$1 ORDER BY updated_at DESC LIMIT 1', [vehicleId]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'No location found' });
    res.json({ location: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
