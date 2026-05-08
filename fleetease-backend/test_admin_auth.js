const jwt = require('jsonwebtoken');
const http = require('http');
require('dotenv').config();

const token = jwt.sign({ user_id: 1, role: 'admin' }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '1h' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/admin/summary',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`BODY: ${data}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
