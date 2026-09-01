import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Shield, FileText, Settings, Layers } from 'lucide-react';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { results, query } = location.state || {};

  if (!results) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-xl font-semibold mb-4">No results found or invalid session.</h2>
        <button onClick={() => navigate('/')} className="text-primary hover:underline">Go back home</button>
      </div>
    );
  }

  const { primary, related } = results;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Safety': return <Shield size={16} className="text-red-500" />;
      case 'Test Method': return <Settings size={16} className="text-blue-500" />;
      case 'Related Product': return <Layers size={16} className="text-green-500" />;
      default: return <FileText size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={() => navigate('/')} className="flex items-center text-gray-500 hover:text-primary mb-6 transition-colors">
        <ArrowLeft size={16} className="mr-1" /> Back to Search
      </button>

      <div className="mb-6 p-4 bg-gray-100 rounded-md text-sm text-gray-700 italic border-l-4 border-primary">
        " {query} "
      </div>

      {primary ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-primary mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            PRIMARY MATCH ({(primary.similarityScore * 100).toFixed(1)}%)
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4 pt-2">
            <div>
              <h2 className="text-3xl font-bold text-primary">{primary.isNumber}</h2>
              <h3 className="text-xl text-gray-800 font-medium mt-1">{primary.title}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-200">
                Category: {primary.category}
              </span>
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-green-200">
                Latest: {primary.latestVersion}
              </span>
            </div>
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">
            {primary.scope}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 pt-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <CheckCircle size={18} className="mr-2 text-secondary" /> Required Certifications
              </h4>
              {primary.certifications && primary.certifications.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {primary.certifications.map((cert, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full border border-gray-200">
                      {cert}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500 text-sm">No specific certifications listed.</span>
              )}
            </div>
            
            <div>
               <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <FileText size={18} className="mr-2 text-secondary" /> Recent Amendments
              </h4>
               {primary.amendments && primary.amendments.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {primary.amendments.map((amend, idx) => (
                    <li key={idx}>{amend}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-500 text-sm">No amendments listed.</span>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Link to={`/standard/${primary._id}`} className="text-primary hover:underline font-medium text-sm flex items-center">
              View Full Details &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center p-10 bg-white rounded-lg shadow-sm">
          No primary match found above the threshold. Try rephrasing your query.
        </div>
      )}

      {related && related.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Allied & Related Standards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {related.map((std, idx) => (
              <div key={idx} className="bg-white p-4 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <Link to={`/standard/${std._id}`} className="text-lg font-semibold text-primary hover:underline">
                    {std.isNumber}
                  </Link>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {(std.similarityScore * 100).toFixed(0)}% match
                  </span>
                </div>
                <p className="text-sm text-gray-800 font-medium mb-2 truncate" title={std.title}>{std.title}</p>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Category: {std.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

