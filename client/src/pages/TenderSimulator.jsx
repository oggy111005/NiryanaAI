import React, { useState, useRef } from 'react';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import {
  UploadCloud, FileText, AlertTriangle, CheckCircle,
  Loader2, ClipboardList, ChevronDown, ChevronUp, X
} from 'lucide-react';

const CONFIDENCE_LABELS = [
  { min: 0.75, label: 'High Confidence', color: 'text-green-700 bg-green-100 border-green-300' },
  { min: 0.50, label: 'Moderate Confidence', color: 'text-blue-700 bg-blue-100 border-blue-300' },
  { min: 0.35, label: 'Low Confidence', color: 'text-yellow-700 bg-yellow-100 border-yellow-300' },
];

function getConfidenceLabel(score) {
  for (const band of CONFIDENCE_LABELS) {
    if (score >= band.min) return band;
  }
  return { label: 'Uncertain', color: 'text-gray-600 bg-gray-100 border-gray-300' };
}

export default function TenderSimulator() {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const [mode, setMode] = useState('paste'); // 'paste' | 'upload'
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [openClauses, setOpenClauses] = useState({});
  const fileRef = useRef();

  const toggleClause = (idx) =>
    setOpenClauses(prev => ({ ...prev, [idx]: !prev[idx] }));

  const reset = () => {
    setResults(null);
    setError('');
    setText('');
    setFile(null);
    setOpenClauses({});
  };

  const handleSubmit = async () => {
    setError('');
    setResults(null);
    setLoading(true);

    try {
      const form = new FormData();

      if (mode === 'paste') {
        if (!text.trim()) { setError('Please paste some tender text.'); setLoading(false); return; }
        const blob = new Blob([text], { type: 'text/plain' });
        form.append('file', blob, 'tender_paste.txt');
      } else {
        if (!file) { setError('Please select a file.'); setLoading(false); return; }
        form.append('file', file, file.name);
      }

      const res = await axios.post('http://localhost:5000/api/analyze-tender', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Summary: total unique standards matched across all clauses
  const allMatchedStandards = results
    ? [...new Map(
        results.results.flatMap(r => r.recommendedStandards)
          .map(s => [s.isNumber, s])
      ).values()]
    : [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <ClipboardList size={32} /> GeM Tender Simulator
        </h1>
        <p className="text-gray-500 mt-2 text-sm leading-relaxed">
          Paste or upload a Government e-Marketplace (GeM) procurement tender. The AI will extract
          technical clauses and automatically generate a BIS compliance checklist mapping each
          requirement to applicable Indian Standards.
        </p>
      </div>

      {!results ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Mode Toggle */}
          <div className="flex rounded-md overflow-hidden border border-gray-200 mb-6 w-fit">
            <button
              onClick={() => setMode('paste')}
              className={`px-5 py-2 text-sm font-medium transition-colors ${mode === 'paste' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              📋 Paste Text
            </button>
            <button
              onClick={() => setMode('upload')}
              className={`px-5 py-2 text-sm font-medium transition-colors border-l border-gray-200 ${mode === 'upload' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              📁 Upload File (PDF / TXT)
            </button>
          </div>

          {/* Input Area */}
          {mode === 'paste' ? (
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={`Paste your procurement tender text here...\n\nExample:\n"2. Technical Requirements\nThe contractor must supply Ordinary Portland Cement conforming to specifications for compression strength and water resistance."`}
              rows={12}
              className="w-full border border-gray-300 rounded-md p-3 text-sm font-mono focus:ring-primary focus:border-primary resize-none"
            />
          ) : (
            <div
              onClick={() => fileRef.current.click()}
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-10 cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors"
            >
              <UploadCloud size={40} className="text-gray-400 mb-3" />
              {file ? (
                <p className="text-primary font-medium text-sm">{file.name}</p>
              ) : (
                <>
                  <p className="text-gray-600 font-medium">Click to select a file</p>
                  <p className="text-gray-400 text-xs mt-1">Supports PDF and TXT</p>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.txt"
                className="hidden"
                onChange={e => setFile(e.target.files[0])}
              />
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded p-3 text-sm">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-5 w-full bg-primary hover:bg-blue-900 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Analyzing Tender Clauses...</>
            ) : (
              <><FileText size={18} /> Analyze &amp; Generate BIS Compliance Checklist</>
            )}
          </button>
        </div>
      ) : (
        <div>
          {/* Summary Banner */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <p className="text-green-800 font-bold text-lg flex items-center gap-2">
                <CheckCircle size={20} /> Analysis Complete
              </p>
              <p className="text-green-700 text-sm mt-0.5">
                <span className="font-semibold">{results.analyzedClauses}</span> clause(s) analysed from{' '}
                <span className="font-semibold">{results.documentName}</span> →{' '}
                <span className="font-semibold">{allMatchedStandards.length}</span> unique BIS standard(s) mapped.
              </p>
            </div>
            <button onClick={reset} className="flex items-center gap-1 text-sm text-green-700 hover:text-green-900 border border-green-300 px-3 py-1.5 rounded-md">
              <X size={14} /> New Analysis
            </button>
          </div>

          {/* Compliance Checklist Summary */}
          {allMatchedStandards.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <ClipboardList size={18} /> BIS Compliance Checklist
              </h2>
              <ul className="divide-y divide-gray-100">
                {allMatchedStandards.map((std, idx) => (
                  <li key={idx} className="flex items-center gap-3 py-2.5">
                    <CheckCircle size={16} className="text-green-500 shrink-0" />
                    <span className="font-bold text-primary text-sm w-32 shrink-0">{std.isNumber}</span>
                    <span className="text-gray-700 text-sm">{std.title}</span>
                    <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded border ${getConfidenceLabel(std.score).color}`}>
                      {getConfidenceLabel(std.score).label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Per-Clause Breakdown */}
          <h2 className="font-bold text-gray-800 mb-3 text-lg">Clause-by-Clause Breakdown</h2>
          <div className="space-y-3">
            {results.results.map((clause, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleClause(idx)}
                  className="w-full flex justify-between items-start p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded mt-0.5 shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-gray-700 line-clamp-2">{clause.clauseText}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${clause.recommendedStandards.length > 0 ? 'text-green-700 bg-green-100 border-green-300' : 'text-gray-500 bg-gray-100 border-gray-300'}`}>
                      {clause.recommendedStandards.length} standard(s)
                    </span>
                    {openClauses[idx] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {openClauses[idx] && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wide">Full Clause Text</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap mb-4">{clause.clauseText}</p>

                    {clause.recommendedStandards.length > 0 ? (
                      <>
                        <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Applicable Indian Standards</p>
                        <ul className="space-y-2">
                          {clause.recommendedStandards.map((std, sIdx) => {
                            const conf = getConfidenceLabel(std.score);
                            return (
                              <li key={sIdx} className="flex items-center gap-3 bg-white border border-gray-200 rounded p-3">
                                <FileText size={16} className="text-primary shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <span className="font-bold text-primary text-sm">{std.isNumber}</span>
                                  <p className="text-xs text-gray-600 truncate">{std.title}</p>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded border shrink-0 ${conf.color}`}>
                                  {(std.score * 100).toFixed(0)}% — {conf.label}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                        <AlertTriangle size={16} /> No applicable standard found above the confidence threshold for this clause.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

