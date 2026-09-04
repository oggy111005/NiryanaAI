import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home as HomeIcon, FileCheck } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto my-16 text-center bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
        <Compass size={36} />
      </div>
      <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
        404 — Page Not Found
      </span>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Lost in the Standards Catalog?</h1>
      <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
        The page or standard document you are looking for does not exist or may have been moved to a new section.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-blue-900 text-white text-xs font-medium py-2.5 px-5 rounded-lg transition-colors shadow-sm"
        >
          <HomeIcon size={16} /> Return to Search
        </Link>
        <Link
          to="/tender"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium py-2.5 px-5 rounded-lg border border-gray-300 transition-colors"
        >
          <FileCheck size={16} /> GeM Tender Simulator
        </Link>
      </div>
    </div>
  );
}
