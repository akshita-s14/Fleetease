/**
 * setup_db.js
 * Run: node setup_db.js
 * Creates tables and seeds demo data.
 */
const pool = require('./db');
const bcrypt = require('bcrypt');

async function setup() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) CHECK (role IN ('admin','customer','driver','company_admin')),
        password_hash TEXT NOT NULL,
        points INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS vehicles (
        vehicle_id SERIAL PRIMARY KEY,
        vehicle_number VARCHAR(50) UNIQUE NOT NULL,
        type VARCHAR(50),
        capacity INT,
        status VARCHAR(20) DEFAULT 'available',
        assigned_driver_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS drivers (
        driver_id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        license_no VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        joined_date DATE DEFAULT CURRENT_DATE
      );

      CREATE TABLE IF NOT EXISTS routes (
        route_id SERIAL PRIMARY KEY,
        source VARCHAR(150) NOT NULL,
        destination VARCHAR(150) NOT NULL,
        distance_km DECIMAL(10,2) NOT NULL,
        fare_per_km DECIMAL(10,2) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS bookings (
        booking_id SERIAL PRIMARY KEY,
        customer_id INT REFERENCES users(user_id),
        driver_id INT REFERENCES drivers(driver_id),
        vehicle_id INT REFERENCES vehicles(vehicle_id),
        route_id INT REFERENCES routes(route_id),
        pickup_location TEXT,
        drop_location TEXT,
        booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(30) DEFAULT 'pending',
        payment_status VARCHAR(30) DEFAULT 'unpaid',
        fare DECIMAL(10,2),
        booking_type VARCHAR(10) DEFAULT 'B2C',
        company_name VARCHAR(255),
        company_contact VARCHAR(100),
        approval_status VARCHAR(20) DEFAULT 'pending'
      );

      CREATE TABLE IF NOT EXISTS payments (
        payment_id SERIAL PRIMARY KEY,
        booking_id INT REFERENCES bookings(booking_id) ON DELETE CASCADE,
        amount DECIMAL(10,2),
        method VARCHAR(50),
        status VARCHAR(30) DEFAULT 'pending',
        transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS invoices (
        invoice_id SERIAL PRIMARY KEY,
        booking_id INT REFERENCES bookings(booking_id) ON DELETE CASCADE,
        company_name VARCHAR(255),
        total_amount DECIMAL(12,2),
        issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        payment_due DATE,
        payment_status VARCHAR(20) DEFAULT 'unpaid'
      );

      CREATE TABLE IF NOT EXISTS vehicle_locations (
        location_id SERIAL PRIMARY KEY,
        vehicle_id INT REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
        latitude DECIMAL(10,6) NOT NULL,
        longitude DECIMAL(10,6) NOT NULL,
        speed_kmph DECIMAL(6,2),
        fuel_level DECIMAL(6,2),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS maintenance (
        maintenance_id SERIAL PRIMARY KEY,
        vehicle_id INT REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
        service_date DATE DEFAULT CURRENT_DATE,
        description TEXT,
        cost DECIMAL(10,2)
      );
      CREATE TABLE IF NOT EXISTS gallery (
        id SERIAL PRIMARY KEY,
        image_url TEXT NOT NULL,
        title VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tables created or already exist.');

    // seed users with hashed passwords
    const users = [
      {name:'Admin User', email:'admin@fleetease.com', phone:'9999999999', role:'admin', pass:'admin123', points:0},
      {name:'Customer One', email:'cust1@fleetease.com', phone:'9999990000', role:'customer', pass:'cust123', points:100},
      {name:'Driver User', email:'driver1@fleetease.com', phone:'9999900000', role:'driver', pass:'driver123', points:50},
      {name:'Company Admin', email:'corp@company.com', phone:'8888888888', role:'company_admin', pass:'corp123', points:0}
    ];

    for (const u of users) {
      const r = await pool.query('SELECT * FROM users WHERE email=$1', [u.email]);
      if (r.rows.length === 0) {
        const hash = await bcrypt.hash(u.pass, 10);
        await pool.query('INSERT INTO users (name,email,phone,role,password_hash,points) VALUES ($1,$2,$3,$4,$5,$6)', [u.name,u.email,u.phone,u.role,hash,u.points]);
        console.log('Inserted user', u.email);
      }
    }

    // seed vehicles
    const v = await pool.query("SELECT * FROM vehicles");
    if (v.rows.length === 0) {
      await pool.query("INSERT INTO vehicles (vehicle_number,type,capacity,status) VALUES ($1,$2,$3,$4)", ['KA01AB1234','Bus',40,'available']);
      await pool.query("INSERT INTO vehicles (vehicle_number,type,capacity,status) VALUES ($1,$2,$3,$4)", ['MH12XY4567','Truck',8,'available']);
      console.log('Inserted demo vehicles');
    }

    // seed drivers table (linked to driver user)
    const du = await pool.query("SELECT * FROM drivers");
    if (du.rows.length === 0) {
      const driverUser = await pool.query("SELECT * FROM users WHERE role='driver' LIMIT 1");
      if (driverUser.rows.length) {
        await pool.query("INSERT INTO drivers (user_id,name,phone,license_no) VALUES ($1,$2,$3,$4)", [driverUser.rows[0].user_id,'Driver One','9999900000','DL-00001']);
        console.log('Inserted driver record');
      }
    }

    // seed routes
    const r = await pool.query('SELECT * FROM routes');
    if (r.rows.length === 0) {
      const routesSeed = [
        ['Patna','Purnea',300,5],
        ['Patna','Gaya',100,6],
        ['Purnea','Patna',300,5],
        ['Patna','Airport',10,12],
        ['Pune','Mumbai',150,6],
        ['Mumbai','Nashik',170,6],
        ['Delhi','Agra',230,5],
        ['Bengaluru','Mysuru',150,5]
      ];
      for (const row of routesSeed) {
        await pool.query('INSERT INTO routes (source,destination,distance_km,fare_per_km) VALUES ($1,$2,$3,$4)', row);
      }
      console.log('Inserted demo routes');
    }

    console.log('Setup completed.');
    process.exit(0);
  } catch (err) {
    console.error('Setup error', err);
    process.exit(1);
  }
}

setup();
