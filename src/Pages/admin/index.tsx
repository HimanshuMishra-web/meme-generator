import React, { useState } from 'react';
import { useAuth } from '../../components/AuthContext';
import AdminSidebar from './AdminSidebar';
import UserManagement from './UserManagement';
import MemeTemplateManagement from './MemeTemplateManagement';
import TestimonialManagement from './TestimonialManagement';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'users' | 'templates' | 'testimonials'>('dashboard');

  // Check if user is admin or super admin
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagement />;
      case 'templates':
        return <MemeTemplateManagement />;
      case 'testimonials':
        return <TestimonialManagement />;
      default:
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* User Management Card - Only for Super Admins */}
              {user.role === 'super_admin' && (
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">User Management</h2>
                  <p className="text-gray-600 mb-4">View and manage user accounts, roles, and permissions.</p>
                  <button 
                    onClick={() => setActiveSection('users')}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-full transition"
                  >
                    Manage Users
                  </button>
                </div>
              )}

              {/* Meme Template Management Card */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Meme Template Management</h2>
                <p className="text-gray-600 mb-4">Upload and manage meme templates and media files.</p>
                <button 
                  onClick={() => setActiveSection('templates')}
                  className="bg-orange-400 hover:bg-orange-500 text-white font-semibold px-4 py-2 rounded-full transition"
                >
                  Manage Templates
                </button>
              </div>

              {/* Statistics Card */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Statistics</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Users:</span>
                    <span className="font-semibold">Loading...</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Templates:</span>
                    <span className="font-semibold">Loading...</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Public Templates:</span>
                    <span className="font-semibold">Loading...</span>
                  </div>
                </div>
              </div>

              {/* Role Information Card */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Role</h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {user.role === 'super_admin' 
                      ? 'You have full access to all admin features including user management and template status control.'
                      : 'You can manage templates and view system statistics.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 