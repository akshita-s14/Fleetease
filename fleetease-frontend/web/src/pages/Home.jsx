import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from '../utils/api';

export default function Home() {
  const [testimonials, setTestimonials] = useState([]);
  const [newTestimonial, setNewTestimonial] = useState({ name: '', rating: 5, comment: '' });
  
  // Search Widget State
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [bookingType, setBookingType] = useState('B2C');
  const [routes, setRoutes] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const navigate = useNavigate();

  const [gallery, setGallery] = useState([]);
  const [newGalleryItem, setNewGalleryItem] = useState({ image_url: '', title: '', description: '' });

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    api.get('/testimonials').then(res => setTestimonials(res.data)).catch(console.log);
    // Fetch routes for the search widget
    api.get('/routes/search').then(res => setRoutes(res.data.routes)).catch(console.log);
    // Fetch gallery
    api.get('/gallery').then(res => setGallery(res.data.gallery)).catch(console.log);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if(!source.trim() || !destination.trim()) {
      setSearchError("Please enter both FROM and TO locations.");
      setSearchResult(null);
      return;
    }
    
    // Find matching route (case-insensitive partial match)
    const match = routes.find(r => 
      r.source.toLowerCase().includes(source.toLowerCase()) && 
      r.destination.toLowerCase().includes(destination.toLowerCase())
    );

    if (match) {
      setSearchError('');
      setSearchResult(match);
    } else {
      setSearchResult(null);
      setSearchError(`Sorry, we don't have a direct pre-calculated route between "${source}" and "${destination}" yet. You can still create a custom booking!`);
    }
  };

  const proceedToBooking = () => {
    navigate('/bookings/create', { 
      state: { 
        preselectedRouteId: searchResult ? searchResult.route_id : null,
        preselectedDate: scheduledDate,
        preselectedType: bookingType
      } 
    });
  };

  const submitTestimonial = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/testimonials', newTestimonial);
      setTestimonials([res.data.item, ...testimonials]);
      setNewTestimonial({ name: '', rating: 5, comment: '' });
      alert('Thank you for your feedback!');
    } catch (err) { alert('Failed to submit testimonial'); }
  };

  const submitGalleryItem = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/gallery', newGalleryItem);
      setGallery([res.data.item, ...gallery]);
      setNewGalleryItem({ image_url: '', title: '', description: '' });
      alert('Gallery item added!');
    } catch (err) { alert('Failed to add gallery item'); }
  };

  const deleteGalleryItem = async (id) => {
    try {
      await api.delete(`/gallery/${id}`);
      setGallery(gallery.filter(g => g.id !== id));
    } catch (err) { alert('Failed to delete gallery item'); }
  };

  return (
    <div className="pb-5">
      {/* Hero Section */}
      <div className="hero-gradient text-center">
        <div className="container">
          <h1 className="display-4 fw-bold mb-2 text-white">Your Ultimate Fleet Partner</h1>
          <p className="lead text-white text-opacity-75 mb-4">Fast, reliable, and transparent vehicle bookings across the nation.</p>
        </div>
      </div>

      {/* MMT Style Floating Search Widget */}
      <div className="container search-widget-container mb-5">
        <div className="glass-card shadow-lg mx-auto" style={{ maxWidth: '1000px', borderRadius: '16px', padding: '2.5rem' }}>
          
          <div className="d-flex mb-4 gap-4 border-bottom pb-2">
            <div 
              className={`fw-bold pb-2 ${bookingType === 'B2C' ? '' : 'text-muted'}`} 
              style={{ color: bookingType === 'B2C' ? 'var(--primary-color)' : '', borderBottom: bookingType === 'B2C' ? '3px solid var(--primary-color)' : '3px solid transparent', cursor: 'pointer' }}
              onClick={() => setBookingType('B2C')}
            >
              <i className="bi bi-car-front-fill me-2"></i> Book a Cab/Fleet
            </div>
            <div 
              className={`fw-bold pb-2 ${bookingType === 'B2B' ? '' : 'text-muted'}`} 
              style={{ color: bookingType === 'B2B' ? 'var(--primary-color)' : '', borderBottom: bookingType === 'B2B' ? '3px solid var(--primary-color)' : '3px solid transparent', cursor: 'pointer' }}
              onClick={() => setBookingType('B2B')}
            >
              <i className="bi bi-box-seam me-2"></i> B2B Cargo
            </div>
          </div>

          <div className="row g-3 align-items-center">
            <div className="col-md-4">
               <div className="p-2 border rounded" style={{ backgroundColor: 'var(--bg-main)' }}>
                 <label className="text-muted fw-bold small mb-0 px-2">FROM</label>
                 <input 
                   className="form-control border-0 fw-bold fs-5 shadow-none bg-transparent" 
                   placeholder={bookingType === 'B2B' ? "Pickup Warehouse/City" : "Enter City or Location"} 
                   value={source}
                   onChange={e => setSource(e.target.value)}
                 />
               </div>
            </div>
            <div className="col-md-4">
               <div className="p-2 border rounded" style={{ backgroundColor: 'var(--bg-main)' }}>
                 <label className="text-muted fw-bold small mb-0 px-2">TO</label>
                 <input 
                   className="form-control border-0 fw-bold fs-5 shadow-none bg-transparent" 
                   placeholder={bookingType === 'B2B' ? "Delivery Destination" : "Enter Destination"} 
                   value={destination}
                   onChange={e => setDestination(e.target.value)}
                 />
               </div>
            </div>
            <div className="col-md-4">
               <div className="p-2 border rounded" style={{ backgroundColor: 'var(--bg-main)' }}>
                 <label className="text-muted fw-bold small mb-0 px-2">DEPARTURE</label>
                 <input 
                   type="date"
                   className="form-control border-0 fw-bold fs-5 shadow-none bg-transparent" 
                   value={scheduledDate}
                   onChange={e => setScheduledDate(e.target.value)}
                   min={new Date().toISOString().split('T')[0]}
                 />
               </div>
            </div>
          </div>

          <div className="text-center mt-4 mb-2">
             <button onClick={handleSearch} className="btn btn-primary btn-lg fw-bold px-5 py-3 rounded-pill text-white shadow" style={{ background: 'linear-gradient(93deg, #53b2fe, #065af3)', fontSize: '1.2rem', letterSpacing: '1px' }}>
               SEARCH
             </button>
          </div>

          {/* Search Result Section */}
          {searchResult && (
            <div className="mt-4 p-4 border border-success rounded bg-success bg-opacity-10 text-center fade show">
              <h5 className="text-success fw-bold mb-3">Great News! We serve this route.</h5>
              <div className="d-flex flex-wrap justify-content-center gap-5 my-4">
                <div className="text-dark">
                   <small className="text-muted d-block text-uppercase fw-bold mb-1"><i className="bi bi-signpost-split me-1"></i> Distance</small>
                   <span className="fs-3 fw-bold">{searchResult.distance_km} <span className="fs-6">km</span></span>
                </div>
                <div className="text-dark border-start ps-5">
                   <small className="text-muted d-block text-uppercase fw-bold mb-1"><i className="bi bi-wallet2 me-1"></i> Estimated Fare</small>
                   <span className="fs-3 fw-bold text-primary">₹{searchResult.distance_km * searchResult.fare_per_km}</span>
                </div>
              </div>
              <button onClick={proceedToBooking} className="btn btn-dark btn-lg fw-bold px-5 py-2 rounded-pill shadow-sm">
                Proceed to Seat Selection <i className="bi bi-arrow-right ms-2"></i>
              </button>
            </div>
          )}
          {searchError && (
             <div className="mt-4 p-4 border border-warning rounded bg-warning bg-opacity-10 text-center">
               <p className="text-dark fw-bold mb-3">{searchError}</p>
               <button onClick={proceedToBooking} className="btn btn-outline-dark fw-bold px-4 rounded-pill">
                 Proceed to Custom Booking
               </button>
             </div>
          )}
        </div>
      </div>

      {/* Gallery Section */}
      <div className="container mt-5 pt-5 mb-5">
        <h2 className="text-center mb-5 text-dark fw-bold">Our Achievements & Gallery</h2>
        
        {isAdmin && (
          <div className="glass-card p-4 mb-5" style={{ borderRadius: '12px' }}>
            <h5 className="mb-3">Admin: Add to Gallery</h5>
            <form onSubmit={submitGalleryItem} className="row g-3">
              <div className="col-md-4">
                <input type="url" className="form-control" placeholder="Image URL (e.g. https://...)" required value={newGalleryItem.image_url} onChange={e=>setNewGalleryItem({...newGalleryItem, image_url: e.target.value})} />
              </div>
              <div className="col-md-3">
                <input type="text" className="form-control" placeholder="Title (optional)" value={newGalleryItem.title} onChange={e=>setNewGalleryItem({...newGalleryItem, title: e.target.value})} />
              </div>
              <div className="col-md-3">
                <input type="text" className="form-control" placeholder="Description (optional)" value={newGalleryItem.description} onChange={e=>setNewGalleryItem({...newGalleryItem, description: e.target.value})} />
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-primary w-100 fw-bold">Add Photo</button>
              </div>
            </form>
          </div>
        )}

        <div className="row g-4">
          {gallery.map(item => (
            <div className="col-md-4" key={item.id}>
              <div className="card shadow-sm border-0 h-100 overflow-hidden" style={{ borderRadius: '12px' }}>
                <img src={item.image_url} alt={item.title || "Gallery"} className="card-img-top" style={{ height: '250px', objectFit: 'cover' }} onError={(e) => e.target.src='https://via.placeholder.com/400x250?text=Image+Not+Found'} />
                {(item.title || item.description) && (
                  <div className="card-body">
                    {item.title && <h5 className="card-title fw-bold text-dark">{item.title}</h5>}
                    {item.description && <p className="card-text text-muted">{item.description}</p>}
                  </div>
                )}
                {isAdmin && (
                  <div className="card-footer bg-white border-0 text-end">
                    <button className="btn btn-sm btn-outline-danger" onClick={() => deleteGalleryItem(item.id)}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {gallery.length === 0 && <p className="text-center text-muted col-12">No photos in the gallery yet.</p>}
        </div>
      </div>

      <div className="container mt-5 pt-5 mb-5">
        <h2 className="text-center mb-5 text-dark fw-bold">What Our Clients Say</h2>
        <div className="row g-4">
          <div className="col-md-8">
            <div className="row g-4">
              {testimonials.map(t => (
                <div className="col-md-6" key={t.id}>
                  <div className="glass-card h-100 p-4" style={{ borderRadius: '12px' }}>
                    <div className="text-warning mb-2">
                      {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
                    </div>
                    <p className="text-dark mb-3 text-opacity-75">"{t.comment}"</p>
                    <h6 className="text-primary fw-bold mb-0">- {t.name}</h6>
                  </div>
                </div>
              ))}
              {testimonials.length === 0 && <p className="text-muted">No testimonials yet.</p>}
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="glass-card p-4" style={{ borderRadius: '12px' }}>
              <h4 className="mb-4">Leave a Review</h4>
              <form onSubmit={submitTestimonial}>
                <div className="mb-3">
                  <input type="text" className="form-control" placeholder="Your Name" required value={newTestimonial.name} onChange={e=>setNewTestimonial({...newTestimonial, name: e.target.value})} />
                </div>
                <div className="mb-3">
                  <label className="text-muted small mb-1">Rating</label>
                  <select className="form-select" value={newTestimonial.rating} onChange={e=>setNewTestimonial({...newTestimonial, rating: parseInt(e.target.value)})}>
                    <option value="5">★★★★★ (5/5)</option>
                    <option value="4">★★★★☆ (4/5)</option>
                    <option value="3">★★★☆☆ (3/5)</option>
                    <option value="2">★★☆☆☆ (2/5)</option>
                    <option value="1">★☆☆☆☆ (1/5)</option>
                  </select>
                </div>
                <div className="mb-3">
                  <textarea className="form-control" rows="3" placeholder="Share your experience..." required value={newTestimonial.comment} onChange={e=>setNewTestimonial({...newTestimonial, comment: e.target.value})}></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-100 fw-bold">Submit Feedback</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}