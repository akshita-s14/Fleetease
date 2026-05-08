const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// ===============================================
// 📊 Admin Dashboard API (Summary)
// ===============================================
router.get('/summary', auth(['admin', 'company_admin']), async (req, res) => {
  try {
    const totalBookings = await pool.query('SELECT COUNT(*) FROM bookings');
    const b2c = await pool.query("SELECT COUNT(*) FROM bookings WHERE booking_type='B2C'");
    const b2b = await pool.query("SELECT COUNT(*) FROM bookings WHERE booking_type='B2B'");

    const totalVehicles = await pool.query('SELECT COUNT(*) FROM vehicles');
    const vAvail = await pool.query("SELECT COUNT(*) FROM vehicles WHERE status='available'");
    const vMaint = await pool.query("SELECT COUNT(*) FROM vehicles WHERE status='maintenance'");

    const totalDrivers = await pool.query('SELECT COUNT(*) FROM drivers');
    const dActive = await pool.query("SELECT COUNT(*) FROM drivers WHERE status='active'");

    const usersRes = await pool.query("SELECT role, COUNT(*) FROM users GROUP BY role");
    let customers = 0, companyAdmins = 0;
    usersRes.rows.forEach(r => {
      if (r.role === 'customer') customers = parseInt(r.count);
      if (r.role === 'company_admin') companyAdmins = parseInt(r.count);
    });

    const totalRevenue = await pool.query("SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE status='completed'");
    const pendingRevenue = await pool.query("SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE status='pending'");

    const avgFuel = await pool.query("SELECT AVG(fuel_level) as avg FROM vehicle_locations");
    const maintTasks = await pool.query("SELECT COUNT(*) FROM maintenance");

    const recentBookings = await pool.query(`
      SELECT b.booking_id, u.name AS customer_name, v.vehicle_number, b.status, b.booking_type, b.booking_time
      FROM bookings b
      LEFT JOIN users u ON b.customer_id = u.user_id
      LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
      ORDER BY b.booking_id DESC LIMIT 5
    `);

    res.json({
      summary: {
        bookings: { total: parseInt(totalBookings.rows[0].count), b2c: parseInt(b2c.rows[0].count), b2b: parseInt(b2b.rows[0].count) },
        vehicles: { total: parseInt(totalVehicles.rows[0].count), available: parseInt(vAvail.rows[0].count), maintenance: parseInt(vMaint.rows[0].count) },
        drivers: { total: parseInt(totalDrivers.rows[0].count), active: parseInt(dActive.rows[0].count), inactive: parseInt(totalDrivers.rows[0].count) - parseInt(dActive.rows[0].count) },
        users: { customers, companyAdmins },
        payments: { revenue: parseFloat(totalRevenue.rows[0].total), pending: parseFloat(pendingRevenue.rows[0].total) },
        fleetHealth: { avgFuelLevel: parseFloat(avgFuel.rows[0].avg || 0).toFixed(1), maintenanceTasks: parseInt(maintTasks.rows[0].count) },
        recentBookings: recentBookings.rows
      }
    });
  } catch (err) {
    console.error('❌ Admin summary error:', err.message);
    res.status(500).json({ error: 'Server error while fetching admin summary' });
  }
});

// ===============================================
// 👥 Manage users (optional future extension)
// ===============================================
router.get('/users', auth(['admin']), async (req, res) => {
  try {
    const result = await pool.query('SELECT user_id, name, email, role FROM users ORDER BY user_id ASC');
    res.json({ users: result.rows });
  } catch (err) {
    console.error('❌ Error fetching users:', err.message);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
});

module.exports = router;
