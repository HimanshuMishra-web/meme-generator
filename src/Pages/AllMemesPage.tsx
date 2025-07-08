import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MemeCard from '../components/MemeCard';
import { memes } from '../data/memes';

const filters = ['Funny', 'Political', 'Relatable', 'AI-generated', 'All'];

export default function AllMemesPage() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Filter memes by search and filter
  const filteredMemes = memes.filter(meme =>
    (activeFilter === 'All' || meme.tags.some(tag => tag.toLowerCase().includes(activeFilter.toLowerCase()))) &&
    (meme.description.toLowerCase().includes(search.toLowerCase()) || meme.author.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-2xl px-5 py-3 rounded-xl border border-gray-200 bg-gray-50 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-300"
          />
        </div>
        {/* Filters */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {filters.map(filter => (
            <button
              key={filter}
              className={`px-4 py-2 rounded-full font-semibold text-sm border transition ${activeFilter === filter ? 'bg-black text-white' : 'bg-gray-100 text-black border-gray-200'}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        {/* Trending Section */}
        <h2 className="text-xl font-bold mb-4">Trending</h2>
        {/* Meme Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredMemes.map((meme) => (
            <Link key={meme.id} to={`/memes/${meme.id}`}>
              <MemeCard src={meme.image} title={meme.description} />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
} 