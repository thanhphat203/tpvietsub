/**
 * @file src/components/MovieRow.tsx
 * Horizontal scrollable row of MovieCards with left/right scroll controls
 */

import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { MovieCard } from './MovieCard';
import { Movie } from '../types';

interface MovieRowProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  movies: Movie[];
  moreLink?: string;
}

export const MovieRow: React.FC<MovieRowProps> = ({
  title,
  subtitle,
  icon,
  movies,
  moreLink,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="relative my-8 group/row">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6">
        <div className="border-l-4 border-[#e50914] pl-3.5 py-0.5">
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-gray-400 font-medium mt-0.5">{subtitle}</p>}
        </div>

        {moreLink && (
          <Link
            to={moreLink}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white transition-all uppercase tracking-wider bg-[#181824] hover:bg-[#e50914] px-3.5 py-1.5 rounded-xl border border-white/10 btn-3d"
          >
            Xem tất cả
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Row Container with Controls */}
      <div className="relative">
        {/* Scroll Left Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/80 hover:bg-[#e50914] text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 shadow-xl border border-white/10 hidden md:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scrollable List */}
        <div
          ref={rowRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth px-4 sm:px-6 pb-4 pt-1 no-scrollbar scroll-snap-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="w-[140px] sm:w-[170px] md:w-[190px] shrink-0 scroll-snap-align-start"
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/80 hover:bg-[#e50914] text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 shadow-xl border border-white/10 hidden md:flex"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
};
