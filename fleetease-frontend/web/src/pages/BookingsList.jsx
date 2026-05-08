import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';

export default function BookingsList() {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [assigningId, setAssigningId] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');

  const fetchData = async () => {
    try {
      const [bRes, vRes, dRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/vehicles'),
        api.get('/drivers')
      ]);
      setBookings(bRes.data.bookings);
      setVehicles(vRes.data.vehicles.filter(v => v.status === 'available'));
      setDrivers(dRes.data.drivers.filter(d => d.status === 'active'));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    if (!selectedVehicle || !selectedDriver) return alert('Please select both a vehicle and a driver.');
    try {
      await api.put(`/bookings/${id}/approve`, {
        action: 'approve',
        assigned_vehicle_id: parseInt(selectedVehicle),
        assigned_driver_id: parseInt(selectedDriver)
      });
      alert('Booking approved and assigned successfully!');
      setAssigningId(null);
      setSelectedVehicle('');
      setSelectedDriver('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve booking');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this booking?')) return;
    try {
      await api.put(`/bookings/${id}/approve`, { action: 'reject' });
      fetchData();
    } catch (err) {
      alert('Failed to reject booking');
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">All Bookings</h3>
        <Link to="/bookings/create" className="btn btn-primary">Create Booking</Link>
      </div>

      <div className="glass-card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-primary">
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Route</th>
                <th>Vehicle & Driver</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <React.Fragment key={b.booking_id}>
                  <tr>
                    <td>#{b.booking_id}</td>
                    <td className="fw-bold">{b.customer_name || 'Guest'}</td>
                    <td><span className="badge bg-secondary">{b.booking_type}</span></td>
                    <td>{b.source || b.pickup_location} ➔ {b.destination || b.drop_location}</td>
                    <td>
                      {b.vehicle_number ? (
                        <>
                          <div className="text-info fw-bold">{b.vehicle_number}</div>
                          <div className="small text-muted">{b.driver_name || 'No Driver'}</div>
                        </>
                      ) : (
                        <span className="text-muted fst-italic">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge bg-${b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'danger'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link to={`/bookings/${b.booking_id}`} className="btn btn-sm btn-outline-primary">View</Link>
                        {b.status === 'pending' && (
                          <button 
                            className="btn btn-sm btn-success" 
                            onClick={() => setAssigningId(assigningId === b.booking_id ? null : b.booking_id)}
                          >
                            {assigningId === b.booking_id ? 'Cancel' : 'Assign'}
                          </button>
                        )}
                        {b.status === 'pending' && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleReject(b.booking_id)}>Reject</button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {assigningId === b.booking_id && (
                    <tr className="bg-light">
                      <td colSpan="7" className="p-4 border-start border-4 border-info">
                        <h6 className="text-info mb-3">Assign Vehicle & Driver for Booking #{b.booking_id}</h6>
                        <div className="row g-3 align-items-end">
                          <div className="col-md-4">
                            <label className="form-label text-muted small">Select Available Vehicle</label>
                            <select className="form-select" value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}>
                              <option value="">-- Choose Vehicle --</option>
                              {vehicles.map(v => (
                                <option key={v.vehicle_id} value={v.vehicle_id}>{v.vehicle_number} ({v.type})</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-4">
                            <label className="form-label text-muted small">Select Active Driver</label>
                            <select className="form-select" value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)}>
                              <option value="">-- Choose Driver --</option>
                              {drivers.map(d => (
                                <option key={d.driver_id} value={d.driver_id}>{d.name} (License: {d.license_no})</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-4">
                            <button className="btn btn-primary w-100 fw-bold" onClick={() => handleApprove(b.booking_id)}>
                              Confirm Assignment & Approve
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">No bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}