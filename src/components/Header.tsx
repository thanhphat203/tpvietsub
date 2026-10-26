/**
 * @file src/components/Header.tsx
 * Cinema-Grade Navigation Header with Live Search, Mega Dropdown, and Mobile Drawer
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Film,
  ChevronDown,
  Menu,
  X,
  Star,
  Play,
  Calendar,
  Compass,
  Trophy,
  History,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ALL_GENRES, Movie } from '../types';
import { searchMoviesApi } from '../services/api';
import { searchMovies } from '../../lib/movies';

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

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

  // Live search debounced
  useEffect(() => {
    if (searchQuery.trim().length >= 1) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        // Fast local search first
        const localMatches = searchMovies(searchQuery).slice(0, 5);
        if (localMatches.length > 0) {
          setSearchResults(localMatches);
          setIsSearchOpen(true);
          setIsSearching(false);
        } else {
          // If no local match, search API
          searchMoviesApi(searchQuery, 1)
            .then((apiMatches) => {
              setSearchResults(apiMatches.slice(0, 5));
              setIsSearchOpen(true);
              setIsSearching(false);
            })
            .catch(() => {
              setIsSearching(false);
            });
        }
      }, 250);

      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
      setIsSearching(false);
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
    <header className="sticky top-0 z-50 bg-[#0f0f14]/95 backdrop-blur-md border-b border-[#222230] shadow-xl">
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
              <span className="text-[9px] text-gray-400 font-medium tracking-wide uppercase">
                Hoạt Hình Trung Quốc Full HD
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-5 text-xs font-black uppercase tracking-wider text-gray-200">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`py-2 transition-colors hover:text-[#e50914] ${
                  location.pathname === link.to ? 'text-[#e50914]' : ''
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
                className={`flex items-center gap-1 py-2 hover:text-[#e50914] transition-colors ${
                  location.pathname.startsWith('/the-loai') ? 'text-[#e50914]' : ''
                }`}
              >
                <span>Thể Loại</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isGenreOpen ? 'rotate-180' : ''}`} />
              </button>

              {isGenreOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-[#161622] rounded-2xl shadow-2xl border border-[#2a2a3e] p-4 grid grid-cols-2 gap-1.5 z-50">
                  {ALL_GENRES.map((genre) => (
                    <Link
                      key={genre}
                      to={`/the-loai/${encodeURIComponent(genre)}`}
                      className="px-3 py-1.5 text-xs font-bold text-gray-300 hover:text-white hover:bg-[#202030] rounded-lg transition-colors truncate"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Tủ Phim / Lịch Sử Link */}
            <Link
              to="/lich-su"
              className={`flex items-center gap-1.5 py-2 hover:text-[#e50914] transition-colors ${
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
                className="w-full bg-[#161622] text-white text-xs rounded-xl pl-9 pr-8 py-2.5 border border-[#272738] focus:outline-none focus:border-[#e50914] transition-all"
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
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#161622] rounded-2xl shadow-2xl border border-[#2a2a3e] overflow-hidden z-50">
                <div className="p-2 border-b border-[#252538] text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                  <span>GỢI Ý TÌM KIẾM</span>
                  <span>{searchResults.length} kết quả</span>
                </div>
                <div className="divide-y divide-[#222232]">
                  {searchResults.map((movie) => (
                    <Link
                      key={movie.id}
                      to={`/phim/${movie.slug}`}
                      className="flex items-center gap-3 p-2.5 hover:bg-[#1f1f2e] transition-colors group"
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
                <div className="p-2 bg-[#12121a] text-center border-t border-[#252538]">
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
              className="p-2 rounded-xl bg-[#161622] text-gray-300 hover:text-white border border-[#262638]"
              title="Tìm kiếm"
            >
              <Search className="w-5 h-5" />
            </Link>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-[#161622] text-gray-300 hover:text-white border border-[#262638]"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-[#12121a] border-b border-[#222232] px-4 py-6 space-y-4 shadow-2xl">
          {/* Quick Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm phim..."
              className="w-full bg-[#181824] text-white text-xs rounded-xl pl-9 pr-4 py-2.5 border border-[#2a2a3e] focus:outline-none focus:border-[#e50914]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          {/* Mobile Links */}
          <div className="grid grid-cols-2 gap-2 text-xs font-black uppercase tracking-wider">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`p-3 rounded-xl border transition-colors ${
                  location.pathname === link.to
                    ? 'bg-[#e50914] text-white border-red-500'
                    : 'bg-[#181824] text-gray-300 border-[#262638] hover:text-white'
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
                  : 'bg-[#181824] text-amber-400 border-[#262638]'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Tủ Phim</span>
            </Link>
          </div>

          {/* Quick Genres for Mobile */}
          <div className="pt-2 border-t border-[#222232] space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Thể loại nổi bật:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ALL_GENRES.slice(0, 10).map((g) => (
                <Link
                  key={g}
                  to={`/the-loai/${encodeURIComponent(g)}`}
                  className="px-2.5 py-1 bg-[#1c1c2a] text-gray-300 hover:text-white text-[11px] rounded-lg border border-[#28283a]"
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
