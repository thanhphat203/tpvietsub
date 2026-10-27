/**
 * @file src/components/GenreTag.tsx
 * Clickable genre pill/tag component
 */

import React from 'react';
import { Link } from 'react-router-dom';

interface GenreTagProps {
  genre: string;
  count?: number;
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const GenreTag: React.FC<GenreTagProps> = ({
  genre,
  count,
  active = false,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-4 py-1.5',
  };

  return (
    <Link
      to={`/the-loai/${encodeURIComponent(genre)}`}
      className={`inline-flex items-center gap-1.5 rounded-full font-bold transition-all duration-150 border btn-3d ${sizeClasses[size]} ${
        active
          ? 'bg-[#e50914] text-white border-[#e50914] shadow-md shadow-red-900/50 scale-105'
          : 'bg-[#181826] text-gray-300 border-[#28283c] hover:bg-[#e50914] hover:text-white hover:border-[#e50914]'
      }`}
    >
      <span>{genre}</span>
      {count !== undefined && (
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            active ? 'bg-black/30 text-white' : 'bg-[#2a2a38] text-gray-400'
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  );
};
