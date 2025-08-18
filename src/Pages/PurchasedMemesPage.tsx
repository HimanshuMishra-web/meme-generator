import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiService } from '../services/axiosInstance';
import { useAuth } from '../components/AuthContext';
import { generateImageSource } from '../utils';
import PageLayout from '../components/PageLayout';
import MemeCard from '../components/MemeCard';
import UserAvatar from '../components/UserAvatar';

interface PurchasedMeme {
  _id: string;
  url: string;
  title?: string;
  prompt?: string;
  purchasePrice: number;
  purchaseDate: string;
  user: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  memeType: 'Meme' | 'GeneratedImage';
  style?: string;
  modelUsed?: string;
}

const PurchasedMemesPage: React.FC = () => {
  const { token, user } = useAuth();

  // Fetch purchased memes
  const { data: purchasedData, isLoading, error } = useQuery<{ memes: PurchasedMeme[] }>({
    queryKey: ['purchased-memes'],
    queryFn: async () => await apiService.get<{ memes: PurchasedMeme[] }>('/premium/purchased', token ?? undefined),
    enabled: !!token
  });

  const purchasedMemes = purchasedData?.memes || [];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-4">Sign in Required</h3>
          <p className="text-gray-500 text-lg mb-8">Please sign in to view your purchased memes.</p>
          <a 
            href="/signin" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Loading your purchased memes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <p className="text-red-600 font-medium">Failed to load purchased memes. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <PageLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              🛒 My Purchased Memes
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your collection of premium memes that you've purchased from talented creators.
            </p>
          </div>

          {/* Stats Banner */}
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-6 mb-8 text-white shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold">{purchasedMemes.length}</div>
                <div className="text-green-100">Purchased Memes</div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  ${purchasedMemes.reduce((sum, meme) => sum + meme.purchasePrice, 0).toFixed(2)}
                </div>
                <div className="text-green-100">Total Spent</div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {new Set(purchasedMemes.map(meme => meme.user._id)).size}
                </div>
                <div className="text-green-100">Creators Supported</div>
              </div>
            </div>
          </div>

          {/* Purchased Memes Grid */}
          {purchasedMemes.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-8xl mb-6">🛒</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">No Purchased Memes Yet</h3>
              <p className="text-gray-500 text-lg mb-8">
                You haven't purchased any premium memes yet. Start exploring and support creators!
              </p>
              <a 
                href="/premium" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                💎 Explore Premium Memes
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {purchasedMemes.map((meme, index) => (
                <Link 
                  key={meme._id} 
                  to={`/memes/${meme._id}`}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden block"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Purchased Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-lg">
                      ✅ Purchased
                    </span>
                  </div>

                  {/* Price Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-500 text-white shadow-lg">
                      ${meme.purchasePrice}
                    </span>
                  </div>

                  {/* Meme Image */}
                  <div className="relative overflow-hidden rounded-t-2xl">
                    <MemeCard 
                      src={generateImageSource(meme.url)} 
                      title={meme.prompt || meme.title || ''} 
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  {/* Meme Info */}
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <UserAvatar 
                        src={meme.user.profileImage ? generateImageSource('/assets/media/' + meme.user.profileImage) : ''} 
                        alt={meme.user.username} 
                        size={32}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm font-semibold text-gray-700">
                        {meme.user.username}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-800 truncate text-sm mb-2">
                      {meme.prompt || meme.title || 'Purchased Meme'}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>
                        {meme.style ? `AI Generated • ${meme.style}` : 'Custom Creation'}
                      </span>
                      <span>Purchased {new Date(meme.purchaseDate).toLocaleDateString()}</span>
                    </div>

                    {/* Download Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const link = document.createElement('a');
                        link.href = generateImageSource(meme.url);
                        link.download = `${meme.title || meme.prompt || 'meme'}.png`;
                        link.click();
                      }}
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      📥 Download
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PageLayout>
    </div>
  );
};

export default PurchasedMemesPage; 