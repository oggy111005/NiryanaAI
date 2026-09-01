import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader2, Bookmark } from 'lucide-react';

export default function Detail() {
  const { id } = useParams();
  const [standard, setStandard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStandard = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/standards/${id}`);
        setStandard(res.data);
      } catch (err) {
        setError('Failed to load standard details.');
      } finally {
        setLoading(false);
      }
    };
    fetchStandard();
  }, [id]);

  if (loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (error) return <div className="text-center text-red-500 mt-20">{error}</div>;
  if (!standard) return <div className="text-center mt-20">Standard not found.</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <Link to={-1} className="flex items-center text-gray-500 hover:text-primary mb-6 w-fit transition-colors">
        <ArrowLeft size={16} className="mr-1" /> Back
      </Link>

      <div className="flex justify-between items-start mb-6 border-b pb-6">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">{standard.isNumber}</h1>
          <h2 className="text-2xl text-gray-800 font-medium">{standard.title}</h2>
        </div>
        <button className="p-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-600 transition-colors">
          <Bookmark size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-2 space-y-6">
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Scope</h3>
            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded border border-gray-100">
              {standard.scope}
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Allied Standards</h3>
            {standard.alliedStandards && standard.alliedStandards.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Standard</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {standard.alliedStandards.map((as, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{as.isNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{as.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">{as.type}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No allied standards specified.</p>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Metadata</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="block text-gray-500">Category</span>
                <span className="font-medium text-gray-800">{standard.category}</span>
              </div>
              <div>
                <span className="block text-gray-500">Latest Version</span>
                <span className="font-medium text-gray-800">{standard.latestVersion}</span>
              </div>
              <div>
                <span className="block text-gray-500">Required Certification</span>
                {standard.certifications && standard.certifications.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                     {standard.certifications.map((c, i) => (
                       <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">{c}</span>
                     ))}
                  </div>
                ) : 'None'}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Amendments</h3>
            {standard.amendments && standard.amendments.length > 0 ? (
              <ul className="space-y-2 text-sm text-gray-700">
                {standard.amendments.map((a, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-secondary mr-2">•</span> {a}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No amendments.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

