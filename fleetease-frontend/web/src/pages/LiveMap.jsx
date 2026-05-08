import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

export default function LiveMap() {
  const [vehicles, setVehicles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFleetData = async () => {
      try {
        const vRes = await api.get('/vehicles');
        const activeVehicles = vRes.data.vehicles.filter(v => v.status !== 'maintenance');
        setVehicles(activeVehicles);

        const locs = [];
        for (let v of activeVehicles) {
          try {
            const lRes = await api.get(`/gps/${v.vehicle_id}`);
            if (lRes.data.location) {
              locs.push({
                ...v,
                lat: parseFloat(lRes.data.location.latitude),
                lng: parseFloat(lRes.data.location.longitude),
                speed: lRes.data.location.speed_kmph,
                fuel: lRes.data.location.fuel_level
              });
            }
          } catch (err) {
            // No gps data for this vehicle yet
          }
        }
        setLocations(locs);
      } catch (err) {
        console.error("Error fetching fleet data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFleetData();
    // In a real scenario, we would also attach a socket listener here for global updates
  }, []);

  const center = locations.length > 0 ? [locations[0].lat, locations[0].lng] : [20.5937, 78.9629]; // Default to India

  return (
    <div className="container-fluid mt-4 mb-5 px-4">
      <h3 className="mb-4 text-dark">Global Fleet Tracker</h3>
      <div className="glass-card p-2" style={{ height: '75vh' }}>
        {loading ? (
          <div className="d-flex h-100 justify-content-center align-items-center">
            <h4 className="text-muted">Loading fleet coordinates...</h4>
          </div>
        ) : (
          <div style={{ borderRadius: '12px', overflow: 'hidden', height: '100%' }}>
            <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {locations.map(loc => (
                <Marker key={loc.vehicle_id} position={[loc.lat, loc.lng]}>
                  <Popup>
                    <div className="text-dark">
                      <h6 className="fw-bold mb-1">{loc.vehicle_number}</h6>
                      <p className="mb-0 small">Type: {loc.type}</p>
                      <p className="mb-0 small">Speed: {loc.speed ? `${loc.speed} km/h` : 'Unknown'}</p>
                      <p className="mb-0 small">Fuel: {loc.fuel ? `${loc.fuel}%` : 'Unknown'}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
}
