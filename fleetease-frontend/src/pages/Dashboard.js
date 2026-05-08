import React, {useEffect,useState} from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
export default function Dashboard(){
  const [summary,setSummary]=useState(null);
  useEffect(()=>{ api.get('/admin/summary').then(r=>setSummary(r.data.summary)).catch(()=>{}); },[]);
  return (<div className="container">
    <h2>Dashboard</h2>
    {summary ? (<div className="row">
      <div className="col"><div className="card p-3">Bookings: {summary.bookings}</div></div>
      <div className="col"><div className="card p-3">Vehicles: {summary.vehicles}</div></div>
      <div className="col"><div className="card p-3">Drivers: {summary.drivers}</div></div>
      <div className="col"><div className="card p-3">Revenue: ₹{summary.revenue}</div></div>
    </div>) : <p>No summary available (login as admin)</p>}
    <hr/>
    <Link to="/bookings/create" className="btn btn-primary">Create Booking</Link>
  </div>);
}