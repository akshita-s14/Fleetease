const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Simple context-aware rule-based chatbot
router.post('/message', auth(['customer','company_admin','admin','driver']), async (req, res) => {
  try {
    const { message } = req.body;
    const userRole = req.user.role;
    if (!message) return res.status(400).json({ error: 'Message required' });
    const m = message.toLowerCase();

    // examples
    if (m.includes('book') || m.includes('booking')) {
      return res.json({ reply: 'To create a booking, POST /api/bookings with pickup and drop. For corporate bookings set booking_type=B2B.' });
    }
    if (m.includes('eta') || m.includes('arrival')) {
      return res.json({ reply: 'Check ETA with GET /api/eta/:bookingId. Provide your booking id.' });
    }
    if (m.includes('invoice') || m.includes('bill')) {
      return res.json({ reply: 'For invoice details, use GET /api/invoices/booking/:bookingId (company admins and admins only).' });
    }
    if (m.includes('points') || m.includes('loyalty')) {
      if (userRole === 'customer') {
        const r = await pool.query('SELECT points FROM users WHERE user_id=$1', [req.user.user_id]);
        return res.json({ reply: `You have ${r.rows[0].points || 0} loyalty points.` });
      } else {
        return res.json({ reply: 'Loyalty points are available for customers.' });
      }
    }

    // fallback - log chat
    await pool.query('INSERT INTO chatbot_logs (user_id, user_message, bot_response) VALUES ($1,$2,$3)', [req.user.user_id, message, "Sorry, I didn't understand. Try asking about bookings, ETA, or payments."]);
    return res.json({ reply: "Sorry, I didn't understand. Try asking about bookings, ETA, or payments." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
