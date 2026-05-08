import React, {useEffect, useState} from 'react';
import api from '../utils/api';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

export default function BookingDetails(){
  const { id } = useParams();
  const [location, setLocation] = useState(null);
  const [path, setPath] = useState([]);
  const [booking, setBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [isPaying, setIsPaying] = useState(false);
  const [etaInfo, setEtaInfo] = useState(null);
  const [loadingMap, setLoadingMap] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.user_id) {
          const hist = await api.get(`/bookings/history/${user.user_id}`);
          const b = hist.data.bookings.find(x => x.booking_id === parseInt(id));
          if (b) setBooking(b);
        }
      } catch (e) { console.log('Error fetching booking details', e); }

      try {
        const r = await api.get(`/bookings/${id}/gps`);
        if (r.data.location) {
          setLocation([parseFloat(r.data.location.latitude), parseFloat(r.data.location.longitude)]);
          
          // Fetch ETA
          api.get(`/eta/${id}`).then(res => {
            setEtaInfo(res.data);
          }).catch(err => console.log('ETA Error:', err.response?.data?.error));
        }
        const h = await api.get(`/bookings/${id}/gps/history`);
        setPath(h.data.path.map(p=>[parseFloat(p.latitude), parseFloat(p.longitude)]));
      } catch(e) { console.log('No GPS data yet:', e); }
      setLoadingMap(false);
    };
    fetchDetails();

    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    if (booking && booking.vehicle_id) {
      socket.emit('join_vehicle', booking.vehicle_id);
    }
    socket.on('location_update', (data) => {
      setLocation([parseFloat(data.latitude), parseFloat(data.longitude)]);
      setPath(prev=>[...prev, [parseFloat(data.latitude), parseFloat(data.longitude)]]);
    });
    return () => socket.disconnect();
  }, [id, booking?.vehicle_id]);

  const handlePayment = async () => {
    if(!booking || !booking.fare) return alert('Fare details not available.');
    setIsPaying(true);
    try {
      await api.post('/payments', {
        booking_id: booking.booking_id,
        amount: booking.fare,
        method: paymentMethod
      });
      alert(`Payment of ₹${booking.fare} successful! Loyalty points awarded.`);
      setBooking({ ...booking, payment_status: 'paid' });
    } catch (err) {
      alert(err.response?.data?.error || 'Payment failed');
    }
    setIsPaying(false);
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="row g-4">
        {/* Left Column: Map */}
        <div className="col-lg-8">
          <div className="glass-card position-relative">
            <h3 className="mb-4">Booking #{id} Tracking</h3>
            
            {etaInfo && (
              <div className="position-absolute top-0 end-0 m-4 p-3 bg-white bg-opacity-75 rounded-3 border border-info shadow" style={{ zIndex: 1000, backdropFilter: 'blur(10px)' }}>
                <h6 className="text-info mb-1"><i className="bi bi-clock-history me-2"></i>Live ETA</h6>
                <p className="mb-0 text-dark fw-bold fs-5">{etaInfo.eta_text}</p>
                <small className="text-muted">{etaInfo.distance_text} remaining</small>
              </div>
            )}

            <div className="map-wrapper" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              {location ? (
                <MapContainer center={location} zoom={13} style={{height:400}}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={location} />
                  {path.length>1 && <Polyline positions={path} />}
                </MapContainer>
              ) : (
                <div className="d-flex justify-content-center align-items-center" style={{height:400, backgroundColor: 'var(--card-bg)'}}>
                  <p className="text-muted p-4 text-center">
                    {loadingMap ? 'Loading live tracking map...' : 'No active tracking data available for this vehicle yet.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Payment & Details */}
        <div className="col-lg-4">
          <div className="glass-card h-100">
            <h4 className="mb-3">Booking Details</h4>
            {booking ? (
              <div>
                <p className="text-muted mb-1">Status: <span className="text-dark fw-bold">{booking.status}</span></p>
                <p className="text-muted mb-1">Route: <span className="text-dark">{booking.source || booking.pickup_location} ➔ {booking.destination || booking.drop_location}</span></p>
                {booking.scheduled_date && (
                  <p className="text-muted mb-1">Travel Date: <span className="text-dark fw-bold">{new Date(booking.scheduled_date).toLocaleDateString()}</span></p>
                )}
                <p className="text-muted mb-4">Fare: <span className="text-dark fw-bold fs-5">₹{booking.fare || 0}</span></p>
                
                <hr style={{borderColor: 'var(--glass-border)'}}/>
                
                <h5 className="mb-3">Payment</h5>
                {booking.payment_status === 'paid' ? (
                  <div className="alert alert-success bg-success bg-opacity-10 border-0 text-success">
                    <span className="fs-4">✅</span> Paid in full
                  </div>
                ) : (
                  <div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Select Payment Method</label>
                      <select className="form-select" value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)}>
                        <option value="Credit Card">Credit Card</option>
                        <option value="UPI">UPI</option>
                        <option value="Wallet">Wallet</option>
                      </select>
                    </div>
                    <button 
                      className="btn btn-primary w-100 py-2 fw-bold" 
                      onClick={handlePayment} 
                      disabled={isPaying || !booking.fare}
                    >
                      {isPaying ? 'Processing...' : `Pay ₹${booking.fare || 0} Now`}
                    </button>
                    <p className="text-muted small mt-2 text-center">Earn loyalty points on every payment!</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted">Loading details...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}