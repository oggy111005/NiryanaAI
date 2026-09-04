import React, { useState } from 'react';
import api from '../api';
import { Scale, FileText, CheckCircle, AlertTriangle, Loader2, Award, ArrowRight } from 'lucide-react';

const SAMPLE_BID_A = `VENDOR PROPOSAL A
We will supply heavy civil structural materials for the bridge project.
1. We will use 43 Grade Ordinary Portland Cement meeting IS 269 specifications with 43.0 MPa minimum strength.
2. All hot rolled structural steel sections will comply with IS 2062 and bear ISI marks.
3. Precast concrete pipes will be used as per IS 458 for drainage.`;

const SAMPLE_BID_B = `VENDOR PROPOSAL B
We are pleased to submit our proposal for the bridge materials.
1. We will supply standard commercial cement with good compressive strength.
2. We use high quality steel sections sourced from international vendors, tested in our own labs to exceed local requirements.
3. Drainage will use standard concrete pipes.`;

export default function BidComparator() {
  const [bidA, setBidA] = useState('');
  const [bidB, setBidB] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const loadSamples = () => {
    setBidA(SAMPLE_BID_A);
    setBidB(SAMPLE_BID_B);
    setResults(null);
  };

  const extractUniqueStandards = (analysisResult) => {
    const stds = new Map();
    analysisResult.results.forEach(clause => {
      clause.recommendedStandards.forEach(std => {
        if (!stds.has(std.isNumber)) {
          stds.set(std.isNumber, std);
        }
      });
    });
    return Array.from(stds.values()).sort((a, b) => b.score - a.score);
  };

  const handleCompare = async () => {
    if (!bidA.trim() || !bidB.trim()) {
      setError('Please enter text for both Bid A and Bid B');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const formA = new FormData();
      formA.append('file', new Blob([bidA], { type: 'text/plain' }), 'Bid_A.txt');

      const formB = new FormData();
      formB.append('file', new Blob([bidB], { type: 'text/plain' }), 'Bid_B.txt');

      const [resA, resB] = await Promise.all([
        api.post('/api/analyze-tender', formA),
        api.post('/api/analyze-tender', formB)
      ]);
      
      const stdsA = extractUniqueStandards(resA.data);
      const stdsB = extractUniqueStandards(resB.data);
      
      // Calculate a simple "Compliance Score" based on confidence levels
      const scoreA = stdsA.reduce((acc, std) => acc + (std.score * 100), 0) / (stdsA.length || 1);
      const scoreB = stdsB.reduce((acc, std) => acc + (std.score * 100), 0) / (stdsB.length || 1);

      setResults({
        a: { ...resA.data, uniqueStandards: stdsA, complianceScore: Math.round(scoreA || 0) },
        b: { ...resB.data, uniqueStandards: stdsB, complianceScore: Math.round(scoreB || 0) }
      });
    } catch (err) {
      console.error(err);
      setError('Failed to analyze bids. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderBidResult = (label, data, isWinner) => (
    <div className={`p-6 rounded-lg border-2 ${isWinner ? 'border-green-500 bg-green-50/30' : 'border-gray-200 bg-white'}`}>
      <div className="flex justify-between items-start mb-6 border-b pb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{label}</h3>
          <p className="text-sm text-gray-500">{data.analyzedClauses} clauses extracted</p>
        </div>
        {isWinner && (
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 border border-green-300 shadow-sm">
            <Award size={16} /> Most Compliant
          </div>
        )}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded text-center border border-blue-100">
          <div className="text-2xl font-black text-blue-700">{data.uniqueStandards.length}</div>
          <div className="text-xs text-blue-600 font-medium">Standards Referenced</div>
        </div>
        <div className="bg-purple-50 p-3 rounded text-center border border-purple-100">
          <div className="text-2xl font-black text-purple-700">{data.complianceScore}%</div>
          <div className="text-xs text-purple-600 font-medium">Avg Match Confidence</div>
        </div>
      </div>

      <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wider">Detected Standards</h4>
      {data.uniqueStandards.length > 0 ? (
        <ul className="space-y-3">
          {data.uniqueStandards.map((std, i) => (
            <li key={i} className="flex gap-3 items-start bg-white p-3 rounded border border-gray-100 shadow-sm">
              <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-primary block">{std.isNumber}</span>
                <span className="text-sm text-gray-600 leading-tight block mt-1">{std.title}</span>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded mt-2 inline-block">
                  {(std.score * 100).toFixed(0)}% Confidence
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center p-6 bg-red-50 border border-red-100 rounded text-red-500 flex flex-col items-center">
          <AlertTriangle size={24} className="mb-2" />
          <p className="font-semibold text-sm">No valid BIS standards detected</p>
          <p className="text-xs mt-1">This bid lacks formal compliance references.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <Scale className="text-secondary" size={32} />
          Bid Comparator
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Paste two competing vendor proposals side-by-side. AI will extract and compare their BIS standard compliance.
        </p>
      </div>

      {!results ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={loadSamples} className="text-sm text-primary hover:underline font-medium">
              Load Sample Bids
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FileText size={18} /> Vendor Bid A
              </h3>
              <textarea
                value={bidA}
                onChange={(e) => setBidA(e.target.value)}
                className="w-full h-64 p-3 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                placeholder="Paste the text of the first bid or proposal here..."
              />
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FileText size={18} /> Vendor Bid B
              </h3>
              <textarea
                value={bidB}
                onChange={(e) => setBidB(e.target.value)}
                className="w-full h-64 p-3 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                placeholder="Paste the text of the second bid or proposal here..."
              />
            </div>
          </div>

          {error && <div className="text-red-500 bg-red-50 p-3 rounded text-center font-medium">{error}</div>}

          <div className="text-center mt-8">
            <button
              onClick={handleCompare}
              disabled={loading}
              className="bg-primary hover:bg-blue-900 text-white px-8 py-3 rounded-md font-bold text-lg inline-flex items-center gap-2 disabled:opacity-50 transition-colors shadow-md"
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={24} /> Analyzing & Comparing...</>
              ) : (
                <>Compare Bids <ArrowRight size={24} /></>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Comparison Results</h2>
              <p className="text-sm text-gray-500">AI analysis of both proposals against the BIS catalog.</p>
            </div>
            <button
              onClick={() => setResults(null)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              New Comparison
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {renderBidResult('Vendor Bid A', results.a, results.a.uniqueStandards.length > results.b.uniqueStandards.length)}
            {renderBidResult('Vendor Bid B', results.b, results.b.uniqueStandards.length > results.a.uniqueStandards.length)}
          </div>
        </div>
      )}
    </div>
  );
}
