import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Customer State
  const [customerBookings, setCustomerBookings] = useState([]);
  const [customerPayments, setCustomerPayments] = useState([]);

  // Driver State
  const [driverRides, setDriverRides] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setName(storedUser.name || '');
      setPhone(storedUser.phone || ''); // The token doesn't have phone, but we'll try

      if (storedUser.role === 'customer') {
        fetchCustomerData(storedUser.user_id);
      } else if (storedUser.role === 'driver') {
        fetchDriverData(storedUser.user_id);
      }
    }
  }, []);

  const fetchCustomerData = async (userId) => {
    try {
      const bRes = await api.get(`/bookings/history/${userId}`);
      setCustomerBookings(bRes.data.bookings);

      const pRes = await api.get(`/payments/customer/${userId}`);
      setCustomerPayments(pRes.data.payments);
    } catch (err) {
      console.error('Error fetching customer data', err);
    }
  };

  const fetchDriverData = async (userId) => {
    try {
      const dRes = await api.get(`/bookings/driver/${userId}`);
      setDriverRides(dRes.data.bookings);
    } catch (err) {
      console.error('Error fetching driver data', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await api.put('/auth/profile', {
        user_id: user.user_id,
        name,
        phone
      });
      alert('Profile updated successfully!');
      
      const updatedUser = { ...user, name: res.data.user.name, phone: res.data.user.phone };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update profile');
    }
    setIsUpdating(false);
  };

  if (!user) return <div className="text-center mt-5 text-dark">Loading profile...</div>;

  return (
    <div className="container mt-4 mb-5">
      <h3 className="mb-4 text-dark">My Profile</h3>
      
      <div className="row g-4">
        {/* Left Column: Edit Profile */}
        <div className="col-lg-4">
          <div className="glass-card h-100">
            <h4 className="mb-4">Account Details</h4>
            <div className="text-center mb-4">
              <div className="bg-primary bg-opacity-25 rounded-circle d-inline-flex justify-content-center align-items-center mb-2" style={{width: '80px', height: '80px'}}>
                <span className="fs-1 text-primary">{user.name.charAt(0)}</span>
              </div>
              <p className="text-muted mb-0">{user.email}</p>
              <span className="badge bg-secondary mt-2 text-uppercase">{user.role}</span>
              {user.role === 'customer' && (
                <div className="mt-2 text-warning fw-bold"><i className="bi bi-star-fill me-1"></i>{user.points || 0} Loyalty Points</div>
              )}
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div className="mb-3">
                <label className="form-label text-muted">Full Name</label>
                <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="mb-4">
                <label className="form-label text-muted">Phone Number</label>
                <input type="text" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Update your phone..." />
              </div>
              <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Dashboard Data */}
        <div className="col-lg-8">
          
          {user.role === 'customer' && (
            <>
              {/* Customer Bookings */}
              <div className="glass-card mb-4 overflow-hidden p-0">
                <div className="p-4 border-bottom" style={{borderColor: 'var(--glass-border)'}}>
                  <h4 className="mb-0">My Bookings</h4>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-primary">
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Route</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerBookings.map(b => (
                        <tr key={b.booking_id}>
                          <td>#{b.booking_id}</td>
                          <td>{new Date(b.booking_time).toLocaleDateString()}</td>
                          <td>{b.source || b.pickup_location} ➔ {b.destination || b.drop_location}</td>
                          <td>
                            <span className={`badge bg-${b.status === 'confirmed' ? 'success' : b.status === 'cancelled' ? 'danger' : 'warning'}`}>
                              {b.status}
                            </span>
                          </td>
                          <td>
                            <Link to={`/bookings/${b.booking_id}`} className="btn btn-sm btn-outline-info">Track / View</Link>
                          </td>
                        </tr>
                      ))}
                      {customerBookings.length === 0 && <tr><td colSpan="5" className="text-center py-4 text-muted">No bookings found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Customer Payments */}
              <div className="glass-card overflow-hidden p-0">
                <div className="p-4 border-bottom" style={{borderColor: 'var(--glass-border)'}}>
                  <h4 className="mb-0">Recent Transactions</h4>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-primary">
                      <tr>
                        <th>Txn ID</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Booking Ref</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerPayments.map(p => (
                        <tr key={p.payment_id}>
                          <td>TXN-{p.payment_id}</td>
                          <td>{new Date(p.transaction_time).toLocaleDateString()}</td>
                          <td className="fw-bold text-success">₹{p.amount}</td>
                          <td>{p.method}</td>
                          <td>#{p.booking_id}</td>
                        </tr>
                      ))}
                      {customerPayments.length === 0 && <tr><td colSpan="5" className="text-center py-4 text-muted">No transactions found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {user.role === 'driver' && (
            <>
              {/* Driver Assigned Rides */}
              <div className="glass-card overflow-hidden p-0">
                <div className="p-4 border-bottom" style={{borderColor: 'var(--glass-border)'}}>
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
                        <th>Action</th>
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
                            <Link to={`/bookings/${r.booking_id}`} className="btn btn-sm btn-info fw-bold text-dark">
                              <i className="bi bi-geo-alt-fill me-1"></i> Live Map
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {driverRides.length === 0 && <tr><td colSpan="6" className="text-center py-4 text-muted">No assigned rides yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {(user.role === 'admin' || user.role === 'company_admin') && (
            <div className="glass-card d-flex align-items-center justify-content-center h-100">
              <div className="text-center">
                <h4 className="text-dark">Admin Profile Overview</h4>
                <p className="text-muted">You have administrative access to the platform.</p>
                <Link to="/admin" className="btn btn-primary mt-2">Go to Admin Dashboard</Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
