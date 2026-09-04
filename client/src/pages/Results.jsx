import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import api, { getCleanBisUrl } from '../api';
import { ArrowLeft, CheckCircle, Shield, FileText, Search, Lightbulb, ChevronDown, ChevronUp, Loader2, ExternalLink, BookOpen } from 'lucide-react';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { results, query } = location.state || {};

  // --- Explainability state (must be declared at top level) ---
  const [explainOpen, setExplainOpen] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [citations, setCitations] = useState([]);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState('');

  if (!results) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-xl font-semibold mb-4">No results found or invalid session.</h2>
        <button onClick={() => navigate('/')} className="text-primary hover:underline">Go back home</button>
      </div>
    );
  }

  const { primary, related } = results;

  const fetchExplanation = async () => {
    if (explanation) { setExplainOpen(o => !o); return; } // already fetched
    setExplainOpen(true);
    setExplainLoading(true);
    setExplainError('');
    try {
      const res = await api.post('/api/explain', {
        standardId: primary._id,
        userQuery: query
      });
      setExplanation(res.data.explanation);
      setCitations(res.data.citations || []);
    } catch {
      setExplainError('Could not load explanation. Please try again.');
    } finally {
      setExplainLoading(false);
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
        <div className={`bg-white p-6 rounded-lg shadow-sm border-2 mb-8 relative overflow-hidden ${primary.matchType ? 'border-green-500' : 'border-primary'}`}>
          <div className={`absolute top-0 right-0 text-white text-xs font-bold px-4 py-1.5 rounded-bl-lg uppercase flex items-center shadow-sm ${primary.matchType ? 'bg-green-600' : 'bg-primary'}`}>
            {primary.matchType ? (
              <><CheckCircle size={14} className="mr-1.5" /> EXACT MATCH</>
            ) : (
              <><Shield size={14} className="mr-1.5" /> AI MATCH ({(primary.similarityScore * 100).toFixed(1)}%)</>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4 pt-2">
            <div>
              <h2 className={`text-3xl font-bold ${primary.matchType ? 'text-green-700' : 'text-primary'}`}>{primary.isNumber}</h2>
              <h3 className="text-xl text-gray-800 font-medium mt-1">{primary.title}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-200">
                Category: {primary.category}
              </span>
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-green-200">
                Latest: {primary.latestVersion || 'N/A'}
              </span>
              {primary.verifiedDate && (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle size={12} /> Verified: {new Date(primary.verifiedDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              )}
              {primary.sourceUrl && (
                <a
                  href={primary.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-teal-50 hover:bg-teal-100 text-secondary border border-teal-200 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center gap-1 transition-colors"
                  title="View official BIS Standard document"
                >
                  <ExternalLink size={12} /> Official BIS Source
                </a>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Scope</h4>
            <p className="text-gray-600 text-sm leading-relaxed">{primary.scope}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <CheckCircle size={18} className="mr-2 text-green-600" /> Certifications
              </h4>
              {primary.certifications && primary.certifications.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {primary.certifications.map((cert, idx) => (
                    <span key={idx} className="bg-white border border-gray-200 text-gray-700 text-xs px-2 py-1 rounded shadow-sm">
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
                  {primary.amendments.map((amd, idx) => (
                    <li key={idx}>{amd}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-500 text-sm">No amendments listed.</span>
              )}
            </div>
          </div>
          
          {/* Recommendation Explainability (Audit Trail) */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <button
              onClick={fetchExplanation}
              type="button"
              className="flex items-center text-sm font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 rounded-md transition-colors border border-amber-200"
            >
              <Lightbulb size={16} className="mr-2 text-amber-600" />
              <span>Why was this standard recommended?</span>
              {explainLoading ? (
                <Loader2 size={15} className="ml-2 animate-spin text-amber-600" />
              ) : explainOpen ? (
                <ChevronUp size={15} className="ml-2" />
              ) : (
                <ChevronDown size={15} className="ml-2" />
              )}
            </button>

            {explainOpen && (
              <div className="mt-3 p-4 bg-amber-50/60 rounded-lg border border-amber-200 text-sm text-gray-800 leading-relaxed">
                {explainLoading ? (
                  <div className="flex items-center text-gray-600 py-1">
                    <Loader2 size={16} className="animate-spin mr-2 text-amber-600" />
                    <span>Analyzing match against standard specifications...</span>
                  </div>
                ) : explainError ? (
                  <div className="text-red-600 text-xs">{explainError}</div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="font-semibold text-amber-900 mb-1 flex items-center">
                        <Shield size={14} className="mr-1.5 text-amber-700" />
                        Procurement Compliance Rationale:
                      </div>
                      <p className="text-gray-700 leading-relaxed">{explanation}</p>
                    </div>

                    {citations && citations.length > 0 && (
                      <div className="pt-3 border-t border-amber-200/70">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center">
                            <BookOpen size={14} className="mr-1.5 text-amber-700" />
                            Clause-by-Clause Citations
                          </h4>
                          <span className="text-xs font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                            {citations.length} verified {citations.length === 1 ? 'clause' : 'clauses'}
                          </span>
                        </div>
                        <div className="space-y-2.5">
                          {citations.map((cit, idx) => (
                            <div key={idx} className="bg-white p-3.5 rounded-md border border-amber-200 shadow-sm text-xs">
                              <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                                    {cit.clauseId ? `Clause ${cit.clauseId}` : cit.clauseNumber ? `Clause ${cit.clauseNumber}` : 'Clause —'}
                                  </span>
                                  <span className="font-semibold text-gray-900 text-xs">{cit.title}</span>
                                </div>
                                {cit.sourceUrl && (
                                  <a
                                    href={getCleanBisUrl(cit.sourceUrl, cit.clauseId || primary.isNumber)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-primary hover:text-blue-800 font-semibold hover:underline text-xs"
                                  >
                                    <ExternalLink size={12} /> BIS Source
                                  </a>
                                )}
                              </div>
                              <blockquote className="text-gray-700 italic pl-2.5 border-l-2 border-amber-400 my-2 leading-normal bg-amber-50/40 py-1 rounded-r">
                                "{cit.text}"
                              </blockquote>
                              {cit.relevance && (
                                <div className="text-gray-600 mt-1 flex items-start gap-1">
                                  <span className="font-semibold text-amber-800 shrink-0">Relevance:</span>
                                  <span>{cit.relevance}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Link to={`/standard/${primary._id}`} className={`${primary.matchType ? 'text-green-600 hover:text-green-800' : 'text-primary hover:text-blue-800'} font-medium text-sm flex items-center hover:underline`}>
              View Full Details &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm">
          <div className="flex items-center mb-2">
            <div className="bg-red-100 p-2 rounded-full mr-3">
              <Shield className="text-red-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-red-800">Search Refinement Needed</h3>
          </div>
          <p className="text-red-700 ml-12">
            {location.state?.results?.message || "No confident Indian Standard match found. The AI determined that the available standards do not closely match your query. Try adding more specific engineering terms."}
          </p>
        </div>
      )}

      {primary && primary.alliedStandards && primary.alliedStandards.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
            <FileText size={20} className="mr-2 text-primary" /> Official Allied Standards (Normative)
          </h3>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <ul className="space-y-3">
              {primary.alliedStandards.map((allied, idx) => (
                <li key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-3 rounded shadow-sm border border-gray-100">
                  <div>
                    <span className="font-bold text-primary mr-2">{allied.isNumber}</span>
                    <span className="text-gray-700 text-sm">{allied.title}</span>
                  </div>
                  {allied.type && (
                    <span className="mt-2 sm:mt-0 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {allied.type}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {related && related.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
            <Search size={20} className="mr-2 text-secondary" /> AI Discovered Similar Standards
          </h3>
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
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <span>Category: {std.category}</span>
                  {std.sourceUrl && (
                    <a
                      href={getCleanBisUrl(std.sourceUrl, std.isNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <ExternalLink size={12} /> Source
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
