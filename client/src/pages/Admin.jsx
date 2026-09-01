import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Plus, Save, Upload, Loader2 } from 'lucide-react';

export default function Admin() {
  const [formData, setFormData] = useState({
    isNumber: '',
    title: '',
    category: '',
    scope: '',
    latestVersion: '',
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
      const response = await axios.post('http://localhost:5000/api/extract-standard', uploadData, {
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
        latestVersion: extracted.latestVersion || prev.latestVersion
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

      {/* Auto-fill from file section */}
      <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Auto-fill from Document</h3>
        <p className="text-sm text-gray-600 mb-4">Upload a PDF or text file of the standard to automatically extract details like IS Number, Title, and Scope.</p>
        
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
