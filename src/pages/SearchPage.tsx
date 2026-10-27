/**
 * @file src/pages/SearchPage.tsx
 * Real-Time API Search Page with Pagination & Instant Keyword Suggestions
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMoviesApi } from '../services/api';
import { MovieCard } from '../components/MovieCard';
import { GenreTag } from '../components/GenreTag';
import { Movie, ALL_GENRES } from '../types';
import { Search, Film, X, Layers, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [query, setQuery] = useState(queryParam);
  const [page, setPage] = useState(pageParam);
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync state when URL params change
  useEffect(() => {
    setQuery(queryParam);
    setPage(pageParam);
  }, [queryParam, pageParam]);

  // Execute Search via API
  useEffect(() => {
    let isMounted = true;
    if (query.trim()) {
      setLoading(true);
      searchMoviesApi(query.trim(), page)
        .then((data) => {
          if (isMounted) {
            setResults(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error('Search error', err);
          if (isMounted) setLoading(false);
        });
    } else {
      setResults([]);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [query, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setPage(1);
      setSearchParams({ q: query.trim(), page: '1' });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSearchParams({ q: query.trim(), page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0f0f14] text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Search Header Container */}
        <div className="bg-[#14141e] p-6 rounded-2xl border border-[#262638] space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="border-l-4 border-[#e50914] pl-3.5 py-0.5">
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                TÌM KIẾM PHIM TOÀN HỆ THỐNG
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Tìm kiếm đa nguồn theo tên phim, tên gốc, thể loại hoặc nhân vật
              </p>
            </div>

            {/* Search Input Box */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nhập tên phim cần tìm (vd: Tiên Nghịch)..."
                className="w-full bg-[#1b1b28] text-white text-sm rounded-xl pl-10 pr-10 py-3 border border-[#2e2e42] focus:outline-none focus:border-[#e50914] shadow-inner transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSearchParams({});
                    setResults([]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>

          {/* Quick Suggestions Bar */}
          <div className="pt-3 border-t border-[#242436] flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1 mr-1">
              <Layers className="w-3.5 h-3.5 text-[#e50914]" /> Gợi ý thể loại:
            </span>
            {ALL_GENRES.slice(0, 12).map((g) => (
              <GenreTag key={g} genre={g} size="sm" />
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between text-sm text-gray-300 font-medium">
          {query ? (
            <p>
              Kết quả tìm kiếm cho từ khóa: <strong className="text-[#e50914] font-mono">"{query}"</strong>
              {!loading && (
                <span className="text-gray-400 ml-1">
                  (Tìm thấy {results.length} phim ở Trang {page})
                </span>
              )}
            </p>
          ) : (
            <p className="text-gray-400 text-xs">
              Vui lòng nhập tên phim vào ô tìm kiếm ở trên để tra cứu.
            </p>
          )}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
            <p className="text-xs text-gray-400 font-bold tracking-wide">
              Đang tra cứu dữ liệu phim...
            </p>
          </div>
        )}

        {/* Results Grid */}
        {!loading && results.length > 0 && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {results.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-[#222232]">
              <button
                type="button"
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page <= 1}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                  page > 1
                    ? 'bg-[#1a1a26] text-white hover:bg-[#252538] border-[#2f2f45]'
                    : 'bg-[#12121a] text-gray-600 border-gray-800 cursor-not-allowed opacity-50'
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Trang Trước
              </button>

              <span className="px-4 py-2 bg-[#1b1b28] text-white rounded-xl font-mono text-xs font-bold border border-[#2e2e42]">
                Trang {page}
              </span>

              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={results.length < 15}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                  results.length >= 15
                    ? 'bg-[#1a1a26] text-white hover:bg-[#252538] border-[#2f2f45]'
                    : 'bg-[#12121a] text-gray-600 border-gray-800 cursor-not-allowed opacity-50'
                }`}
              >
                Trang Tiếp <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && query && results.length === 0 && (
          <div className="text-center py-16 bg-[#14141e] rounded-2xl border border-[#242436] space-y-4">
            <Film className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="text-lg font-bold text-gray-300">
              Không tìm thấy bộ phim nào phù hợp với từ khóa "{query}"
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Hãy thử tìm kiếm với từ khóa ngắn hơn, tên Hán Việt hoặc tên tiếng Trung của bộ phim.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
