/**
 * @file src/components/HotMoviesPopup.tsx
 * Floating bottom-right corner popup featuring currently Hot movies
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Flame, Play, Star, ChevronUp } from 'lucide-react';
import { Movie } from '../types';
import { getHdImageUrl } from '../services/api';

interface HotMoviesPopupProps {
  movies: Movie[];
}

export const HotMoviesPopup: React.FC<HotMoviesPopupProps> = ({ movies }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const hotList = movies.filter((m) => m.isHot).slice(0, 4);

  useEffect(() => {
    // Auto minimize after 12 seconds
    const timer = setTimeout(() => {
      setIsMinimized(true);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen || hotList.length === 0) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className="fixed bottom-4 right-4 z-40 bg-[#e50914] hover:bg-red-700 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-red-400/30 animate-bounce"
        aria-label="Hiện phim hot"
      >
        <Flame className="w-4 h-4 fill-amber-300 text-amber-300" />
        <span>PHIM HOT</span>
      </button>
    );
  }

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-40 bg-[#181822] hover:bg-[#e50914] text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-red-500/40 transition-all duration-300"
        aria-label="Mở popup phim thịnh hành"
      >
        <span>PHIM THỊNH HÀNH ({hotList.length})</span>
        <ChevronUp className="w-4 h-4 ml-1" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-88 bg-[#181824]/95 backdrop-blur-xl rounded-2xl p-4 border border-red-600/40 shadow-2xl shadow-red-950/40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
        <div className="border-l-3 border-[#e50914] pl-2.5">
          <h3 className="font-black text-sm text-white uppercase tracking-wider">
            Phim Thịnh Hành
          </h3>
          <p className="text-[10px] text-gray-400">Xem ngay không bỏ lỡ</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors text-xs font-semibold px-2"
            title="Thu nhỏ"
          >
            _
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Movies List */}
      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 no-scrollbar">
        {hotList.map((m) => (
          <Link
            key={m.id}
            to={`/phim/${m.slug}`}
            onClick={() => setIsMinimized(true)}
            className="flex items-center gap-3 p-2 rounded-xl bg-[#12121a] hover:bg-[#20202e] transition-all border border-white/5 hover:border-red-500/40 group"
          >
            <img
              src={getHdImageUrl(m.poster)}
              alt={m.title}
              loading="lazy"
              className="w-10 h-14 object-cover rounded-md shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&auto=format&fit=crop&q=80';
              }}
            />
            <div className="flex-grow min-w-0">
              <h4 className="font-bold text-xs text-white group-hover:text-[#e50914] truncate transition-colors">
                {m.title}
              </h4>
              <p className="text-[10px] text-gray-400 truncate mt-0.5">{m.episodeInfo}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-extrabold text-amber-400 flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {m.rating}
                </span>
                <span className="text-[10px] text-gray-500">{m.genres[0]}</span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#e50914]/20 group-hover:bg-[#e50914] text-[#e50914] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
