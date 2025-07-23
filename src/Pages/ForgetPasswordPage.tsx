import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Player from 'lottie-react';
import forgetLottie from '../assets/forget-lottie.json';
import { useMutation } from '@tanstack/react-query';
import { API_URL } from '../../constants';
import { toast } from 'react-hot-toast';

async function forgetPasswordApi(email: string) {
  const res = await fetch(`${API_URL}/auth/forget-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error('Failed to send reset link');
  return res.json();
}

const ForgetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const mutation = useMutation({
    mutationFn: (email: string) => forgetPasswordApi(email),
    onSuccess: (data) => {
      setSuccess(data.message || 'If this email is registered, a password reset link has been sent.');
      setError('');
      toast.success(data.message || 'If this email is registered, a password reset link has been sent.');
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to send reset link');
      setSuccess('');
      toast.error(err.message || 'Failed to send reset link');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    mutation.mutate(email);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="bg-gray-100 p-8 rounded shadow-md w-full max-w-2xl flex flex-col md:flex-row items-center">
        <div className="flex justify-center mb-6 md:mb-0 md:mr-8 w-full md:w-1/2">
          <Player
            autoplay
            loop
            animationData={forgetLottie}
            style={{ height: '260px', width: '260px' }}
          />
        </div>
        <form onSubmit={handleSubmit} className="w-full md:w-1/2">
          <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
          {/* Toast handles error/success messages */}
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded border"
            required
          />
          <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-full transition mb-2" disabled={mutation.isPending}>{mutation.isPending ? 'Sending...' : 'Send Reset Link'}</button>
          <div className="text-center text-sm mt-2">
            Remembered your password? <Link to="/signin" className="text-blue-500 hover:underline">Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgetPasswordPage; 