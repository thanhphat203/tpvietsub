/**
 * @file src/pages/SeriesPage.tsx
 * Dedicated Phim Bộ (Series / Multi-episode) Donghua page
 */

import React, { useState, useEffect, useMemo } from 'react';
import { MovieCard } from '../components/MovieCard';
import { Movie } from '../types';
import { getSeriesMovies, initializeMovies } from '../../lib/movies';
import { Film, ArrowUpDown, Layers, Calendar, Sparkles } from 'lucide-react';

export const SeriesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>(getSeriesMovies());
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'rating' | 'views'>('updated');

  useEffect(() => {
    const handleUpdate = () => {
      setMovies(getSeriesMovies());
    };
    window.addEventListener('tp_movies_updated', handleUpdate);
    initializeMovies();
    return () => window.removeEventListener('tp_movies_updated', handleUpdate);
  }, []);

  const filteredMovies = useMemo(() => {
    let result = [...movies];
    if (selectedGenre !== 'all') {
      result = result.filter((m) =>
        m.genres.some((g) => g.toLowerCase().includes(selectedGenre.toLowerCase()))
      );
    }
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
  }, [movies, selectedGenre, selectedYear, sortBy]);

  const genres = ['all', 'Tu Tiên', 'Luyện Cấp', 'Trùng Sinh', 'Huyền Huyễn', 'Võ Hiệp', 'Hệ Thống', 'Hiện Đại'];
  const years = ['all', '2026', '2025', '2024', '2023', '2022'];

  return (
    <div className="min-h-screen bg-[#0f0f14] text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14141e] p-6 rounded-2xl border border-[#262638] shadow-xl">
          <div className="border-l-4 border-[#e50914] pl-3.5 py-0.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              PHIM BỘ DONGHUA (SERIES)
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Tuyển tập các siêu phẩm hoạt hình nhiều tập có cốt truyện đỉnh cao, cập nhật liên tục
            </p>
          </div>

          <div className="text-xs font-mono text-gray-400 bg-black/40 px-3.5 py-2 rounded-xl border border-white/5">
            Tổng cộng: <strong className="text-emerald-400 font-bold">{filteredMovies.length}</strong> bộ phim
          </div>
        </div>

        {/* Quick Filters */}
        <div className="bg-[#14141e] p-4 rounded-2xl border border-[#262638] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Genre Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">
                Thể loại:
              </span>
              {genres.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGenre(g)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                    selectedGenre === g
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-[#1b1b28] text-gray-300 border-[#28283a] hover:text-white'
                  }`}
                >
                  {g === 'all' ? 'Tất cả' : g}
                </button>
              ))}
            </div>

            {/* Sort & Year dropdowns */}
            <div className="flex items-center gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-[#1b1b28] text-gray-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-[#2e2e42] focus:outline-none"
              >
                <option value="all">Mọi năm</option>
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
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

      </div>
    </div>
  );
};
