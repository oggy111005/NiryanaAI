import axios from 'axios';

/**
 * Shared axios instance for all API calls.
 * Base URL is read from the VITE_API_BASE_URL env variable so the
 * app works in any environment (local dev, staging, production) without
 * touching source code.
 *
 * Set in client/.env:
 *   VITE_API_BASE_URL=http://localhost:5000
 *
 * Auth header is managed by AuthContext.jsx via axios.defaults,
 * which this instance inherits automatically.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
});

// Mirror any auth token set on the global axios defaults
// so this instance always has the current Bearer token.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

/**
 * Ensures a BIS source URL routes reliably to the official working
 * Government of India BIS portal (bis.gov.in) rather than crashing on
 * broken legacy vendor portals like standardsbis.bsbedge.com.
 */
export function getCleanBisUrl(url, isNumber) {
  if (!url || url.includes('standardsbis.bsbedge.com')) {
    const q = isNumber ? encodeURIComponent(isNumber) : 'Indian%20Standard';
    return `https://www.bis.gov.in/?s=${q}`;
  }
  return url;
}

export default api;
