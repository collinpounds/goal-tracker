import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundView() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-2xl text-gray-600 mb-8">Page Not Found</p>
        <Link
          to="/"
          className="inline-block bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 transition-colors font-medium"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}

export default NotFoundView;
