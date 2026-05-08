import React, {useState} from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [isRegister, setIsRegister] = useState(false);
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [name, setName]=useState(''); const [phone, setPhone]=useState('');
  const [role, setRole]=useState('customer');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await api.post('/auth/register', { name, email, phone, password, role });
        alert('Registration successful! Please sign in.');
        setIsRegister(false);
      } else {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        nav(res.data.user.role==='admin' ? '/admin' : '/');
      }
    } catch (err) {
      alert(err.response?.data?.error || (isRegister ? 'Registration failed' : 'Login failed'));
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="glass-card w-100" style={{ maxWidth: '450px' }}>
        <h2 className="text-center mb-4">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        <form onSubmit={submit}>
          {isRegister && (
            <>
              <div className="mb-3">
                <label className="form-label text-muted">Full Name</label>
                <input className="form-control" value={name} onChange={e=>setName(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted">Phone Number</label>
                <input className="form-control" value={phone} onChange={e=>setPhone(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted">Role</label>
                <select className="form-select" value={role} onChange={e=>setRole(e.target.value)}>
                  <option value="customer">Customer</option>
                  <option value="driver">Driver</option>
                  <option value="company_admin">Company Admin</option>
                </select>
              </div>
            </>
          )}
          <div className="mb-3">
            <label className="form-label text-muted">Email Address</label>
            <input type="email" className="form-control" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com" required />
          </div>
          <div className="mb-4">
            <label className="form-label text-muted">Password</label>
            <input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary w-100 py-2 mb-3">
            {isRegister ? 'Register' : 'Sign In'}
          </button>
          
          <div className="text-center">
            <button type="button" className="btn btn-link text-decoration-none" onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}