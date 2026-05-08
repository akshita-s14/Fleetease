import React, {useState} from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      nav('/dashboard');
    } catch (err) { alert(err.response?.data?.error || err.message) }
  };

  return (<div className="container"><h2>Login</h2>
    <form onSubmit={submit}>
      <div className="mb-3"><label>Email</label><input className="form-control" value={email} onChange={e=>setEmail(e.target.value)} /></div>
      <div className="mb-3"><label>Password</label><input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} /></div>
      <button className="btn btn-primary">Login</button>
    </form></div>);
}