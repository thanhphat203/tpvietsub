/**
 * @file src/components/TopMoviesList.tsx
 * Top 10 most viewed movies list component
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Trophy, Sparkles } from 'lucide-react';
import { Movie } from '../types';

interface TopMoviesListProps {
  movies: Movie[];
}

export const TopMoviesList: React.FC<TopMoviesListProps> = ({ movies }) => {
  const top10 = movies.slice(0, 10);

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return 'text-amber-400 font-black text-3xl sm:text-4xl drop-shadow-[0_2px_10px_rgba(245,158,11,0.6)]';
    if (rank === 2) return 'text-slate-300 font-black text-3xl sm:text-4xl drop-shadow-[0_2px_8px_rgba(203,213,225,0.5)]';
    if (rank === 3) return 'text-amber-600 font-black text-3xl sm:text-4xl drop-shadow-[0_2px_8px_rgba(217,119,6,0.5)]';
    return 'text-gray-500 font-extrabold text-2xl sm:text-3xl';
  };

  return (
    <div className="bg-[#14141c] rounded-2xl p-4 sm:p-5 border border-[#262636] shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#262636]">
        <div className="border-l-4 border-amber-500 pl-3 py-0.5">
          <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
            BẢNG XẾP HẠNG TOP 10
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">Đánh giá và lượt xem cao nhất</p>
        </div>
        <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/50 px-2 py-0.5 rounded border border-red-900/40">
          TP VIETSUB
        </span>
      </div>

      {/* List */}
      <div className="space-y-3">
        {top10.map((movie, idx) => {
          const rank = idx + 1;
          return (
            <Link
              key={movie.id}
              to={`/phim/${movie.slug}`}
              className="flex items-center gap-3 p-2 rounded-xl bg-[#1b1b26] hover:bg-[#252536] transition-all duration-200 group border border-transparent hover:border-[#e50914]/40 hover:-translate-x-0.5"
            >
              {/* Rank Number */}
              <div className="w-9 text-center shrink-0 font-mono">
                <span className={getRankBadgeClass(rank)}>
                  {rank < 10 ? `0${rank}` : rank}
                </span>
              </div>

              {/* Poster Thumbnail */}
              <div className="w-12 h-16 shrink-0 rounded-md overflow-hidden bg-gray-800 relative">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Info */}
              <div className="flex-grow min-w-0">
                <h3 className="font-bold text-sm text-gray-100 group-hover:text-[#e50914] truncate transition-colors">
                  {movie.title}
                </h3>
                {movie.titleOriginal && (
                  <p className="text-[11px] text-gray-400 truncate mt-0.5 font-light">
                    {movie.titleOriginal}
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1.5">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {movie.rating.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-gray-300 font-medium bg-[#12121a] px-1.5 py-0.5 rounded border border-white/5 truncate max-w-[100px]">
                    {movie.episodeInfo || movie.genres[0]}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
