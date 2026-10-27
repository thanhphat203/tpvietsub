/**
 * @file src/pages/GenrePage.tsx
 * Genre filter view showing grid of movies matching selected genre tag
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMoviesByGenre, getAllAvailableGenres, initializeMovies } from '../../lib/movies';
import { MovieCard } from '../components/MovieCard';
import { GenreTag } from '../components/GenreTag';
import { Layers, ArrowUpDown, Film, Filter } from 'lucide-react';
import { Movie } from '../types';

export const GenrePage: React.FC = () => {
  const { genre } = useParams<{ genre: string }>();
  const decodedGenre = genre ? decodeURIComponent(genre) : 'Tu Tiên';

  const [movies, setMovies] = useState<Movie[]>(getMoviesByGenre(decodedGenre));
  const [selectedType, setSelectedType] = useState<'all' | 'series' | 'single'>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'rating' | 'views'>('updated');

  const allGenres = getAllAvailableGenres();

  useEffect(() => {
    const handleUpdate = () => {
      setMovies(getMoviesByGenre(decodedGenre));
    };
    window.addEventListener('tp_movies_updated', handleUpdate);
    initializeMovies();
    return () => window.removeEventListener('tp_movies_updated', handleUpdate);
  }, [decodedGenre]);

  const filteredMovies = useMemo(() => {
    let result = getMoviesByGenre(decodedGenre);

    if (selectedType === 'series') {
      result = result.filter((m) => m.type !== 'single');
    } else if (selectedType === 'single') {
      result = result.filter(
        (m) =>
          m.type === 'single' ||
          m.genres.some((g) => g.includes('Lẻ') || g.includes('Chiếu Rạp')) ||
          m.duration?.toLowerCase().includes('phút')
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
  }, [decodedGenre, selectedType, selectedYear, sortBy, movies]);

  const years = ['all', '2026', '2025', '2024', '2023', '2022'];

  return (
    <div className="min-h-screen bg-[#0f0f14] text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Genre Selector Pills */}
        <div className="bg-[#14141d] p-4 rounded-2xl border border-[#222232] shadow-lg">
          <div className="border-l-4 border-[#e50914] pl-3 py-0.5 mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-white">
              TẤT CẢ THỂ LOẠI HOẠT HÌNH
            </span>
          </div>
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
            {allGenres.map((g) => (
              <GenreTag key={g} genre={g} active={g.toLowerCase() === decodedGenre.toLowerCase()} size="sm" />
            ))}
          </div>
        </div>

        {/* Page Header with Sub-filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#14141e] p-6 rounded-2xl border border-[#262638] shadow-xl">
          <div className="border-l-4 border-[#e50914] pl-3.5 py-0.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              THỂ LOẠI: <span className="text-[#e50914]">{decodedGenre}</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Tìm thấy <strong className="text-white font-mono">{filteredMovies.length}</strong> bộ phim thuộc thể loại này
            </p>
          </div>

          {/* Sub Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Type */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="bg-[#1b1b28] text-gray-200 text-xs font-bold px-3 py-2 rounded-xl border border-[#2e2e42] focus:outline-none"
            >
              <option value="all">Phim Bộ & Lẻ</option>
              <option value="series">Phim Bộ</option>
              <option value="single">Phim Lẻ</option>
            </select>

            {/* Year */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-[#1b1b28] text-gray-200 text-xs font-bold px-3 py-2 rounded-xl border border-[#2e2e42] focus:outline-none"
            >
              <option value="all">Mọi năm</option>
              {years.filter((y) => y !== 'all').map((y) => (
                <option key={y} value={y}>Năm {y}</option>
              ))}
            </select>

            {/* Sort */}
            <div className="flex items-center gap-1.5 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#1b1b28] text-gray-200 text-xs font-bold px-3 py-2 rounded-xl border border-[#2e2e42] focus:outline-none focus:border-[#e50914]"
              >
                <option value="updated">Mới cập nhật</option>
                <option value="rating">Đánh giá cao nhất</option>
                <option value="views">Xem nhiều nhất</option>
              </select>
            </div>
          </div>
        </div>

        {/* Movies Grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#14141d] rounded-2xl border border-[#242436] space-y-4">
            <Film className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="text-lg font-bold text-gray-300">
              Chưa có phim nào thuộc thể loại "{decodedGenre}" phù hợp với tiêu chí lọc
            </h3>
            <Link
              to="/"
              className="inline-block bg-[#e50914] text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-950/60"
            >
              Quay về Trang Chủ
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};
