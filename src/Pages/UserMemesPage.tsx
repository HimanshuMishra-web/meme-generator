import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/axiosInstance';
import { generateImageSource } from '../utils';
import PageLayout from '../components/PageLayout';
import UserAvatar from '../components/UserAvatar';
import MemeCard from '../components/MemeCard';

interface User {
  _id: string;
  username: string;
  bio?: string;
  profileImage?: string;
  isPublic: boolean;
}

interface Meme {
  _id: string;
  url: string;
  prompt?: string;
  title?: string;
  is_public: boolean;
  createdAt: string;
}

interface UserMemesResponse {
  user: User;
  memes: Meme[];
}

const UserMemesPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  const { data, isLoading, error } = useQuery<UserMemesResponse>({
    queryKey: ['user-memes', userId],
    queryFn: async () => await apiService.get<UserMemesResponse>(`/images/user/${userId}/public-memes`),
    enabled: !!userId
  });

  const user = data?.user;
  const memes = data?.memes || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h3 className="text-xl font-bold text-gray-700">Loading memes...</h3>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">User not found</h3>
          <p className="text-gray-600">This user doesn't exist or hasn't made their profile public.</p>
          <a href="/community" className="mt-4 inline-block bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition">
            Back to Community
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageLayout>
        {/* User Header */}
        <div className="text-center mb-12 py-10">
          <div className="flex flex-col items-center">
            <UserAvatar
              src={user.profileImage ? generateImageSource('/assets/media/' + user.profileImage) : ''}
              alt={user.username}
              size={120}
              className="border-4 border-yellow-400 shadow-lg mb-4"
            />
            <div className="inline-flex items-center px-3 py-1 bg-green-100 rounded-full text-green-800 text-sm font-medium mb-2">
              🌐 Public Profile
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              {user.username}'s <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Creations</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {user.bio || `Explore ${user.username}'s amazing meme collection`}
            </p>
            <div className="mt-4 flex items-center gap-4">
              <span className="bg-white px-4 py-2 rounded-full shadow-md text-gray-700 font-medium">
                🎨 {memes.length} public creations
              </span>
              <a href="/community" className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition font-medium">
                ← Back to Community
              </a>
            </div>
          </div>
        </div>

        {/* Memes Grid */}
        <section className="mb-16">
          {memes.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No public memes yet</h3>
              <p className="text-gray-600">{user.username} hasn't shared any public memes yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {memes.map((meme) => (
                <Link key={meme._id} to={`/memes/${meme._id}`} className="group block">
                  <MemeCard 
                    src={generateImageSource(meme.url)} 
                    title={meme.prompt || meme.title || 'Untitled Meme'} 
                  />
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    Created {new Date(meme.createdAt).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </PageLayout>
    </div>
  );
};

export default UserMemesPage; 