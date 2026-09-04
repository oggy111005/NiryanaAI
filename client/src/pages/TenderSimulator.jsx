import React, { useState, useRef } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import {
  UploadCloud, FileText, AlertTriangle, CheckCircle,
  Loader2, ClipboardList, ChevronDown, ChevronUp, X,
  ShieldCheck, AlertCircle, CheckCircle2, XCircle,
  Download, Printer, UserCheck, Stamp, Lock,
  Edit3, Building2, PlusCircle, Trash2, Send
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

  // --- Custom Bid & Lab Test Entry State ---
  const [showCustomBidForm, setShowCustomBidForm] = useState(false);
  const [customBidderName, setCustomBidderName] = useState('UltraTech Cement & Infrastructure Ltd');
  const [customLabReportNo, setCustomLabReportNo] = useState('NABL/TC-2026/8941');
  const [customParams, setCustomParams] = useState([
    { parameterName: '28-Day Compressive Strength', clauseNumber: '4.2', requiredValue: '43.0', proposedValue: '48.5', unit: 'MPa', operator: '>=' },
    { parameterName: 'Total Sulfur Content (SO3)', clauseNumber: '4.1', requiredValue: '3.5', proposedValue: '2.6', unit: '%', operator: '<=' },
    { parameterName: 'BIS ISI Certification Mark', clauseNumber: '6.1', requiredValue: 'valid', proposedValue: 'Valid & Active (CM/L-9812450)', unit: '', operator: 'includes' },
    { parameterName: 'Fe 500 Yield Strength', clauseNumber: '5.1', requiredValue: '500.0', proposedValue: '535.0', unit: 'N/mm²', operator: '>=' }
  ]);

  // --- Engineer Review & Decision State ---
  const [engineerDecision, setEngineerDecision] = useState('approve');
  const [engineerNotes, setEngineerNotes] = useState('');
  const [isDecisionRecorded, setIsDecisionRecorded] = useState(false);
  const [recordedAuditId, setRecordedAuditId] = useState(null);
  const [recordedTimestamp, setRecordedTimestamp] = useState(null);

  const toggleClause = (idx) =>
    setOpenClauses(prev => ({ ...prev, [idx]: !prev[idx] }));

  const loadSampleTender = () => {
    setMode('paste');
    setText(SAMPLE_TENDER_TEXT);
    setError('');
  };

  const handleRecordDecision = () => {
    setIsDecisionRecorded(true);
    setRecordedAuditId(`AUDIT-2026-IS-${Math.floor(100000 + Math.random() * 900000)}`);
    setRecordedTimestamp(new Date().toLocaleString());
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
    setShowCustomBidForm(false);
    setCustomBidderName('UltraTech Cement & Infrastructure Ltd');
    setCustomLabReportNo('NABL/TC-2026/8941');
    setCustomParams([
      { parameterName: '28-Day Compressive Strength', clauseNumber: '4.2', requiredValue: '43.0', proposedValue: '48.5', unit: 'MPa', operator: '>=' },
      { parameterName: 'Total Sulfur Content (SO3)', clauseNumber: '4.1', requiredValue: '3.5', proposedValue: '2.6', unit: '%', operator: '<=' },
      { parameterName: 'BIS ISI Certification Mark', clauseNumber: '6.1', requiredValue: 'valid', proposedValue: 'Valid & Active (CM/L-9812450)', unit: '', operator: 'includes' },
      { parameterName: 'Fe 500 Yield Strength', clauseNumber: '5.1', requiredValue: '500.0', proposedValue: '535.0', unit: 'N/mm²', operator: '>=' }
    ]);
    setEngineerDecision('approve');
    setEngineerNotes('');
    setIsDecisionRecorded(false);
    setRecordedAuditId(null);
    setRecordedTimestamp(null);
  };

  const handleParamChange = (index, field, value) => {
    setCustomParams(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddParam = () => {
    setCustomParams(prev => [
      ...prev,
      { parameterName: 'Additional Specification Criterion', clauseNumber: '4.X', requiredValue: '10.0', proposedValue: '12.0', unit: '', operator: '>=' }
    ]);
  };

  const handleRemoveParam = (index) => {
    setCustomParams(prev => prev.filter((_, i) => i !== index));
  };

  const handleScreenCustomBid = async (e) => {
    if (e) e.preventDefault();
    setActivePreset('custom');
    setScreeningLoading(true);
    setScreeningError('');

    try {
      const res = await api.post('/api/screen-compliance', {
        isNumber: 'IS 269 / IS 1786 (Bridge Spec)',
        materialName: `Bridge Construction Materials (Bidder: ${customBidderName || 'Vendor'})`,
        parameters: customParams
      });
      setScreeningData({
        ...res.data,
        bidderName: customBidderName,
        labReportNo: customLabReportNo
      });
    } catch (err) {
      setScreeningError(err.response?.data?.error || 'Compliance screening failed');
    } finally {
      setScreeningLoading(false);
    }
  };

  const handleExportJSON = () => {
    const exportPayload = {
      portal: 'NiryanaAI GeM-Style Procurement Simulator',
      purpose: 'Demonstration and Evaluation Purposes Only',
      tenderDocument: results?.documentName || 'tender_spec.txt',
      analyzedClausesCount: results?.analyzedClauses || 0,
      mappedStandards: allMatchedStandards.map(s => ({
        isNumber: s.isNumber,
        title: s.title,
        confidenceScore: s.score
      })),
      complianceScreening: screeningData ? {
        ...screeningData,
        bidderName: screeningData.bidderName || customBidderName,
        labReportNo: screeningData.labReportNo || customLabReportNo
      } : {
        status: 'PENDING_SCREENING',
        note: 'Vendor test evidence screening not performed'
      },
      engineerReview: {
        officer: user?.username || 'Procurement Officer',
        role: user?.role || 'user',
        decision: engineerDecision,
        remarks: engineerNotes || 'Standard compliance verified.',
        decisionTimestamp: new Date().toISOString()
      },
      regulatoryNotice: 'Generated via AI procurement screening simulator. For official procurement, cross-verify with BIS Gazette.',
      auditTimestamp: new Date().toISOString()
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `GeM_Compliance_Audit_${results?.documentName || 'tender'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  const runScreening = async (presetType) => {
    setActivePreset(presetType);
    setScreeningLoading(true);
    setScreeningError('');

    let parameters = [];
    let bidderName = 'Bridge Civil Supplier Ltd';
    let labReportNo = 'NABL-2026-CERT-01';

    if (presetType === 'compliant') {
      bidderName = 'Ambuja Cements & Tata Steel Consortium';
      labReportNo = 'NABL/2026/PASS-9102';
      parameters = [
        { parameterName: '28-Day Compressive Strength', clauseNumber: '4.2', requiredValue: '43.0', proposedValue: '48.5', unit: 'MPa', operator: '>=' },
        { parameterName: 'Total Sulfur Content (SO3)', clauseNumber: '4.1', requiredValue: '3.5', proposedValue: '2.6', unit: '%', operator: '<=' },
        { parameterName: 'BIS ISI Certification Mark', clauseNumber: '6.1', requiredValue: 'valid', proposedValue: 'Valid & Active (CM/L-9812450)', unit: '', operator: 'includes' },
        { parameterName: 'Fe 500 Yield Strength', clauseNumber: '5.1', requiredValue: '500.0', proposedValue: '535.0', unit: 'N/mm²', operator: '>=' }
      ];
    } else if (presetType === 'non_compliant') {
      bidderName = 'Substandard Materials Trading Co.';
      labReportNo = 'QC-FAIL-2026-044';
      parameters = [
        { parameterName: '28-Day Compressive Strength', clauseNumber: '4.2', requiredValue: '43.0', proposedValue: '31.2', unit: 'MPa', operator: '>=' },
        { parameterName: 'Total Sulfur Content (SO3)', clauseNumber: '4.1', requiredValue: '3.5', proposedValue: '4.4', unit: '%', operator: '<=' },
        { parameterName: 'BIS ISI Certification Mark', clauseNumber: '6.1', requiredValue: 'valid', proposedValue: 'Expired / Revoked', unit: '', operator: 'includes' },
        { parameterName: 'Fe 500 Yield Strength', clauseNumber: '5.1', requiredValue: '500.0', proposedValue: '468.0', unit: 'N/mm²', operator: '>=' }
      ];
    } else if (presetType === 'verify') {
      bidderName = 'National Infrastructure Supplies Pvt Ltd';
      labReportNo = 'REV-AUDIT-2026-11';
      parameters = [
        { parameterName: '28-Day Compressive Strength', clauseNumber: '4.2', requiredValue: '43.0', proposedValue: '41.8', unit: 'MPa', operator: '>=' },
        { parameterName: 'Total Sulfur Content (SO3)', clauseNumber: '4.1', requiredValue: '3.5', proposedValue: '3.45', unit: '%', operator: '<=' },
        { parameterName: 'BIS ISI Certification Mark', clauseNumber: '6.1', requiredValue: 'valid', proposedValue: 'Pending Renewal Audit', unit: '', operator: 'includes' },
        { parameterName: 'Fe 500 Yield Strength', clauseNumber: '5.1', requiredValue: '500.0', proposedValue: '495.0', unit: 'N/mm²', operator: '>=' }
      ];
    }

    setCustomBidderName(bidderName);
    setCustomLabReportNo(labReportNo);
    setCustomParams(parameters);
    setShowCustomBidForm(true);

    try {
      const res = await api.post('/api/screen-compliance', {
        isNumber: 'IS 269 / IS 1786 (Bridge Spec)',
        materialName: `Bridge Construction Materials (${bidderName})`,
        parameters
      });
      setScreeningData({
        ...res.data,
        bidderName,
        labReportNo
      });
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

      const res = await api.post('/api/analyze-tender', form);
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

              {/* Simulation Preset Buttons & Custom Bid Toggle */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomBidForm(prev => !prev)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                    showCustomBidForm
                      ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                      : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border-blue-300'
                  }`}
                >
                  <Edit3 size={14} /> ✍️ Enter Custom Bid
                </button>
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

            {/* Custom Bid Submission Drawer / Form */}
            {showCustomBidForm && (
              <div className="bg-slate-50 border border-blue-200 rounded-lg p-5 mb-5 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="text-primary" size={20} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800 text-sm">Vendor Bid &amp; Lab Test Report Submission</h3>
                        {activePreset && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            activePreset === 'compliant' ? 'bg-green-100 text-green-800 border border-green-200' :
                            activePreset === 'verify' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            activePreset === 'non_compliant' ? 'bg-red-100 text-red-800 border border-red-200' :
                            'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            Preset: {activePreset.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500">Enter contractor credentials and submitted NABL lab test values to evaluate against BIS clause specifications.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCustomBidForm(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    ✕ Close Form
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Bidder / Vendor Name
                    </label>
                    <input
                      type="text"
                      value={customBidderName}
                      onChange={e => setCustomBidderName(e.target.value)}
                      placeholder="e.g. UltraTech Cement Ltd"
                      className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:ring-primary focus:border-primary bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      NABL Lab Test Report / Certificate #
                    </label>
                    <input
                      type="text"
                      value={customLabReportNo}
                      onChange={e => setCustomLabReportNo(e.target.value)}
                      placeholder="e.g. NABL/TC-2026/8941"
                      className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs font-mono focus:ring-primary focus:border-primary bg-white"
                    />
                  </div>
                </div>

                {/* Interactive Parameters Table */}
                <div className="border border-gray-200 rounded-md overflow-hidden bg-white mb-3">
                  <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-gray-100 text-gray-600 font-semibold uppercase">
                      <tr>
                        <th className="px-3 py-2 text-left w-20">Clause</th>
                        <th className="px-3 py-2 text-left">Parameter Name</th>
                        <th className="px-3 py-2 text-left w-36">Required Criteria</th>
                        <th className="px-3 py-2 text-left w-48">Submitted Vendor Value</th>
                        <th className="px-3 py-2 text-center w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {customParams.map((p, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={p.clauseNumber}
                              onChange={e => handleParamChange(idx, 'clauseNumber', e.target.value)}
                              className="w-full border border-gray-200 rounded px-1.5 py-1 text-[11px] font-mono"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={p.parameterName}
                              onChange={e => handleParamChange(idx, 'parameterName', e.target.value)}
                              className="w-full border border-gray-200 rounded px-2 py-1 text-xs font-medium"
                            />
                          </td>
                          <td className="px-3 py-2 text-gray-600 font-mono text-xs">
                            {p.operator} {p.requiredValue} {p.unit}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={p.proposedValue}
                              onChange={e => handleParamChange(idx, 'proposedValue', e.target.value)}
                              placeholder="e.g. 48.5"
                              className="w-full border border-blue-300 rounded px-2 py-1 text-xs font-bold font-mono focus:ring-1 focus:ring-primary bg-blue-50/40"
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveParam(idx)}
                              className="text-gray-400 hover:text-red-600 transition-colors p-1"
                              title="Remove Parameter"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleAddParam}
                    className="text-xs font-semibold text-primary hover:text-blue-900 flex items-center gap-1"
                  >
                    <PlusCircle size={14} /> + Add Another Parameter
                  </button>

                  <button
                    type="button"
                    onClick={handleScreenCustomBid}
                    disabled={screeningLoading}
                    className="px-5 py-2 bg-primary hover:bg-blue-900 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                  >
                    <Send size={13} /> 🔍 Screen &amp; Evaluate Bid Against BIS
                  </button>
                </div>
              </div>
            )}

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
                  Click <span className="font-semibold text-blue-800">✍️ Enter Custom Bid</span> to submit contractor lab numbers, or use one of the quick simulation buttons above (e.g. <span className="font-semibold text-green-700">🟢 Compliant</span> or <span className="font-semibold text-red-700">🔴 Defective</span>).
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
                      {screeningData.bidderName && (
                        <div className="text-[11px] font-medium text-gray-700 mt-1 flex items-center gap-2">
                          <span>Bidder: <strong className="text-gray-900">{screeningData.bidderName}</strong></span>
                          {screeningData.labReportNo && (
                            <span>• Lab Report: <span className="font-mono text-gray-800">#{screeningData.labReportNo}</span></span>
                          )}
                        </div>
                      )}
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

          {/* STEP 7: QUALIFIED ENGINEER REVIEW & PROCUREMENT DECISION */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 my-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="text-primary" size={22} />
              <div>
                <h2 className="font-bold text-gray-800 text-lg">Qualified Engineer Review &amp; Procurement Decision</h2>
                <p className="text-xs text-gray-500">
                  Qualified Engineer / Department Authority reviews AI findings and evidence to record the final determination.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Decision Options */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Procurement Determination
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEngineerDecision('approve')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      engineerDecision === 'approve'
                        ? 'border-green-600 bg-green-50/80 ring-2 ring-green-600 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-sm text-green-800">
                      <CheckCircle2 size={16} /> Approve
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Meets all required standards and lab criteria.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEngineerDecision('conditional')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      engineerDecision === 'conditional'
                        ? 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-600 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-sm text-amber-800">
                      <AlertCircle size={16} /> Approve w/ Conditions
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Subject to revised calibration or NABL test proof.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEngineerDecision('reject')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      engineerDecision === 'reject'
                        ? 'border-red-600 bg-red-50/80 ring-2 ring-red-600 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-sm text-red-800">
                      <XCircle size={16} /> Reject Bid
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Failed mandatory BIS threshold limits.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEngineerDecision('retender')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      engineerDecision === 'retender'
                        ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-600 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-sm text-blue-800">
                      <ClipboardList size={16} /> Seek Re-tender
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Specifications require scope re-evaluation.</p>
                  </button>
                </div>
              </div>

              {/* Remarks Textarea */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Official Technical Remarks &amp; Audit Trail Notes
                </label>
                <textarea
                  rows={3}
                  value={engineerNotes}
                  disabled={isDecisionRecorded}
                  onChange={e => setEngineerNotes(e.target.value)}
                  placeholder="Enter engineer justification, verification caveats, or conditions for procurement approval..."
                  className={`w-full border rounded-md p-2.5 text-xs font-sans focus:ring-primary focus:border-primary resize-none ${
                    isDecisionRecorded ? 'bg-gray-100 text-gray-700 border-gray-200 cursor-not-allowed' : 'border-gray-300'
                  }`}
                />
              </div>

              {/* Record Decision Action / Status Banner */}
              {!isDecisionRecorded ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleRecordDecision}
                    className="w-full sm:w-auto px-5 py-2.5 bg-primary hover:bg-blue-900 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Stamp size={16} /> 📝 Record &amp; Digitally Sign Determination
                  </button>
                  <span className="text-[11px] text-gray-500 italic">
                    Stamps the decision with an immutable audit ID and locks the remarks for official export.
                  </span>
                </div>
              ) : (
                <div className="bg-green-50 border-2 border-green-500/80 rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold shrink-0">
                      <Lock size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs uppercase tracking-wider text-green-900">
                          Determination Finalized &amp; Locked
                        </span>
                        <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-green-300 font-semibold text-green-800">
                          {recordedAuditId}
                        </span>
                      </div>
                      <p className="text-xs text-green-800 mt-0.5">
                        Recorded verdict: <strong className="uppercase">{engineerDecision}</strong> by <strong>{user?.username || 'Procurement Officer'}</strong> on {recordedTimestamp}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDecisionRecorded(false)}
                    className="text-xs text-green-800 hover:text-green-950 underline font-semibold shrink-0"
                  >
                    ✏️ Unlock / Modify
                  </button>
                </div>
              )}


              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                <span>Signed as: <strong className="text-gray-800">{user?.username || 'Procurement Officer'}</strong> ({user?.role || 'user'})</span>
                <span className="text-green-700 font-semibold flex items-center gap-1">
                  <CheckCircle size={13} /> Digital Audit Trail Active
                </span>
              </div>
            </div>
          </div>

          {/* STEP 8: OUTPUTS & COMPLIANCE EXPORT */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="font-bold text-primary text-sm flex items-center gap-2">
                <FileText size={18} /> Procurement Compliance Export (Outputs)
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Download machine-readable JSON audit trail or print the official GeM-style Compliance Sheet.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleExportJSON}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                <Download size={14} /> Export JSON Audit
              </button>

              <button
                onClick={handlePrint}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-blue-900 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                <Printer size={14} /> Print / Save PDF Sheet
              </button>
            </div>
          </div>

          {/* KEY BENEFITS FOOTER (From Architecture Flowchart) */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">
              Key System Benefits (Problem Statement #108)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2 bg-gray-50 rounded border border-gray-100">
                <span className="block text-primary font-semibold mb-0.5">🛡️ Correct IS</span>
                <span className="text-[11px] text-gray-500">Ensures BIS compliance</span>
              </div>
              <div className="p-2 bg-gray-50 rounded border border-gray-100">
                <span className="block text-primary font-semibold mb-0.5">⏱️ Early Risk Catch</span>
                <span className="text-[11px] text-gray-500">Detects defects pre-award</span>
              </div>
              <div className="p-2 bg-gray-50 rounded border border-gray-100">
                <span className="block text-primary font-semibold mb-0.5">💰 Quality Control</span>
                <span className="text-[11px] text-gray-500">Improves public spend</span>
              </div>
              <div className="p-2 bg-gray-50 rounded border border-gray-100">
                <span className="block text-primary font-semibold mb-0.5">👷 Decision Support</span>
                <span className="text-[11px] text-gray-500">Empowers engineers</span>
              </div>
              <div className="p-2 bg-gray-50 rounded border border-gray-100 col-span-2 sm:col-span-1">
                <span className="block text-primary font-semibold mb-0.5">🏛️ Public Safety</span>
                <span className="text-[11px] text-gray-500">Stronger infrastructure</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

