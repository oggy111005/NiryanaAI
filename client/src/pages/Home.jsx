import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Search, Loader2 } from 'lucide-react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const exampleQueries = [
    "I need the standard for high strength deformed steel bars used in concrete",
    "Safety requirements for household electrical appliances like ceiling fans",
    "Testing methods for ordinary portland cement 53 grade",
    "Requirements for stainless steel cooking utensils"
  ];

  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setError('');
    try {
      // Make API call to our backend recommendation endpoint
      const response = await api.post('/api/recommend', { query: q });
      
      // Navigate to results page with the data
      navigate('/results', { state: { results: response.data, query: q } });
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 503) {
          setError(err.response.data.error || 'AI Model is loading, please wait a moment and try again.');
      } else {
          setError('Failed to fetch recommendations. Ensure backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-primary mb-4">Find the Right Indian Standard</h1>
        <p className="text-lg text-gray-600">Describe your product or specification in plain English. We'll use AI to find the most relevant IS standard.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <textarea
            className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows="4"
            placeholder="e.g., 'Looking for the standard covering the safety of toys, specifically migration of certain elements...'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          ></textarea>
        </div>
        
        {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="bg-primary hover:bg-blue-900 text-white px-6 py-2 rounded-md font-medium flex items-center disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="animate-spin mr-2" size={20} /> Analyzing...</>
            ) : (
              <><Search className="mr-2" size={20} /> Analyze</>
            )}
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Example Queries</h3>
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(q);
                // handleSearch(q); // Auto-submit optional
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-1.5 px-3 rounded-full transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

