import React from 'react';
import MemeCard from './MemeCard';
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
}

interface TrendingMemesProps {
  memes: TrendingMeme[];
}

const breakpointColumnsObj = {
  default: 5,
  1280: 4,
  1024: 3,
  640: 2,
};

const TrendingMemes: React.FC<TrendingMemesProps> = ({ memes }) => {
  return (
    <section className="mb-14 px-4 py-10 bg-gradient-to-br from-yellow-50 via-pink-50 to-blue-50 rounded-2xl shadow-inner">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex w-auto gap-6"
        columnClassName="masonry-column flex flex-col gap-6"
      >
        {memes.map((meme) => (
          <div key={meme.id} className="relative mb-4 overflow-hidden rounded-lg">
            <img src={meme.image} alt="Trending meme" className="w-full block object-cover" style={{ display: 'block', width: '100%' }} />
            <div className="absolute left-0 right-0 bottom-0 bg-black/60 text-white text-sm px-3 py-2" style={{ borderBottomLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}>
              {meme.description}
            </div>
          </div>
        ))}
      </Masonry>
    </section>
  );
};

export default TrendingMemes; 