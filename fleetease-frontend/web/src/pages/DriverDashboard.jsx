import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function DriverDashboard() {
  const [vehicleId, setVehicleId] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [speed, setSpeed] = useState('');
  const [fuel, setFuel] = useState('');
  const [telemetry, setTelemetry] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [driverRides, setDriverRides] = useState([]);

  useEffect(() => {
    const fetchDriverRides = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.user_id) {
          const res = await api.get(`/bookings/driver/${storedUser.user_id}`);
          setDriverRides(res.data.bookings);
          
          // Auto-select the first available assigned vehicle
          const active = res.data.bookings.find(b => b.vehicle_id);
          if (active) {
            setVehicleId(active.vehicle_id.toString());
          }
        }
      } catch (err) {
        console.error('Error fetching driver rides:', err);
      }
    };
    fetchDriverRides();
  }, []);

  const handleUpdateGPS = async (e) => {
    e.preventDefault();
    if (!vehicleId || !lat || !lng) return alert('Vehicle ID, Latitude, and Longitude are required.');
    
    setIsUpdating(true);
    try {
      await api.post('/gps/update', {
        vehicle_id: parseInt(vehicleId),
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        speed_kmph: speed ? parseFloat(speed) : null,
        fuel_level: fuel ? parseFloat(fuel) : null
      });
      alert('GPS location updated successfully!');
      fetchTelemetry();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update GPS');
    }
    setIsUpdating(false);
  };

  const fetchTelemetry = async () => {
    if (!vehicleId) return;
    try {
      const res = await api.get(`/fleet/telemetry/${vehicleId}`);
      setTelemetry(res.data.telemetry);
    } catch (err) {
      console.log('Error fetching telemetry', err);
      setTelemetry(null);
    }
  };

  const autofillDemoLocation = () => {
    // Just a fun helper to simulate moving
    const baseLat = 18.5204; // Pune base
    const baseLng = 73.8567;
    const randomOffset = () => (Math.random() * 0.05 - 0.025).toFixed(4);
    
    setLat((baseLat + parseFloat(randomOffset())).toString());
    setLng((baseLng + parseFloat(randomOffset())).toString());
    setSpeed(Math.floor(Math.random() * 40 + 40).toString()); // 40-80 km/h
    setFuel(Math.floor(Math.random() * 20 + 50).toString()); // 50-70%
  };

  const assignedVehicles = [];
  const seenIds = new Set();
  driverRides.forEach(r => {
    if (r.vehicle_id && !seenIds.has(r.vehicle_id)) {
      seenIds.add(r.vehicle_id);
      assignedVehicles.push({ id: r.vehicle_id, number: r.vehicle_number });
    }
  });

  return (
    <div className="container mt-4 mb-5">
      <h3 className="mb-4 text-dark">Driver Portal</h3>
      
      {/* Driver Assigned Rides Section */}
      <div className="glass-card mb-4 overflow-hidden p-0">
        <div className="p-4 border-bottom" style={{borderColor: 'var(--border-color)'}}>
          <h4 className="mb-0">My Assigned Rides</h4>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-primary">
              <tr>
                <th>Booking ID</th>
                <th>Date</th>
                <th>Route</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Vehicle ID</th>
              </tr>
            </thead>
            <tbody>
              {driverRides.map(r => (
                <tr key={r.booking_id}>
                  <td>#{r.booking_id}</td>
                  <td>{new Date(r.booking_time).toLocaleDateString()}</td>
                  <td>{r.source || r.pickup_location} ➔ {r.destination || r.drop_location}</td>
                  <td>{r.customer_name}<br/><small className="text-muted">{r.customer_phone}</small></td>
                  <td>
                    <span className={`badge bg-${r.status === 'confirmed' ? 'success' : r.status === 'completed' ? 'primary' : 'warning'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <span className="text-info fw-bold">{r.vehicle_id || 'N/A'}</span>
                  </td>
                </tr>
              ))}
              {driverRides.length === 0 && <tr><td colSpan="6" className="text-center py-4 text-muted">No assigned rides found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="row g-4">
        {/* Update GPS Form */}
        <div className="col-lg-7">
          <div className="glass-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="mb-0">Transmit Telemetry</h4>
              <button type="button" className="btn btn-outline-info btn-sm" onClick={autofillDemoLocation}>
                Auto-fill Demo Data
              </button>
            </div>
            
            <form onSubmit={handleUpdateGPS}>
              <div className="mb-3">
                <label className="form-label text-muted">Assigned Vehicle</label>
                <select 
                  className="form-select" 
                  value={vehicleId} 
                  onChange={e => setVehicleId(e.target.value)} 
                  required 
                >
                  <option value="">-- Select your vehicle --</option>
                  {assignedVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.number} (ID: {v.id})</option>
                  ))}
                </select>
                {assignedVehicles.length === 0 && (
                  <small className="text-danger mt-1 d-block">You don't have any vehicles assigned yet.</small>
                )}
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label text-muted">Latitude</label>
                  <input 
                    type="number" 
                    step="any" 
                    className="form-control" 
                    value={lat} 
                    onChange={e => setLat(e.target.value)} 
                    required 
                    placeholder="18.5204" 
                  />
                </div>
                <div className="col-md-6 mt-3 mt-md-0">
                  <label className="form-label text-muted">Longitude</label>
                  <input 
                    type="number" 
                    step="any" 
                    className="form-control" 
                    value={lng} 
                    onChange={e => setLng(e.target.value)} 
                    required 
                    placeholder="73.8567" 
                  />
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-6">
                  <label className="form-label text-muted">Speed (km/h)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={speed} 
                    onChange={e => setSpeed(e.target.value)} 
                    placeholder="65" 
                  />
                </div>
                <div className="col-md-6 mt-3 mt-md-0">
                  <label className="form-label text-muted">Fuel Level (%)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={fuel} 
                    onChange={e => setFuel(e.target.value)} 
                    placeholder="80" 
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={isUpdating}>
                {isUpdating ? 'Transmitting...' : 'Broadcast Location'}
              </button>
            </form>
          </div>
        </div>

        {/* Current Status View */}
        <div className="col-lg-5">
          <div className="glass-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="mb-0">Current Status</h4>
              <button className="btn btn-sm btn-secondary" onClick={fetchTelemetry} disabled={!vehicleId}>Refresh</button>
            </div>
            
            {telemetry ? (
              <div>
                <p className="text-muted mb-2">Vehicle ID: <span className="text-dark fw-bold">{telemetry.vehicle_id}</span></p>
                <p className="text-muted mb-2">Coordinates: <span className="text-dark">{telemetry.latitude}, {telemetry.longitude}</span></p>
                <p className="text-muted mb-2">Speed: <span className="text-warning fw-bold">{telemetry.speed_kmph || 0} km/h</span></p>
                <p className="text-muted mb-4">Fuel: <span className="text-success fw-bold">{telemetry.fuel_level || 0}%</span></p>
                
                <hr style={{borderColor: 'var(--glass-border)'}}/>
                <div className="text-center mt-3">
                  <div className="spinner-grow text-success spinner-grow-sm me-2" role="status"></div>
                  <span className="text-success">Live Broadcast Active</span>
                </div>
              </div>
            ) : (
              <div className="d-flex h-75 justify-content-center align-items-center text-center">
                <p className="text-muted">Enter a Vehicle ID and refresh to see current telemetry data.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
