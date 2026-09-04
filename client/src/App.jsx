import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Home from './pages/Home';
import Results from './pages/Results';
import Detail from './pages/Detail';
import History from './pages/History';
import Admin from './pages/Admin';
import DatabaseView from './pages/DatabaseView';
import Login from './pages/Login';
import TenderSimulator from './pages/TenderSimulator';
import NotFound from './pages/NotFound';
import BidComparator from './pages/BidComparator';
import Chatbot from './components/Chatbot';
import { LogOut, User as UserIcon, Moon, Sun } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to={requiredRole === 'admin' ? '/admin-login' : '/user-login'} />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <div className="text-center mt-20 text-red-500 font-bold">Access Denied: You do not have permission to view this portal.</div>;
  }

  return children;
};

const DarkModeToggle = () => {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    // Check initial preference
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggle = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <button 
      onClick={toggle} 
      className="p-1.5 rounded-full hover:bg-blue-800 transition-colors text-white"
      title="Toggle Dark Mode"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

const Navigation = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold flex items-center">
              <span className="text-secondary mr-2">🏛</span> NiryanaAI
            </Link>
            
            <div className="hidden md:flex space-x-4">
              {user && (
                <>
                  <Link to="/" className="hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Search</Link>
                  <Link to="/tender" className="hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Tender Simulator</Link>
                  <Link to="/compare" className="hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Compare Bids</Link>
                </>
              )}
              
              {user?.role === 'user' && (
                <Link to="/history" className="hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">History</Link>
              )}
              
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin" className="hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Admin Dashboard</Link>
                  <Link to="/database" className="hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">IS Database</Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <DarkModeToggle />
            
            {!user ? (
              <>
                <Link to="/user-login" className="bg-secondary hover:bg-teal-700 px-4 py-1.5 rounded text-sm font-medium transition-colors">
                  User Portal
                </Link>
                <Link to="/admin-login" className="border border-white hover:bg-white hover:text-primary px-4 py-1.5 rounded text-sm font-medium transition-colors">
                  Admin Portal
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4 ml-2 border-l border-blue-800 pl-4">
                <span className="text-sm text-gray-300 flex items-center">
                  <UserIcon size={16} className="mr-1" /> {user.username} ({user.role})
                </span>
                <button onClick={logout} className="flex items-center text-sm hover:text-gray-300 transition-colors">
                  <LogOut size={16} className="mr-1" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navigation />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          {/* Auth routes (Public) */}
          <Route path="/user-login" element={<Login role="user" />} />
          <Route path="/admin-login" element={<Login role="admin" />} />

          {/* Protected generic routes (requires ANY login) */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="/standard/:id" element={<ProtectedRoute><Detail /></ProtectedRoute>} />
          <Route path="/tender" element={<ProtectedRoute><TenderSimulator /></ProtectedRoute>} />
          <Route path="/compare" element={<ProtectedRoute><BidComparator /></ProtectedRoute>} />
          {/* Role-specific Protected routes */}
          <Route path="/history" element={<ProtectedRoute requiredRole="user"><History /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>} />
          <Route path="/database" element={<ProtectedRoute requiredRole="admin"><DatabaseView /></ProtectedRoute>} />

          {/* 404 Catch-All Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Chatbot />

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} NiryanaAI. For Smart India Hackathon Prototype.
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
