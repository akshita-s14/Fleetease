import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function DriversList() {
  const [drivers, setDrivers] = useState([]);

  const fetchDrivers = () => {
    api.get('/drivers')
      .then(r => setDrivers(r.data.drivers))
      .catch(e => console.error(e));
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const confirmDriver = async (id) => {
    try {
      await api.put(`/drivers/${id}/confirm`);
      fetchDrivers();
    } catch (e) {
      console.error(e);
      alert('Failed to confirm driver');
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <h3 className="mb-4">Registered Drivers</h3>
      <div className="glass-card p-0 overflow-hidden">
        <table className="table table-hover mb-0">
          <thead className="table-primary">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>License No.</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(d => (
              <tr key={d.driver_id}>
                <td>{d.driver_id}</td>
                <td className="fw-bold">{d.name}</td>
                <td>{d.phone}</td>
                <td>{d.license_no}</td>
                <td>
                  <span className={`badge bg-${d.status === 'active' ? 'success' : d.status === 'pending' ? 'warning' : 'secondary'}`}>
                    {d.status}
                  </span>
                </td>
                <td>
                  {d.status === 'pending' && (
                    <button className="btn btn-sm btn-success" onClick={() => confirmDriver(d.driver_id)}>
                      Confirm
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {drivers.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">No drivers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
