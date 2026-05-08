import React, {useState, useEffect} from 'react';
import api from '../utils/api';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BookingCreate(){
  const [type, setType] = useState('B2C');
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [company, setCompany] = useState('');
  const [fare, setFare] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [scheduledDate, setScheduledDate] = useState('');
  
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fetch available routes to calculate dynamic pricing
    api.get('/routes/search').then(r => {
      setRoutes(r.data.routes);
      
      // Check if we navigated here from Home with a preselected route
      if (location.state && location.state.preselectedRouteId) {
        const routeId = parseInt(location.state.preselectedRouteId);
        const route = r.data.routes.find(x => x.route_id === routeId);
        if (route) {
          setSelectedRoute(route);
          setPickup(route.source);
          setDrop(route.destination);
          setFare(route.distance_km * route.fare_per_km);
        }
      }
      
      // Auto-fill date if selected on home page
      if (location.state && location.state.preselectedDate) {
        setScheduledDate(location.state.preselectedDate);
      }
      
      // Auto-fill booking type if selected on home page
      if (location.state && location.state.preselectedType) {
        setType(location.state.preselectedType);
      }
    }).catch(()=>{});
  }, [location.state]);

  const handleRouteSelect = (routeId) => {
    if (!routeId) {
      setSelectedRoute(null);
      setPickup('');
      setDrop('');
      setFare(0);
      return;
    }
    const r = routes.find(x => x.route_id === parseInt(routeId));
    setSelectedRoute(r);
    if(r) {
      setPickup(r.source);
      setDrop(r.destination);
      setFare(r.distance_km * r.fare_per_km);
    } else {
      setFare(0);
    }
  };

  const toggleSeat = (seatNum) => {
    if (selectedSeats.includes(seatNum)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNum));
    } else {
      setSelectedSeats([...selectedSeats, seatNum]);
    }
  };

  const submit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'null' || token === 'undefined') {
        alert('Please log in or sign up to confirm your booking.');
        nav('/login');
        return;
      }
      const user = JSON.parse(localStorage.getItem('user')||'{}');
      const payload = { 
        customer_id: user.user_id || null, 
        pickup_location: pickup, 
        drop_location: drop, 
        route_id: selectedRoute ? selectedRoute.route_id : null,
        fare: fare > 0 ? fare : null,
        booking_type: type,
        company_name: type==='B2B' ? company : null,
        company_contact: selectedSeats.length > 0 ? `Seats: ${selectedSeats.join(',')}` : null, // Saving seats in contact field for now
        scheduled_date: scheduledDate
      };
      const res = await api.post('/bookings', payload);
      alert('Booking created successfully! ID: ' + res.data.booking.booking_id);
      nav('/bookings/' + res.data.booking.booking_id);
    } catch (err) { 
      alert(err.response?.data?.error || 'Error creating booking'); 
    }
  };

  return (
    <div className="container mt-4 mb-5 d-flex justify-content-center">
      <div className="glass-card w-100" style={{ maxWidth: '800px' }}>
        <h3 className="mb-4">Create New Booking</h3>
        
        <form onSubmit={submit}>
          <div className="row g-4">
            {/* Left Column - Details */}
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label text-muted">Booking Type</label>
                <select className="form-select" value={type} onChange={e=>setType(e.target.value)}>
                  <option value="B2C">B2C (Individual)</option>
                  <option value="B2B">B2B (Corporate)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted">Travel Date</label>
                <input required type="date" className="form-control" value={scheduledDate} onChange={e=>setScheduledDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted">Select Route (Calculates Fare)</label>
                <select className="form-select" value={selectedRoute ? selectedRoute.route_id : ""} onChange={e => handleRouteSelect(e.target.value)}>
                  <option value="">-- Custom Route --</option>
                  {routes.map(r => (
                    <option key={r.route_id} value={r.route_id}>
                      {r.source} to {r.destination} ({r.distance_km} km)
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted">Pickup Location</label>
                <input required className="form-control" placeholder="Enter pickup address" value={pickup} onChange={e=>setPickup(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted">Drop Location</label>
                <input required className="form-control" placeholder="Enter destination" value={drop} onChange={e=>setDrop(e.target.value)} />
              </div>
              
              {type==='B2B' && (
                <div className="mb-3">
                  <label className="form-label text-muted">Company Name</label>
                  <input required className="form-control" placeholder="Enter company name" value={company} onChange={e=>setCompany(e.target.value)} />
                </div>
              )}

              {fare > 0 && (
                <div className="alert alert-info bg-primary bg-opacity-10 border-0 text-primary mt-3">
                  <strong>Estimated Fare:</strong> ₹{fare}
                </div>
              )}
            </div>

            {/* Right Column - Bus Layout Seat Selection */}
            <div className="col-md-6 d-flex flex-column align-items-center">
              <label className="form-label text-muted mb-3">Select Seats (Optional)</label>
              
              <div className="bus-layout p-4 rounded" style={{ backgroundColor: 'var(--bg-main)', border: '2px solid var(--border-color)', width: 'fit-content', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)' }}>
                {/* Steering Wheel / Driver Area */}
                <div className="d-flex justify-content-end mb-4 border-bottom pb-3">
                  <div className="driver-seat text-center p-2 rounded shadow-sm" style={{ width: '40px', height: '40px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }} title="Driver Seat">
                    <i className="bi bi-universal-access"></i>
                  </div>
                </div>

                {/* Seats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '40px 40px 30px 40px 40px', gap: '12px' }}>
                  {Array.from({length: 20}, (_, i) => i + 1).map(seat => {
                    const isSelected = selectedSeats.includes(seat);
                    return (
                      <React.Fragment key={`frag-${seat}`}>
                        {seat % 4 === 3 && <div key={`aisle-${seat}`} className="aisle"></div>}
                        <div 
                          key={seat}
                          onClick={() => toggleSeat(seat)}
                          className="d-flex align-items-center justify-content-center shadow-sm"
                          style={{
                            width: '40px', height: '45px',
                            borderRadius: '6px 6px 2px 2px', cursor: 'pointer',
                            fontWeight: 'bold', transition: 'all 0.2s',
                            background: isSelected ? 'var(--primary-color)' : 'var(--card-bg)',
                            color: isSelected ? '#ffffff' : 'var(--text-main)',
                            border: isSelected ? 'none' : '1px solid var(--border-color)',
                            boxShadow: isSelected ? '0 4px 8px rgba(0,140,255,0.3)' : 'var(--card-shadow)'
                          }}
                        >
                          {seat}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 text-center w-100">
                <div className="d-flex justify-content-center gap-3 mb-2 small text-muted">
                  <div className="d-flex align-items-center gap-2"><div style={{width:'15px', height:'15px', background:'var(--card-bg)', border:'1px solid var(--border-color)', borderRadius:'3px'}}></div> Available</div>
                  <div className="d-flex align-items-center gap-2"><div style={{width:'15px', height:'15px', background:'var(--primary-color)', borderRadius:'3px'}}></div> Selected</div>
                </div>
                <p className="text-muted small m-0 fw-bold border p-2 rounded bg-light" style={{ backgroundColor: 'var(--bg-main)' }}>
                  Selected: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                </p>
              </div>
            </div>
          </div>
          
          <button className="btn btn-primary w-100 py-3 mt-4 fw-bold fs-5 shadow-lg">Confirm Booking</button>
        </form>
      </div>
    </div>
  );
}