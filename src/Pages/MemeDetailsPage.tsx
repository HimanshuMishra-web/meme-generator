import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/axiosInstance';
import { generateImageSource } from '../utils';
import UserAvatar from '../components/UserAvatar';
import CommentList from '../components/CommentList';
import PageLayout from '../components/PageLayout';
import LikeButton from '../components/LikeButton';
import { useAuth } from '../components/AuthContext';

export default function MemeDetailsPage() {
  const { id } = useParams();
  const { token } = useAuth();

  // Fetch meme data from API
  const { data: memeData, isLoading, error } = useQuery({
    queryKey: ['meme', id],
    queryFn: async () => await apiService.get(`/images/meme/${id}`, token ?? undefined),
    enabled: !!id
  });

  const meme = memeData?.meme;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center">
        <PageLayout className="max-w-3xl text-center">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading meme...</p>
        </PageLayout>
      </div>
    );
  }

  if (error || !meme) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center">
        <PageLayout className="max-w-3xl text-center">
          <h2 className="text-2xl font-bold mb-4">Meme Not Found</h2>
          <p className="mb-6">Sorry, we couldn't find the meme you're looking for.</p>
          <Link to="/memes" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded-full transition">Back to Memes</Link>
        </PageLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PageLayout className="max-w-3xl">
        {/* Meme Image */}
        <div className="flex justify-center mb-8">
          <img 
            src={generateImageSource(meme.url)} 
            alt={meme.title || meme.description || 'Meme'} 
            className="rounded-xl shadow max-w-full max-h-[350px] bg-gray-100" 
          />
        </div>
        
        {/* Actions */}
        <div className="flex justify-center gap-6 mb-6">
          <LikeButton 
            memeId={meme._id}
            memeType={meme.memeType}
            size="lg"
          />
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-lg">💬</span>
            <span className="text-sm">{meme.reviewCount || 0}</span>
          </div>
          <button title="Share" className="text-gray-400 hover:text-yellow-400 text-2xl">
            📤
          </button>
        </div>
        
        {/* Author Info */}
        <div className="flex items-center gap-4 mb-4">
          <UserAvatar 
            src={meme.user.profileImage ? generateImageSource('/assets/media/' + meme.user.profileImage) : ''} 
            alt={meme.user.username} 
            size={64} 
          />
          <div>
            <div className="font-bold text-lg">{meme.user.username}</div>
            <div className="text-gray-500 text-sm">
              {new Date(meme.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        {/* Meme Info */}
        <div className="mb-6">
          {meme.title && (
            <h2 className="text-xl font-bold text-gray-900 mb-2">{meme.title}</h2>
          )}
          {meme.description && (
            <p className="text-gray-700 text-base mb-2">{meme.description}</p>
          )}
          {meme.prompt && (
            <p className="text-gray-600 text-sm mb-2">
              <span className="font-medium">Prompt:</span> {meme.prompt}
            </p>
          )}
          <div className="text-gray-500 text-xs">
            {meme.style ? `AI Generated • ${meme.style}` : 'Custom Meme'}
          </div>
        </div>
        
        {/* Share Buttons */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <button className="bg-gray-100 px-4 py-2 rounded-full font-semibold text-gray-700 hover:bg-gray-200">
            Share on X
          </button>
          <button className="bg-gray-100 px-4 py-2 rounded-full font-semibold text-gray-700 hover:bg-gray-200">
            Share on WhatsApp
          </button>
          <button className="bg-gray-100 px-4 py-2 rounded-full font-semibold text-gray-700 hover:bg-gray-200">
            Share on Instagram
          </button>
        </div>
        
        {/* Comments */}
        <div className="mb-8">
          <h3 className="font-bold mb-4 text-lg">Comments</h3>
          <CommentList comments={[]} /> {/* TODO: Add comments functionality */}
        </div>
        
        {/* Remix Button */}
        <div className="flex justify-center">
          <Link 
            to={`/create?template=${encodeURIComponent(generateImageSource(meme.url))}`}
            className="bg-yellow-300 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-full transition"
          >
            Remix this meme
          </Link>
        </div>
      </PageLayout>
    </div>
  );
} 