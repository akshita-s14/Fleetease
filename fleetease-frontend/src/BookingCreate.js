import React, {useState} from 'react';
import api from '../utils/api';
export default function BookingCreate(){
  const [bookingType,setBookingType]=useState('B2C');
  const [pickup,setPickup]=useState('');
  const [drop,setDrop]=useState('');
  const [company,setCompany]=useState('');
  const submit = async (e)=>{
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user')||'{}');
      const payload = { customer_id: user.user_id || null, pickup_location: pickup, drop_location: drop, booking_type: bookingType, company_name: company };
      const r = await api.post('/bookings', payload);
      alert('Booking created id='+r.data.booking.booking_id);
    } catch (err) { alert(err.response?.data?.error || err.message) }
  };
  return (<div className="container"><h2>Create Booking</h2>
    <form onSubmit={submit}>
      <div className="mb-3"><label>Booking Type</label>
        <select className="form-select" value={bookingType} onChange={e=>setBookingType(e.target.value)}>
          <option value="B2C">B2C</option><option value="B2B">B2B</option>
        </select>
      </div>
      <div className="mb-3"><label>Pickup</label><input className="form-control" value={pickup} onChange={e=>setPickup(e.target.value)} /></div>
      <div className="mb-3"><label>Drop</label><input className="form-control" value={drop} onChange={e=>setDrop(e.target.value)} /></div>
      {bookingType==='B2B' && <div className="mb-3"><label>Company Name</label><input className="form-control" value={company} onChange={e=>setCompany(e.target.value)} /></div>}
      <button className="btn btn-primary">Create</button>
    </form>
  </div>);
}