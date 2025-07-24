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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/30 to-yellow-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-amber-200/30 to-orange-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-yellow-200/20 to-amber-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-12 px-4 overflow-y-auto scrollbar-hide">
        <div className="w-full max-w-6xl">
          {/* Main Content Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              
              {/* Left Side - Animation */}
              <div className="lg:w-1/2 bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 p-12 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
                <div className="relative z-10 text-center w-full">
                  <div className="mb-8 flex items-center justify-center">
                    <Player
                      autoplay
                      loop
                      animationData={forgetLottie}
                      style={{ height: '320px', width: '320px' }}
                      className="mx-auto"
                    />
                  </div>
                  <div className="text-white">
                    <h2 className="text-4xl font-black mb-4">No Worries!</h2>
                    <p className="text-xl text-orange-100 leading-relaxed">
                      We'll help you reset your password and get back to creating amazing content! 🔑
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="lg:w-1/2 p-12 overflow-y-auto scrollbar-hide">
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-8">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-3">
                      Forgot Password
                    </h1>
                    <p className="text-gray-600 text-lg">
                      Enter your email to receive a password reset link
                    </p>
                  </div>

                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl mb-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {success}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:bg-white outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                          required
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={mutation.isPending}
                      className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {mutation.isPending ? (
                        <span className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending reset link...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          📧 Send Reset Link
                        </span>
                      )}
                    </button>

                    <div className="text-center pt-4">
                      <p className="text-gray-600">
                        Remembered your password?{' '}
                        <Link 
                          to="/signin" 
                          className="font-bold text-orange-600 hover:text-orange-700 transition-colors duration-200 hover:underline"
                        >
                          Sign In
                        </Link>
                      </p>
                    </div>
                  </form>

                  {/* Additional Help */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200">
                    <div className="text-center">
                      <h3 className="font-bold text-orange-800 mb-2">Need Help?</h3>
                      <p className="text-sm text-orange-700">
                        If you don't receive the email within a few minutes, check your spam folder or contact support.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ForgetPasswordPage; 