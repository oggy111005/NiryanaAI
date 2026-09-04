import React, { useState, useRef, useEffect } from 'react';
import api from '../api';
import { Plus, Save, Upload, Loader2, Database, Users, Search, BarChart2, TrendingUp, Tag } from 'lucide-react';

// ─── Admin Stats Dashboard ─────────────────────────────────────────────────
function StatsBar() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/stats')
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-400">
        <Loader2 size={20} className="animate-spin mr-2" /> Loading dashboard stats...
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="mb-8">
      {/* KPI Cards */}
      <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
        <BarChart2 size={22} /> Admin Dashboard
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg"><Database size={22} className="text-blue-600" /></div>
          <div>
            <p className="text-2xl font-bold text-blue-700">{stats.totalStandards}</p>
            <p className="text-xs text-blue-500 font-medium">Total Standards</p>
            <p className="text-xs text-blue-400">{stats.realStandards} verified</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-lg"><Users size={22} className="text-green-600" /></div>
          <div>
            <p className="text-2xl font-bold text-green-700">{stats.totalUsers}</p>
            <p className="text-xs text-green-500 font-medium">Registered Users</p>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-lg"><Search size={22} className="text-purple-600" /></div>
          <div>
            <p className="text-2xl font-bold text-purple-700">{stats.totalSearches}</p>
            <p className="text-xs text-purple-500 font-medium">Total Searches</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-lg"><Tag size={22} className="text-amber-600" /></div>
          <div>
            <p className="text-2xl font-bold text-amber-700">{stats.categoryBreakdown?.length || 0}</p>
            <p className="text-xs text-amber-500 font-medium">Categories</p>
          </div>
        </div>
      </div>

      {/* Top Queries + Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Queries */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm">
            <TrendingUp size={16} className="text-purple-500" /> Top Searched Queries
          </h3>
          {stats.topQueries?.length > 0 ? (
            <ol className="space-y-2">
              {stats.topQueries.map((q, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="text-sm text-gray-600 truncate flex-1">{q.query}</span>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{q.count}x</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-gray-400 italic">No searches recorded yet.</p>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm">
            <Database size={16} className="text-blue-500" /> Standards by Category
          </h3>
          {stats.categoryBreakdown?.length > 0 ? (
            <ul className="space-y-2">
              {stats.categoryBreakdown.map((c, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 flex-1 truncate">{c.category}</span>
                  <div className="flex items-center gap-1">
                    <div
                      className="h-2 rounded-full bg-blue-400"
                      style={{ width: `${Math.max(20, (c.count / stats.realStandards) * 120)}px` }}
                    />
                    <span className="text-xs font-semibold text-blue-600 w-4 text-right">{c.count}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 italic">No category data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [formData, setFormData] = useState({
    isNumber: '',
    title: '',
    category: '',
    scope: '',
    latestVersion: '',
    sourceUrl: '',
    verifiedDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExtracting(true);
    setMessage('');
    
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const response = await api.post('/api/extract-standard', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const extracted = response.data;
      setFormData(prev => ({
        ...prev,
        isNumber: extracted.isNumber || prev.isNumber,
        title: extracted.title || prev.title,
        category: extracted.category || prev.category,
        scope: extracted.scope || prev.scope,
        latestVersion: extracted.latestVersion || prev.latestVersion,
        sourceUrl: extracted.sourceUrl || prev.sourceUrl,
        verifiedDate: extracted.verifiedDate || prev.verifiedDate
      }));
      
      setMessage('Details extracted successfully! Please review them before saving.');
    } catch (err) {
      console.error(err);
      setMessage('Error extracting details from file.');
    } finally {
      setExtracting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // reset file input
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post('/api/standards', formData);
      setMessage('Standard added successfully! Embeddings generated.');
      setFormData({
        isNumber: '',
        title: '',
        category: '',
        scope: '',
        latestVersion: '',
        sourceUrl: '',
        verifiedDate: ''
      });
    } catch (err) {
      setMessage('Error adding standard.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <StatsBar />
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-primary mb-6 flex items-center">
        <Plus className="mr-2" /> Add New Standard
      </h2>
      
      {message && (
        <div className={`p-4 mb-6 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Auto-fill from file section */}
      <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Auto-fill from Document</h3>
        <p className="text-sm text-gray-600 mb-4">Upload a PDF or text file of the standard to automatically extract details like IS Number, Title, Scope, Source URL, and Verified Date.</p>
        
        <input 
          type="file" 
          accept=".pdf,.txt" 
          onChange={handleFileUpload} 
          ref={fileInputRef}
          className="hidden" 
        />
        
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          disabled={extracting}
          className="bg-secondary hover:bg-teal-700 text-white font-medium py-2 px-4 rounded flex items-center disabled:opacity-50 transition-colors"
        >
          {extracting ? (
            <><Loader2 size={18} className="mr-2 animate-spin" /> Extracting...</>
          ) : (
            <><Upload size={18} className="mr-2" /> Upload File</>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">IS Number</label>
          <input required type="text" name="isNumber" value={formData.isNumber} onChange={handleChange} placeholder="e.g., IS 1234:2023" className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input required type="text" name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latest Version</label>
            <input type="text" name="latestVersion" value={formData.latestVersion} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source URL (Official BIS Document)</label>
            <input
              type="url"
              name="sourceUrl"
              value={formData.sourceUrl}
              onChange={handleChange}
              placeholder="https://standardsbis.bsbedge.com/..."
              className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verified Date</label>
            <input
              type="date"
              name="verifiedDate"
              value={formData.verifiedDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scope (used for AI semantic matching)</label>
          <textarea required name="scope" value={formData.scope} onChange={handleChange} rows="4" className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"></textarea>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-blue-900 text-white font-medium py-2 px-4 rounded flex justify-center items-center mt-6 disabled:opacity-50">
          {loading ? 'Processing...' : <><Save size={18} className="mr-2" /> Save Standard</>}
        </button>
      </form>
    </div>

    {/* Tabbed User Management Component */}
    <UserManagement />
    </>
  );
}

// Combined Tabbed Component for User Management
function UserManagement() {
  const [activeTab, setActiveTab] = useState('register');

  return (
    <div className="max-w-4xl mx-auto mt-8 mb-16">
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('register')}
          className={`py-2 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'register' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Register New User
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`py-2 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'manage' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Manage Existing Users
        </button>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        {activeTab === 'register' ? <RegisterUserContent /> : <ManageUsersContent />}
      </div>
    </div>
  );
}

// Sub-component content for registering a new user
function RegisterUserContent() {
  const [formData, setFormData] = useState({ username: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/api/auth/register', formData);
      setMessage(`Success! Created new ${res.data.role}: ${res.data.username}`);
      setFormData({ username: '', password: '', role: 'user' });
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error creating user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-md">
        <h2 className="text-xl font-bold text-primary mb-6 text-center">Register New User</h2>
        
        {message && (
          <div className={`p-4 mb-6 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary">
              <option value="user">User (Citizen)</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-secondary hover:bg-teal-700 text-white font-medium py-2 px-4 rounded mt-4 disabled:opacity-50">
            {loading ? 'Processing...' : 'Register User'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Sub-component content for managing existing users
function ManageUsersContent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ role: '', password: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/auth/users');
      setUsers(res.data);
    } catch (err) {
      setMessage('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Are you sure you want to delete user ${username}?`)) return;
    try {
      await api.delete(`/api/auth/users/${id}`);
      setMessage(`User ${username} deleted.`);
      fetchUsers();
    } catch (err) {
      setMessage('Failed to delete user.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/auth/users/${editingUser._id}`, editFormData);
      setMessage(`User ${editingUser.username} updated.`);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setMessage('Failed to update user.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-primary">Manage Users</h2>
        <button onClick={fetchUsers} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1 px-3 rounded text-sm transition-colors flex items-center">
          {loading ? 'Refreshing...' : 'Refresh List'}
        </button>
      </div>

      {message && (
        <div className={`p-4 mb-4 rounded text-sm ${message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {editingUser ? (
        <form onSubmit={handleEditSubmit} className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg max-w-md">
          <h3 className="font-bold mb-3 text-blue-800">Editing: {editingUser.username}</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">New Role</label>
              <select value={editFormData.role} onChange={e => setEditFormData({...editFormData, role: e.target.value})} className="w-full p-2 border rounded">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password (leave blank to keep current)</label>
              <input type="password" value={editFormData.password} onChange={e => setEditFormData({...editFormData, password: e.target.value})} className="w-full p-2 border rounded" placeholder="***" />
            </div>
            <div className="flex space-x-2 pt-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">Save Changes</button>
              <button type="button" onClick={() => setEditingUser(null)} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm">Cancel</button>
            </div>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 && !loading ? (
              <tr><td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">No users found.</td></tr>
            ) : null}
            {users.map((u) => (
              <tr key={u._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => { setEditingUser(u); setEditFormData({ role: u.role, password: '' }); }}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(u._id, u.username)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
