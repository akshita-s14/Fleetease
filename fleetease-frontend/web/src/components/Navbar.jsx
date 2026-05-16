import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'dark');
  
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
    <nav className="navbar navbar-expand-lg px-4 py-3 sticky-top">
      <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center" to="/">
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
          
          {/* Theme Toggle Slider */}
          <div 
            onClick={toggleTheme}
            style={{
              width: '60px',
              height: '32px',
              borderRadius: '32px',
              background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              border: `1px solid var(--border-color)`,
              position: 'relative',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '0 4px',
              transition: 'background 0.3s ease'
            }}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            <div 
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: theme === 'dark' ? '#fff' : '#6366f1',
                position: 'absolute',
                left: theme === 'dark' ? '32px' : '4px',
                transition: 'left 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), background 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              {theme === 'dark' ? 
                <i className="bi bi-moon-stars-fill" style={{fontSize: '10px', color: '#0f172a'}}></i> : 
                <i className="bi bi-brightness-high-fill" style={{fontSize: '12px', color: '#fff'}}></i>
              }
            </div>
          </div>

          {user ? (
            <>
              <div className="d-flex align-items-center bg-transparent border rounded-pill px-3 py-2">
                <span className="text-muted me-3">Hi, <strong className="text-white">{user.name}</strong></span>
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