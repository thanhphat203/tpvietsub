/**
 * @file src/pages/ExplorePage.tsx
 * Advanced Multi-Dimensional Catalog & Filter Hub
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterBar } from '../components/FilterBar';
import { MovieCard } from '../components/MovieCard';
import { Movie, FilterOptions } from '../types';
import { getAllMovies, initializeMovies } from '../../lib/movies';
import { fetchLatestUpdates } from '../services/api';
import { Compass, Film, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allMovies, setAllMovies] = useState<Movie[]>(getAllMovies());
  const [loading, setLoading] = useState(false);

  // Initialize filters from query params or defaults
  const [filters, setFilters] = useState<FilterOptions>({
    country: searchParams.get('country') || 'all',
    type: (searchParams.get('type') as any) || 'all',
    genre: searchParams.get('genre') || 'all',
    year: searchParams.get('year') || 'all',
    status: (searchParams.get('status') as any) || 'all',
    schedule: searchParams.get('schedule') || 'all',
    sortBy: (searchParams.get('sort') as any) || 'updated',
    page: parseInt(searchParams.get('page') || '1', 10),
  });

  // Listen for storage or api updates
  useEffect(() => {
    const handleUpdate = () => {
      setAllMovies(getAllMovies());
    };
    window.addEventListener('tp_movies_updated', handleUpdate);
    initializeMovies();
    return () => window.removeEventListener('tp_movies_updated', handleUpdate);
  }, []);

  // Update query params when filters change
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    const params: Record<string, string> = {};
    if (newFilters.country && newFilters.country !== 'all') params.country = newFilters.country;
    if (newFilters.type !== 'all') params.type = newFilters.type;
    if (newFilters.genre !== 'all') params.genre = newFilters.genre;
    if (newFilters.year !== 'all') params.year = newFilters.year;
    if (newFilters.status !== 'all') params.status = newFilters.status;
    if (newFilters.schedule !== 'all') params.schedule = newFilters.schedule;
    if (newFilters.sortBy !== 'updated') params.sort = newFilters.sortBy;
    if (newFilters.page > 1) params.page = newFilters.page.toString();
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    handleFilterChange({
      country: 'all',
      type: 'all',
      genre: 'all',
      year: 'all',
      status: 'all',
      schedule: 'all',
      sortBy: 'updated',
      page: 1,
    });
  };

  // Filter & sort logic
  const filteredMovies = useMemo(() => {
    let result = [...allMovies];

    // Filter by Country
    if (filters.country && filters.country !== 'all') {
      const cTarget = filters.country.toLowerCase();
      result = result.filter((m) => m.country && m.country.toLowerCase().includes(cTarget));
    }

    // Filter by type
    if (filters.type === 'series') {
      result = result.filter((m) => m.type !== 'single');
    } else if (filters.type === 'single') {
      result = result.filter(
        (m) =>
          m.type === 'single' ||
          m.genres.some((g) => g.includes('Lẻ') || g.includes('Chiếu Rạp')) ||
          m.duration?.toLowerCase().includes('phút')
      );
    }

    // Filter by genre
    if (filters.genre !== 'all') {
      const gTarget = filters.genre.toLowerCase();
      result = result.filter((m) =>
        m.genres.some((g) => g.toLowerCase().includes(gTarget) || gTarget.includes(g.toLowerCase()))
      );
    }

    // Filter by year
    if (filters.year !== 'all') {
      const yTarget = parseInt(filters.year, 10);
      result = result.filter((m) => m.year === yTarget);
    }

    // Filter by status
    if (filters.status === 'ongoing') {
      result = result.filter((m) => !m.status?.toLowerCase().includes('hoàn tất') && !m.status?.toLowerCase().includes('full'));
    } else if (filters.status === 'completed') {
      result = result.filter((m) => m.status?.toLowerCase().includes('hoàn tất') || m.status?.toLowerCase().includes('full'));
    }

    // Filter by schedule
    if (filters.schedule !== 'all') {
      const sTarget = filters.schedule.toUpperCase();
      result = result.filter((m) => {
        if (!m.airSchedule) return false;
        const days = m.airSchedule.toUpperCase().split(/[,\s]+/);
        return days.includes(sTarget);
      });
    }

    // Sort
    result.sort((a, b) => {
      if (filters.sortBy === 'year_desc') return b.year - a.year;
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'views') return b.views - a.views;
      if (filters.sortBy === 'title') return a.title.localeCompare(b.title);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return result;
  }, [allMovies, filters]);

  // Pagination (24 items per page)
  const pageSize = 24;
  const totalPages = Math.max(1, Math.ceil(filteredMovies.length / pageSize));
  const currentPage = Math.min(filters.page, totalPages);
  const pagedMovies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMovies.slice(start, start + pageSize);
  }, [filteredMovies, currentPage, pageSize]);

  return (
    <div className="min-h-screen bg-[#0f0f14] text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Title */}
        <div className="bg-[#14141e] p-5 sm:p-6 rounded-2xl border border-[#262638] shadow-xl">
          <div className="border-l-4 border-[#e50914] pl-3.5 py-1">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
              KHÁM PHÁ & LỌC PHIM TOÀN DIỆN
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Kho phim trực tuyến chất lượng cao Full HD / 4K Vietsub + Thuyết Minh
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleReset}
          totalResults={filteredMovies.length}
        />

        {/* Movies Grid */}
        {pagedMovies.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {pagedMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6 border-t border-[#222232]">
                <button
                  type="button"
                  onClick={() => handleFilterChange({ ...filters, page: Math.max(1, currentPage - 1) })}
                  disabled={currentPage <= 1}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                    currentPage > 1
                      ? 'bg-[#1a1a26] text-white hover:bg-[#252538] border-[#2f2f45]'
                      : 'bg-[#12121a] text-gray-600 border-gray-800 cursor-not-allowed opacity-50'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" /> Trang Trước
                </button>

                <div className="flex items-center gap-1.5 font-mono text-xs">
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                    let pageNum = idx + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = currentPage - 2 + idx;
                      if (pageNum > totalPages) pageNum = totalPages - (4 - idx);
                    }
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handleFilterChange({ ...filters, page: pageNum })}
                        className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center border transition-all ${
                          isActive
                            ? 'bg-[#e50914] text-white border-red-500 shadow-lg shadow-red-950/60'
                            : 'bg-[#1a1a26] text-gray-300 border-[#2b2b3e] hover:bg-[#252538] hover:text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => handleFilterChange({ ...filters, page: Math.min(totalPages, currentPage + 1) })}
                  disabled={currentPage >= totalPages}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                    currentPage < totalPages
                      ? 'bg-[#1a1a26] text-white hover:bg-[#252538] border-[#2f2f45]'
                      : 'bg-[#12121a] text-gray-600 border-gray-800 cursor-not-allowed opacity-50'
                  }`}
                >
                  Trang Tiếp <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#14141e] rounded-2xl border border-[#242436] space-y-4">
            <Film className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="text-lg font-bold text-gray-300">
              Không tìm thấy bộ phim nào phù hợp với bộ lọc đã chọn
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Hãy thử chọn thể loại khác, thay đổi năm chiếu hoặc đặt lại toàn bộ tiêu chí lọc.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="inline-block bg-[#e50914] hover:bg-red-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-red-950/60"
            >
              Đặt Lại Bộ Lọc
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
