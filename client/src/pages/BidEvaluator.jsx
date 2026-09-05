import React, { useState, useRef } from 'react';
import api from '../api';
import {
  Trophy, Upload, FileText, AlertTriangle, CheckCircle, XCircle,
  Loader2, Medal, Star, TrendingUp, IndianRupee, Clock, Award,
  ChevronDown, ChevronUp, BarChart2, ShieldCheck, Users, Plus,
  Trash2, Download, Play, RefreshCw, Sparkles, Building, Layers
} from 'lucide-react';

const ScoreBar = ({ label, score, color }) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between text-[11px] font-semibold uppercase tracking-wide">
      <span className="text-gray-500">{label}</span>
      <span className={color}>{score}%</span>
    </div>
    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${
          score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-blue-500' : score >= 30 ? 'bg-yellow-400' : 'bg-red-400'
        }`}
        style={{ width: `${score}%` }}
      />
    </div>
  </div>
);

const RankBadge = ({ badge, rank }) => {
  if (badge === 'WINNER') return (
    <span className="inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
      <Trophy size={10} /> Winner
    </span>
  );
  if (badge === 'RUNNER_UP') return (
    <span className="inline-flex items-center gap-1 bg-gray-300 text-gray-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
      <Medal size={10} /> Runner Up
    </span>
  );
  if (badge === 'SECOND_RUNNER_UP') return (
    <span className="inline-flex items-center gap-1 bg-orange-200 text-orange-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
      <Star size={10} /> 2nd Runner Up
    </span>
  );
  return <span className="text-gray-400 font-mono text-sm">#{rank}</span>;
};

const BidderCard = ({ bid, index }) => {
  const [expanded, setExpanded] = useState(index === 0);
  const sc = (s) => s >= 75 ? 'text-green-700' : s >= 50 ? 'text-blue-600' : s >= 30 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden transition-all ${
      bid.badge === 'WINNER' ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50 shadow-yellow-100' :
      bid.badge === 'RUNNER_UP' ? 'border-gray-300 bg-gradient-to-r from-gray-50 to-slate-50' :
      'border-gray-200 bg-white'
    }`}>
      <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-black/5 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="text-2xl font-black text-gray-300 w-8 shrink-0 text-center">{bid.rank}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-800 text-sm">{bid.name}</span>
            <RankBadge badge={bid.badge} rank={bid.rank} />
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{bid.rawSummary}</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-center hidden sm:block">
            <div className={`text-xl font-black ${sc(bid.finalScore)}`}>{bid.finalScore}</div>
            <div className="text-[10px] text-gray-400 uppercase">Final</div>
          </div>
          <div className="text-center hidden md:block">
            <div className={`text-base font-bold ${sc(bid.bisScore)}`}>{bid.bisScore}%</div>
            <div className="text-[10px] text-gray-400">BIS</div>
          </div>
          {bid.proposedCostINR && (
            <div className="text-center hidden lg:block">
              <div className="text-base font-bold text-gray-700">&#8377;{(bid.proposedCostINR / 100000).toFixed(1)}L</div>
              <div className="text-[10px] text-gray-400">Cost</div>
            </div>
          )}
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-4 bg-white/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ScoreBar label="BIS Compliance (50%)" score={bid.bisScore} color={sc(bid.bisScore)} />
            <ScoreBar label="Cost Competitiveness (30%)" score={bid.costScore} color={sc(bid.costScore)} />
            <ScoreBar label="Delivery Timeline (10%)" score={bid.timelineScore} color={sc(bid.timelineScore)} />
            <ScoreBar label="Experience (10%)" score={bid.experienceScore} color={sc(bid.experienceScore)} />
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {bid.proposedCostINR && (
              <span className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium">
                <IndianRupee size={11} /> &#8377;{(bid.proposedCostINR / 100000).toFixed(1)} Lakhs
              </span>
            )}
            {bid.deliveryDays && (
              <span className="flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full font-medium">
                <Clock size={11} /> {bid.deliveryDays} days
              </span>
            )}
            {bid.isMarkClaimed && (
              <span className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-medium">
                <ShieldCheck size={11} /> ISI/BIS Certified
              </span>
            )}
            {bid.experienceMentioned && (
              <span className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
                <Award size={11} /> Experience Mentioned
              </span>
            )}
          </div>
          {bid.matchedStandards && bid.matchedStandards.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">AI-Matched BIS Standards</p>
              <div className="flex flex-wrap gap-1.5">
                {bid.matchedStandards.map((s, i) => (
                  <span key={i} className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-mono font-bold">
                    {s.isNumber} <span className="font-normal text-gray-500">· {(s.score * 100).toFixed(0)}%</span>
                  </span>
                ))}
              </div>
            </div>
          )}
          {bid.standardsClaimed && bid.standardsClaimed.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Bidder Claimed Standards</p>
              <div className="flex flex-wrap gap-1.5">
                {bid.standardsClaimed.map((s, i) => (
                  <span key={i} className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded font-mono">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Preset Demo Scenarios for 1-Click Builder ──
const PRESET_SCENARIOS = {
  bridge: {
    tenderTitle: 'Major Highway Bridge Pier & Deck Construction',
    tenderRef: 'NHIDCL-2026-BRIDGE-99102',
    issuingAuthority: 'National Highways & Infrastructure Development Corp Ltd',
    budgetCeiling: '50',
    maxDeliveryDays: '70',
    requiresISIMark: true,
    bidders: [
      {
        name: 'Bharat Construction Ltd.',
        regNo: 'CIN: U45201MH2001PLC134567',
        costLakhs: '42.5',
        deliveryDays: '50',
        isMarkClaimed: true,
        standardsClaimed: 'IS 269, IS 1786, IS 2062, IS 456',
        materials: '43 Grade OPC Cement, Fe 500 TMT steel bars, Plain and Reinforced Concrete',
        experienceMentioned: true
      },
      {
        name: 'Shree Metals & Alloys Pvt. Ltd.',
        regNo: 'CIN: U27100GJ2005PTC045231',
        costLakhs: '46.0',
        deliveryDays: '45',
        isMarkClaimed: true,
        standardsClaimed: 'IS 1786, IS 2062, IS 458',
        materials: 'High-strength deformed steel bars Fe 500, structural steel sections, precast concrete pipes',
        experienceMentioned: true
      },
      {
        name: 'Pioneer Cement Works',
        regNo: 'UDYAM-RJ-12-0078945',
        costLakhs: '38.75',
        deliveryDays: '60',
        isMarkClaimed: true,
        standardsClaimed: 'IS 269, IS 12269',
        materials: '43 Grade OPC cement and 53 Grade OPC cement for high-strength bridge deck concrete',
        experienceMentioned: true
      },
      {
        name: 'Rajputana Infrastructure Corp.',
        regNo: 'CIN: U45400RJ2010PTC031122',
        costLakhs: '68.0',
        deliveryDays: '55',
        isMarkClaimed: true,
        standardsClaimed: 'IS 269, IS 1786, IS 2062',
        materials: '43 Grade OPC cement, reinforced steel bars, structural steel sections',
        experienceMentioned: true
      },
      {
        name: 'Global Traders International',
        regNo: 'LLP Reg: AAC-1234',
        costLakhs: '35.0',
        deliveryDays: '40',
        isMarkClaimed: false,
        standardsClaimed: 'None specified',
        materials: 'Imported commercial grade cement and steel bars without BIS certification mark',
        experienceMentioned: false
      }
    ]
  },
  electrical: {
    tenderTitle: 'Hospital Emergency Power Substation & Cabling',
    tenderRef: 'AIIMS-2026-ELECT-4402',
    issuingAuthority: 'All India Institute of Medical Sciences (AIIMS)',
    budgetCeiling: '35',
    maxDeliveryDays: '45',
    requiresISIMark: true,
    bidders: [
      {
        name: 'ElectroPower Systems India',
        regNo: 'CIN: U31100DL2008PLC174829',
        costLakhs: '29.5',
        deliveryDays: '30',
        isMarkClaimed: true,
        standardsClaimed: 'IS 1554, IS 694, IS 4770',
        materials: 'Heavy duty PVC insulated cables 1.1kV, fire-retardant wiring, rubber insulating safety gloves',
        experienceMentioned: true
      },
      {
        name: 'Apex Gridtech Engineers',
        regNo: 'CIN: U40100KA2012PTC063219',
        costLakhs: '32.0',
        deliveryDays: '35',
        isMarkClaimed: true,
        standardsClaimed: 'IS 1554, IS 3961',
        materials: 'PVC insulated armored control cables and heavy-duty current carrying conductor assemblies',
        experienceMentioned: true
      },
      {
        name: 'Zenith Electricals LLP',
        regNo: 'LLP Reg: AAB-9921',
        costLakhs: '42.0',
        deliveryDays: '40',
        isMarkClaimed: true,
        standardsClaimed: 'IS 1554, IS 694',
        materials: 'Industrial copper conductor power cables with ISI certification',
        experienceMentioned: true
      },
      {
        name: 'Kavita Hardware & Trading',
        regNo: 'GSTIN: 07AAAFK1234D1Z5',
        costLakhs: '22.0',
        deliveryDays: '25',
        isMarkClaimed: false,
        standardsClaimed: 'Commercial grade',
        materials: 'Standard commercial copper wiring and unbranded rubber safety gloves',
        experienceMentioned: false
      }
    ]
  },
  pipeline: {
    tenderTitle: 'Municipal Bulk Water Supply Pipeline Network',
    tenderRef: 'JJM-2026-WATER-8821',
    issuingAuthority: 'Jal Jeevan Mission / State Water & Sanitation Mission',
    budgetCeiling: '60',
    maxDeliveryDays: '90',
    requiresISIMark: true,
    bidders: [
      {
        name: 'Kisan PolyPipes Ltd.',
        regNo: 'CIN: U25200MH1998PLC118420',
        costLakhs: '52.0',
        deliveryDays: '75',
        isMarkClaimed: true,
        standardsClaimed: 'IS 4984, IS 4985, IS 12235',
        materials: 'High Density Polyethylene (HDPE PE-100) pipes for potable drinking water, uPVC pressure pipes',
        experienceMentioned: true
      },
      {
        name: 'Ductile Iron Piping Solutions',
        regNo: 'CIN: U27104WB2004PLC098231',
        costLakhs: '56.5',
        deliveryDays: '70',
        isMarkClaimed: true,
        standardsClaimed: 'IS 8329, IS 5382',
        materials: 'Centrifugally cast ductile iron pressure pipes and rubber sealing elastomeric rings',
        experienceMentioned: true
      },
      {
        name: 'National Infra Tubes Corp.',
        regNo: 'CIN: U25209UP2015PTC071234',
        costLakhs: '74.0',
        deliveryDays: '80',
        isMarkClaimed: true,
        standardsClaimed: 'IS 4984, IS 8329',
        materials: 'HDPE PE-100 water distribution pipes with fusion fittings and ISI certificate',
        experienceMentioned: true
      },
      {
        name: 'BlueStar Polymer Traders',
        regNo: 'UDYAM-PB-02-0044123',
        costLakhs: '41.0',
        deliveryDays: '60',
        isMarkClaimed: false,
        standardsClaimed: 'ISO certified',
        materials: 'Recycled agricultural HDPE plastic piping without Bureau of Indian Standards mark',
        experienceMentioned: false
      }
    ]
  }
};

export default function BidEvaluator() {
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('builder'); // 'builder' or 'upload'
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [expandDisqualified, setExpandDisqualified] = useState(false);
  const [pdfBuilding, setPdfBuilding] = useState(false);

  // Common tender setup
  const [tenderTitle, setTenderTitle] = useState('Major Highway Bridge Pier & Deck Construction');
  const [tenderRef, setTenderRef] = useState('NHIDCL-2026-BRIDGE-99102');
  const [issuingAuthority, setIssuingAuthority] = useState('National Highways & Infrastructure Development Corp Ltd');
  const [budgetCeiling, setBudgetCeiling] = useState('50');
  const [maxDeliveryDays, setMaxDeliveryDays] = useState('70');
  const [requiresISIMark, setRequiresISIMark] = useState(true);

  // Custom Bidders list for PDF Maker
  const [customBidders, setCustomBidders] = useState(PRESET_SCENARIOS.bridge.bidders);

  const loadScenario = (key) => {
    const sc = PRESET_SCENARIOS[key];
    if (!sc) return;
    setTenderTitle(sc.tenderTitle);
    setTenderRef(sc.tenderRef);
    setIssuingAuthority(sc.issuingAuthority);
    setBudgetCeiling(sc.budgetCeiling);
    setMaxDeliveryDays(sc.maxDeliveryDays);
    setRequiresISIMark(sc.requiresISIMark);
    setCustomBidders(sc.bidders);
  };

  const addBidder = () => {
    const nextNum = customBidders.length + 1;
    setCustomBidders([
      ...customBidders,
      {
        name: `Vendor ${nextNum} Pvt. Ltd.`,
        regNo: '',
        costLakhs: '40.0',
        deliveryDays: '45',
        isMarkClaimed: true,
        standardsClaimed: 'IS 269, IS 1786',
        materials: 'Standard construction materials with ISI certification',
        experienceMentioned: true
      }
    ]);
  };

  const removeBidder = (index) => {
    setCustomBidders(customBidders.filter((_, i) => i !== index));
  };

  const updateBidder = (index, field, value) => {
    const updated = [...customBidders];
    updated[index] = { ...updated[index], [field]: value };
    setCustomBidders(updated);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === 'application/pdf') setFile(dropped);
    else setError('Please upload a PDF file.');
  };

  // ── Download Generated Multi-Bidder PDF ──
  const downloadGeneratedPdf = async () => {
    if (customBidders.length === 0) {
      setError('Please add at least one bidder proposal.');
      return;
    }
    setError('');
    setPdfBuilding(true);
    try {
      const payload = {
        tenderTitle,
        tenderRef,
        issuingAuthority,
        submissionDeadline: '15 September 2026',
        bidders: customBidders.map(b => ({
          name: b.name,
          regNo: b.regNo,
          proposedCostINR: b.costLakhs ? parseFloat(b.costLakhs) * 100000 : null,
          deliveryDays: b.deliveryDays ? parseInt(b.deliveryDays) : null,
          isMarkClaimed: b.isMarkClaimed,
          standardsClaimed: typeof b.standardsClaimed === 'string'
            ? b.standardsClaimed.split(',').map(s => s.trim()).filter(Boolean)
            : b.standardsClaimed,
          materials: b.materials,
          experienceMentioned: b.experienceMentioned
        }))
      };

      const res = await api.post('/api/generate-bid-pdf', payload, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${(tenderRef || 'tender_bids').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate PDF. Please try again.');
    } finally {
      setPdfBuilding(false);
    }
  };

  // ── Run Direct Evaluation from Builder ──
  const runDirectEvaluation = async () => {
    if (customBidders.length === 0) {
      setError('Please add at least one bidder proposal.');
      return;
    }
    setError('');
    setResults(null);
    setLoading(true);

    const msgs = [
      'Generating standardized multi-bidder PDF packet…',
      'Extracting bidder specifications via AI engine…',
      'Running BIS semantic vector matching…',
      'Applying mandatory criteria gate…',
      'Finalizing composite rankings & dashboard…'
    ];
    let msgIdx = 0;
    setLoadingMsg(msgs[0]);
    const interval = setInterval(() => { msgIdx = (msgIdx + 1) % msgs.length; setLoadingMsg(msgs[msgIdx]); }, 2200);

    try {
      // 1. Generate PDF on server
      const payload = {
        tenderTitle,
        tenderRef,
        issuingAuthority,
        submissionDeadline: '15 September 2026',
        bidders: customBidders.map(b => ({
          name: b.name,
          regNo: b.regNo,
          proposedCostINR: b.costLakhs ? parseFloat(b.costLakhs) * 100000 : null,
          deliveryDays: b.deliveryDays ? parseInt(b.deliveryDays) : null,
          isMarkClaimed: b.isMarkClaimed,
          standardsClaimed: typeof b.standardsClaimed === 'string'
            ? b.standardsClaimed.split(',').map(s => s.trim()).filter(Boolean)
            : b.standardsClaimed,
          materials: b.materials,
          experienceMentioned: b.experienceMentioned
        }))
      };

      const pdfRes = await api.post('/api/generate-bid-pdf', payload, { responseType: 'blob' });
      const pdfBlob = new Blob([pdfRes.data], { type: 'application/pdf' });

      // 2. Evaluate with evaluate-bids endpoint
      const form = new FormData();
      form.append('pdf', pdfBlob, `${tenderRef || 'tender_bids'}.pdf`);
      form.append('tenderContext', JSON.stringify({
        title: tenderTitle || 'Procurement Tender',
        budgetCeiling: budgetCeiling ? parseFloat(budgetCeiling) * 100000 : null,
        maxDeliveryDays: maxDeliveryDays ? parseInt(maxDeliveryDays) : null,
        requiresISIMark
      }));

      const evalRes = await api.post('/api/evaluate-bids', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResults(evalRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Evaluation failed. Please try again.');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  // ── Evaluate from Uploaded File ──
  const handleEvaluateUploaded = async () => {
    if (!file) { setError('Please upload a PDF file.'); return; }
    setError(''); setResults(null); setLoading(true);
    const msgs = ['Extracting text from PDF…','Identifying bidder sections via AI…','Running BIS semantic matching…','Applying mandatory criteria gate…','Computing composite scores…','Finalizing rankings…'];
    let msgIdx = 0; setLoadingMsg(msgs[0]);
    const interval = setInterval(() => { msgIdx = (msgIdx + 1) % msgs.length; setLoadingMsg(msgs[msgIdx]); }, 2200);

    try {
      const form = new FormData();
      form.append('pdf', file);
      form.append('tenderContext', JSON.stringify({
        title: tenderTitle || 'Procurement Tender',
        budgetCeiling: budgetCeiling ? parseFloat(budgetCeiling) * 100000 : null,
        maxDeliveryDays: maxDeliveryDays ? parseInt(maxDeliveryDays) : null,
        requiresISIMark
      }));
      const res = await api.post('/api/evaluate-bids', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Evaluation failed. Please try again.');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResults(null);
    setError('');
    setExpandDisqualified(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <Trophy size={32} /> Multi-Bidder Evaluation &amp; PDF Maker
        </h1>
        <p className="text-gray-500 mt-2 text-sm leading-relaxed">
          Create, customize, and evaluate multi-vendor tender proposals against Bureau of Indian Standards (BIS) specifications,
          commercial costs, delivery timelines, and mandatory procurement gates.
        </p>
      </div>

      {!results ? (
        <div className="space-y-6">
          {/* Tab Switcher */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => { setActiveTab('builder'); setError(''); }}
              className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-all ${
                activeTab === 'builder'
                  ? 'border-primary text-primary bg-blue-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Sparkles size={16} /> 🛠️ Interactive PDF Maker &amp; Bid Builder
            </button>
            <button
              onClick={() => { setActiveTab('upload'); setError(''); }}
              className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-all ${
                activeTab === 'upload'
                  ? 'border-primary text-primary bg-blue-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Upload size={16} /> 📂 Upload Existing PDF Packet
            </button>
          </div>

          {/* ════ TAB 1: INTERACTIVE BID BUILDER & PDF MAKER ════ */}
          {activeTab === 'builder' && (
            <div className="space-y-6">
              {/* Preset Scenario Selector */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} /> 1-Click SIH Presentation Presets
                  </p>
                  <p className="text-xs text-blue-700 mt-0.5">Quickly load realistic multi-vendor tender scenarios for your mentor demo</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => loadScenario('bridge')}
                    className="px-3 py-1.5 bg-white border border-blue-300 hover:border-primary text-blue-900 rounded-lg text-xs font-semibold shadow-sm transition-all hover:shadow"
                  >
                    🏗️ Highway Bridge (5 Bids)
                  </button>
                  <button
                    onClick={() => loadScenario('electrical')}
                    className="px-3 py-1.5 bg-white border border-blue-300 hover:border-primary text-blue-900 rounded-lg text-xs font-semibold shadow-sm transition-all hover:shadow"
                  >
                    ⚡ Hospital Electrical (4 Bids)
                  </button>
                  <button
                    onClick={() => loadScenario('pipeline')}
                    className="px-3 py-1.5 bg-white border border-blue-300 hover:border-primary text-blue-900 rounded-lg text-xs font-semibold shadow-sm transition-all hover:shadow"
                  >
                    💧 Water Pipeline (4 Bids)
                  </button>
                </div>
              </div>

              {/* Tender Parameters */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">
                  <span className="bg-primary text-white rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">1</span>
                  Tender Specifications &amp; Mandatory Criteria
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Project / Tender Title</label>
                    <input type="text" value={tenderTitle} onChange={e => setTenderTitle(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tender Reference ID</label>
                    <input type="text" value={tenderRef} onChange={e => setTenderRef(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Issuing Authority</label>
                    <input type="text" value={issuingAuthority} onChange={e => setIssuingAuthority(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Budget Ceiling (&#8377; Lakhs)</label>
                    <input type="number" value={budgetCeiling} onChange={e => setBudgetCeiling(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <p className="text-[11px] text-gray-400 mt-1">Bids above this cost are auto-disqualified</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Max Delivery Days</label>
                    <input type="number" value={maxDeliveryDays} onChange={e => setMaxDeliveryDays(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <p className="text-[11px] text-gray-400 mt-1">Bids exceeding this are auto-disqualified</p>
                  </div>
                  <div className="sm:col-span-3 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <button onClick={() => setRequiresISIMark(!requiresISIMark)}
                      className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${requiresISIMark ? 'bg-primary' : 'bg-gray-300'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${requiresISIMark ? 'translate-x-5' : ''}`} />
                    </button>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Require ISI / BIS Certification Mark</p>
                      <p className="text-xs text-gray-400">Bidders who do not claim active IS certification will be eliminated</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bidder Proposals List */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="font-bold text-gray-800 text-base flex items-center gap-2">
                    <span className="bg-primary text-white rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">2</span>
                    Company Proposals ({customBidders.length} Bidders)
                  </h2>
                  <button
                    onClick={addBidder}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-primary hover:bg-blue-100 rounded-lg text-xs font-bold border border-blue-200 transition-colors"
                  >
                    <Plus size={14} /> Add Company Bid
                  </button>
                </div>

                <div className="space-y-4">
                  {customBidders.map((b, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 hover:bg-white transition-all space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                        <span className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                          <Building size={14} /> Bidder #{idx + 1}
                        </span>
                        {customBidders.length > 1 && (
                          <button
                            onClick={() => removeBidder(idx)}
                            className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                            title="Remove bidder"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Company / Vendor Name</label>
                          <input type="text" value={b.name} onChange={e => updateBidder(idx, 'name', e.target.value)}
                            placeholder="e.g. Tata Projects Ltd."
                            className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:ring-1 focus:ring-primary" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Proposed Cost (&#8377; Lakhs)</label>
                          <input type="number" step="0.1" value={b.costLakhs} onChange={e => updateBidder(idx, 'costLakhs', e.target.value)}
                            placeholder="e.g. 42.5"
                            className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:ring-1 focus:ring-primary" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Delivery (Days)</label>
                          <input type="number" value={b.deliveryDays} onChange={e => updateBidder(idx, 'deliveryDays', e.target.value)}
                            placeholder="e.g. 45"
                            className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:ring-1 focus:ring-primary" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">IS Standards Claimed</label>
                          <input type="text" value={b.standardsClaimed} onChange={e => updateBidder(idx, 'standardsClaimed', e.target.value)}
                            placeholder="e.g. IS 269, IS 1786, IS 2062"
                            className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white font-mono focus:ring-1 focus:ring-primary" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Materials Offered</label>
                          <input type="text" value={b.materials} onChange={e => updateBidder(idx, 'materials', e.target.value)}
                            placeholder="e.g. 43 Grade OPC Cement, Fe 500 TMT Steel Bars"
                            className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:ring-1 focus:ring-primary" />
                        </div>
                      </div>

                      <div className="flex items-center gap-6 pt-1 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={b.isMarkClaimed} onChange={e => updateBidder(idx, 'isMarkClaimed', e.target.checked)}
                            className="rounded text-primary focus:ring-primary" />
                          <span className="font-medium text-gray-700">Claims ISI / BIS Certification Mark</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={b.experienceMentioned} onChange={e => updateBidder(idx, 'experienceMentioned', e.target.checked)}
                            className="rounded text-primary focus:ring-primary" />
                          <span className="font-medium text-gray-700">Past Government Project Experience</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="flex items-center gap-2 mt-3 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                    <AlertTriangle size={16} /> {error}
                  </div>
                )}

                {/* Dual Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={downloadGeneratedPdf}
                    disabled={pdfBuilding || loading}
                    className="w-full bg-white hover:bg-gray-50 border-2 border-primary text-primary font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow"
                  >
                    {pdfBuilding ? (
                      <><Loader2 size={18} className="animate-spin" /> Generating PDF…</>
                    ) : (
                      <><Download size={18} /> 📥 Download Multi-Bidder PDF</>
                    )}
                  </button>

                  <button
                    onClick={runDirectEvaluation}
                    disabled={loading || pdfBuilding}
                    className="w-full bg-primary hover:bg-blue-900 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg"
                  >
                    {loading ? (
                      <><Loader2 size={18} className="animate-spin" /> <span>{loadingMsg}</span></>
                    ) : (
                      <><Play size={18} /> 🚀 Generate &amp; Run Evaluation Now</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════ TAB 2: UPLOAD EXISTING PDF ════ */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              {/* Tender Parameters */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">
                  <span className="bg-primary text-white rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">1</span>
                  Tender Setup &amp; Mandatory Criteria
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tender Title / Reference</label>
                    <input type="text" value={tenderTitle} onChange={e => setTenderTitle(e.target.value)}
                      placeholder="e.g. NHIDCL-2026-Bridge-Materials"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Budget Ceiling (&#8377; Lakhs)</label>
                    <input type="number" value={budgetCeiling} onChange={e => setBudgetCeiling(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <p className="text-[11px] text-gray-400 mt-1">Bids above this cost are auto-disqualified</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Max Delivery Days</label>
                    <input type="number" value={maxDeliveryDays} onChange={e => setMaxDeliveryDays(e.target.value)}
                      placeholder="e.g. 60"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <p className="text-[11px] text-gray-400 mt-1">Bids exceeding this timeline are auto-disqualified</p>
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <button onClick={() => setRequiresISIMark(!requiresISIMark)}
                      className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${requiresISIMark ? 'bg-primary' : 'bg-gray-300'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${requiresISIMark ? 'translate-x-5' : ''}`} />
                    </button>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Require ISI / BIS Certification Mark</p>
                      <p className="text-xs text-gray-400">Bidders who do not claim IS Mark will be disqualified</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF Dropzone */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">
                  <span className="bg-primary text-white rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">2</span>
                  Upload Multi-Bidder PDF Packet
                </h2>
                <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragging ? 'border-primary bg-blue-50' : file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}`}>
                  <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={e => setFile(e.target.files[0])} />
                  {file ? (
                    <><FileText size={36} className="mx-auto text-green-500 mb-2" /><p className="font-bold text-green-700">{file.name}</p><p className="text-sm text-gray-500 mt-1">{(file.size/1024).toFixed(0)} KB &middot; Click to change</p></>
                  ) : (
                    <><Upload size={36} className="mx-auto text-gray-400 mb-2" /><p className="text-gray-600 font-medium">Drag &amp; drop your PDF here</p><p className="text-sm text-gray-400 mt-1">Or click to browse &middot; Max 10MB &middot; Text-based PDF only</p></>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-3 bg-amber-50 border border-amber-100 rounded-lg p-2.5">
                  <strong>PDF Format Tip:</strong> Each vendor section should start with a clear label like &quot;Vendor A&quot;, &quot;Bidder 1&quot;, or the company name. The AI uses these headers to split proposals.
                </p>
                {error && <div className="flex items-center gap-2 mt-3 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm"><AlertTriangle size={16} /> {error}</div>}
                <button onClick={handleEvaluateUploaded} disabled={!file || loading}
                  className="mt-4 w-full bg-primary hover:bg-blue-900 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow">
                  {loading ? <><Loader2 size={18} className="animate-spin" /><span>{loadingMsg}</span></> : <><BarChart2 size={18} /> Evaluate All Bids &amp; Rank</>}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ════ RESULTS DASHBOARD VIEW ════ */
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: <Users size={18}/>, label: 'Total Bidders', value: results.totalBiddersFound, color: 'text-gray-700' },
              { icon: <CheckCircle size={18}/>, label: 'Qualified', value: results.qualifiedCount, color: 'text-green-600' },
              { icon: <XCircle size={18}/>, label: 'Disqualified', value: results.disqualifiedCount, color: 'text-red-500' },
              { icon: <TrendingUp size={18}/>, label: 'Ranking', value: `Top ${Math.min(results.topBids?.length||0,10)}`, color: 'text-primary' },
            ].map((s,i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3 shadow-sm">
                <span className={s.color}>{s.icon}</span>
                <div><p className={`font-black text-xl ${s.color}`}>{s.value}</p><p className="text-[11px] text-gray-400 uppercase tracking-wide">{s.label}</p></div>
              </div>
            ))}
          </div>

          {results.allBidsUseless && (
            <div className="bg-red-50 border-2 border-red-400 rounded-xl p-5 flex items-start gap-3">
              <AlertTriangle size={24} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-black text-red-700 text-lg">All Bids Require Improvement</h3>
                <p className="text-red-600 text-sm mt-1">{results.message}</p>
                <p className="text-red-500 text-xs mt-2">See the disqualification breakdown below for specific failure reasons per bidder.</p>
              </div>
            </div>
          )}

          {!results.allBidsUseless && results.topBids?.[0] && (
            <div className="bg-gradient-to-r from-yellow-400 to-amber-400 rounded-xl p-5 flex items-center gap-4 shadow-lg">
              <Trophy size={40} className="text-yellow-900 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-yellow-900 text-xs font-bold uppercase tracking-widest">Highest Ranked Bid</p>
                <h2 className="text-white font-black text-2xl truncate">{results.topBids[0].name}</h2>
                <p className="text-yellow-100 text-sm mt-0.5 truncate">{results.topBids[0].rawSummary}</p>
              </div>
              <div className="text-center shrink-0">
                <p className="text-5xl font-black text-white">{results.topBids[0].finalScore}</p>
                <p className="text-yellow-200 text-xs uppercase">Final Score</p>
              </div>
            </div>
          )}

          {!results.allBidsUseless && results.topBids?.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                <BarChart2 size={20} className="text-primary" /> Ranked Bids Dashboard
              </h2>
              {results.topBids.map((bid, idx) => <BidderCard key={idx} bid={bid} index={idx} />)}
            </div>
          )}

          {results.disqualified?.length > 0 && (
            <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
              <button onClick={() => setExpandDisqualified(!expandDisqualified)}
                className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors">
                <h3 className="font-bold text-red-700 flex items-center gap-2">
                  <XCircle size={18} /> {results.disqualified.length} Disqualified Bid{results.disqualified.length > 1 ? 's' : ''}
                </h3>
                {expandDisqualified ? <ChevronUp size={16} className="text-red-400" /> : <ChevronDown size={16} className="text-red-400" />}
              </button>
              {expandDisqualified && (
                <div className="border-t border-red-100 divide-y divide-red-50">
                  {results.disqualified.map((b,i) => (
                    <div key={i} className="p-4">
                      <p className="font-bold text-gray-800 text-sm">{b.name}</p>
                      {b.rawSummary && <p className="text-gray-500 text-xs mt-0.5 mb-2">{b.rawSummary}</p>}
                      <ul className="space-y-1">
                        {b.failReasons.map((r,j) => (
                          <li key={j} className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded px-2 py-1">
                            <AlertTriangle size={12} className="shrink-0 mt-0.5" /> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button onClick={reset} className="text-sm text-gray-500 hover:text-primary border border-gray-300 hover:border-primary px-6 py-2 rounded-lg transition-colors">
              &larr; Configure Another Evaluation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
