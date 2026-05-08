import React, {useEffect,useState} from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
export default function Dashboard(){
  const [summary,setSummary]=useState(null);
  useEffect(()=>{ api.get('/admin/summary').then(r=>setSummary(r.data.summary)).catch(()=>{}); },[]);
  return (<div className="container mt-4">
    <h2 className="mb-4">Dashboard</h2>
    {summary ? (<div className="row g-4">
      <div className="col-md-3"><div className="glass-card text-center p-4"><h5 className="text-muted">Bookings</h5><h3>{summary.bookings}</h3></div></div>
      <div className="col-md-3"><div className="glass-card text-center p-4"><h5 className="text-muted">Vehicles</h5><h3>{summary.vehicles}</h3></div></div>
      <div className="col-md-3"><div className="glass-card text-center p-4"><h5 className="text-muted">Drivers</h5><h3>{summary.drivers}</h3></div></div>
      <div className="col-md-3"><div className="glass-card text-center p-4"><h5 className="text-muted">Revenue</h5><h3 className="text-success">₹{summary.revenue}</h3></div></div>
    </div>) : <p className="text-muted">No summary available (login as admin)</p>}
    <hr className="my-5" style={{borderColor: 'rgba(255,255,255,0.1)'}}/>
    <Link to="/bookings/create" className="btn btn-primary">Create Booking</Link>
  </div>);
}