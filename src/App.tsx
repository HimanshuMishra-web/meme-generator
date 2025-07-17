import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import MemeGeneratorPage from './Pages/MemeGeneratorPage';
import AllMemesPage from './Pages/AllMemesPage';
import MemeDetailsPage from './Pages/MemeDetailsPage';
import UserProfilePage from './Pages/UserProfilePage';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './components/AuthContext';
import SignInPage from './Pages/SignInPage';
import SignUpPage from './Pages/SignUpPage';
import ForgetPasswordPage from './Pages/ForgetPasswordPage';
import APIMemesPage from './Pages/APIMemesPage';
import AdminDashboard from './Pages/admin';
import { Toaster } from 'react-hot-toast';

const AppContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const getNavbarLinks = () => {
    const baseLinks = [
      { label: 'Home', to: '/' },
      { label: 'Create', to: '/create' },
      { label: 'Explore', to: '/memes' },
      { label: 'API Memes', to: '/api-memes' },
      { label: 'Community', href: '#' },
    ];

    // Add admin link if user is admin or super admin
    if (isAuthenticated && (user?.role === 'admin' || user?.role === 'super_admin')) {
      baseLinks.push({ label: 'Admin Panel', to: '/admin' });
    }

    return baseLinks;
  };

  // Check if we should hide the navbar (admin user on admin page)
  const shouldHideNavbar = isAuthenticated && (user?.role === 'admin' || user?.role === 'super_admin') && location.pathname === '/admin';

  return (
    <>
      {!shouldHideNavbar && <Navbar links={getNavbarLinks()} />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<MemeGeneratorPage />} />
        <Route path="/memes" element={<AllMemesPage />} />
        <Route path="/memes/:id" element={<MemeDetailsPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgetPasswordPage />} />
        <Route path="/api-memes" element={<APIMemesPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" />
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
