import React from 'react';
import { useAuth } from '../../components/AuthContext';
import { FiLogOut, FiUser } from 'react-icons/fi';

interface AdminSidebarProps {
  activeSection: 'dashboard' | 'users' | 'templates' | 'testimonials';
  setActiveSection: (section: 'dashboard' | 'users' | 'templates' | 'testimonials') => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeSection, setActiveSection }) => {
  const { user, signOut } = useAuth();

  const menuItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
      showFor: ['admin', 'super_admin'] as const
    },
    {
      id: 'users' as const,
      label: 'User Management',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      showFor: ['super_admin'] as const
    },
    {
      id: 'templates' as const,
      label: 'Meme Templates',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      showFor: ['admin', 'super_admin'] as const
    },
    {
      id: 'testimonials' as const,
      label: 'Testimonials',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 000 7.75" />
        </svg>
      ),
      showFor: ['super_admin'] as const
    }
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    if (!user?.role) return false;
    return item.showFor.includes(user.role as any);
  });

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen flex flex-col justify-between">
      <div>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Admin Panel
            <span className="flex items-center gap-2 ml-2">
              {/* Profile icon with tooltip */}
              <span className="relative group">
                <button className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold text-sm focus:outline-none" title={user?.username}>
                  {user?.username?.charAt(0).toUpperCase() || <FiUser />}
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-40 bg-white text-xs text-gray-700 rounded shadow-lg p-2 opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                  <div className="font-semibold">{user?.username}</div>
                  <div className="text-gray-500">{user?.email}</div>
                </div>
              </span>
              {/* Logout icon with tooltip */}
              <span className="relative group">
                <button onClick={signOut} className="w-8 h-8 flex items-center justify-center rounded-full text-red-500 hover:bg-red-100 focus:outline-none" title="Logout">
                  <FiLogOut size={18} />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-20 bg-white text-xs text-gray-700 rounded shadow-lg p-2 opacity-0 group-hover:opacity-100 pointer-events-none z-10 text-center">
                  Logout
                </div>
              </span>
            </span>
          </h1>
        </div>

        <nav className="mt-6">
          <div className="px-4 space-y-2">
            {filteredMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      <div className="p-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7v7m0 0L10 21l-7-7 11-11z" />
          </svg>
          <span>Go To Website</span>
        </a>
      </div>
    </div>
  );
};

export default AdminSidebar; 