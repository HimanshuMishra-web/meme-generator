import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import MemeGeneratorPage from './Pages/MemeGeneratorPage';
import AllMemesPage from './Pages/AllMemesPage';
import MemeDetailsPage from './Pages/MemeDetailsPage';
import UserProfilePage from './Pages/UserProfilePage';
import Navbar from './components/Navbar';
import { AuthProvider } from './components/AuthContext';
import SignInPage from './Pages/SignInPage';
import SignUpPage from './Pages/SignUpPage';
import ForgetPasswordPage from './Pages/ForgetPasswordPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white text-gray-900">
          <Navbar
            logo={<span className="text-xl font-bold">🪄 MemeForge</span>}
            links={[
              { label: 'Home', to: '/' },
              { label: 'Create', to: '/create' },
              { label: 'Explore', to: '/memes' },
              { label: 'Community', href: '#' },
            ]}
            rightContent={<button className="ml-4 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-5 py-2 rounded-full transition">Sign up</button>}
          />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/create" element={<MemeGeneratorPage />} />
            <Route path="/memes" element={<AllMemesPage />} />
            <Route path="/memes/:id" element={<MemeDetailsPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgetPasswordPage />} />
            {/* Future routes can be added here */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
