/**
 * @file src/pages/SingleMoviesPage.tsx
 * Dedicated Phim Lẻ / Chiếu Rạp Donghua page
 */

import React, { useState, useEffect, useMemo } from 'react';
import { MovieCard } from '../components/MovieCard';
import { Movie } from '../types';
import { getSingleMovies, initializeMovies } from '../../lib/movies';
import { Film, ArrowUpDown, Sparkles } from 'lucide-react';

export const SingleMoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>(getSingleMovies());
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'rating' | 'views'>('updated');

  useEffect(() => {
    const handleUpdate = () => {
      setMovies(getSingleMovies());
    };
    window.addEventListener('tp_movies_updated', handleUpdate);
    initializeMovies();
    return () => window.removeEventListener('tp_movies_updated', handleUpdate);
  }, []);

  const filteredMovies = useMemo(() => {
    let result = [...movies];
    if (selectedYear !== 'all') {
      const y = parseInt(selectedYear, 10);
      result = result.filter((m) => m.year === y);
    }
    result.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'views') return b.views - a.views;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    return result;
  }, [movies, selectedYear, sortBy]);

  const years = ['all', '2026', '2025', '2024', '2023', '2022'];

  return (
    <div className="min-h-screen bg-[#0f0f14] text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14141e] p-6 rounded-2xl border border-[#262638] shadow-xl">
          <div>
            <div className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Film className="w-4 h-4" /> Bản Chiếu Rạp & Tập Đặc Biệt (Movie / OVA)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              PHIM LẺ DONGHUA & CHIẾU RẠP
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Các bộ phim hoạt hình ngắn tập, movie điện ảnh chiếu rạp chất lượng cao Full HD / 4K
            </p>
          </div>

          <div className="text-xs font-mono text-gray-400 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
            Tổng cộng: <strong className="text-amber-400 font-bold">{filteredMovies.length}</strong> bộ phim
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-3 bg-[#14141e] p-4 rounded-2xl border border-[#262638]">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Lọc theo năm chiếu:
          </span>
          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-[#1b1b28] text-gray-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-[#2e2e42] focus:outline-none"
            >
              <option value="all">Tất cả các năm</option>
              {years.filter((y) => y !== 'all').map((y) => (
                <option key={y} value={y}>Năm {y}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#1b1b28] text-gray-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-[#2e2e42] focus:outline-none"
            >
              <option value="updated">Mới cập nhật</option>
              <option value="rating">Đánh giá cao</option>
              <option value="views">Lượt xem nhiều</option>
            </select>
          </div>
        </div>

        {/* Movie Grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#14141e] rounded-2xl border border-[#242436] space-y-3">
            <Film className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-gray-300 font-bold">Chưa có phim lẻ phù hợp với bộ lọc</p>
          </div>
        )}

      </div>
    </div>
  );
};
