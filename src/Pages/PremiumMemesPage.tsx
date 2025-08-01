import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/axiosInstance';
import { useAuth } from '../components/AuthContext';
import { generateImageSource } from '../utils';
import toast from 'react-hot-toast';
import PageLayout from '../components/PageLayout';
import MemeCard from '../components/MemeCard';
import UserAvatar from '../components/UserAvatar';

interface PremiumMeme {
  _id: string;
  url: string;
  title?: string;
  prompt?: string;
  price: number;
  commission: number;
  soldCount?: number;
  user: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  memeType: 'Meme' | 'GeneratedImage';
  style?: string;
  modelUsed?: string;
}

const PremiumMemesPage: React.FC = () => {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState<'createdAt' | 'price' | 'soldCount'>('createdAt');

  // Fetch premium memes
  const { data: premiumData, isLoading, error } = useQuery<{ memes: PremiumMeme[] }>({
    queryKey: ['premium-memes', sortBy],
    queryFn: async () => await apiService.get<{ memes: PremiumMeme[] }>(`/premium/memes?sort=${sortBy}`),
  });

  const premiumMemes = premiumData?.memes || [];

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async ({ memeId, memeType }: { memeId: string; memeType: string }) => 
      await apiService.post('/premium/meme/purchase', { memeId, memeType }, token ?? undefined),
    onSuccess: () => {
      toast.success('Premium meme purchased successfully!');
      queryClient.invalidateQueries({ queryKey: ['premium-memes'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to purchase meme');
    }
  });

  const handlePurchase = (meme: PremiumMeme) => {
    if (!user) {
      toast.error('Please sign in to purchase premium memes');
      return;
    }

    if (meme.user._id === user._id) {
      toast.error('You cannot purchase your own meme');
      return;
    }

    purchaseMutation.mutate({
      memeId: meme._id,
      memeType: meme.memeType
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Loading premium memes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <p className="text-red-600 font-medium">Failed to load premium memes. Please try again.</p>
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
              💎 Premium Memes
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover exclusive, high-quality memes created by talented creators. 
              Support artists and get unique content for your collection!
            </p>
          </div>

          {/* Stats Banner */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 mb-8 text-white shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold">{premiumMemes.length}</div>
                <div className="text-yellow-100">Premium Memes</div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  ${premiumMemes.reduce((sum, meme) => sum + meme.price, 0).toFixed(2)}
                </div>
                <div className="text-yellow-100">Total Value</div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {premiumMemes.reduce((sum, meme) => sum + (meme.soldCount || 0), 0)}
                </div>
                <div className="text-yellow-100">Total Sales</div>
              </div>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-full shadow-lg p-2">
              <div className="flex space-x-2">
                {[
                  { key: 'createdAt', label: 'Latest' },
                  { key: 'price', label: 'Price' },
                  { key: 'soldCount', label: 'Popular' }
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setSortBy(option.key as any)}
                    className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                      sortBy === option.key
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Premium Memes Grid */}
          {premiumMemes.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-8xl mb-6">💎</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">No Premium Memes Yet</h3>
              <p className="text-gray-500 text-lg mb-8">
                Creators haven't made any memes premium yet. Be the first to create premium content!
              </p>
              <a 
                href="/create" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                ✨ Create Premium Meme
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {premiumMemes.map((meme, index) => (
                <div 
                  key={meme._id} 
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Premium Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
                      💎 Premium
                    </span>
                  </div>

                  {/* Price Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-lg">
                      ${meme.price}
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
                      {meme.prompt || meme.title || 'Premium Meme'}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>
                        {meme.style ? `AI Generated • ${meme.style}` : 'Custom Creation'}
                      </span>
                      <span>Sold: {meme.soldCount || 0}</span>
                    </div>

                    {/* Purchase Button */}
                    <button
                      onClick={() => handlePurchase(meme)}
                      disabled={purchaseMutation.isPending || meme.user._id === user?._id}
                      className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                        meme.user._id === user?._id
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                      } disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none`}
                    >
                      {purchaseMutation.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Purchasing...
                        </span>
                      ) : meme.user._id === user?._id ? (
                        'Your Meme'
                      ) : (
                        `Buy for $${meme.price}`
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageLayout>
    </div>
  );
};

export default PremiumMemesPage; 