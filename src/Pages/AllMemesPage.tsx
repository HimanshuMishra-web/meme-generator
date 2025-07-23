import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MemeCard from '../components/MemeCard';
import { memes } from '../data/memes';
import { trending_memes } from '../data/trendingAPI';

const filters = ['All', 'Funny', 'Political', 'Relatable', 'AI-generated'];

export default function AllMemesPage() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const navigate = useNavigate();

  // Filter memes by search and filter
  const filteredMemes = memes.filter(meme =>
    (activeFilter === 'All' || meme.tags.some(tag => tag.toLowerCase().includes(activeFilter.toLowerCase()))) &&
    (meme.description.toLowerCase().includes(search.toLowerCase()) || meme.author.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-16 h-16 bg-yellow-400/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-pink-400/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-10 left-1/3 w-12 h-12 bg-blue-400/30 rounded-full blur-xl animate-pulse delay-500"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 text-white text-sm font-medium mb-6">
              🔍 Discover & Explore
            </div>
            <h1 className="text-5xl lg:text-6xl font-black mb-6 leading-tight">
              Explore <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Epic</span> Memes
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
              Dive into our vast collection of trending templates, viral content, and community favorites. Find your perfect meme inspiration! 
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xl">🔍</span>
                </div>
                <input
                  type="text"
                  placeholder="Search for memes, creators, or tags..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-16 pr-6 py-4 rounded-2xl border-0 bg-white/95 backdrop-blur-sm text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl placeholder-gray-500"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{memes.length}+</div>
                <div className="text-white/70 text-sm">Memes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{trending_memes.length}+</div>
                <div className="text-white/70 text-sm">Templates</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">∞</div>
                <div className="text-white/70 text-sm">Possibilities</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Enhanced Filters */}
        <section className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            {filters.map(filter => (
              <button
                key={filter}
                className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${
                  activeFilter === filter 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl scale-105' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300 hover:text-purple-600 shadow-md'
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* Trending Section */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full text-red-600 font-medium mb-4">
              🔥 Hot Templates
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Trending <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Templates</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Jump-start your creativity with the most popular meme templates right now
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {trending_memes.map((meme) => (
              <div key={meme.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-orange-200 transform hover:-translate-y-2">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={meme.url} 
                    alt={meme.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-2 text-sm line-clamp-1">{meme.name}</h3>
                  <button
                    className="w-full bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 text-sm transform hover:scale-105 shadow-md hover:shadow-lg"
                    onClick={() => navigate(`/create?template=${encodeURIComponent(meme.url)}`)}
                  >
                    Use Template ✨
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Community Memes Section */}
        <section>
          <div className="text-center mb-10">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full text-purple-600 font-medium mb-4">
              🎨 Community Gallery
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Community <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Creations</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing memes created by our talented community members
            </p>
          </div>

          {filteredMemes.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No memes found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredMemes.map((meme) => (
                <Link key={meme.id} to={`/memes/${meme.id}`} className="group block">
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200 transform hover:-translate-y-2">
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={meme.image} 
                        alt={meme.description}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-gray-800 font-medium text-sm line-clamp-2 mb-2">{meme.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-medium">{meme.author.name}</span>
                        <span>•</span>
                        <span>{meme.tags.slice(0, 2).join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Call to Action */}
        <section className="mt-20">
          <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Ready to Create Your <span className="text-yellow-300">Masterpiece</span>?
              </h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                Don't just browse - create! Use our powerful meme generator to bring your ideas to life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/create" 
                  className="bg-white text-purple-600 font-bold py-4 px-8 rounded-2xl hover:bg-gray-100 transition-all duration-300 text-lg shadow-xl transform hover:-translate-y-1"
                >
                  Start Creating 🎨
                </Link>
                <Link 
                  to="/api-memes" 
                  className="bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-2xl hover:bg-white hover:text-purple-600 transition-all duration-300 text-lg"
                >
                  Try AI Generator 🤖
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 