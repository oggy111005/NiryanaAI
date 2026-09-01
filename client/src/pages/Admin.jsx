import React, { useState } from 'react';
import axios from 'axios';
import { Plus, Save } from 'lucide-react';

export default function Admin() {
  const [formData, setFormData] = useState({
    isNumber: '',
    title: '',
    category: '',
    scope: '',
    latestVersion: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await axios.post('http://localhost:5000/api/standards', formData);
      setMessage('Standard added successfully! Embeddings generated.');
      setFormData({ isNumber: '', title: '', category: '', scope: '', latestVersion: '' });
    } catch (err) {
      setMessage('Error adding standard.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-primary mb-6 flex items-center">
        <Plus className="mr-2" /> Add New Standard
      </h2>
      
      {message && (
        <div className={`p-4 mb-6 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scope (used for AI semantic matching)</label>
          <textarea required name="scope" value={formData.scope} onChange={handleChange} rows="4" className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"></textarea>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-blue-900 text-white font-medium py-2 px-4 rounded flex justify-center items-center mt-6 disabled:opacity-50">
          {loading ? 'Processing...' : <><Save size={18} className="mr-2" /> Save Standard</>}
        </button>
      </form>
    </div>
  );
}

