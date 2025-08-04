import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import MemeGeneratorPage from './Pages/MemeGeneratorPage';
import AllMemesPage from './Pages/AllMemesPage';
import MemeDetailsPage from './Pages/MemeDetailsPage';
import UserProfilePage from './Pages/UserProfilePage';
import CommunityPage from './Pages/CommunityPage';
import UserMemesPage from './Pages/UserMemesPage';
import PremiumMemesPage from './Pages/PremiumMemesPage';
import PurchasedMemesPage from './Pages/PurchasedMemesPage';
import ContactPage from './Pages/ContactPage';
import SupportPage from './Pages/SupportPage';
import PrivacyPage from './Pages/PrivacyPage';
import UserTicketsPage from './Pages/UserTicketsPage';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './components/AuthContext';
import SignInPage from './Pages/SignInPage';
import SignUpPage from './Pages/SignUpPage';
import ForgetPasswordPage from './Pages/ForgetPasswordPage';
import AdminDashboard from './Pages/admin';
import { Toaster } from 'react-hot-toast';
import ResetPasswordPage from './Pages/ResetPasswordPage';

const AppContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const getNavbarLinks = () => {
    const baseLinks = [
      { label: 'Home', to: '/' },
      { label: 'Create', to: '/create' },
      { label: 'Explore', to: '/memes' },
      { label: 'Premium', to: '/premium' },
      { label: 'Community', to: '/community' },
      { label: 'Support', to: '/support' },
      { label: 'Contact', to: '/contact' },
    ];

    // My Tickets link has been moved to the user menu

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
      {!shouldHideNavbar && (
        <Navbar 
          links={getNavbarLinks()} 
          logo={
            <Link to="/" className="flex items-center gap-2 text-2xl font-black">
              <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                MemeForge
              </span>
              <span className="text-2xl">🔥</span>
            </Link>
          }
        />
      )}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<MemeGeneratorPage />} />
        <Route path="/memes" element={<AllMemesPage />} />
        <Route path="/memes/:id" element={<MemeDetailsPage />} />
        <Route path="/premium" element={<PremiumMemesPage />} />
        <Route path="/purchased" element={<PurchasedMemesPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/user/:userId/memes" element={<UserMemesPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgetPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/contact" element={<ContactPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/my-tickets" element={<UserTicketsPage />} />
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
