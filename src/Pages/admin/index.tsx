import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Media Management Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Media Management</h2>
            <p className="text-gray-600 mb-4">Upload and manage media files including memes, banners, and other assets.</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Manage Media
            </button>
          </div>

          {/* User Management Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">User Management</h2>
            <p className="text-gray-600 mb-4">View and manage user accounts, roles, and permissions.</p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
              Manage Users
            </button>
          </div>

          {/* Content Management Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Content Management</h2>
            <p className="text-gray-600 mb-4">Manage memes, categories, and other content on the platform.</p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
              Manage Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 