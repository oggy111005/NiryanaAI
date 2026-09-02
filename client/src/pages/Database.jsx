import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Database as DatabaseIcon, Loader2, ExternalLink, Filter } from 'lucide-react';

export default function Database() {
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchStandards();
  }, []);

  const fetchStandards = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5000/api/standards');
      setStandards(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load standards catalog. Ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(standards.map(s => s.category).filter(Boolean))];

  const filteredStandards = standards.filter(std => {
    const matchesSearch =
      (std.isNumber && std.isNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (std.title && std.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (std.scope && std.scope.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || std.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <DatabaseIcon className="text-secondary" size={28} /> Indian Standards Catalog
          </h1>
          <p className="text-gray-600 mt-1">
            Browse and inspect all Indian Standards currently registered in the recommendation engine.
          </p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm self-start md:self-auto">
          Total Standards: <span className="font-semibold text-primary">{standards.length}</span>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by IS number, title, or keywords..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-gray-500 font-medium flex items-center gap-1 mr-1">
            <Filter size={14} /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-200">
          <Loader2 className="animate-spin text-primary mb-3" size={32} />
          <p className="text-gray-500 text-sm">Loading standards database...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
          <p className="font-semibold mb-2">Unable to load catalog</p>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchStandards}
            className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2 rounded transition-colors font-medium"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredStandards.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200 text-gray-500">
          <DatabaseIcon size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-700">No standards found</p>
          <p className="text-xs text-gray-500 mt-1">
            {searchQuery || selectedCategory !== 'All'
              ? 'Try adjusting your search criteria or clearing filters.'
              : 'The database is currently empty.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    IS Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStandards.map((std) => (
                  <tr key={std._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                      {std.isNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium max-w-md">
                      <div className="line-clamp-2" title={std.title}>
                        {std.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded text-xs font-medium">
                        {std.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {std.latestVersion || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        to={`/standard/${std._id}`}
                        className="text-secondary hover:text-teal-800 font-medium text-xs inline-flex items-center gap-1"
                      >
                        Inspect <ExternalLink size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
            <span>Showing {filteredStandards.length} of {standards.length} standards</span>
            <span className="italic text-gray-400">Read-only catalog view</span>
          </div>
        </div>
      )}
    </div>
  );
}
