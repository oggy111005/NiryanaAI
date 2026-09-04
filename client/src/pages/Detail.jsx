import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { getCleanBisUrl } from '../api';
import { ArrowLeft, Loader2, Bookmark, ExternalLink, CheckCircle, AlertCircle, Globe, FileText, Calendar } from 'lucide-react';

export default function Detail() {
  const { id } = useParams();
  const [standard, setStandard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('bookmarked_standards') || '[]');
      return saved.some(item => item.id === id);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const fetchStandard = async () => {
      try {
        const res = await api.get(`/api/standards/${id}`);
        setStandard(res.data);
      } catch (err) {
        setError('Failed to load standard details.');
      } finally {
        setLoading(false);
      }
    };
    fetchStandard();
  }, [id]);

  const toggleBookmark = () => {
    if (!standard) return;
    try {
      const saved = JSON.parse(localStorage.getItem('bookmarked_standards') || '[]');
      let updated;
      if (isBookmarked) {
        updated = saved.filter(item => item.id !== id);
        setIsBookmarked(false);
      } else {
        updated = [...saved, {
          id,
          isNumber: standard.isNumber,
          title: standard.title,
          category: standard.category,
          savedAt: new Date().toISOString()
        }];
        setIsBookmarked(true);
      }
      localStorage.setItem('bookmarked_standards', JSON.stringify(updated));
    } catch (e) {
      console.error('Bookmark error', e);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-16 mb-6"></div>
        <div className="border-b pb-6 mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 mb-3"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-24 bg-gray-100 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-32 bg-gray-100 rounded"></div>
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  if (error) return <div className="text-center text-red-500 mt-20">{error}</div>;
  if (!standard) return <div className="text-center mt-20">Standard not found.</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <Link to={-1} className="flex items-center text-gray-500 hover:text-primary mb-6 w-fit transition-colors">
        <ArrowLeft size={16} className="mr-1" /> Back
      </Link>

      <div className="flex justify-between items-start mb-6 border-b pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-4xl font-bold text-primary">{standard.isNumber}</h1>
            {standard.status && (
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                standard.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                standard.status === 'draft' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                standard.status === 'superseded' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                'bg-gray-100 text-gray-800 border-gray-200'
              }`}>
                {standard.status}
              </span>
            )}
            {standard.isDemo && (
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded border border-amber-300">
                DEMO DATA
              </span>
            )}
          </div>
          <h2 className="text-2xl text-gray-800 font-medium">{standard.title}</h2>
        </div>
        <button
          type="button"
          onClick={toggleBookmark}
          title={isBookmarked ? "Remove from Saved Standards" : "Save Standard"}
          className={`px-3 py-2 border rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold ${
            isBookmarked
              ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm'
              : 'border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
        >
          <Bookmark size={18} className={isBookmarked ? "fill-amber-500 text-amber-500" : "text-gray-500"} />
          <span>{isBookmarked ? "Saved" : "Save"}</span>
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

          {standard.clauses && standard.clauses.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FileText size={18} className="mr-2 text-primary" /> Technical Clauses & Specifications
                </h3>
                <span className="text-xs font-semibold text-primary bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  {standard.clauses.length} {standard.clauses.length === 1 ? 'clause' : 'clauses'}
                </span>
              </div>
              <div className="space-y-3">
                {standard.clauses.map((c, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                          Clause {c.clauseNumber}
                        </span>
                        <h4 className="font-semibold text-gray-800 text-sm">{c.title}</h4>
                      </div>
                      {c.sourceUrl && (
                        <a
                          href={getCleanBisUrl(c.sourceUrl, standard.isNumber)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-secondary hover:text-teal-800 hover:underline font-medium"
                        >
                          <ExternalLink size={12} /> Source
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed pl-3 border-l-2 border-primary/30">
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

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
                <span className="block text-gray-500">Amendments</span>
                <span className="font-medium text-gray-800">
                  {standard.amendments?.length ? `${standard.amendments.length} notified` : 'None'}
                </span>
              </div>
              {standard.publishedOn && (
                <div>
                  <span className="block text-gray-500 mb-1">Published On</span>
                  <span className="font-medium text-gray-800">
                    {new Date(standard.publishedOn).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
              {standard.latestReviewedYear && (
                <div>
                  <span className="block text-gray-500 mb-1">Latest Reviewed</span>
                  <span className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded text-xs font-semibold">
                    <Calendar size={13} className="text-blue-600" />
                    Year {standard.latestReviewedYear}
                  </span>
                </div>
              )}
              <div>
                <span className="block text-gray-500 mb-1">Verified Date</span>
                {standard.verifiedDate ? (
                  <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded text-xs font-semibold">
                    <CheckCircle size={13} className="text-green-600" />
                    {new Date(standard.verifiedDate).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded text-xs font-medium">
                    <AlertCircle size={13} className="text-amber-600" />
                    Unverified Record
                  </span>
                )}
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Official Source</span>
                {standard.sourceUrl ? (
                  <a
                    href={getCleanBisUrl(standard.sourceUrl, standard.isNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-secondary hover:text-teal-800 text-xs font-semibold bg-teal-50 border border-teal-200 px-2.5 py-1.5 rounded transition-colors hover:underline"
                  >
                    <Globe size={13} /> View BIS Standard <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="text-xs text-gray-400 italic">No official document URL linked</span>
                )}
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
