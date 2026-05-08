const pool = require('./db');

async function migrate() {
  try {
    await pool.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS scheduled_date DATE');
    console.log('Successfully added scheduled_date to bookings table');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
