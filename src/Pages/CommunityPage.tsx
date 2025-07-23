import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/axiosInstance';
import { generateImageSource } from '../utils';
import PageLayout from '../components/PageLayout';
import UserAvatar from '../components/UserAvatar';
import MemeCard from '../components/MemeCard';

interface PublicUser {
  _id: string;
  username: string;
  bio?: string;
  profileImage?: string;
  createdAt?: string;
  likesReceived?: number;
  isPublic: boolean;
}

interface Meme {
  _id: string;
  url: string;
  prompt?: string;
  title?: string;
  userId: string;
}

const CommunityPage: React.FC = () => {
  // Fetch public users
  const { data: users = [], isLoading: loadingUsers } = useQuery<PublicUser[]>({
    queryKey: ['public-users'],
    queryFn: async () => {
      const allUsers = await apiService.get<PublicUser[]>('/users');
      return allUsers.filter(user => user.isPublic);
    },
  });

  // Fetch community memes (from public users)
  const { data: memesData, isLoading: loadingMemes } = useQuery<{ memes: Meme[] }>({
    queryKey: ['community-memes'],
    queryFn: async () => await apiService.get<{ memes: Meme[] }>('/images/community-memes'),
    enabled: users.length > 0
  });

  const memes = memesData?.memes || [];

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
        </div>

        {/* Public Profiles Section */}
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
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>👍 {user.likesReceived || 0} likes</span>
                      <span>📅 {user.createdAt ? new Date(user.createdAt).getFullYear() : ''}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Community Memes Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Community Gallery
            </h2>
            <p className="text-gray-600">
              Latest memes from our public creators
            </p>
          </div>

          {loadingMemes ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Loading community memes...</div>
            </div>
          ) : memes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No community memes yet</h3>
              <p className="text-gray-600">Public creators haven't shared any memes yet. Create some and make your profile public!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {memes.map((meme) => {
                const creator = users.find(user => user._id === meme.userId);
                return (
                  <div key={meme._id} className="group">
                    <MemeCard 
                      src={generateImageSource(meme.url)} 
                      title={meme.prompt || meme.title || ''} 
                    />
                    {creator && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                        <UserAvatar
                          src={creator.profileImage ? generateImageSource('/assets/media/' + creator.profileImage) : ''}
                          alt={creator.username}
                          size={20}
                        />
                        <span className="font-medium">{creator.username}</span>
                        <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded text-xs font-medium">PUBLIC</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

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
      </PageLayout>
    </div>
  );
};

export default CommunityPage; 