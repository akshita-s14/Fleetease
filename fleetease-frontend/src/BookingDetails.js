import React, {useEffect,useState} from 'react';
import api from '../utils/api';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default function BookingDetails(){
  const { id } = useParams();
  const [location,setLocation]=useState(null);
  const [path,setPath]=useState([]);
  const [eta,setEta]=useState(null);

  useEffect(()=>{
    const fetchData = async ()=>{
      try {
        const res = await api.get(`/bookings/${id}/gps`);
        setLocation([parseFloat(res.data.location.latitude), parseFloat(res.data.location.longitude)]);
      } catch (e){ console.log(e) }
      try {
        const r = await api.get(`/bookings/${id}/gps/history`);
        const coords = r.data.path.map(p=>[parseFloat(p.latitude), parseFloat(p.longitude)]);
        setPath(coords);
      } catch(e){ console.log(e) }
      try {
        const e = await api.get(`/eta/${id}`); setEta(e.data);
      } catch(e){}
    };
    fetchData();

    // socket real-time updates
    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    socket.emit('join_vehicle', 1); // in real app, use vehicle id from booking
    socket.on('location_update', (data)=>{
      setLocation([parseFloat(data.latitude), parseFloat(data.longitude)]);
      setPath(prev=>[...prev, [parseFloat(data.latitude), parseFloat(data.longitude)]]);
    });
    return ()=>{ socket.disconnect(); };
  },[id]);

  return (<div className="container">
    <h2>Booking #{id}</h2>
    <div>
      {eta ? <p>ETA: {eta.eta_text} | Distance: {eta.distance_text}</p> : <p>ETA not available</p>}
    </div>
    <div style={{height:400}}>
      {location ? (
        <MapContainer center={location} zoom={13} style={{height:'100%'}}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={location} />
          {path.length>1 && <Polyline positions={path} />}
        </MapContainer>
      ) : <p>Loading map...</p>}
    </div>
  </div>);
}