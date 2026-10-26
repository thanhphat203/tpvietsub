/**
 * @file src/components/MovieCard.tsx
 * Cinema-Grade Card Component with Schedule Badges, Quick Bookmark, and Hover Glow
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Play, Bookmark, Clock, Calendar } from 'lucide-react';
import { Movie } from '../types';
import { isBookmarked, toggleBookmark } from '../services/storage';

interface MovieCardProps {
  movie: Movie;
  aspectRatio?: 'poster' | 'wide';
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (movie.slug) {
      setBookmarked(isBookmarked(movie.slug));
    }
  }, [movie.slug]);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = toggleBookmark(movie);
    setBookmarked(updated);
  };

  return (
    <div className="group relative flex flex-col h-full bg-[#151520] rounded-xl overflow-hidden border border-[#262638] hover:border-[#e50914]/80 transition-all duration-300 hover:shadow-2xl hover:shadow-red-950/50 hover:-translate-y-1.5">
      <Link to={`/phim/${movie.slug}`} className="block relative aspect-[2/3] overflow-hidden bg-[#0d0d14]">
        {/* Poster Image */}
        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Ambient Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#151520] via-transparent to-black/40 opacity-90 group-hover:opacity-40 transition-opacity duration-300" />

        {/* Top Badges Row */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
          <div className="flex flex-wrap gap-1">
            {movie.isHot && (
              <span className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-md uppercase tracking-wider">
                HOT
              </span>
            )}
            {movie.isNew && (
              <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-md uppercase tracking-wider">
                MỚI
              </span>
            )}
            {movie.airSchedule && (
              <span className="bg-sky-950/80 backdrop-blur-md text-sky-300 border border-sky-800/60 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {movie.airSchedule}
              </span>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleBookmarkClick}
            className={`p-1.5 rounded-lg backdrop-blur-md transition-all shadow-md ${
              bookmarked
                ? 'bg-red-600 text-white scale-110 shadow-red-950'
                : 'bg-black/60 text-gray-300 hover:text-white hover:bg-black/90'
            }`}
            title={bookmarked ? 'Bỏ lưu yêu thích' : 'Lưu vào danh sách xem sau'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Status / Episode Info Badge */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-none">
          <span className="bg-black/85 backdrop-blur-md text-amber-300 font-mono text-[10px] font-extrabold px-2 py-0.5 rounded border border-amber-500/30 shadow-md">
            {movie.status || movie.episodeInfo}
          </span>

          <span className="bg-black/75 backdrop-blur-md text-gray-200 font-extrabold text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-white/10">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            {movie.rating.toFixed(1)}
          </span>
        </div>

        {/* Play Button Overlay on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[1.5px]">
          <div className="w-12 h-12 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-lg shadow-red-600/60 transform group-hover:scale-110 transition-transform duration-300 border border-red-400/40">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      </Link>

      {/* Info Content Section */}
      <div className="p-3 flex flex-col flex-grow justify-between bg-[#151520]">
        <div>
          <Link
            to={`/phim/${movie.slug}`}
            className="font-extrabold text-xs sm:text-sm text-gray-100 hover:text-[#e50914] line-clamp-1 transition-colors duration-200"
            title={movie.title}
          >
            {movie.title}
          </Link>
          {movie.titleOriginal && (
            <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5 font-light italic">
              {movie.titleOriginal}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2.5 pt-2 border-t border-[#252536]">
          <span className="truncate text-gray-400 font-medium">
            {movie.genres[0] || 'Hoạt Hình'}
          </span>
          <span className="text-[9px] text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-900/40 px-1.5 py-0.5 rounded font-mono">
            {movie.year || '2024'}
          </span>
        </div>
      </div>
    </div>
  );
};
