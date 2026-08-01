/**
 * @file src/components/Header.tsx
 * Navigation header with search bar, genre dropdown, and mobile navigation
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Film, ChevronDown, Menu, X, Star, Play, Sparkles, Sliders } from 'lucide-react';
import { ALL_GENRES, Movie } from '../types';
import { searchMovies } from '../../lib/movies';

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  const genreRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsGenreOpen(false);
  }, [location.pathname, location.search]);

  // Handle live search suggestions
  useEffect(() => {
    if (searchQuery.trim().length >= 1) {
      const results = searchMovies(searchQuery).slice(0, 5);
      setSearchResults(results);
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  }, [searchQuery]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (genreRef.current && !genreRef.current.contains(event.target as Node)) {
        setIsGenreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0f0f14]/95 backdrop-blur-md border-b border-[#222230] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e50914] via-red-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-red-950/60 group-hover:scale-105 group-hover:shadow-red-600/40 transition-all duration-300 border border-red-500/30">
              <Film className="w-5 h-5 fill-current text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight text-white group-hover:text-red-500 transition-colors flex items-center gap-1.5">
                <span className="text-red-500 font-extrabold tracking-tighter">TP</span> VIETSUB
                <span className="text-[10px] font-mono font-bold bg-red-950/80 border border-red-800/60 text-red-400 px-1.5 py-0.5 rounded shadow-sm">
                  DONGHUA
                </span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
                Kênh Phim Hoạt Hình Trung Quốc
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-bold text-gray-200">
            <Link
              to="/"
              className={`hover:text-[#e50914] transition-colors py-2 ${
                location.pathname === '/' ? 'text-[#e50914]' : ''
              }`}
            >
              Trang Chủ
            </Link>

            <Link
              to="/tim-kiem?q=hot"
              className="hover:text-[#e50914] transition-colors py-2 flex items-center gap-1 text-amber-400"
            >
              <Sparkles className="w-4 h-4 fill-amber-400" />
              Phim Hot
            </Link>

            <Link
              to="/the-loai/Tu%20Ti%C3%AAn"
              className="hover:text-[#e50914] transition-colors py-2"
            >
              Tu Tiên
            </Link>

            <Link
              to="/the-loai/Xuy%C3%AAn%20Kh%C3%B4ng"
              className="hover:text-[#e50914] transition-colors py-2"
            >
              Xuyên Không
            </Link>

            <Link
              to="/the-loai/H%E1%BB%87%20Th%E1%BB%91ng"
              className="hover:text-[#e50914] transition-colors py-2"
            >
              Hệ Thống
            </Link>

            {/* Genre Dropdown */}
            <div className="relative" ref={genreRef}>
              <button
                onClick={() => setIsGenreOpen(!isGenreOpen)}
                className="flex items-center gap-1 hover:text-[#e50914] transition-colors py-2 cursor-pointer font-bold"
              >
                <span>Thể Loại</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isGenreOpen ? 'rotate-180 text-[#e50914]' : ''}`} />
              </button>

              {/* Genre Dropdown Grid */}
              {isGenreOpen && (
                <div className="absolute top-full left-0 mt-2 w-[520px] bg-[#161622] rounded-2xl p-5 border border-[#2b2b3d] shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-3 border-b border-gray-800 pb-2 flex justify-between items-center">
                    <span>DANH SÁCH THỂ LOẠI DONGHUA</span>
                    <span className="text-[#e50914] font-mono">{ALL_GENRES.length} Thể loại</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1">
                    {ALL_GENRES.map((genre) => (
                      <Link
                        key={genre}
                        to={`/the-loai/${encodeURIComponent(genre)}`}
                        onClick={() => setIsGenreOpen(false)}
                        className="text-xs font-semibold text-gray-300 hover:text-white hover:bg-[#e50914] px-3 py-2 rounded-lg transition-all duration-150 border border-transparent hover:border-red-500/30 truncate"
                      >
                        {genre}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Search Bar & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm phim, thể loại..."
                  className="w-36 sm:w-60 md:w-72 bg-[#181824] text-gray-100 placeholder-gray-500 text-xs sm:text-sm rounded-xl pl-9 pr-8 py-2.5 border border-[#28283a] focus:outline-none focus:border-[#e50914] transition-all"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Live Search Suggestions Dropdown */}
              {isSearchOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#161622] rounded-2xl p-3 border border-[#2c2c3e] shadow-2xl z-50">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 pb-2 mb-2 border-b border-gray-800 flex justify-between">
                    <span>Gợi Ý Tìm Kiếm</span>
                    <span>{searchResults.length} Kết quả</span>
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((m) => (
                        <Link
                          key={m.id}
                          to={`/phim/${m.slug}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#222232] transition-colors group"
                        >
                          <img
                            src={m.poster}
                            alt={m.title}
                            className="w-10 h-14 object-cover rounded-md shrink-0"
                          />
                          <div className="flex-grow min-w-0">
                            <h4 className="font-bold text-xs text-gray-100 group-hover:text-[#e50914] truncate">
                              {m.title}
                            </h4>
                            <p className="text-[11px] text-gray-400 truncate">{m.episodeInfo}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                              <span className="text-amber-400 font-bold flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-amber-400" />
                                {m.rating}
                              </span>
                              <span>{m.genres[0]}</span>
                            </div>
                          </div>
                        </Link>
                      ))}

                      <button
                        onClick={handleSearchSubmit}
                        className="w-full text-center py-2 text-xs font-bold text-[#e50914] hover:bg-red-950/30 rounded-xl transition-colors mt-1"
                      >
                        Xem tất cả kết quả cho "{searchQuery}" →
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 py-4 text-center">
                      Không tìm thấy phim phù hợp với "{searchQuery}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white rounded-xl bg-[#181824] border border-[#28283a]"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#14141d] border-b border-[#28283a] px-4 py-5 space-y-4 animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-2">
            <Link
              to="/"
              className="px-3 py-2 rounded-xl text-sm font-bold text-gray-200 hover:bg-[#e50914] hover:text-white transition-colors"
            >
              🏠 Trang Chủ
            </Link>
            <Link
              to="/tim-kiem?q=hot"
              className="px-3 py-2 rounded-xl text-sm font-bold text-amber-400 hover:bg-[#e50914] hover:text-white transition-colors"
            >
              🔥 Phim Đang Hot
            </Link>

          </nav>

          <div className="pt-3 border-t border-[#262638]">
            <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3 px-1">
              Tất Cả Thể Loại Donghua
            </h4>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {ALL_GENRES.map((genre) => (
                <Link
                  key={genre}
                  to={`/the-loai/${encodeURIComponent(genre)}`}
                  className="text-xs font-semibold text-gray-300 bg-[#1e1e2c] hover:bg-[#e50914] hover:text-white px-3 py-2 rounded-lg truncate transition-colors text-center"
                >
                  {genre}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
