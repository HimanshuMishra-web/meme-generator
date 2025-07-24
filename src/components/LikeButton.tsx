import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/axiosInstance';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

interface LikeButtonProps {
  memeId: string;
  memeType: 'Meme' | 'GeneratedImage';
  className?: string;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface LikeData {
  likeCount: number;
  isLiked: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  memeId,
  memeType,
  className = '',
  showCount = true,
  size = 'md'
}) => {
  const { isAuthenticated, token } = useAuth();
  const queryClient = useQueryClient();

  // Get like status and count
  const { data: likeData, isLoading } = useQuery<LikeData>({
    queryKey: ['like-status', memeType, memeId],
    queryFn: async () => await apiService.get<LikeData>(`/likes/${memeType}/${memeId}/status`, token)
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        throw new Error('Please sign in to like memes');
      }
      return await apiService.post('/likes/like', { memeId, memeType }, token!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['like-status', memeType, memeId] });
      toast.success('Meme liked! 👍');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || error.message || 'Failed to like meme';
      toast.error(message);
    }
  });

  // Unlike mutation
  const unlikeMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        throw new Error('Please sign in to unlike memes');
      }
      return await apiService.post('/likes/unlike', { memeId, memeType }, token!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['like-status', memeType, memeId] });
      toast.success('Meme unliked');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || error.message || 'Failed to unlike meme';
      toast.error(message);
    }
  });

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like memes');
      return;
    }

    if (likeData?.isLiked) {
      unlikeMutation.mutate();
    } else {
      likeMutation.mutate();
    }
  };

  const isLoading_mutations = likeMutation.isPending || unlikeMutation.isPending;
  const isLiked = likeData?.isLiked || false;
  const likeCount = likeData?.likeCount || 0;

  // Size styles
  const sizeStyles = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-3'
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || isLoading_mutations}
      className={`
        inline-flex items-center gap-2 rounded-full font-medium transition-all duration-200
        ${isLiked 
          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }
        ${isLoading || isLoading_mutations ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        ${sizeStyles[size]}
        ${className}
      `}
      title={isLiked ? 'Unlike this meme' : 'Like this meme'}
    >
      {isLoading || isLoading_mutations ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <span className={`transition-transform ${isLiked ? 'scale-110' : ''}`}>
          {isLiked ? '❤️' : '🤍'}
        </span>
      )}
      
      {showCount && (
        <span className="font-bold">
          {likeCount}
        </span>
      )}
      
      {!showCount && (
        <span className="hidden sm:inline">
          {isLiked ? 'Liked' : 'Like'}
        </span>
      )}
    </button>
  );
};

export default LikeButton; 