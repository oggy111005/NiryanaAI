import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Search, Loader2, Tag, ChevronRight, X } from 'lucide-react';

const EXAMPLE_QUERIES = [
  "High strength deformed steel bars for concrete reinforcement",
  "Safety of household electrical appliances like ceiling fans",
  "Ordinary Portland Cement 53 grade testing methods",
  "Stainless steel cookware food contact safety",
  "Paving bitumen for road construction VG-30",
  "Drinking water quality turbidity and bacteria limits",
];

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [sugLoading, setSugLoading] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const textareaRef = useRef(null);
  const debouncedQuery = useDebounce(query, 280);

  // Fetch suggestions when query changes
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }
    setSugLoading(true);
    api.get(`/api/suggestions?q=${encodeURIComponent(trimmed)}`)
      .then(res => {
        setSuggestions(res.data || []);
        setShowSuggestions(true);
        setActiveSuggestion(-1);
      })
      .catch(() => setSuggestions([]))
      .finally(() => setSugLoading(false));
  }, [debouncedQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (searchQuery) => {
    const q = (searchQuery || query).trim();
    if (!q) return;
    setShowSuggestions(false);
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/api/recommend', { query: q });
      navigate('/results', { state: { results: response.data, query: q } });
    } catch (err) {
      console.error(err);
      if (err.response?.status === 503) {
        setError(err.response.data.error || 'AI Model is loading, please wait a moment and try again.');
      } else {
        setError('Failed to fetch recommendations. Ensure backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const pickSuggestion = (std) => {
    const q = `${std.isNumber} — ${std.title}`;
    setQuery(q);
    setSuggestions([]);
    setShowSuggestions(false);
    handleSearch(q);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSearch();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (activeSuggestion >= 0) {
        pickSuggestion(suggestions[activeSuggestion]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-primary mb-4">Find the Right Indian Standard</h1>
        <p className="text-lg text-gray-600">
          Describe your product or specification in plain English or Hindi. AI will find the most relevant BIS standard.
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="relative" ref={wrapperRef}>
          <textarea
            ref={textareaRef}
            className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows="3"
            placeholder="e.g., 'Safety of toys for children, migration of chemical elements...' or type an IS number like 'IS 456'"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim().length >= 2) setShowSuggestions(true);
              else setShowSuggestions(false);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
          />

          {/* Clear button */}
          {query && (
            <button
              onClick={() => { setQuery(''); setSuggestions([]); setShowSuggestions(false); textareaRef.current?.focus(); }}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {showSuggestions && (suggestions.length > 0 || sugLoading) && (
            <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              {sugLoading && suggestions.length === 0 && (
                <div className="flex items-center gap-2 px-4 py-3 text-gray-400 text-sm">
                  <Loader2 size={14} className="animate-spin" /> Searching standards...
                </div>
              )}
              {suggestions.map((std, idx) => (
                <button
                  key={std._id}
                  onMouseDown={(e) => { e.preventDefault(); pickSuggestion(std); }}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors border-b border-gray-100 last:border-0 ${
                    idx === activeSuggestion ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded">{std.isNumber}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{std.title}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Tag size={10} /> {std.category}
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 mt-1 shrink-0" />
                </button>
              ))}
              {!sugLoading && suggestions.length > 0 && (
                <div className="px-4 py-2 bg-gray-50 text-xs text-gray-400 flex items-center gap-1">
                  <Search size={10} /> Press Enter to run AI search · Arrow keys to navigate
                </div>
              )}
            </div>
          )}
        </div>

        {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-400">Tip: supports Hindi — try "सीमेंट" or "स्टील"</span>
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="bg-primary hover:bg-blue-900 text-white px-6 py-2 rounded-md font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={18} /> Analyzing...</>
            ) : (
              <><Search size={18} /> Analyze</>
            )}
          </button>
        </div>
      </div>

      {/* Example Query Chips */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Try These Queries</h3>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => { setQuery(q); setSuggestions([]); setShowSuggestions(false); }}
              className="bg-gray-100 hover:bg-blue-50 hover:text-primary hover:border-blue-200 border border-transparent text-gray-700 text-sm py-1.5 px-3 rounded-full transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
