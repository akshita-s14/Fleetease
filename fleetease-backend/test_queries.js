const pool = require('./db');

async function test() {
  try {
    console.log('Testing queries...');
    await pool.query('SELECT COUNT(*) FROM bookings');
    console.log('bookings ok');
    await pool.query("SELECT COUNT(*) FROM bookings WHERE booking_type='B2C'");
    console.log('bookings b2c ok');
    await pool.query('SELECT COUNT(*) FROM vehicles');
    console.log('vehicles ok');
    await pool.query("SELECT COUNT(*) FROM drivers WHERE status='active'");
    console.log('drivers ok');
    await pool.query("SELECT role, COUNT(*) FROM users GROUP BY role");
    console.log('users ok');
    await pool.query("SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE status='completed'");
    console.log('payments ok');
    await pool.query("SELECT AVG(fuel_level) as avg FROM vehicle_locations");
    console.log('vehicle_locations ok');
    await pool.query("SELECT COUNT(*) FROM maintenance");
    console.log('maintenance ok');
    await pool.query(`
      SELECT b.booking_id, u.name AS customer_name, v.vehicle_number, b.status, b.booking_type, b.booking_time
      FROM bookings b
      LEFT JOIN users u ON b.customer_id = u.user_id
      LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
      ORDER BY b.booking_id DESC LIMIT 5
    `);
    console.log('recent bookings ok');
    console.log('ALL QUERIES PASSED!');
    process.exit(0);
  } catch (err) {
    console.error('QUERY FAILED:', err);
    process.exit(1);
  }
}

test();
