import React from 'react';
import { Link } from 'react-router-dom';
import MemeCard from '../components/MemeCard';
import PageLayout from '../components/PageLayout';
import { trendingMemes } from '../data/memes';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/axiosInstance';
import { generateImageSource } from '../utils';
import Testimonials from '../components/Testimonials';

export default function LandingPage() {
  // Fetch testimonials
  const { data: testimonialsRaw = [] } = useQuery({
    queryKey: ['testimonials-public'],
    queryFn: async () => await apiService.get('/testimonials'),
  });
  const testimonials = testimonialsRaw as any[];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PageLayout>
        {/* Hero Banner */}
        <section className="rounded-xl overflow-hidden mb-10">
          <div className="bg-gradient-to-br from-orange-400 via-pink-500 to-blue-500 p-10 flex flex-col gap-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow mb-2">Unleash Your Inner Meme Lord</h1>
            <p className="text-lg text-white/90 max-w-xl">Craft hilarious memes with our easy-to-use generator. Share your creations and join a thriving community of meme enthusiasts.</p>
            <div className="flex gap-4 mt-2">
              <Link to="/create" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded-full transition">Create a Meme</Link>
              <button className="bg-white/20 hover:bg-white/40 text-white font-bold py-2 px-6 rounded-full border border-white/30 transition">Explore Trending</button>
            </div>
          </div>
        </section>
        {/* Trending Memes */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Trending Memes</h2>
          <div className="flex gap-6">
            {trendingMemes.map((meme) => (
              <MemeCard
                key={meme.id}
                src={meme.image}
                alt={meme.description}
                title={meme.description}
              />
            ))}
          </div>
        </section>
        {/* Features */}
        <section className="mb-10">
          <h3 className="font-semibold mb-2">Features</h3>
          <h2 className="text-2xl font-extrabold mb-2">Meme Creation Made Easy</h2>
          <p className="text-gray-600 mb-6 max-w-2xl">Our platform offers a range of powerful features to help you create and share your memes effortlessly.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 flex flex-col items-start gap-2 bg-white">
              <span className="text-2xl">🪄</span>
              <span className="font-bold">Text-to-Image AI</span>
              <span className="text-gray-500 text-sm">Generate unique meme images from text prompts using our advanced AI technology.</span>
            </div>
            <div className="border rounded-lg p-4 flex flex-col items-start gap-2 bg-white">
              <span className="text-2xl">🔥</span>
              <span className="font-bold">Trending Templates</span>
              <span className="text-gray-500 text-sm">Browse our constantly updating library of popular meme templates to get started quickly.</span>
            </div>
            <div className="border rounded-lg p-4 flex flex-col items-start gap-2 bg-white">
              <span className="text-2xl">⚡</span>
              <span className="font-bold">Instant Sharing</span>
              <span className="text-gray-500 text-sm">Share your memes directly to social media platforms with a single click.</span>
            </div>
          </div>
        </section>
        {/* Community Highlights (Testimonials) */}
        <section className="mb-10">
          <h3 className="font-semibold mb-2">What Our Users Say</h3>
          <Testimonials testimonials={testimonials} />
        </section>
      </PageLayout>
      <footer className="border-t py-6 text-center text-gray-400 text-sm mt-10">
        <div className="flex justify-center gap-6 mb-2">
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Contact</a>
          <a href="#" className="hover:underline">Privacy</a>
        </div>
        &copy; {new Date().getFullYear()} MemeForge. All rights reserved.
      </footer>
    </div>
  );
} 