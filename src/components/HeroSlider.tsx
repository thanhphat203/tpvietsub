/**
 * @file src/components/HeroSlider.tsx
 * Featured movies banner slider with backdrop images and auto-slide
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Play, ChevronLeft, ChevronRight, Info, Sparkles } from 'lucide-react';
import { Movie } from '../types';

interface HeroSliderProps {
  movies: Movie[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ movies }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const featured = movies.length > 0 ? movies.slice(0, 5) : [];

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (!featured || featured.length === 0) return null;

  const current = featured[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  return (
    <div className="relative w-full h-[450px] sm:h-[520px] md:h-[600px] bg-[#0b0b10] overflow-hidden group">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          key={current.id}
          src={current.backdrop || current.poster}
          alt={current.title}
          className="w-full h-full object-cover object-center transition-all duration-700 ease-out scale-105"
        />
        {/* Dark Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f14] via-[#0f0f14]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f14] via-[#0f0f14]/85 to-transparent w-full md:w-3/4" />
      </div>

      {/* Slide Navigation Buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-[#e50914] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/10 hidden sm:flex shadow-xl"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-[#e50914] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/10 hidden sm:flex shadow-xl"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 md:px-8 flex flex-col justify-end pb-12 sm:pb-16 pt-20">
        <div className="max-w-2xl space-y-3 sm:space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-gradient-to-r from-red-600 to-amber-600 text-white text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider shadow-lg shadow-red-950/50 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 fill-current text-amber-200" />
              HOT BẢNG XẾP HẠNG
            </span>
            <span className="bg-black/80 backdrop-blur-md text-amber-400 font-extrabold text-xs px-2.5 py-1 rounded-md flex items-center gap-1 border border-amber-500/30">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {current.rating.toFixed(1)}
            </span>
            <span className="bg-black/80 backdrop-blur-md text-gray-200 text-xs font-semibold px-2.5 py-1 rounded-md border border-white/10">
              {current.episodeInfo}
            </span>
            <span className="bg-red-950/80 backdrop-blur-md text-red-300 text-xs font-bold px-2.5 py-1 rounded-md border border-red-800/40">
              {current.year} • Vietsub
            </span>
          </div>

          {/* Movie Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight line-clamp-2 drop-shadow-lg">
            {current.title}
          </h1>

          {current.titleOriginal && (
            <p className="text-sm sm:text-base text-gray-300 font-medium italic opacity-90">
              {current.titleOriginal}
            </p>
          )}

          {/* Genre Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {current.genres.slice(0, 4).map((g) => (
              <span
                key={g}
                className="bg-white/10 backdrop-blur-md text-gray-200 text-xs px-2.5 py-0.5 rounded-full border border-white/10"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 sm:line-clamp-3 leading-relaxed font-normal pt-1 max-w-xl">
            {current.description}
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              to={`/phim/${current.slug}`}
              className="inline-flex items-center gap-2 bg-[#e50914] hover:bg-[#c10711] text-white font-extrabold text-sm sm:text-base px-6 py-3 rounded-xl shadow-lg shadow-red-950/60 hover:shadow-red-600/40 transition-all duration-200 transform hover:scale-105 border border-red-500/30"
            >
              <Play className="w-5 h-5 fill-current" />
              XEM NGAY
            </Link>

            <Link
              to={`/phim/${current.slug}`}
              className="inline-flex items-center gap-2 bg-black/60 hover:bg-black/80 text-gray-200 hover:text-white font-bold text-sm sm:text-base px-5 py-3 rounded-xl backdrop-blur-md border border-white/20 transition-all"
            >
              <Info className="w-5 h-5" />
              Chi tiết
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {featured.map((m, idx) => (
          <button
            key={m.id}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? 'w-8 h-2.5 bg-[#e50914] shadow-md shadow-red-600/50'
                : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
