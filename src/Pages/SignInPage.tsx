import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import Player from 'lottie-react';
import loginLottie from '../assets/login-lottie.json';

const SignInPage: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!email) return 'Email is required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Invalid email format';
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const success = await signIn(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] bg-white overflow-hidden">
      <div className="bg-gray-100 p-8 rounded shadow-md w-full max-w-2xl flex flex-col md:flex-row items-center max-h-[85vh] overflow-y-auto">
        <div className="flex justify-center mb-6 md:mb-0 md:mr-8 w-full md:w-1/2">
          <Player
            autoplay
            loop
            animationData={loginLottie}
            style={{ height: '260px', width: '260px' }}
          />
        </div>
        <form onSubmit={handleSubmit} className="w-full md:w-1/2">
          <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded border"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full mb-6 px-4 py-2 rounded border"
            required
          />
          <div className="text-right mb-4">
            <Link to="/forgot-password" className="text-blue-500 hover:underline text-sm">Forgot password?</Link>
          </div>
          <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-full transition mb-2" disabled={submitting}>{submitting ? 'Signing In...' : 'Sign In'}</button>
          <div className="text-center text-sm mt-2">
            Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline">Sign Up</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignInPage; 