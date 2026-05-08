import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { Link } from "react-router-dom";
import {
  FaBus,
  FaUsers,
  FaMoneyBillWave,
  FaClipboardList,
  FaTools,
  FaUserTie,
} from "react-icons/fa";

const AdminSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get("/admin/summary");
        setSummary(res.data.summary);
      } catch (err) {
        console.error("Error fetching summary:", err);
        setErrorMsg(err.response?.data?.error || err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return <p className="text-center mt-5 fw-bold">Loading admin summary...</p>;
  }

  if (!summary) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger shadow-lg p-5 text-center">
          <h1 className="display-4 fw-bold mb-4">🚨 Admin Dashboard Error</h1>
          <h3 className="mb-4">I need you to tell me EXACTLY what this says:</h3>
          <div className="bg-dark text-white p-4 rounded fs-3 font-monospace mb-4">
            {errorMsg}
          </div>
          <p className="fs-5">Please copy the text in the black box above and paste it to me so I can fix it instantly!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4 mb-5 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold" style={{ letterSpacing: '-0.5px' }}>Dashboard Overview</h2>
        <div className="text-muted small">Updated just now</div>
      </div>

      {/* Quick Management Links */}
      <div className="row g-3 mb-5">
        <div className="col-md-3">
          <Link to="/bookings" className="text-decoration-none">
            <div className="card shadow-sm border-0 h-100 p-3" style={{ borderLeft: '4px solid #0d6efd !important', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e=>e.currentTarget.style.transform='none'}>
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 text-primary p-3 rounded me-3">
                  <FaClipboardList size={20} />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold text-dark">Manage Work</h6>
                  <small className="text-muted">View all bookings</small>
                </div>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-3">
          <Link to="/drivers" className="text-decoration-none">
            <div className="card shadow-sm border-0 h-100 p-3" style={{ borderLeft: '4px solid #fd7e14 !important', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e=>e.currentTarget.style.transform='none'}>
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 text-warning p-3 rounded me-3">
                  <FaUserTie size={20} />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold text-dark">Drivers</h6>
                  <small className="text-muted">Manage roster</small>
                </div>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-3">
          <Link to="/vehicles" className="text-decoration-none">
            <div className="card shadow-sm border-0 h-100 p-3" style={{ borderLeft: '4px solid #198754 !important', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e=>e.currentTarget.style.transform='none'}>
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 text-success p-3 rounded me-3">
                  <FaBus size={20} />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold text-dark">Fleet Setup</h6>
                  <small className="text-muted">Manage vehicles</small>
                </div>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-3">
          <Link to="/invoices" className="text-decoration-none">
            <div className="card shadow-sm border-0 h-100 p-3" style={{ borderLeft: '4px solid #0dcaf0 !important', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e=>e.currentTarget.style.transform='none'}>
              <div className="d-flex align-items-center">
                <div className="bg-info bg-opacity-10 text-info p-3 rounded me-3">
                  <FaMoneyBillWave size={20} />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold text-dark">Invoicing</h6>
                  <small className="text-muted">Corporate billing</small>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 p-4 h-100">
            <h6 className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Total Bookings</h6>
            <h1 className="display-5 fw-bold mb-3">{summary.bookings.total}</h1>
            <div className="d-flex justify-content-between border-top pt-3">
              <div className="text-muted small"><span className="text-primary fw-bold">{summary.bookings.b2c}</span> Retail</div>
              <div className="text-muted small"><span className="text-info fw-bold">{summary.bookings.b2b}</span> Corporate</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 p-4 h-100">
            <h6 className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Active Fleet</h6>
            <h1 className="display-5 fw-bold mb-3">{summary.vehicles.total}</h1>
            <div className="d-flex justify-content-between border-top pt-3">
              <div className="text-muted small"><span className="text-success fw-bold">{summary.vehicles.available}</span> Available</div>
              <div className="text-muted small"><span className="text-danger fw-bold">{summary.vehicles.maintenance}</span> Maintenance</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 p-4 h-100">
            <h6 className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Financials</h6>
            <h1 className="display-5 fw-bold mb-3">₹{summary.payments.revenue.toLocaleString()}</h1>
            <div className="d-flex justify-content-between border-top pt-3">
              <div className="text-muted small">Total Realized Revenue</div>
              <div className="text-muted small">Pending: ₹{summary.payments.pending.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics & Data */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 p-4 h-100">
            <h6 className="text-uppercase text-muted fw-bold mb-4" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Platform Users</h6>
            <div className="d-flex align-items-center mb-3">
              <FaUsers className="text-secondary me-3" size={24} />
              <div>
                <div className="fw-bold fs-5">{summary.users.customers + summary.users.companyAdmins}</div>
                <div className="text-muted small">Total Accounts</div>
              </div>
            </div>
            <div className="d-flex align-items-center">
              <FaUserTie className="text-secondary me-3" size={24} />
              <div>
                <div className="fw-bold fs-5">{summary.drivers.active}</div>
                <div className="text-muted small">Active Drivers</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
              <h6 className="text-uppercase text-muted fw-bold m-0" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Recent Booking Activity</h6>
            </div>
            <div className="card-body px-0">
              <div className="table-responsive px-4">
                <table className="table table-borderless align-middle mb-0">
                  <thead className="border-bottom">
                    <tr>
                      <th className="text-muted small text-uppercase" style={{fontWeight: 500}}>ID</th>
                      <th className="text-muted small text-uppercase" style={{fontWeight: 500}}>Customer</th>
                      <th className="text-muted small text-uppercase" style={{fontWeight: 500}}>Vehicle</th>
                      <th className="text-muted small text-uppercase" style={{fontWeight: 500}}>Status</th>
                      <th className="text-muted small text-uppercase" style={{fontWeight: 500}}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.recentBookings.map((b) => (
                      <tr key={b.booking_id} className="border-bottom">
                        <td className="text-muted">#{b.booking_id}</td>
                        <td className="fw-bold">{b.customer_name}</td>
                        <td>{b.vehicle_number || <span className="text-muted fst-italic">Pending</span>}</td>
                        <td>
                          <span className={`badge bg-${b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning text-dark' : 'danger'} bg-opacity-10 text-${b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'danger'} px-3 py-2 rounded-pill`}>
                            {b.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-muted small">{new Date(b.booking_time).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {summary.recentBookings.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">No recent activity found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSummary;
