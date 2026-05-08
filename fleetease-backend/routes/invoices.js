const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth(['admin', 'company_admin']), async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM invoices ORDER BY invoice_id DESC');
    res.json({ invoices: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/booking/:bookingId', auth(['admin','company_admin']), async (req, res) => {
  try {
    const { bookingId } = req.params;
    const r = await pool.query('SELECT * FROM invoices WHERE booking_id=$1', [bookingId]);
    res.json({ invoices: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/pay', auth(['company_admin','admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE invoices SET payment_status=$1 WHERE invoice_id=$2', ['paid', id]);
    res.json({ message: 'Invoice marked as paid' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
