/**
 * @file src/pages/WeeklySchedulePage.tsx
 * Comprehensive 7-Day Airing Schedule Calendar
 */

import React, { useState, useEffect, useMemo } from 'react';
import { MovieCard } from '../components/MovieCard';
import { Movie, SCHEDULE_DAYS } from '../types';
import { getAllMovies, initializeMovies } from '../../lib/movies';
import { Calendar, Clock, Sparkles } from 'lucide-react';

export const WeeklySchedulePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>(getAllMovies());

  // Determine current day of week (T2..CN)
  const todayKey = useMemo(() => {
    const day = new Date().getDay();
    const map: Record<number, string> = {
      0: 'CN',
      1: 'T2',
      2: 'T3',
      3: 'T4',
      4: 'T5',
      5: 'T6',
      6: 'T7',
    };
    return map[day] || 'T2';
  }, []);

  const [activeDay, setActiveDay] = useState<string>(todayKey);

  useEffect(() => {
    const handleUpdate = () => {
      setMovies(getAllMovies());
    };
    window.addEventListener('tp_movies_updated', handleUpdate);
    initializeMovies();
    return () => window.removeEventListener('tp_movies_updated', handleUpdate);
  }, []);

  const dayMovies = useMemo(() => {
    if (activeDay === 'all') return movies;
    return movies.filter((m) => {
      if (!m.airSchedule) return false;
      const days = m.airSchedule.toUpperCase().split(/[,\s]+/);
      return days.includes(activeDay.toUpperCase());
    });
  }, [movies, activeDay]);

  const countsPerDay = useMemo(() => {
    const counts: Record<string, number> = {};
    SCHEDULE_DAYS.forEach((d) => {
      if (d.key === 'all') {
        counts[d.key] = movies.filter((m) => Boolean(m.airSchedule)).length;
      } else {
        counts[d.key] = movies.filter((m) => {
          if (!m.airSchedule) return false;
          const days = m.airSchedule.toUpperCase().split(/[,\s]+/);
          return days.includes(d.key);
        }).length;
      }
    });
    return counts;
  }, [movies]);

  return (
    <div className="min-h-screen bg-[#0f0f14] text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14141e] p-6 rounded-2xl border border-[#262638] shadow-xl">
          <div className="border-l-4 border-emerald-500 pl-3.5 py-0.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              LỊCH PHÁT SÓNG TRONG TUẦN
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Lịch ra tập mới mỗi tuần, cập nhật Vietsub & Thuyết minh siêu tốc
            </p>
          </div>

          <div className="text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-3.5 py-1.5 rounded-xl font-bold">
            Hôm nay là: {SCHEDULE_DAYS.find((d) => d.key === todayKey)?.label || 'Hôm nay'}
          </div>
        </div>

        {/* 7-Day Pills Selector */}
        <div className="flex flex-wrap gap-2.5 bg-[#14141e] p-4 rounded-2xl border border-[#262638]">
          {SCHEDULE_DAYS.map((d) => {
            const isSelected = activeDay === d.key;
            const isToday = todayKey === d.key;
            const count = countsPerDay[d.key] || 0;

            return (
              <button
                key={d.key}
                type="button"
                onClick={() => setActiveDay(d.key)}
                className={`relative px-4 py-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-950/80 scale-105'
                    : 'bg-[#1b1b28] text-gray-300 border-[#28283c] hover:bg-[#252538] hover:text-white'
                }`}
              >
                <span>{d.label}</span>
                {isToday && (
                  <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded uppercase font-sans">
                    Hôm nay
                  </span>
                )}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isSelected ? 'bg-black/30 text-white' : 'bg-[#252538] text-gray-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Movies Grid */}
        {dayMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {dayMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#14141e] rounded-2xl border border-[#242436] space-y-3">
            <Clock className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-gray-300 font-bold">
              Chưa có phim nào đăng ký lịch phát sóng vào ngày này
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
