import React from 'react';
import { useParams, Link } from 'react-router-dom';
import UserAvatar from '../components/UserAvatar';
import CommentList from '../components/CommentList';
import PageLayout from '../components/PageLayout';
import { memes } from '../data/memes';

export default function MemeDetailsPage() {
  const { id } = useParams();
  const meme = memes.find(m => m.id === id);

  if (!meme) {
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
          <img src={meme.image} alt="Meme" className="rounded-xl shadow max-w-full max-h-[350px] bg-gray-100" />
        </div>
        {/* Actions */}
        <div className="flex justify-center gap-6 mb-6 text-gray-400 text-2xl">
          <button title="Like" className="hover:text-yellow-400"> 661</button>
          <button title="Favorite" className="hover:text-yellow-400"> 605</button>
          <button title="Comment" className="hover:text-yellow-400"> 4ac</button>
          <button title="Share" className="hover:text-yellow-400"> 934</button>
        </div>
        {/* Author Info */}
        <div className="flex items-center gap-4 mb-4">
          <UserAvatar src={meme.author.avatar} alt={meme.author.name} size={64} />
          <div>
            <div className="font-bold text-lg">{meme.author.name}</div>
            <div className="text-gray-500 text-sm">{meme.author.username}</div>
          </div>
        </div>
        {/* Tags */}
        <div className="text-gray-500 text-xs mb-6 flex flex-wrap gap-1">
          {meme.tags.map((tag, idx) => (
            <span key={idx}>{tag}</span>
          ))}
        </div>
        {/* Description */}
        {meme.description && (
          <div className="mb-6 text-gray-700 text-base">
            {meme.description}
          </div>
        )}
        {/* Share Buttons */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <button className="bg-gray-100 px-4 py-2 rounded-full font-semibold text-gray-700 hover:bg-gray-200">Share on X</button>
          <button className="bg-gray-100 px-4 py-2 rounded-full font-semibold text-gray-700 hover:bg-gray-200">Share on WhatsApp</button>
          <button className="bg-gray-100 px-4 py-2 rounded-full font-semibold text-gray-700 hover:bg-gray-200">Share on Instagram</button>
        </div>
        {/* Comments */}
        <div className="mb-8">
          <h3 className="font-bold mb-4 text-lg">Comments</h3>
          <CommentList comments={meme.comments} />
        </div>
        {/* Remix Button */}
        <div className="flex justify-center">
          <button className="bg-yellow-300 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-full transition">Remix this meme</button>
        </div>
      </PageLayout>
    </div>
  );
} 