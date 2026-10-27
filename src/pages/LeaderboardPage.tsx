/**
 * @file src/pages/LeaderboardPage.tsx
 * Top Trending & Ranking Leaderboard Page
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Star, Eye, Flame, Play } from 'lucide-react';
import { Movie } from '../types';
import { getAllMovies, initializeMovies } from '../../lib/movies';
import { getHdImageUrl } from '../services/api';

export const LeaderboardPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>(getAllMovies());
  const [tab, setTab] = useState<'views' | 'rating' | 'hot'>('views');

  useEffect(() => {
    const handleUpdate = () => {
      setMovies(getAllMovies());
    };
    window.addEventListener('tp_movies_updated', handleUpdate);
    initializeMovies();
    return () => window.removeEventListener('tp_movies_updated', handleUpdate);
  }, []);

  const sortedMovies = useMemo(() => {
    const list = [...movies];
    if (tab === 'rating') {
      return list.sort((a, b) => b.rating - a.rating);
    }
    if (tab === 'hot') {
      return list.filter((m) => m.isHot || m.views > 700000).sort((a, b) => b.views - a.views);
    }
    return list.sort((a, b) => b.views - a.views);
  }, [movies, tab]);

  return (
    <div className="min-h-screen bg-[#0f0f14] text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14141e] p-6 rounded-2xl border border-[#262638] shadow-xl">
          <div className="border-l-4 border-amber-500 pl-3.5 py-0.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              BẢNG XẾP HẠNG PHIM
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Top những bộ phim được yêu thích và có điểm số, lượt xem cao nhất
            </p>
          </div>

          {/* Ranking Type Tabs */}
          <div className="flex items-center gap-2 bg-[#1b1b28] p-1.5 rounded-xl border border-[#2c2c40]">
            <button
              type="button"
              onClick={() => setTab('views')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                tab === 'views' ? 'bg-[#e50914] text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Lượt Xem Khủng
            </button>
            <button
              type="button"
              onClick={() => setTab('rating')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                tab === 'rating' ? 'bg-[#e50914] text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Đánh Giá Cao
            </button>
            <button
              type="button"
              onClick={() => setTab('hot')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                tab === 'hot' ? 'bg-[#e50914] text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Đang Thịnh Hành
            </button>
          </div>
        </div>

        {/* Ranking List */}
        <div className="space-y-3">
          {sortedMovies.slice(0, 30).map((movie, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;
            const rankColors = [
              'from-amber-400 to-yellow-600 text-black shadow-amber-500/50',
              'from-gray-300 to-gray-500 text-black shadow-gray-400/50',
              'from-amber-700 to-orange-800 text-white shadow-orange-700/50',
            ];

            return (
              <Link
                key={movie.id}
                to={`/phim/${movie.slug}`}
                className="group flex items-center justify-between gap-4 bg-[#14141e] hover:bg-[#1a1a28] p-3 sm:p-4 rounded-2xl border border-[#242436] hover:border-red-500/60 transition-all duration-200 hover:-translate-y-0.5 shadow-lg"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-grow min-w-0">
                  {/* Rank Badge */}
                  <div
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl font-black text-sm sm:text-base flex items-center justify-center shrink-0 shadow-md ${
                      isTop3
                        ? `bg-gradient-to-br ${rankColors[rank - 1]}`
                        : 'bg-[#1e1e2d] text-gray-400 border border-[#2e2e42]'
                    }`}
                  >
                    #{rank}
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-12 h-16 sm:w-16 sm:h-22 rounded-xl overflow-hidden shrink-0 bg-black">
                    <img
                      src={getHdImageUrl(movie.poster)}
                      alt={movie.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-grow space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold bg-red-950/80 text-red-400 border border-red-800/60 px-1.5 py-0.2 rounded">
                        {movie.status || movie.episodeInfo}
                      </span>
                      {movie.airSchedule && (
                        <span className="text-[10px] font-mono bg-sky-950/80 text-sky-400 border border-sky-800/60 px-1.5 py-0.2 rounded">
                          {movie.airSchedule}
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-red-400 truncate">
                      {movie.title}
                    </h3>
                    <p className="text-xs text-gray-400 truncate hidden sm:block">
                      {movie.genres.join(' • ')}
                    </p>
                  </div>
                </div>

                {/* Right Meta Stats */}
                <div className="flex items-center gap-4 sm:gap-8 shrink-0 text-right">
                  <div className="space-y-0.5">
                    <div className="text-xs font-mono font-extrabold text-amber-400 flex items-center justify-end gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {movie.rating.toFixed(1)}
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono flex items-center justify-end gap-1">
                      <Eye className="w-3 h-3" />
                      {movie.views.toLocaleString()}
                    </div>
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-red-600/20 group-hover:bg-[#e50914] text-red-400 group-hover:text-white flex items-center justify-center transition-colors">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
};
