import React from 'react';

const features = [
  {
    icon: '🪄',
    title: 'Text-to-Image AI',
    description: 'Generate unique meme images from text prompts using our advanced AI technology.'
  },
  {
    icon: '🔥',
    title: 'Trending Templates',
    description: 'Browse our constantly updating library of popular meme templates to get started quickly.'
  },
  {
    icon: '⚡',
    title: 'Instant Sharing',
    description: 'Share your memes directly to social media platforms with a single click.'
  }
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="mb-12 py-12 bg-gradient-to-br from-yellow-50 via-pink-50 to-blue-50 rounded-2xl shadow-inner">
      <div className="max-w-5xl mx-auto px-4">
        <h3 className="font-semibold text-yellow-500 mb-2 text-center text-lg tracking-wide uppercase">Features</h3>
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-center text-gray-900">Meme Creation Made Easy</h2>
        <p className="text-gray-600 mb-10 max-w-2xl mx-auto text-center text-lg">Our platform offers a range of powerful features to help you create and share your memes effortlessly.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center text-center border-t-4 border-yellow-400 hover:border-pink-400 group transform hover:-translate-y-2 hover:scale-105 hover:rotate-1 duration-300 ease-in-out"
            >
              <span className="text-5xl mb-4 group-hover:scale-125 group-hover:animate-bounce-smooth transition-transform duration-500 ease-in-out">{feature.icon}</span>
              <span className="font-bold text-xl mb-2 text-gray-800 group-hover:text-pink-500 transition-colors duration-300">{feature.title}</span>
              <span className="text-gray-500 text-base">{feature.description}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 