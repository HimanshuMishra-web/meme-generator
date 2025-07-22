import React from 'react';
import { Link } from 'react-router-dom';
import MemeCard from '../components/MemeCard';
import PageLayout from '../components/PageLayout';
import { trendingMemes } from '../data/memes';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/axiosInstance';
import { generateImageSource } from '../utils';
import Testimonials from '../components/Testimonials';
import TrendingMemes from '../components/TrendingMemes';
import FeaturesSection from '../components/FeaturesSection';

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
        <TrendingMemes memes={trendingMemes} />
        <div className="flex justify-center mt-4 mb-12">
          <Link
            to="/memes"
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-8 rounded-full shadow transition text-lg"
          >
            View More
          </Link>
        </div>
        {/* Features */}
        <FeaturesSection />
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