import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className={`navbar navbar-expand-lg ${theme === 'dark' ? 'navbar-dark' : 'navbar-light bg-white'} px-4 py-3 sticky-top border-bottom`} style={{ backgroundColor: theme === 'dark' ? 'var(--card-bg)' : '#ffffff' }}>
      <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center" style={{color: 'var(--primary-color)', letterSpacing: '-0.5px'}} to="/">
        Fleetease
      </Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto ms-4">
          <li className="nav-item"><Link className="nav-link" to="/bookings">Bookings</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/bookings/create">Create Booking</Link></li>
          {user && (user.role === 'admin' || user.role === 'company_admin') && (
            <li className="nav-item"><Link className="nav-link" to="/vehicles">Vehicles</Link></li>
          )}
          {user && (user.role === 'admin' || user.role === 'company_admin') && (
            <li className="nav-item"><Link className="nav-link text-warning fw-bold" to="/map">Live Map</Link></li>
          )}
          {user && user.role === 'admin' && (
            <li className="nav-item"><Link className="nav-link" to="/drivers">Drivers</Link></li>
          )}
          {user && user.role === 'driver' && (
            <li className="nav-item"><Link className="nav-link text-info fw-bold" to="/driver/dashboard">Driver Portal</Link></li>
          )}
          {user && (user.role === 'admin' || user.role === 'company_admin') && (
            <li className="nav-item"><Link className="nav-link text-success" to="/invoices">Invoices</Link></li>
          )}
          {user && (user.role === 'admin' || user.role === 'company_admin') && (
            <li className="nav-item"><Link className="nav-link" to="/admin">Dashboard</Link></li>
          )}
        </ul>
        <div className="d-flex align-items-center gap-3">
          <button 
            className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center" 
            style={{ width: '36px', height: '36px' }} 
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
          
          {user ? (
            <>
              <div className="d-flex align-items-center bg-light border rounded-pill px-3 py-1">
                <span className="text-muted me-3">Hi, <strong className="text-dark">{user.name}</strong></span>
                <Link to="/profile" className="btn btn-sm btn-outline-info rounded-pill px-3 me-2">Profile</Link>
                <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={logout}>Logout</button>
              </div>
            </>
          ) : (
            <Link className="btn btn-primary rounded-pill px-4" to="/login">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
}