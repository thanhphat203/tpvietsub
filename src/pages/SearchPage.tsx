/**
 * @file src/pages/SearchPage.tsx
 * Client-side search and filtering page
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMovies, getAllMovies, getAllAvailableGenres } from '../../lib/movies';
import { MovieCard } from '../components/MovieCard';
import { GenreTag } from '../components/GenreTag';
import { Search, Film, X, Layers } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [query, setQuery] = useState(queryParam);

  useEffect(() => {
    setQuery(queryParam);
  }, [queryParam]);

  const allMovies = getAllMovies();
  const allGenres = getAllAvailableGenres();

  let results = query.trim() ? searchMovies(query) : allMovies;

  // Filter hot or new special keywords
  if (query.toLowerCase() === 'hot') {
    results = allMovies.filter((m) => m.isHot);
  } else if (query.toLowerCase() === 'moi') {
    results = allMovies.filter((m) => m.isNew);
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query.trim() });
  };

  return (
    <div className="min-h-screen bg-[#0f0f14] text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Search Header Bar */}
        <div className="bg-[#14141e] p-6 rounded-2xl border border-[#262638] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <Search className="w-6 h-6 text-[#e50914]" />
                Tìm Kiếm Phim Donghua
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Tìm kiếm theo tên phim, tên gốc, nội dung hoặc thể loại
              </p>
            </div>

            {/* Live Search Input Form */}
            <form onSubmit={handleSearch} className="relative w-full sm:w-80">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchParams({ q: e.target.value });
                }}
                placeholder="Nhập từ khóa tìm kiếm..."
                className="w-full bg-[#1b1b28] text-white text-sm rounded-xl pl-10 pr-8 py-3 border border-[#2e2e42] focus:outline-none focus:border-[#e50914] transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSearchParams({});
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>

          {/* Quick Genre Suggestions */}
          <div className="pt-2 border-t border-[#242436] flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1 mr-1">
              <Layers className="w-3.5 h-3.5 text-[#e50914]" /> Gợi ý thể loại:
            </span>
            {allGenres.slice(0, 10).map((g) => (
              <GenreTag key={g} genre={g} size="sm" />
            ))}
          </div>
        </div>

        {/* Search Results Summary Header */}
        <div className="flex items-center justify-between text-sm text-gray-300 font-medium">
          {query ? (
            <p>
              Kết quả tìm kiếm cho từ khóa: <strong className="text-[#e50914] font-mono">"{query}"</strong> ({results.length} bộ phim)
            </p>
          ) : (
            <p>
              Tất cả danh sách phim hiện có ({results.length} bộ phim)
            </p>
          )}
        </div>

        {/* Results Grid */}
        {results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {results.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#14141d] rounded-2xl border border-[#242436] space-y-4">
            <Film className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="text-lg font-bold text-gray-300">
              Không tìm thấy bộ phim nào phù hợp với từ khóa "{query}"
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Thử tìm kiếm với các từ khóa ngắn hơn như "Tu Tiên", "Trọng Sinh", "Hệ Thống" hoặc bấm chọn danh mục thể loại ở trên.
            </p>
            <button
              onClick={() => {
                setQuery('');
                setSearchParams({});
              }}
              className="bg-[#e50914] text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors"
            >
              Xóa tìm kiếm & Hiện tất cả phim
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
