/**
 * @file src/components/Header.tsx
 * Clean Minimalist Header with Typography-Only Logo and 3D Interactive Controls
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  Menu,
  X,
  Star,
  History,
} from 'lucide-react';
import { ALL_GENRES, Movie } from '../types';
import { searchMoviesApi } from '../services/api';
import { searchMovies } from '../../lib/movies';

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  const genreRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsGenreOpen(false);
    setIsCountryOpen(false);
  }, [location.pathname, location.search]);

  // Live search debounced
  useEffect(() => {
    if (searchQuery.trim().length >= 1) {
      const timer = setTimeout(() => {
        // Fast local search first (0ms)
        const localMatches = searchMovies(searchQuery).slice(0, 5);
        if (localMatches.length > 0) {
          setSearchResults(localMatches);
          setIsSearchOpen(true);
        } else {
          // Fallback to API search
          searchMoviesApi(searchQuery, 1)
            .then((apiMatches) => {
              setSearchResults(apiMatches.slice(0, 5));
              setIsSearchOpen(true);
            })
            .catch(() => {});
        }
      }, 200);

      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  }, [searchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (genreRef.current && !genreRef.current.contains(event.target as Node)) {
        setIsGenreOpen(false);
      }
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setIsCountryOpen(false);
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

  const navLinks = [
    { to: '/', label: 'Trang Chủ' },
    { to: '/kham-pha', label: 'Khám Phá' },
    { to: '/phim-bo', label: 'Phim Bộ' },
    { to: '/phim-le', label: 'Phim Lẻ' },
    { to: '/lich-chieu', label: 'Lịch Chiếu' },
    { to: '/bang-xep-hang', label: 'BXH Top' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0b0b10]/95 backdrop-blur-md border-b border-[#20202e] shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Clean Typography-Only Logo as requested ("LOGO chỉ để tên thôi là được") */}
          <Link to="/" className="flex items-center group py-2 select-none shrink-0">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white transition-all group-hover:scale-105">
              <span className="text-[#e50914] drop-shadow-[0_0_15px_rgba(229,9,20,0.65)]">TP</span> VIETSUB
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-gray-200">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`py-2 transition-all hover:text-[#e50914] hover:scale-105 ${
                  location.pathname === link.to ? 'text-[#e50914] font-black' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Thể Loại Mega Dropdown */}
            <div className="relative" ref={genreRef}>
              <button
                type="button"
                onClick={() => setIsGenreOpen(!isGenreOpen)}
                className={`flex items-center gap-1 py-2 transition-all hover:text-[#e50914] ${
                  location.pathname.startsWith('/the-loai') ? 'text-[#e50914]' : ''
                }`}
              >
                <span>Thể Loại</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isGenreOpen ? 'rotate-180' : ''}`} />
              </button>

              {isGenreOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-[#14141e] rounded-2xl shadow-2xl border border-[#262638] p-3.5 grid grid-cols-2 gap-1.5 z-50">
                  {ALL_GENRES.map((genre) => (
                    <Link
                      key={genre}
                      to={`/the-loai/${encodeURIComponent(genre)}`}
                      className="px-3 py-1.5 text-xs font-bold text-gray-300 hover:text-white hover:bg-red-600/20 hover:border-red-500/40 rounded-xl transition-all border border-transparent truncate"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quốc Gia Dropdown */}
            <div className="relative" ref={countryRef}>
              <button
                type="button"
                onClick={() => setIsCountryOpen(!isCountryOpen)}
                className={`flex items-center gap-1 py-2 transition-all hover:text-[#e50914] ${
                  location.search.includes('country=') ? 'text-[#e50914]' : ''
                }`}
              >
                <span>Quốc Gia</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCountryOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#14141e] rounded-2xl shadow-2xl border border-[#262638] p-2.5 flex flex-col gap-1 z-50">
                  {[
                    { label: 'Phim Trung Quốc', value: 'Trung Quốc' },
                    { label: 'Phim Hàn Quốc', value: 'Hàn Quốc' },
                    { label: 'Phim Nhật Bản', value: 'Nhật Bản' },
                    { label: 'Phim Âu Mỹ', value: 'Âu Mỹ' },
                    { label: 'Phim Thái Lan', value: 'Thái Lan' },
                  ].map((item) => (
                    <Link
                      key={item.value}
                      to={`/kham-pha?country=${encodeURIComponent(item.value)}`}
                      className="px-3 py-1.5 text-xs font-bold text-gray-300 hover:text-white hover:bg-red-600/20 hover:border-red-500/40 rounded-xl transition-all border border-transparent truncate"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Tủ Phim Link */}
            <Link
              to="/lich-su"
              className={`flex items-center gap-1.5 py-2 transition-all hover:text-[#e50914] ${
                location.pathname === '/lich-su' ? 'text-[#e50914]' : 'text-gray-300'
              }`}
            >
              <History className="w-4 h-4 text-amber-400" />
              <span>Tủ Phim</span>
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="relative flex-grow max-w-xs sm:max-w-md hidden md:block" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setIsSearchOpen(true);
                }}
                placeholder="Tìm phim, nhân vật, thể loại..."
                className="w-full bg-[#14141f] text-white text-xs rounded-xl pl-9 pr-8 py-2.5 border border-[#252538] focus:outline-none focus:border-[#e50914] shadow-inner transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Instant Search Suggestions Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#14141f] rounded-2xl shadow-2xl border border-[#2a2a3e] overflow-hidden z-50">
                <div className="p-2 border-b border-[#252538] text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                  <span>GỢI Ý TÌM KIẾM</span>
                  <span>{searchResults.length} kết quả</span>
                </div>
                <div className="divide-y divide-[#20202e]">
                  {searchResults.map((movie) => (
                    <Link
                      key={movie.id}
                      to={`/phim/${movie.slug}`}
                      className="flex items-center gap-3 p-2.5 hover:bg-[#1a1a28] transition-colors group"
                    >
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-10 h-14 object-cover rounded-lg shrink-0 bg-black"
                      />
                      <div className="min-w-0 flex-grow">
                        <h4 className="text-xs font-bold text-white group-hover:text-red-400 truncate">
                          {movie.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono mt-0.5">
                          <span className="text-amber-400 flex items-center gap-0.5 font-bold">
                            <Star className="w-2.5 h-2.5 fill-amber-400" />
                            {movie.rating.toFixed(1)}
                          </span>
                          <span>•</span>
                          <span>{movie.year}</span>
                          <span>•</span>
                          <span className="text-emerald-400 truncate">{movie.status || movie.episodeInfo}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="p-2 bg-[#0f0f18] text-center border-t border-[#252538]">
                  <Link
                    to={`/tim-kiem?q=${encodeURIComponent(searchQuery)}`}
                    className="text-xs text-red-400 hover:text-red-300 font-bold"
                  >
                    Xem tất cả kết quả cho "{searchQuery}" &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Right Actions */}
          <div className="flex items-center gap-2 xl:hidden">
            <Link
              to="/tim-kiem"
              className="p-2 rounded-xl bg-[#14141f] text-gray-300 hover:text-white border border-[#252538]"
              title="Tìm kiếm"
            >
              <Search className="w-5 h-5" />
            </Link>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-[#14141f] text-gray-300 hover:text-white border border-[#252538]"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-[#0d0d14] border-b border-[#20202e] px-4 py-5 space-y-4 shadow-2xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm phim..."
              className="w-full bg-[#14141f] text-white text-xs rounded-xl pl-9 pr-4 py-2.5 border border-[#252538] focus:outline-none focus:border-[#e50914]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <div className="grid grid-cols-2 gap-2 text-xs font-black uppercase tracking-wider">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`p-3 rounded-xl border transition-colors ${
                  location.pathname === link.to
                    ? 'bg-[#e50914] text-white border-red-500'
                    : 'bg-[#14141f] text-gray-300 border-[#252538] hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <Link
              to="/lich-su"
              className={`p-3 rounded-xl border flex items-center gap-2 ${
                location.pathname === '/lich-su'
                  ? 'bg-[#e50914] text-white border-red-500'
                  : 'bg-[#14141f] text-amber-400 border-[#252538]'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Tủ Phim</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-[#20202e] space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Quốc gia:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Trung Quốc', val: 'Trung Quốc' },
                { label: 'Hàn Quốc', val: 'Hàn Quốc' },
                { label: 'Nhật Bản', val: 'Nhật Bản' },
                { label: 'Âu Mỹ', val: 'Âu Mỹ' },
              ].map((c) => (
                <Link
                  key={c.val}
                  to={`/kham-pha?country=${encodeURIComponent(c.val)}`}
                  className="px-2.5 py-1 bg-[#161622] text-gray-300 hover:text-white text-[11px] rounded-lg border border-[#252538]"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#20202e] space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Thể loại nổi bật:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ALL_GENRES.slice(0, 10).map((g) => (
                <Link
                  key={g}
                  to={`/the-loai/${encodeURIComponent(g)}`}
                  className="px-2.5 py-1 bg-[#161622] text-gray-300 hover:text-white text-[11px] rounded-lg border border-[#252538]"
                >
                  {g}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
