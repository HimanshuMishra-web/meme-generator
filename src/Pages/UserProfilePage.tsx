import React, { useState } from 'react';
import UserAvatar from '../components/UserAvatar';
import Tabs from '../components/Tabs';
import MemeCard from '../components/MemeCard';
import PageLayout from '../components/PageLayout';
import { mockUser, mockMemes } from '../data/users';

const tabs = ['Created', 'Liked', 'Saved'];

const UserProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Created');

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-8">
      <PageLayout className="flex flex-col items-center">
        {/* Profile Section */}
        <div className="flex flex-col items-center mb-6">
          <UserAvatar src={mockUser.avatar} alt="Profile" size={128} className="mb-4" />
          <h2 className="text-2xl font-bold mb-1">{mockUser.name}</h2>
          <p className="text-gray-600 mb-1 text-center">{mockUser.bio}</p>
          <p className="text-gray-400 text-sm mb-3">Joined {mockUser.joined}</p>
          <button className="bg-gray-100 px-6 py-2 rounded font-semibold text-gray-700 hover:bg-gray-200 transition">Edit Profile</button>
        </div>
        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6 border-b w-full max-w-4xl justify-center" />
        {/* Meme Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl mb-10">
          {mockMemes.map((meme) => (
            <MemeCard key={meme.id} src={meme.url} title={meme.title} />
          ))}
        </div>
        {/* Stats */}
        <div className="flex space-x-8 w-full max-w-2xl justify-center">
          <div className="bg-white rounded-lg shadow p-6 flex-1 flex flex-col items-center">
            <span className="text-2xl font-bold">{mockUser.totalMemes}</span>
            <span className="text-gray-500 text-sm mt-1">Total memes</span>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex-1 flex flex-col items-center">
            <span className="text-2xl font-bold">{mockUser.likesReceived}</span>
            <span className="text-gray-500 text-sm mt-1">Likes received</span>
          </div>
        </div>
      </PageLayout>
    </div>
  );
};

export default UserProfilePage; 