require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const authMiddleware = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);

// Routes (some protected)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/gps', require('./routes/gps'));
app.use('/api/eta', require('./routes/eta'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/fleet', require('./routes/fleet'));
// newly added public endpoints
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/gallery', require('./routes/gallery'));

// Protected admin endpoints
app.use('/api/admin', require('./routes/adminSummary'));

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('join_vehicle', (vehicleId) => {
    socket.join(`vehicle_${vehicleId}`);
  });
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Fleetease backend final running on port ${port}`));
