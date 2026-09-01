import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Results from './pages/Results';
import Detail from './pages/Detail';
import History from './pages/History';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans">
        {/* Navigation Bar */}
        <nav className="bg-primary text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link to="/" className="text-xl font-bold flex items-center">
                  <span className="text-secondary mr-2">🏛</span> IS-Recommend
                </Link>
                <div className="hidden md:flex space-x-4">
                  <Link to="/" className="hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Search</Link>
                  <Link to="/history" className="hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">History</Link>
                  <Link to="/admin" className="hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Admin</Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<Results />} />
            <Route path="/standard/:id" element={<Detail />} />
            <Route path="/history" element={<History />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} IS-Recommend. For Smart India Hackathon Prototype.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
