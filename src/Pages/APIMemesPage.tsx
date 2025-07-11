import React from "react";
import { trending_memes } from "../data/trendingAPI";

const APIMemesPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">API Memes</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {trending_memes.map((meme) => (
          <div key={meme.id} className="bg-white rounded shadow p-2 flex flex-col items-center">
            <img src={meme.url} alt={meme.name} className="w-full h-40 object-contain mb-2 rounded" />
            <span className="text-center font-medium text-sm">{meme.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default APIMemesPage; 