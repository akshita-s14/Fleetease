const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const hash = await bcrypt.hash(password, 10);
    const r = await pool.query('INSERT INTO users (name,email,phone,role,password_hash) VALUES ($1,$2,$3,$4,$5) RETURNING user_id,name,email,role,points', [name,email,phone,role,hash]);
    
    const newUser = r.rows[0];

    // If registering as a driver, automatically add them to the drivers table
    if (role === 'driver') {
      await pool.query(
        'INSERT INTO drivers (user_id, name, phone, license_no, status) VALUES ($1, $2, $3, $4, $5)',
        [newUser.user_id, name, phone || '', 'PENDING-LICENSE', 'pending']
      );
    }

    res.status(201).json({ user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const r = await pool.query('SELECT user_id,name,email,role,password_hash,points FROM users WHERE email=$1', [email]);
    if (r.rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });
    const user = r.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ user_id: user.user_id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'secret', { expiresIn: '12h' });
    res.json({ token, user: { user_id: user.user_id, name: user.name, email: user.email, role: user.role, points: user.points } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const { user_id, name, phone } = req.body;
    const r = await pool.query(
      'UPDATE users SET name=$1, phone=$2 WHERE user_id=$3 RETURNING user_id,name,email,role,points,phone',
      [name, phone, user_id]
    );
    res.json({ user: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
