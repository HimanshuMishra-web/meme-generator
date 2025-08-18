import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiService } from '../services/axiosInstance';
import { generateImageSource } from '../utils';
import PageLayout from '../components/PageLayout';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../components/AuthContext';
import LikeButton from '../components/LikeButton';
import ReviewSection from '../components/ReviewSection';

interface PublicUser {
  _id: string;
  username: string;
  bio?: string;
  profileImage?: string;
  createdAt?: string;
  likesReceived?: number;
  isPublic: boolean;
  publicMemeCount?: number;
}

interface CommunityMeme {
  _id: string;
  url: string;
  title?: string;
  description?: string;
  prompt?: string;
  style?: string;
  modelUsed?: string;
  createdAt: string;
  is_public: boolean;
  memeType: 'Meme' | 'GeneratedImage';
  likeCount?: number;
  reviewCount?: number;
  user: {
    _id: string;
    username: string;
    profileImage?: string;
    isPublic: boolean;
  };
}



const CommunityPage: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const [selectedMeme, setSelectedMeme] = useState<CommunityMeme | null>(null);
  const [activeTab, setActiveTab] = useState<'creators' | 'memes'>('memes');

  // Fetch current user's profile if authenticated
  const { data: currentUserProfile } = useQuery<PublicUser>({
    queryKey: ['my-profile'],
    queryFn: async () => await apiService.get<PublicUser>('/users/me', token ?? undefined),
    enabled: !!isAuthenticated && !!token
  });

  // Fetch public users
  const { data: allUsers = [], isLoading: loadingUsers } = useQuery<PublicUser[]>({
    queryKey: ['public-users'],
    queryFn: async () => await apiService.get<PublicUser[]>('/users/public'),
  });

  // Filter out current user from public users
  const users = allUsers.filter(user => 
    !currentUserProfile || user._id !== currentUserProfile._id
  );

  // Fetch community memes
  const { data: memesData, isLoading: loadingMemes } = useQuery<{ memes: CommunityMeme[] }>({
    queryKey: ['community-memes'],
    queryFn: async () => await apiService.get<{ memes: CommunityMeme[] }>('/images/community-memes')
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <PageLayout>
        {/* Header */}
        <div className="text-center mb-12 py-10">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full text-purple-600 font-medium mb-4">
            🌐 Community Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Meet Our <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Community</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing creators and their incredible meme collections
          </p>
          
          {/* Tab Navigation */}
          <div className="flex justify-center mt-8">
            <div className="bg-white rounded-full p-1 shadow-lg">
              <button
                onClick={() => setActiveTab('memes')}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                  activeTab === 'memes'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                🎨 Community Memes
              </button>
              <button
                onClick={() => setActiveTab('creators')}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                  activeTab === 'creators'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                👥 Creators
              </button>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'memes' && (
          <section className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Community Memes
              </h2>
              <p className="text-gray-600">
                Latest public memes from our talented community members
              </p>
            </div>

            {loadingMemes ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-gray-500">Loading community memes...</div>
              </div>
            ) : !memesData?.memes.length ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No public memes yet</h3>
                <p className="text-gray-600">Be the first to share a public meme with the community!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {memesData.memes.map((meme) => (
                  <Link key={meme._id} to={`/memes/${meme._id}`} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-2 block">
                    {/* Meme Image */}
                    <div className="relative overflow-hidden aspect-square">
                      <img 
                        src={generateImageSource(meme.url)} 
                        alt={meme.title || meme.description || 'Community meme'}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      
                      {/* Overlay with actions */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                          <div onClick={(e) => e.stopPropagation()}>
                            <LikeButton 
                              memeId={meme._id}
                              memeType={meme.memeType}
                              size="sm"
                              className="bg-white/90 text-gray-800 hover:bg-white"
                            />
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedMeme(meme);
                            }}
                            className="bg-white/90 hover:bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium transition-colors"
                          >
                            💬 Reviews
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Meme Info */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <UserAvatar
                          src={meme.user.profileImage ? generateImageSource('/assets/media/' + meme.user.profileImage) : ''}
                          alt={meme.user.username}
                          size={24}
                          className="flex-shrink-0"
                        />
                        <span className="font-medium text-gray-900 text-sm">{meme.user.username}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(meme.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {(meme.title || meme.description) && (
                        <div className="mb-2">
                          {meme.title && (
                            <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{meme.title}</h3>
                          )}
                          {meme.description && (
                            <p className="text-gray-600 text-xs line-clamp-2 mt-1">{meme.description}</p>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {meme.style ? `AI Generated • ${meme.style}` : 'Custom Meme'}
                        </span>
                        <div className="flex items-center gap-3">
                          <span>❤️ {meme.likeCount || 0}</span>
                          <span>💬 {meme.reviewCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'creators' && (
          <section className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Public Creators
              </h2>
              <p className="text-gray-600">
                These talented creators have made their profiles public to share their work with the community
              </p>
            </div>

            {loadingUsers ? (
              <div className="text-center py-12">
                <div className="text-gray-500">Loading community members...</div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No public profiles yet</h3>
                <p className="text-gray-600">Be the first to make your profile public and join our community!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {users.map((user) => (
                  <div key={user._id} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-2">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-4">
                        <UserAvatar
                          src={user.profileImage ? generateImageSource('/assets/media/' + user.profileImage) : ''}
                          alt={user.username}
                          size={80}
                          className="border-4 border-yellow-400 shadow-lg"
                        />
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                          PUBLIC
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{user.username}</h3>
                      <p className="text-gray-600 text-sm mb-3 min-h-[3rem]">{user.bio || 'No bio yet.'}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span>👍 {user.likesReceived || 0} likes</span>
                        <span>📅 {user.createdAt ? new Date(user.createdAt).getFullYear() : ''}</span>
                      </div>
                      <a 
                        href={`/user/${user._id}/memes`}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-lg"
                      >
                        🎨 {user.publicMemeCount || 0} creations
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}



        {/* Call to Action */}
        <section className="text-center py-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join Our Community!
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Make your profile public to showcase your memes and connect with other creators. 
            Go to your profile settings to enable public visibility.
          </p>
          <a 
            href="/profile" 
            className="inline-flex items-center bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg transform hover:-translate-y-1"
          >
            Update Profile Settings
          </a>
        </section>

        {/* Meme Detail Modal */}
        {selectedMeme && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    src={selectedMeme.user.profileImage ? generateImageSource('/assets/media/' + selectedMeme.user.profileImage) : ''}
                    alt={selectedMeme.user.username}
                    size={40}
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedMeme.user.username}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedMeme.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMeme(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6 p-6">
                {/* Meme Image */}
                <div className="space-y-4">
                  <img 
                    src={generateImageSource(selectedMeme.url)} 
                    alt={selectedMeme.title || selectedMeme.description || 'Community meme'}
                    className="w-full rounded-xl shadow-lg"
                  />
                  
                  {/* Meme Details */}
                  <div>
                    {selectedMeme.title && (
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedMeme.title}</h3>
                    )}
                    {selectedMeme.description && (
                      <p className="text-gray-700 mb-4">{selectedMeme.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 mb-4">
                      <LikeButton 
                        memeId={selectedMeme._id}
                        memeType={selectedMeme.memeType}
                      />
                      <span className="text-sm text-gray-500">
                        {selectedMeme.style ? `AI Generated • ${selectedMeme.style}` : 'Custom Meme'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reviews */}
                <div>
                  <ReviewSection
                    memeId={selectedMeme._id}
                    memeType={selectedMeme.memeType}
                    className="shadow-none p-0"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </PageLayout>
    </div>
  );
};

export default CommunityPage; 