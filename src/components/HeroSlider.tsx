/**
 * @file src/components/HeroSlider.tsx
 * Cinema-Grade Hero Slider with Full-Framed 3D Poster Showcase (No Cropping, Ultra HD)
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Play,
  ChevronLeft,
  ChevronRight,
  Info,
  Sparkles,
  Clock,
  Maximize2,
} from 'lucide-react';
import { Movie } from '../types';
import { getHdImageUrl } from '../services/api';

interface HeroSliderProps {
  movies: Movie[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ movies }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const featured = movies.length > 0 ? movies.slice(0, 6) : [];

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (!featured || featured.length === 0) return null;

  const current = featured[currentIndex];
  const hdPoster = getHdImageUrl(current.poster);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  return (
    <div className="relative w-full min-h-[500px] sm:min-h-[560px] md:min-h-[620px] bg-[#07070c] overflow-hidden group select-none">
      
      {/* 1. Ambient Lighting Aura (Deep Blurred Background) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          key={`ambient-${current.id}`}
          src={hdPoster}
          alt={current.title}
          className="w-full h-full object-cover object-center filter blur-3xl scale-125 opacity-35 transition-all duration-1000 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80';
          }}
        />
        {/* Cinematic Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b10] via-[#0b0b10]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b10] via-[#0b0b10]/85 to-transparent w-full md:w-3/4" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* 2. Slide Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/60 hover:bg-[#e50914] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 border border-white/10 hidden sm:flex shadow-2xl btn-3d"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/60 hover:bg-[#e50914] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 border border-white/10 hidden sm:flex shadow-2xl btn-3d"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* 3. Main Content: 2-Column Split (Left: Info / Right: FULL 100% HD POSTER) */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 md:px-8 py-10 sm:py-14 flex items-center">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center w-full">
          
          {/* Left Column: Movie Info & Action CTA */}
          <div className="md:col-span-7 lg:col-span-7 space-y-4 pt-4 sm:pt-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#e50914] text-white text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider shadow-lg shadow-red-950/60">
                THỊNH HÀNH
              </span>
              
              <span className="bg-black/80 backdrop-blur-md text-amber-400 font-extrabold text-xs px-2.5 py-1 rounded-md flex items-center gap-1 border border-amber-500/30">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {current.rating.toFixed(1)}
              </span>

              <span className="bg-black/80 backdrop-blur-md text-gray-200 text-xs font-semibold px-2.5 py-1 rounded-md border border-white/10 font-mono">
                {current.status || current.episodeInfo}
              </span>

              {current.airSchedule && (
                <span className="bg-sky-950/80 backdrop-blur-md text-sky-300 text-xs font-bold px-2.5 py-1 rounded-md border border-sky-800/40 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Lịch: {current.airSchedule}
                </span>
              )}
            </div>

            {/* Title */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight line-clamp-2 drop-shadow-2xl">
                {current.title}
              </h1>

              {current.titleOriginal && (
                <p className="text-sm sm:text-base text-gray-300 font-light italic opacity-90">
                  {current.titleOriginal}
                </p>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {current.genres.slice(0, 5).map((g) => (
                <span
                  key={g}
                  className="bg-white/10 backdrop-blur-md text-gray-200 text-xs font-medium px-3 py-1 rounded-full border border-white/10"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Synopsis */}
            <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 leading-relaxed font-normal pt-1 max-w-xl">
              {current.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                to={`/phim/${current.slug}`}
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#e50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white font-black text-sm sm:text-base px-7 py-3.5 rounded-xl shadow-xl shadow-red-950/70 border border-red-500/40 btn-3d"
              >
                <Play className="w-5 h-5 fill-current" />
                XEM NGAY
              </Link>

              <Link
                to={`/phim/${current.slug}`}
                className="inline-flex items-center gap-2 bg-black/60 hover:bg-black/80 text-gray-200 hover:text-white font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl backdrop-blur-md border border-white/20 transition-all btn-3d"
              >
                <Info className="w-5 h-5" />
                Chi tiết
              </Link>
            </div>
          </div>

          {/* Right Column: THE FULL, UNCROPPED ULTRA-HD 3D POSTER */}
          <div className="hidden md:flex md:col-span-5 lg:col-span-5 justify-center lg:justify-end items-center">
            <Link
              to={`/phim/${current.slug}`}
              className="group/poster relative block aspect-[2/3] h-[380px] sm:h-[440px] md:h-[490px] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/15 hover:border-red-500 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 card-3d"
              style={{
                boxShadow:
                  '0 25px 60px -15px rgba(0,0,0,0.9), 0 0 35px rgba(229,9,20,0.3)',
              }}
              title={`Xem phim ${current.title}`}
            >
              {/* Ultra HD Full Image (100% Complete, No Cropping, Zero Blurriness) */}
              <img
                key={`poster-${current.id}`}
                src={hdPoster}
                alt={current.title}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/poster:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80';
                }}
              />

              {/* Top Quality Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-black/80 backdrop-blur-md text-emerald-400 border border-emerald-500/40 font-mono text-[10px] font-black px-2 py-0.5 rounded shadow-lg uppercase">
                  4K ULTRA HD
                </span>
              </div>

              {/* Bottom Gradient with Title Preview */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div className="flex items-center gap-2 text-white font-black text-sm">
                  <div className="w-8 h-8 rounded-full bg-[#e50914] flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                  <span>Bấm để xem ngay</span>
                </div>
              </div>
            </Link>
          </div>

        </div>
      </div>

      {/* 4. Slide Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {featured.map((m, idx) => (
          <button
            key={m.id}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? 'w-8 h-2.5 bg-[#e50914] shadow-lg shadow-red-600/60 scale-105'
                : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

    </div>
  );
};
