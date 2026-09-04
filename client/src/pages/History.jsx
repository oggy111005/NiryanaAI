import React, { useState, useEffect } from 'react';
import api from '../api';
import { Clock, Loader2, Search } from 'lucide-react';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/api/history');
        setHistory(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-primary mb-6 flex items-center">
        <Clock className="mr-2" /> Search History
      </h2>
      
      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
          <Loader2 className="animate-spin text-primary" size={20} />
          <span className="text-sm">Retrieving your procurement search history...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 text-gray-500">
          <Search size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm font-medium">No procurement searches logged yet.</p>
          <p className="text-xs text-gray-400 mt-1">Queries entered in the search bar will be saved here for auditability.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {history.map((item) => (
              <li key={item._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="text-gray-800 font-medium">"{item.query}"</div>
                  <div className="text-sm text-gray-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

