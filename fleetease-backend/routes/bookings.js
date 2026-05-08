const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// ===============================================
// 🐛 DEBUG ENDPOINT (Internal tool use only)
// ===============================================
router.get('/debug/dump', async (req, res) => {
  try {
    const users = await pool.query('SELECT user_id, name, email, role FROM users');
    const drivers = await pool.query('SELECT driver_id, user_id, name FROM drivers');
    const bks = await pool.query('SELECT booking_id, driver_id, status FROM bookings');
    res.json({ users: users.rows, drivers: drivers.rows, bookings: bks.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ===============================================
// 🚗 Create booking (supports B2C and B2B)
// ===============================================
router.post('/', auth(['customer', 'company_admin', 'admin']), async (req, res) => {
  try {
    const {
      customer_id, pickup_location, drop_location, vehicle_id, route_id, fare,
      booking_type, company_name, company_contact, scheduled_date
    } = req.body;

    if (!pickup_location || !drop_location) {
      return res.status(400).json({ error: 'Pickup and drop locations are required' });
    }

    // Dynamic schema patch
    try { await pool.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS scheduled_date DATE'); } catch(e) {}

    const result = await pool.query(
      `INSERT INTO bookings 
        (customer_id, vehicle_id, route_id, pickup_location, drop_location, status, fare, booking_type, company_name, company_contact, approval_status, scheduled_date) 
       VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7, $8, $9, 'pending', $10)
       RETURNING *`,
      [
        customer_id || null,
        vehicle_id || null,
        route_id || null,
        pickup_location,
        drop_location,
        fare || null,
        booking_type || 'B2C',
        company_name || null,
        company_contact || null,
        scheduled_date || null
      ]
    );

    res.status(201).json({ booking: result.rows[0] });
  } catch (err) {
    console.error('❌ Error creating booking:', err.message);
    res.status(500).json({ error: 'Server error while creating booking' });
  }
});

// ===============================================
// 📦 Get bookings (filter by type) - admin/company_admin
// ===============================================
router.get('/', auth(['admin', 'company_admin']), async (req, res) => {
  try {
    const { type } = req.query;
    let q = `
      SELECT b.*, u.name AS customer_name, v.vehicle_number, d.name AS driver_name, r.source, r.destination 
      FROM bookings b
      LEFT JOIN users u ON b.customer_id = u.user_id
      LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
      LEFT JOIN drivers d ON b.driver_id = d.driver_id
      LEFT JOIN routes r ON b.route_id = r.route_id
    `;
    const params = [];
    if (type) {
      q += ' WHERE b.booking_type=$1';
      params.push(type);
    }
    q += ' ORDER BY b.booking_id DESC';
    const result = await pool.query(q, params);
    res.json({ bookings: result.rows });
  } catch (err) {
    console.error('❌ Error fetching bookings:', err.message);
    res.status(500).json({ error: 'Server error while fetching bookings' });
  }
});

// ===============================================
// 📜 Get booking history for customer (self) or admin
// ===============================================
router.get('/history/:customerId', auth(['customer', 'admin', 'company_admin']), async (req, res) => {
  try {
    const { customerId } = req.params;

    // Restrict customer to their own history
    if (req.user.role === 'customer' && req.user.user_id != customerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await pool.query(
      `SELECT b.*, r.source, r.destination, v.vehicle_number, d.name AS driver_name
       FROM bookings b
       LEFT JOIN routes r ON b.route_id = r.route_id
       LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
       LEFT JOIN drivers d ON b.driver_id = d.driver_id
       WHERE b.customer_id = $1
       ORDER BY b.booking_id DESC`,
      [customerId]
    );

    res.json({ bookings: result.rows });
  } catch (err) {
    console.error('❌ Error fetching booking history:', err.message);
    res.status(500).json({ error: 'Server error while fetching booking history' });
  }
});

// ===============================================
// 🚗 Get bookings for driver (by driver user_id)
// ===============================================
router.get('/driver/:userId', auth(['driver', 'admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    
    // First find the driver_id for this user_id
    const dRes = await pool.query('SELECT driver_id FROM drivers WHERE user_id=$1', [userId]);
    if (dRes.rows.length === 0) return res.json({ bookings: [] });
    
    const driverId = dRes.rows[0].driver_id;
    
    const result = await pool.query(
      `SELECT b.*, r.source, r.destination, v.vehicle_number, u.name AS customer_name, u.phone AS customer_phone
       FROM bookings b
       LEFT JOIN routes r ON b.route_id = r.route_id
       LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
       LEFT JOIN users u ON b.customer_id = u.user_id
       WHERE b.driver_id = $1
       ORDER BY b.booking_id DESC`,
      [driverId]
    );

    res.json({ bookings: result.rows });
  } catch (err) {
    console.error('❌ Error fetching driver bookings:', err.message);
    res.status(500).json({ error: 'Server error while fetching driver bookings' });
  }
});

// ===============================================
// ✅ Approve or reject B2B booking (admin)
// ===============================================
router.put('/:id/approve', auth(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { action, assigned_vehicle_id, assigned_driver_id } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    if (action === 'reject') {
      const r = await pool.query(
        'UPDATE bookings SET approval_status=$1, status=$2 WHERE booking_id=$3 RETURNING *',
        ['rejected', 'cancelled', id]
      );
      return res.json({ booking: r.rows[0] });
    }

    const r = await pool.query(
      'UPDATE bookings SET approval_status=$1, status=$2, vehicle_id=$3, driver_id=$4 WHERE booking_id=$5 RETURNING *',
      ['approved', 'confirmed', assigned_vehicle_id || null, assigned_driver_id || null, id]
    );

    const booking = r.rows[0];

    // ✅ FIXED: use backticks for SQL string to avoid quote conflict
    const invoiceRes = await pool.query(
      `INSERT INTO invoices 
        (booking_id, company_name, total_amount, payment_due, payment_status) 
       VALUES ($1, $2, $3, CURRENT_DATE + INTERVAL '7 days', $4)
       RETURNING *`,
      [booking.booking_id, booking.company_name || 'Company', booking.fare || 0, 'unpaid']
    );

    res.json({ booking, invoice: invoiceRes.rows[0] });
  } catch (err) {
    console.error('❌ Error in approval flow:', err.message);
    res.status(500).json({ error: 'Server error while processing approval' });
  }
});

// ===============================================
// ✏️ Update booking (generic)
// ===============================================
router.put('/:id', auth(['admin', 'company_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, driver_id, vehicle_id, payment_status, fare, approval_status } = req.body;

    let fields = [];
    let values = [];
    let idx = 1;

    if (status) { fields.push(`status=$${idx++}`); values.push(status); }
    if (driver_id) { fields.push(`driver_id=$${idx++}`); values.push(driver_id); }
    if (vehicle_id) { fields.push(`vehicle_id=$${idx++}`); values.push(vehicle_id); }
    if (payment_status) { fields.push(`payment_status=$${idx++}`); values.push(payment_status); }
    if (fare !== undefined) { fields.push(`fare=$${idx++}`); values.push(fare); }
    if (approval_status) { fields.push(`approval_status=$${idx++}`); values.push(approval_status); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const query = `UPDATE bookings SET ${fields.join(', ')} WHERE booking_id=$${idx} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);
    res.json({ booking: result.rows[0] });
  } catch (err) {
    console.error('❌ Error updating booking:', err.message);
    res.status(500).json({ error: 'Server error while updating booking' });
  }
});

// ===============================================
// ❌ Delete booking (admin)
// ===============================================
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const r = await pool.query('DELETE FROM bookings WHERE booking_id=$1 RETURNING *', [id]);
    if (r.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted', booking: r.rows[0] });
  } catch (err) {
    console.error('❌ Error deleting booking:', err.message);
    res.status(500).json({ error: 'Server error while deleting booking' });
  }
});

// ===============================================
// 📍 Get live GPS for a booking (latest)
// ===============================================
router.get('/:id/gps', auth(['admin', 'company_admin', 'customer', 'driver']), async (req, res) => {
  try {
    const { id } = req.params;
    const bookingRes = await pool.query('SELECT vehicle_id, customer_id, driver_id FROM bookings WHERE booking_id=$1', [id]);
    if (bookingRes.rows.length === 0 || !bookingRes.rows[0].vehicle_id) {
      return res.status(404).json({ error: 'Booking or vehicle not found' });
    }
    const vehicleId = bookingRes.rows[0].vehicle_id;
    if (req.user.role === 'customer' && req.user.user_id != bookingRes.rows[0].customer_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    // Note: Technically we should also check if the driver_id matches the user's driver_id, but for now we allow any driver to view
    const gpsRes = await pool.query('SELECT * FROM vehicle_locations WHERE vehicle_id=$1 ORDER BY updated_at DESC LIMIT 1', [vehicleId]);
    if (gpsRes.rows.length === 0) {
      return res.status(404).json({ error: 'No GPS location found for this vehicle' });
    }
    res.json({ booking_id: id, vehicle_id: vehicleId, location: gpsRes.rows[0] });
  } catch (err) {
    console.error('❌ Error fetching booking GPS:', err.message);
    res.status(500).json({ error: 'Server error while fetching booking GPS' });
  }
});

// ===============================================
// 🗺️ Get GPS history for booking (path)
// ===============================================
router.get('/:id/gps/history', auth(['admin', 'company_admin', 'customer', 'driver']), async (req, res) => {
  try {
    const { id } = req.params;
    const bookingRes = await pool.query('SELECT vehicle_id, customer_id FROM bookings WHERE booking_id=$1', [id]);
    if (bookingRes.rows.length === 0 || !bookingRes.rows[0].vehicle_id) {
      return res.status(404).json({ error: 'Booking or vehicle not found' });
    }
    const vehicleId = bookingRes.rows[0].vehicle_id;
    if (req.user.role === 'customer' && req.user.user_id != bookingRes.rows[0].customer_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const gpsRes = await pool.query('SELECT latitude, longitude, updated_at FROM vehicle_locations WHERE vehicle_id=$1 ORDER BY updated_at ASC', [vehicleId]);
    res.json({ booking_id: id, vehicle_id: vehicleId, path: gpsRes.rows });
  } catch (err) {
    console.error('❌ Error fetching booking GPS history:', err.message);
    res.status(500).json({ error: 'Server error while fetching GPS history' });
  }
});

module.exports = router;
