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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section - Completely Redesigned */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Floating Elements for Visual Interest */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-pink-400/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-blue-400/30 rounded-full blur-xl animate-pulse delay-500"></div>
        
        <div className="relative z-10 container mx-auto px-4 pt-20 pb-32">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Column - Hero Content */}
              <div className="text-center lg:text-left space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 text-white text-sm font-medium">
                    🚀 AI-Powered Meme Generation
                  </div>
                  <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight">
                    Create
                    <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                      Epic Memes
                    </span>
                    <span className="block text-4xl lg:text-5xl">in Seconds</span>
                  </h1>
                  <p className="text-xl text-white/90 max-w-xl leading-relaxed">
                    Unleash your creativity with our AI-powered meme generator. From viral templates to custom creations, become the meme lord you were born to be! 🔥
                  </p>
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link 
                    to="/create" 
                    className="group bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-lg flex items-center justify-center gap-2"
                  >
                    <span>🎨</span>
                    Start Creating
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link
                    to="/memes"
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-2xl border border-white/30 hover:border-white/50 transition-all duration-300 text-lg flex items-center justify-center gap-2"
                  >
                    <span>🔥</span>
                    Explore Memes
                  </Link>
                </div>
                
                {/* Stats */}
                <div className="flex flex-wrap gap-8 justify-center lg:justify-start pt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">10K+</div>
                    <div className="text-white/70 text-sm">Memes Created</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">500+</div>
                    <div className="text-white/70 text-sm">Templates</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">5K+</div>
                    <div className="text-white/70 text-sm">Happy Users</div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Visual Preview */}
              <div className="relative">
                <div className="relative z-10">
                  {/* Floating Meme Preview Cards */}
                  <div className="relative w-full max-w-lg mx-auto">
                    {/* Top Row */}
                    <div className="flex justify-center gap-4 items-start mb-6">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 transform hover:scale-105 transition-all duration-300 rotate-3 hover:rotate-0 w-40">
                        <div className="aspect-square bg-gradient-to-br from-yellow-200 to-orange-200 rounded-lg flex items-center justify-center text-3xl">
                          😂
                        </div>
                        <div className="text-white text-sm mt-3 text-center font-medium">Viral Template</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 transform hover:scale-105 transition-all duration-300 -rotate-2 hover:rotate-0 w-40 mt-8">
                        <div className="aspect-square bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg flex items-center justify-center text-3xl">
                          🚀
                        </div>
                        <div className="text-white text-sm mt-3 text-center font-medium">AI Generated</div>
                      </div>
                    </div>
                    
                    {/* Bottom Row */}
                    <div className="flex justify-center gap-4 items-start">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 transform hover:scale-105 transition-all duration-300 -rotate-3 hover:rotate-0 w-40 mt-2">
                        <div className="aspect-square bg-gradient-to-br from-blue-200 to-cyan-200 rounded-lg flex items-center justify-center text-3xl">
                          🎭
                        </div>
                        <div className="text-white text-sm mt-3 text-center font-medium">Custom Text</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 transform hover:scale-105 transition-all duration-300 rotate-2 hover:rotate-0 w-40">
                        <div className="aspect-square bg-gradient-to-br from-green-200 to-emerald-200 rounded-lg flex items-center justify-center text-3xl">
                          🎨
                        </div>
                        <div className="text-white text-sm mt-3 text-center font-medium">Pro Tools</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-pink-400/20 blur-3xl"></div>
              </div>
            </div>
          </div>
        </div>

      </section>

      <PageLayout>
        {/* Quick Action Cards */}
        <section className="py-20 relative z-10">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Link to="/create" className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl p-6 border border-gray-100 hover:border-yellow-200 transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎨</div>
              <h3 className="font-bold text-xl mb-2 text-gray-800">Create Meme</h3>
              <p className="text-gray-600">Start from scratch with our intuitive meme maker</p>
            </Link>
            <Link to="/memes" className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl p-6 border border-gray-100 hover:border-pink-200 transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🔥</div>
              <h3 className="font-bold text-xl mb-2 text-gray-800">Browse Templates</h3>
              <p className="text-gray-600">Explore thousands of trending meme templates</p>
            </Link>
            <Link to="/api-memes" className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl p-6 border border-gray-100 hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🤖</div>
              <h3 className="font-bold text-xl mb-2 text-gray-800">AI Memes</h3>
              <p className="text-gray-600">Let AI generate hilarious memes for you</p>
            </Link>
          </div>
        </section>

        {/* Trending Memes with Enhanced Design */}
        <section className="py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full text-purple-600 font-medium mb-4">
              🔥 Trending Now
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Hot <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Memes</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Check out what's going viral in our community right now
            </p>
          </div>
          <TrendingMemes memes={trendingMemes} />
          <div className="flex justify-center mt-8">
            <Link
              to="/memes"
              className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg flex items-center gap-2 transform hover:-translate-y-1"
            >
              View All Memes
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </section>

        {/* Features Section (Keeping as requested) */}
        <FeaturesSection />

        {/* Enhanced Testimonials Section */}
        <section className="py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full text-orange-600 font-medium mb-4">
              💬 Community Love
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              What Our <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Meme Lords</span> Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of creators who are already having a blast making memes
            </p>
          </div>
          <Testimonials testimonials={testimonials} />
        </section>

        {/* Call to Action Section */}
        <section className="py-24">
          <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Ready to Go <span className="text-yellow-300">Viral</span>?
              </h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                Join our community of meme creators and start making content that gets shared across the internet!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/signup" 
                  className="bg-white text-purple-600 font-bold py-4 px-8 rounded-2xl hover:bg-gray-100 transition-all duration-300 text-lg shadow-xl transform hover:-translate-y-1"
                >
                  Sign Up Free
                </Link>
                <Link 
                  to="/create" 
                  className="bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-2xl hover:bg-white hover:text-purple-600 transition-all duration-300 text-lg"
                >
                  Try Now
                </Link>
              </div>
            </div>
          </div>
        </section>
      </PageLayout>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white text-xl mb-4">MemeForge</h3>
              <p className="text-gray-400">The ultimate destination for meme creation and sharing.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Create</h4>
              <ul className="space-y-2">
                <li><Link to="/create" className="hover:text-white transition-colors">Meme Generator</Link></li>
                <li><Link to="/memes" className="hover:text-white transition-colors">Templates</Link></li>
                <li><Link to="/api-memes" className="hover:text-white transition-colors">AI Memes</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Community</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Trending</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Popular</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Featured</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} MemeForge. All rights reserved. Made with ❤️ for meme lovers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 