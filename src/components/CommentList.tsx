import React from 'react';
import UserAvatar from './UserAvatar';

export interface Comment {
  id: number | string;
  author: { name: string; avatar: string };
  text: string;
}

interface CommentListProps {
  comments: Comment[];
  className?: string;
}

const CommentList: React.FC<CommentListProps> = ({ comments, className }) => (
  <div className={`space-y-4 ${className || ''}`}>
    {comments.map(comment => (
      <div key={comment.id} className="flex items-start gap-3">
        <UserAvatar src={comment.author.avatar} alt={comment.author.name} size={40} />
        <div>
          <div className="font-semibold">{comment.author.name}</div>
          <div className="text-gray-700 text-sm">{comment.text}</div>
        </div>
      </div>
    ))}
  </div>
);

export default CommentList; 