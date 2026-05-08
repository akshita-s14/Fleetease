const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Payment history (admin)
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const r = await pool.query(`SELECT p.*, b.booking_id, b.booking_type, u.name as customer_name
                                FROM payments p LEFT JOIN bookings b ON p.booking_id=b.booking_id
                                LEFT JOIN users u ON b.customer_id=u.user_id ORDER BY p.payment_id DESC`);
    res.json({ payments: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Payment history (customer)
router.get('/customer/:userId', auth(['customer']), async (req, res) => {
  try {
    const { userId } = req.params;
    const r = await pool.query(`SELECT p.*, b.booking_id, b.booking_type, r.source, r.destination
                                FROM payments p 
                                JOIN bookings b ON p.booking_id=b.booking_id
                                LEFT JOIN routes r ON b.route_id=r.route_id
                                WHERE b.customer_id=$1 ORDER BY p.payment_id DESC`, [userId]);
    res.json({ payments: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Make payment (customer/company_admin)
router.post('/', auth(['customer','company_admin','admin']), async (req, res) => {
  try {
    const { booking_id, amount, method } = req.body;
    if (!booking_id || !amount || !method) return res.status(400).json({ error: 'Missing fields' });

    const r = await pool.query('INSERT INTO payments (booking_id, amount, method, status) VALUES ($1,$2,$3,$4) RETURNING *', [booking_id, amount, method, 'completed']);

    // update booking payment_status
    await pool.query('UPDATE bookings SET payment_status=$1 WHERE booking_id=$2', ['paid', booking_id]);

    // award loyalty points to booking's customer
    const bookingRes = await pool.query('SELECT customer_id FROM bookings WHERE booking_id=$1', [booking_id]);
    if (bookingRes.rows.length) {
      const customerId = bookingRes.rows[0].customer_id;
      const points = Math.floor(amount / 100);
      await pool.query('UPDATE users SET points = COALESCE(points,0) + $1 WHERE user_id=$2', [points, customerId]);
    }

    res.status(201).json({ payment: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
