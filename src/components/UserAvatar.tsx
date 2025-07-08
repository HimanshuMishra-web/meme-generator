import React from 'react';

interface UserAvatarProps {
  src: string;
  alt?: string;
  size?: number; // px
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ src, alt, size = 32, className }) => (
  <img
    src={src}
    alt={alt || 'User Avatar'}
    className={`rounded-full border object-cover ${className || ''}`}
    style={{ width: size, height: size }}
  />
);

export default UserAvatar; 