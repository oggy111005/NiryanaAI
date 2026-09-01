import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock } from 'lucide-react';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/history');
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
        <div className="text-center py-10 text-gray-500">Loading history...</div>
      ) : history.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg border border-gray-200 text-gray-500">
          No search history available.
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

