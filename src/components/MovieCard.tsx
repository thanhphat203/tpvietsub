/**
 * @file src/components/MovieCard.tsx
 * Card component for individual Donghua movie
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Play, Sparkles } from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  aspectRatio?: 'poster' | 'wide';
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <div className="group relative flex flex-col h-full bg-[#16161e] rounded-xl overflow-hidden border border-[#252533] hover:border-[#e50914]/70 transition-all duration-300 hover:shadow-2xl hover:shadow-red-950/40 hover:-translate-y-1">
      <Link to={`/phim/${movie.slug}`} className="block relative aspect-[2/3] overflow-hidden bg-[#111118]">
        {/* Poster Image */}
        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#16161e] via-transparent to-black/30 opacity-80 group-hover:opacity-40 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
          <div className="flex gap-1">
            {movie.isHot && (
              <span className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-md uppercase tracking-wider animate-pulse">
                HOT
              </span>
            )}
            {movie.isNew && (
              <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-md uppercase tracking-wider">
                MỚI
              </span>
            )}
          </div>

          <span className="bg-black/75 backdrop-blur-md text-amber-400 font-extrabold text-[11px] px-2 py-0.5 rounded flex items-center gap-1 border border-amber-500/30">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {movie.rating.toFixed(1)}
          </span>
        </div>

        {/* Episode Info Badge */}
        <div className="absolute bottom-2 left-2 z-10">
          <span className="bg-black/85 backdrop-blur-md text-gray-200 text-xs font-semibold px-2.5 py-1 rounded-md border border-white/10 shadow-lg">
            {movie.episodeInfo || movie.status}
          </span>
        </div>

        {/* Play Button Overlay on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[2px]">
          <div className="w-12 h-12 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-lg shadow-red-600/60 transform group-hover:scale-110 transition-transform duration-300 border border-red-400/30">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
        </div>
      </Link>

      {/* Info Content */}
      <div className="p-3 flex flex-col flex-grow justify-between bg-[#16161e]">
        <div>
          <Link
            to={`/phim/${movie.slug}`}
            className="font-bold text-sm text-gray-100 hover:text-[#e50914] line-clamp-1 transition-colors duration-200"
            title={movie.title}
          >
            {movie.title}
          </Link>
          {movie.titleOriginal && (
            <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5 font-light">
              {movie.titleOriginal}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2.5 pt-2 border-t border-[#252533]">
          <span className="truncate text-gray-400 font-medium">
            {movie.genres[0] || 'Donghua'}
          </span>
          <span className="text-[10px] text-red-400 font-semibold bg-red-950/40 border border-red-900/40 px-1.5 py-0.5 rounded">
            Vietsub
          </span>
        </div>
      </div>
    </div>
  );
};
