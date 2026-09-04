import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Database as DatabaseIcon, ExternalLink, CheckCircle } from 'lucide-react';

export default function DatabaseView() {
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStandards = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/standards');
        setStandards(res.data);
      } catch (err) {
        setError('Failed to fetch standards.');
      } finally {
        setLoading(false);
      }
    };
    fetchStandards();
  }, []);

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary flex items-center">
          <DatabaseIcon className="mr-2" /> IS Data Database
        </h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
          {standards.length} Total Standards
        </span>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center py-12 text-gray-500">
          <Loader2 size={32} className="animate-spin mr-2" /> Loading database...
        </div>
      ) : standards.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No standards found in the database.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IS Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified Date</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {standards.map((std) => (
                <tr key={std._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    <div className="flex items-center space-x-2">
                      <Link to={`/standard/${std._id}`} className="hover:underline">
                        {std.isNumber}
                      </Link>
                      {std.isDemo && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-300">
                          DEMO DATA
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={std.title}>{std.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{std.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{std.latestVersion || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                      std.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                      std.status === 'draft' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      std.status === 'superseded' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                      std.status === 'withdrawn' ? 'bg-red-100 text-red-800 border-red-200' :
                      'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      {std.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                    {std.verifiedDate ? (
                      <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                        <CheckCircle size={12} className="text-green-600" />
                        {new Date(std.verifiedDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Unverified</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    {std.sourceUrl ? (
                      <a
                        href={std.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary hover:text-teal-800 inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-teal-50 rounded border border-teal-200 hover:bg-teal-100 transition-colors"
                        title="Open official BIS standard"
                      >
                        <ExternalLink size={12} /> BIS
                      </a>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
