import React, { useState } from 'react';
import Masonry from 'react-masonry-css';

interface TrendingMeme {
  id: string;
  image: string;
  description: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  tags?: string[];
  comments?: any[];
}

interface TrendingMemesProps {
  memes: TrendingMeme[];
}

const breakpointColumnsObj = {
  default: 4,
  1536: 4,
  1280: 3,
  1024: 3,
  768: 2,
  640: 1,
};

const TrendingMemes: React.FC<TrendingMemesProps> = ({ memes }) => {
  const [likedMemes, setLikedMemes] = useState<Set<string>>(new Set());
  const [savedMemes, setSavedMemes] = useState<Set<string>>(new Set());

  const toggleLike = (memeId: string) => {
    setLikedMemes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memeId)) {
        newSet.delete(memeId);
      } else {
        newSet.add(memeId);
      }
      return newSet;
    });
  };

  const toggleSave = (memeId: string) => {
    setSavedMemes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memeId)) {
        newSet.delete(memeId);
      } else {
        newSet.add(memeId);
      }
      return newSet;
    });
  };

  return (
    <section className="mb-14 px-4">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex w-auto -ml-6"
        columnClassName="pl-6 bg-clip-padding"
      >
        {memes.map((meme) => (
          <div 
            key={meme.id} 
            className="relative mb-6 group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-gray-200"
          >
            {/* Image Container */}
            <div className="relative overflow-hidden">
              <img 
                src={meme.image} 
                alt={meme.description}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Quick Action Buttons - Visible on Hover */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-[-10px] group-hover:translate-y-0">
                <button
                  onClick={() => toggleSave(meme.id)}
                  className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 ${
                    savedMemes.has(meme.id) 
                      ? 'bg-yellow-500 text-white shadow-lg' 
                      : 'bg-white/90 text-gray-700 hover:bg-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                </button>
                <button className="p-2 rounded-full bg-white/90 text-gray-700 backdrop-blur-md hover:bg-white transition-all duration-300 hover:scale-110">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
              </div>

              {/* Fire Badge for Trending */}
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                  🔥 <span>HOT</span>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-5">
              {/* Author Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <img 
                    src={meme.author.avatar} 
                    alt={meme.author.name}
                    className="w-10 h-10 rounded-full border-2 border-gray-200 group-hover:border-purple-300 transition-colors duration-300"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm group-hover:text-purple-600 transition-colors duration-300">
                    {meme.author.name}
                  </h4>
                  <p className="text-gray-500 text-xs">{meme.author.username}</p>
                </div>
                <button className="text-gray-400 hover:text-purple-500 transition-colors duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>

              {/* Description */}
              <p className="text-gray-800 text-sm leading-relaxed mb-4 group-hover:text-gray-900 transition-colors duration-300">
                {meme.description}
              </p>

              {/* Tags */}
              {meme.tags && meme.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {meme.tags.slice(0, 3).map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-purple-600 text-xs rounded-full border border-purple-100 hover:border-purple-200 transition-colors duration-300 cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                  {meme.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-full border border-gray-200">
                      +{meme.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Interaction Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleLike(meme.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                      likedMemes.has(meme.id)
                        ? 'bg-red-50 text-red-500 hover:bg-red-100'
                        : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <svg className={`w-4 h-4 transition-transform duration-300 ${likedMemes.has(meme.id) ? 'scale-110' : ''}`} fill={likedMemes.has(meme.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-xs font-medium">
                      {Math.floor(Math.random() * 100) + 50 + (likedMemes.has(meme.id) ? 1 : 0)}
                    </span>
                  </button>
                  
                  <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-blue-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-xs font-medium">
                      {meme.comments?.length || Math.floor(Math.random() * 20) + 5}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center text-gray-400 text-xs">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {Math.floor(Math.random() * 12) + 1}h ago
                  </div>
                </div>
              </div>
            </div>

            {/* Hover Animation Border */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        ))}
      </Masonry>
    </section>
  );
};

export default TrendingMemes; 