/**
 * @file src/components/ScheduleSection.tsx
 * Interactive Weekly Airing Schedule Section with auto-today detection
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, ChevronRight, Sparkles } from 'lucide-react';
import { Movie, SCHEDULE_DAYS } from '../types';
import { MovieCard } from './MovieCard';

interface ScheduleSectionProps {
  movies: Movie[];
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({ movies }) => {
  // Determine today's day key (T2..CN)
  const todayKey = useMemo(() => {
    const day = new Date().getDay(); // 0 is Sunday, 1 is Monday...
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

  const [selectedDay, setSelectedDay] = useState<string>(todayKey);

  // Filter movies that air on the selected day
  const filteredMovies = useMemo(() => {
    if (!movies) return [];
    return movies.filter((m) => {
      if (!m.airSchedule) return false;
      const days = m.airSchedule.toUpperCase().split(/[,\s]+/);
      return days.includes(selectedDay.toUpperCase());
    });
  }, [movies, selectedDay]);

  // Count per day
  const countsPerDay = useMemo(() => {
    const counts: Record<string, number> = {};
    SCHEDULE_DAYS.filter((d) => d.key !== 'all').forEach((d) => {
      counts[d.key] = movies.filter((m) => {
        if (!m.airSchedule) return false;
        const days = m.airSchedule.toUpperCase().split(/[,\s]+/);
        return days.includes(d.key);
      }).length;
    });
    return counts;
  }, [movies]);

  return (
    <section className="bg-[#14141e] border border-[#242436] rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242436] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/60">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              LỊCH PHÁT SÓNG DONGHUA TRONG TUẦN
              <span className="text-xs font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded">
                CẬP NHẬT MỖI NGÀY
              </span>
            </h2>
            <p className="text-xs text-gray-400">
              Theo dõi lịch phát hành các tập mới nhất của hoạt hình Trung Quốc
            </p>
          </div>
        </div>

        <Link
          to="/lich-chieu"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-950/40 border border-emerald-800/40 px-3.5 py-2 rounded-xl"
        >
          Xem Toàn Bộ Lịch
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Day Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {SCHEDULE_DAYS.filter((d) => d.key !== 'all').map((day) => {
          const isSelected = selectedDay === day.key;
          const isToday = todayKey === day.key;
          const count = countsPerDay[day.key] || 0;

          return (
            <button
              key={day.key}
              type="button"
              onClick={() => setSelectedDay(day.key)}
              className={`relative px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-950/70 scale-105'
                  : 'bg-[#1b1b28] text-gray-300 border-[#28283c] hover:bg-[#252538] hover:text-white'
              }`}
            >
              <span>{day.label}</span>
              {isToday && (
                <span className="text-[10px] font-mono bg-red-600 text-white px-1.5 py-0.2 rounded-full uppercase">
                  Hôm nay
                </span>
              )}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isSelected ? 'bg-black/30 text-white' : 'bg-[#262638] text-gray-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Movies Grid for Selected Day */}
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMovies.slice(0, 12).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#12121a] rounded-xl border border-gray-800/60 space-y-2">
          <Clock className="w-10 h-10 text-gray-600 mx-auto" />
          <p className="text-sm font-bold text-gray-400">
            Hôm nay chưa có phim cập nhật lịch chiếu trực tiếp trong danh sách này.
          </p>
        </div>
      )}
    </section>
  );
};
