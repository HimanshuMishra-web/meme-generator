import React from 'react';

interface MemeCardProps {
  src: string;
  alt?: string;
  title?: string;
  onClick?: () => void;
  className?: string;
}

const MemeCard: React.FC<MemeCardProps> = ({ src, alt, title, onClick, className }) => (
  <div
    className={`bg-gray-100 rounded-lg p-4 flex flex-col items-center shadow hover:scale-105 transition-transform cursor-pointer ${className || ''}`}
    onClick={onClick}
    tabIndex={0}
    role={onClick ? 'button' : undefined}
  >
    <img src={src} alt={alt || title || 'Meme'} className="object-cover rounded-md w-full h-full max-w-xs max-h-48" />
    {title && <p className="text-center text-gray-700 text-sm mt-2">{title}</p>}
  </div>
);

export default MemeCard; 