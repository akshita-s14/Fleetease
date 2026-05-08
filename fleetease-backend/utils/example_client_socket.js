// Example client (Node) to listen for vehicle updates via Socket.IO
const io = require('socket.io-client');
const socket = io(process.env.SOCKET_URL || 'http://localhost:5000');

const vehicleId = 1;
socket.on('connect', () => {
  console.log('connected', socket.id);
  socket.emit('join_vehicle', vehicleId);
});

socket.on('location_update', (data) => {
  console.log('location update:', data);
});