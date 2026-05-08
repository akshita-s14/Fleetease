import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function VehiclesList() {
  const [vehicles, setVehicles] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [maintenanceLogs, setMaintenanceLogs] = useState({});
  const [newLog, setNewLog] = useState({ description: '', cost: '' });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ vehicle_number: '', type: 'bus', capacity: '', status: 'available' });

  const fetchVehicles = () => {
    api.get('/vehicles')
      .then(r => setVehicles(r.data.vehicles))
      .catch(e => console.error(e));
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const submitVehicle = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vehicles', {
        ...newVehicle,
        capacity: parseInt(newVehicle.capacity) || 0
      });
      fetchVehicles();
      setShowAddForm(false);
      setNewVehicle({ vehicle_number: '', type: 'bus', capacity: '', status: 'available' });
      alert('Vehicle added successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to add vehicle');
    }
  };

  const toggleMaintenance = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!maintenanceLogs[id]) {
      try {
        const res = await api.get(`/fleet/maintenance/${id}`);
        setMaintenanceLogs(prev => ({ ...prev, [id]: res.data.maintenance }));
      } catch (e) { console.error(e); }
    }
  };

  const submitLog = async (e, vehicle_id) => {
    e.preventDefault();
    try {
      const res = await api.post('/fleet/maintenance', {
        vehicle_id,
        description: newLog.description,
        cost: parseFloat(newLog.cost)
      });
      setMaintenanceLogs(prev => ({
        ...prev,
        [vehicle_id]: [res.data.maintenance, ...(prev[vehicle_id] || [])]
      }));
      setNewLog({ description: '', cost: '' });
      alert('Maintenance logged!');
    } catch (e) { alert('Failed to log maintenance'); }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Fleet Vehicles</h3>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add Vehicle'}
        </button>
      </div>

      {showAddForm && (
        <div className="card shadow-sm border-0 mb-4 p-4">
          <h5>Add New Vehicle</h5>
          <form onSubmit={submitVehicle} className="row g-3 mt-2">
            <div className="col-md-3">
              <label className="form-label">Vehicle Number</label>
              <input type="text" className="form-control" required value={newVehicle.vehicle_number} onChange={e => setNewVehicle({...newVehicle, vehicle_number: e.target.value})} placeholder="e.g. MH-12-AB-1234" />
            </div>
            <div className="col-md-3">
              <label className="form-label">Type</label>
              <select className="form-select" value={newVehicle.type} onChange={e => setNewVehicle({...newVehicle, type: e.target.value})}>
                <option value="bus">Bus</option>
                <option value="van">Van</option>
                <option value="car">Car</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Capacity</label>
              <input type="number" className="form-control" required value={newVehicle.capacity} onChange={e => setNewVehicle({...newVehicle, capacity: e.target.value})} placeholder="Seats" />
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button type="submit" className="btn btn-success w-100">Save Vehicle</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card p-0 overflow-hidden">
        <table className="table table-hover mb-0">
          <thead className="table-primary">
            <tr>
              <th>ID</th>
              <th>Vehicle Number</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Assigned Driver ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <React.Fragment key={v.vehicle_id}>
                <tr>
                  <td>{v.vehicle_id}</td>
                  <td className="fw-bold">{v.vehicle_number}</td>
                  <td>{v.type}</td>
                  <td>{v.capacity}</td>
                  <td>
                    <span className={`badge bg-${v.status === 'available' ? 'success' : v.status === 'maintenance' ? 'danger' : 'warning'}`}>
                      {v.status}
                    </span>
                  </td>
                  <td>{v.assigned_driver_id || 'Unassigned'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-info" onClick={() => toggleMaintenance(v.vehicle_id)}>
                      {expandedId === v.vehicle_id ? 'Hide Logs' : 'Maintenance'}
                    </button>
                  </td>
                </tr>
                {expandedId === v.vehicle_id && (
                  <tr>
                    <td colSpan="7" className="bg-light p-4">
                      <div className="row g-4">
                        <div className="col-md-7">
                          <h6 className="text-dark">Maintenance History</h6>
                          {maintenanceLogs[v.vehicle_id]?.length > 0 ? (
                            <ul className="list-group list-group-flush rounded-3">
                              {maintenanceLogs[v.vehicle_id].map(log => (
                                <li key={log.maintenance_id} className="list-group-item bg-transparent text-dark border-secondary">
                                  <div className="d-flex justify-content-between">
                                    <span>{log.description}</span>
                                    <span className="text-danger fw-bold">₹{log.cost}</span>
                                  </div>
                                  <small className="text-muted">{new Date(log.service_date).toLocaleDateString()}</small>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted small">No maintenance logs found.</p>
                          )}
                        </div>
                        <div className="col-md-5">
                          <h6 className="text-dark">Add Log</h6>
                          <form onSubmit={(e) => submitLog(e, v.vehicle_id)}>
                            <div className="mb-2">
                              <input type="text" className="form-control form-control-sm" placeholder="Description" required value={newLog.description} onChange={e=>setNewLog({...newLog, description: e.target.value})} />
                            </div>
                            <div className="mb-2">
                              <input type="number" className="form-control form-control-sm" placeholder="Cost (₹)" required value={newLog.cost} onChange={e=>setNewLog({...newLog, cost: e.target.value})} />
                            </div>
                            <button type="submit" className="btn btn-primary btn-sm w-100">Save Log</button>
                          </form>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted">No vehicles found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
