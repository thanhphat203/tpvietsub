/**
 * @file src/components/MovieCard.tsx
 * 3D Tactile Movie Card with Zero Layout Shift (CLS = 0) and Uniform Grid Alignment
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Play, Bookmark, Clock } from 'lucide-react';
import { Movie } from '../types';
import { isBookmarked, toggleBookmark } from '../services/storage';
import { getHdImageUrl } from '../services/api';

interface MovieCardProps {
  movie: Movie;
  aspectRatio?: 'poster' | 'wide';
}

export const MovieCard = React.memo<MovieCardProps>(({ movie }) => {
  const [bookmarked, setBookmarked] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const syncBookmark = () => setBookmarked(isBookmarked(movie.slug));
    syncBookmark();
    window.addEventListener('tp_storage_updated', syncBookmark);
    return () => window.removeEventListener('tp_storage_updated', syncBookmark);
  }, [movie.slug]);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = toggleBookmark(movie);
    setBookmarked(updated);
  };

  return (
    <div className="group relative flex flex-col h-full bg-[#14141f] rounded-2xl overflow-hidden border border-[#252538] card-3d select-none">
      
      {/* Poster Media Box with Strict 2/3 Aspect Ratio */}
      <Link
        to={`/phim/${movie.slug}`}
        className="block relative aspect-[2/3] w-full overflow-hidden bg-[#0d0d15]"
      >
        {/* Shimmer Placeholder behind image */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-[#171726] animate-pulse flex items-center justify-center">
            <span className="text-[10px] font-mono text-gray-600 uppercase">TP VietSub</span>
          </div>
        )}

        {/* Poster Image */}
        <img
          src={getHdImageUrl(movie.poster)}
          alt={movie.title}
          loading="lazy"
          width={300} height={450}
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-108 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src =
              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80';
            setImgLoaded(true);
          }}
        />

        {/* Dynamic Dark Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#14141f] via-transparent to-black/50 opacity-90 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none" />

        {/* Top Badges (3D Elevated) */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
          <div className="flex flex-wrap gap-1">
            {movie.isHot && (
              <span className="bg-gradient-to-r from-red-600 to-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-lg uppercase tracking-wider">
                HOT
              </span>
            )}
            {movie.isNew && (
              <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-lg uppercase tracking-wider">
                MỚI
              </span>
            )}
            {movie.airSchedule && (
              <span className="bg-sky-950/85 text-sky-300 border border-sky-700/60 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-md">
                <Clock className="w-2.5 h-2.5" />
                {movie.airSchedule}
              </span>
            )}
          </div>

          {/* 3D Bookmark Button */}

        </div>

        {/* Bottom Status & Rating Badges */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
          <span className="bg-black/85 backdrop-blur-md text-amber-300 font-mono text-[10px] font-extrabold px-2 py-0.5 rounded border border-amber-500/30 shadow-lg truncate max-w-[70%]">
            {movie.status || movie.episodeInfo}
          </span>

          <span className="bg-black/85 backdrop-blur-md text-gray-200 font-extrabold text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-white/10 shadow-lg">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            {movie.rating > 0 ? movie.rating.toFixed(1) : '—'}
          </span>
        </div>

        {/* 3D Floating Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[1px] pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-xl shadow-red-600/60 transform group-hover:scale-115 transition-transform duration-300 border border-red-400/50">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      </Link>
          <button
            type="button"
            onClick={handleBookmarkClick}
            className={`absolute top-2 right-2 z-30 p-2.5 rounded-xl pointer-events-auto backdrop-blur-md transition-all duration-200 btn-3d ${
              bookmarked
                ? 'bg-red-600 text-white shadow-lg shadow-red-950 scale-105'
                : 'bg-black/60 text-gray-300 hover:text-white hover:bg-black/90 border border-white/10'
            }`}
            aria-label={bookmarked ? `Bỏ lưu ${movie.title}` : `Lưu ${movie.title}`}
            title={bookmarked ? 'Bỏ lưu yêu thích' : 'Lưu vào tủ phim'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
          </button>

      {/* Structured Info Box with Fixed Heights to Eliminate Any Layout Shifts */}
      <div className="p-3 flex flex-col justify-between flex-grow bg-[#14141f] border-t border-[#222234]">
        <div className="space-y-0.5">
          <Link
            to={`/phim/${movie.slug}`}
            tabIndex={-1}
            className="block font-black text-xs sm:text-sm text-gray-100 group-hover:text-red-400 line-clamp-1 transition-colors duration-200 h-5"
            title={movie.title}
          >
            {movie.title}
          </Link>
          
          <p
            className="text-[10px] text-gray-400 font-light italic line-clamp-1 h-4"
            title={movie.titleOriginal || ''}
          >
            {movie.titleOriginal || movie.country || ''}
          </p>
        </div>

        <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 mt-1.5 border-t border-[#222234] h-6">
          <span className="truncate text-gray-400 font-medium max-w-[65%]">
            {movie.genres[0] || 'Đang cập nhật'}
          </span>
          <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/50 px-1.5 py-0.2 rounded font-mono shrink-0">
            {movie.year || '2024'}
          </span>
        </div>
      </div>

    </div>
  );
});
