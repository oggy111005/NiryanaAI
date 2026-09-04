import React, { useState, useRef } from 'react';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import {
  UploadCloud, FileText, AlertTriangle, CheckCircle,
  Loader2, ClipboardList, ChevronDown, ChevronUp, X,
  ShieldCheck, AlertCircle, CheckCircle2, XCircle, Play, Sparkles
} from 'lucide-react';

const CONFIDENCE_LABELS = [
  { min: 0.75, label: 'High Confidence', color: 'text-green-700 bg-green-100 border-green-300' },
  { min: 0.50, label: 'Moderate Confidence', color: 'text-blue-700 bg-blue-100 border-blue-300' },
  { min: 0.35, label: 'Low Confidence', color: 'text-yellow-700 bg-yellow-100 border-yellow-300' },
];

const SAMPLE_TENDER_TEXT = `PROCUREMENT TENDER #BR-2026-99102
PROJECT: MAJOR HIGHWAY BRIDGE CONSTRUCTION (PIER & DECK SLAB)

1. Scope of Work
Supply and quality verification of heavy civil structural materials for bridge pier foundations and prestressed girder sections.

2. Cementitious Materials Requirement
The contractor must supply 43 Grade Ordinary Portland Cement (OPC) conforming to IS specifications. 
The cement must achieve minimum 28-day compressive strength of 43.0 MPa. Total sulfur content calculated as sulfuric anhydride (SO3) shall not exceed 3.5% by mass.

3. Structural Steel & Reinforcement
All structural steel sections and high-strength deformed steel bars (Fe 500 Grade) must comply with mandatory BIS standards and bear valid ISI Certification Marks.`;

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

  // --- AI Compliance Screening State ---
  const [screeningData, setScreeningData] = useState(null);
  const [screeningLoading, setScreeningLoading] = useState(false);
  const [screeningError, setScreeningError] = useState('');
  const [activePreset, setActivePreset] = useState(null);

  const toggleClause = (idx) =>
    setOpenClauses(prev => ({ ...prev, [idx]: !prev[idx] }));

  const loadSampleTender = () => {
    setMode('paste');
    setText(SAMPLE_TENDER_TEXT);
    setError('');
  };

  const reset = () => {
    setResults(null);
    setError('');
    setText('');
    setFile(null);
    setOpenClauses({});
    setScreeningData(null);
    setScreeningError('');
    setActivePreset(null);
  };

  const runScreening = async (presetType) => {
    setActivePreset(presetType);
    setScreeningLoading(true);
    setScreeningError('');

    let parameters = [];
    if (presetType === 'compliant') {
      parameters = [
        { parameterName: '28-Day Compressive Strength', clauseNumber: '4.2', requiredValue: '43.0', proposedValue: '48.5', unit: 'MPa', operator: '>=' },
        { parameterName: 'Total Sulfur Content (SO3)', clauseNumber: '4.1', requiredValue: '3.5', proposedValue: '2.6', unit: '%', operator: '<=' },
        { parameterName: 'BIS ISI Certification Mark', clauseNumber: '6.1', requiredValue: 'valid', proposedValue: 'Valid & Active (CM/L-9812450)', operator: 'includes' },
        { parameterName: 'Fe 500 Yield Strength', clauseNumber: '5.1', requiredValue: '500.0', proposedValue: '535.0', unit: 'N/mm²', operator: '>=' }
      ];
    } else if (presetType === 'non_compliant') {
      parameters = [
        { parameterName: '28-Day Compressive Strength', clauseNumber: '4.2', requiredValue: '43.0', proposedValue: '31.2', unit: 'MPa', operator: '>=' },
        { parameterName: 'Total Sulfur Content (SO3)', clauseNumber: '4.1', requiredValue: '3.5', proposedValue: '4.4', unit: '%', operator: '<=' },
        { parameterName: 'BIS ISI Certification Mark', clauseNumber: '6.1', requiredValue: 'valid', proposedValue: 'Expired / Revoked', operator: 'includes' },
        { parameterName: 'Fe 500 Yield Strength', clauseNumber: '5.1', requiredValue: '500.0', proposedValue: '468.0', unit: 'N/mm²', operator: '>=' }
      ];
    } else if (presetType === 'verify') {
      parameters = [
        { parameterName: '28-Day Compressive Strength', clauseNumber: '4.2', requiredValue: '43.0', proposedValue: '41.8', unit: 'MPa', operator: '>=' },
        { parameterName: 'Total Sulfur Content (SO3)', clauseNumber: '4.1', requiredValue: '3.5', proposedValue: '3.45', unit: '%', operator: '<=' },
        { parameterName: 'BIS ISI Certification Mark', clauseNumber: '6.1', requiredValue: 'valid', proposedValue: 'Pending Renewal Audit', operator: 'includes' },
        { parameterName: 'Fe 500 Yield Strength', clauseNumber: '5.1', requiredValue: '500.0', proposedValue: '495.0', unit: 'N/mm²', operator: '>=' }
      ];
    }

    try {
      const res = await axios.post('http://localhost:5000/api/screen-compliance', {
        isNumber: 'IS 269 / IS 1786 (Bridge Spec)',
        materialName: 'Bridge Construction Materials (Cement & Steel)',
        parameters
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScreeningData(res.data);
    } catch (err) {
      setScreeningError(err.response?.data?.error || 'Compliance screening failed');
    } finally {
      setScreeningLoading(false);
    }
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
          {/* Mode Toggle & Demo Preset */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex rounded-md overflow-hidden border border-gray-200 w-fit">
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

            <button
              onClick={loadSampleTender}
              className="flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3.5 py-2 rounded-md transition-colors shadow-sm"
              title="Load standard procurement tender specifications"
            >
              <FileText size={14} /> 📄 Load Sample Tender
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

          {/* AI COMPLIANCE SCREENING PANEL (Flowchart Steps 5 & 6) */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <ShieldCheck className="text-secondary" size={22} /> AI Compliance Screening
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Screen vendor lab test reports against mandatory Indian Standard requirements.
                </p>
              </div>

              {/* Simulation Preset Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => runScreening('compliant')}
                  disabled={screeningLoading}
                  className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    activePreset === 'compliant'
                      ? 'bg-green-700 text-white shadow-sm'
                      : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-300'
                  }`}
                >
                  <CheckCircle2 size={14} /> 🟢 Simulate Compliant Bid
                </button>
                <button
                  onClick={() => runScreening('verify')}
                  disabled={screeningLoading}
                  className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    activePreset === 'verify'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300'
                  }`}
                >
                  <AlertCircle size={14} /> 🟡 Simulate Borderline (Verify)
                </button>
                <button
                  onClick={() => runScreening('non_compliant')}
                  disabled={screeningLoading}
                  className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    activePreset === 'non_compliant'
                      ? 'bg-red-700 text-white shadow-sm'
                      : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-300'
                  }`}
                >
                  <XCircle size={14} /> 🔴 Simulate Defective Bid
                </button>
              </div>
            </div>

            {screeningLoading && (
              <div className="flex items-center justify-center py-8 text-sm text-gray-500 gap-2">
                <Loader2 size={20} className="animate-spin text-primary" />
                Cross-checking vendor lab evidence against BIS clause limits...
              </div>
            )}

            {screeningError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                {screeningError}
              </div>
            )}

            {!screeningData && !screeningLoading && (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500">
                <p className="font-medium text-gray-700 mb-1">No test evidence screened yet.</p>
                <p className="text-xs text-gray-400">
                  Click one of the buttons above (e.g. <span className="font-semibold text-green-700">🟢 Simulate Compliant Bid</span> or <span className="font-semibold text-red-700">🔴 Simulate Defective Bid</span>) to evaluate vendor lab test reports against applicable standards.
                </p>
              </div>
            )}

            {screeningData && !screeningLoading && (
              <div className="space-y-4 mt-2">
                {/* Tri-Color Verdict Banner */}
                <div
                  className={`p-4 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    screeningData.overallStatus === 'COMPLIANT'
                      ? 'bg-green-50 border-green-300 text-green-900'
                      : screeningData.overallStatus === 'VERIFY'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-red-50 border-red-300 text-red-900'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {screeningData.overallStatus === 'COMPLIANT' ? (
                      <div className="w-12 h-12 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={28} className="text-green-600" />
                      </div>
                    ) : screeningData.overallStatus === 'VERIFY' ? (
                      <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-500 flex items-center justify-center shrink-0">
                        <AlertCircle size={28} className="text-amber-600" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center shrink-0">
                        <XCircle size={28} className="text-red-600" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-lg tracking-wide uppercase">
                          {screeningData.overallStatus}
                        </span>
                        <span className="text-xs bg-white/80 px-2 py-0.5 rounded border border-gray-300 font-medium text-gray-700">
                          {screeningData.isNumber}
                        </span>
                      </div>
                      <p className="text-xs mt-1 font-medium">{screeningData.summary}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono text-gray-500 bg-white/60 px-2 py-1 rounded border border-gray-200">
                      Evaluated: {new Date(screeningData.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Evidence Parameter Table */}
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-2 text-left">IS Clause</th>
                        <th className="px-3 py-2 text-left">Technical Parameter</th>
                        <th className="px-3 py-2 text-left">Mandatory Standard Criteria</th>
                        <th className="px-3 py-2 text-left">Submitted Vendor Test Evidence</th>
                        <th className="px-3 py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {screeningData.evaluatedParameters.map((p, pIdx) => (
                        <tr key={pIdx} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-mono text-gray-500">Cl. {p.clauseNumber}</td>
                          <td className="px-3 py-2 font-medium text-gray-900">{p.parameterName}</td>
                          <td className="px-3 py-2 text-gray-600 font-mono">
                            {p.requiredValue} {p.unit}
                          </td>
                          <td className="px-3 py-2 font-mono font-semibold text-gray-800">
                            {p.proposedValue} {p.unit}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[11px] border ${
                                p.status === 'PASS'
                                  ? 'bg-green-100 text-green-800 border-green-300'
                                  : p.status === 'BORDERLINE'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-red-100 text-red-800 border-red-300'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>


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

