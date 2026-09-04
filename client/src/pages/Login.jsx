import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Lock, User } from 'lucide-react';

export default function Login({ role }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password,
        role
      });
      
      login({ username: res.data.username, role: res.data.role }, res.data.token);
      
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-primary flex justify-center items-center gap-2">
          {role === 'admin' ? <Lock size={28} /> : <User size={28} />}
          {role === 'admin' ? 'Admin Login' : 'User Login'}
        </h2>
        <p className="text-gray-500 mt-2">
          {role === 'admin' ? 'Demo: admin / adminpassword' : 'Demo: demouser / userpassword'}
        </p>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">{error}</div>}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input 
            type="text" 
            required 
            value={username} 
            onChange={e => setUsername(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password" 
            required 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary" 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-primary hover:bg-blue-900 text-white font-medium py-2 rounded transition-colors disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
