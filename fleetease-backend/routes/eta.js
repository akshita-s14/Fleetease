const express = require('express');
const axios = require('axios');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

router.get('/:bookingId', auth(['admin','company_admin','customer']), async (req, res) => {
  try {
    const { bookingId } = req.params;
    const bookingRes = await pool.query('SELECT b.pickup_location, b.customer_id, v.vehicle_id FROM bookings b LEFT JOIN vehicles v ON b.vehicle_id=v.vehicle_id WHERE b.booking_id=$1', [bookingId]);
    if (bookingRes.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    const booking = bookingRes.rows[0];
    if (req.user.role==='customer' && req.user.user_id != booking.customer_id) return res.status(403).json({ error: 'Forbidden' });
    const gpsRes = await pool.query('SELECT latitude, longitude FROM vehicle_locations WHERE vehicle_id=$1 ORDER BY updated_at DESC LIMIT 1', [booking.vehicle_id]);
    if (gpsRes.rows.length === 0) return res.status(404).json({ error: 'No GPS location found for vehicle' });
    const vehicleLoc = gpsRes.rows[0];
    const origin = `${vehicleLoc.latitude},${vehicleLoc.longitude}`;
    const destination = encodeURIComponent(booking.pickup_location);
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_API_KEY}`;
    const response = await axios.get(url);
    if (!response.data.routes || response.data.routes.length === 0) return res.status(400).json({ error: 'No route found' });
    const leg = response.data.routes[0].legs[0];
    res.json({ bookingId, eta_text: leg.duration.text, eta_value: leg.duration.value, distance_text: leg.distance.text, distance_value: leg.distance.value });
  } catch (err) {
    console.error('Error calculating ETA:', err.message);
    res.status(500).json({ error: 'Server error while calculating ETA' });
  }
});

module.exports = router;
