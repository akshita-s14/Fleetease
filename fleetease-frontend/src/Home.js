import React from 'react';
import { Link } from 'react-router-dom';
export default function Home(){ return (
  <div className="container">
    <h1>Fleetease</h1>
    <p>Fleet & Booking Management System</p>
    <Link className="btn btn-primary" to="/login">Login</Link>
    <Link className="btn btn-secondary ms-2" to="/bookings/create">Create Booking</Link>
  </div>
)}