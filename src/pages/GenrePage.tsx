/**
 * @file src/pages/GenrePage.tsx
 * Genre filter view showing grid of movies matching selected genre tag
 */

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMoviesByGenre, getAllAvailableGenres } from '../../lib/movies';
import { MovieCard } from '../components/MovieCard';
import { GenreTag } from '../components/GenreTag';
import { Layers, ArrowUpDown, Film } from 'lucide-react';

export const GenrePage: React.FC = () => {
  const { genre } = useParams<{ genre: string }>();
  const [sortBy, setSortBy] = useState<'updated' | 'rating' | 'views'>('updated');

  const decodedGenre = genre ? decodeURIComponent(genre) : 'Tu Tiên';
  const allGenres = getAllAvailableGenres();
  const rawMovies = getMoviesByGenre(decodedGenre);

  // Apply sorting
  const movies = [...rawMovies].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'views') return b.views - a.views;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="min-h-screen bg-[#0f0f14] text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Genre Selector Pills */}
        <div className="bg-[#14141d] p-4 rounded-2xl border border-[#222232]">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
            <Layers className="w-4 h-4 text-[#e50914]" />
            <span>Tất Cả Thể Loại Hoạt Hình Donghua</span>
          </div>
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
            {allGenres.map((g) => (
              <GenreTag key={g} genre={g} active={g.toLowerCase() === decodedGenre.toLowerCase()} size="sm" />
            ))}
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#14141e] p-6 rounded-2xl border border-[#262638]">
          <div>
            <div className="text-xs font-bold text-[#e50914] uppercase tracking-wider mb-1">
              Danh Mục Thể Loại
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              Thế Giới Phim: <span className="text-[#e50914]">{decodedGenre}</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Tìm thấy <strong className="text-white font-mono">{movies.length}</strong> bộ phim thuộc thể loại này.
            </p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400 font-medium">Sắp xếp:</span>
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

        {/* Movies Grid */}
        {movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#14141d] rounded-2xl border border-[#242436] space-y-4">
            <Film className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="text-lg font-bold text-gray-300">
              Chưa có phim nào thuộc thể loại "{decodedGenre}"
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Bạn có thể mở file <code className="bg-black/50 px-2 py-1 rounded text-red-400 font-mono">data/movies.json</code> để thêm phim mới vào thể loại này.
            </p>
            <Link
              to="/"
              className="inline-block bg-[#e50914] text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors"
            >
              Quay về Trang Chủ
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};
