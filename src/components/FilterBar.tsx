/**
 * @file src/components/FilterBar.tsx
 * Cinema-Grade Multi-dimensional filter bar: API Source, Format, Genre, Year, Air Schedule, Status & Sort
 */

import React, { useState } from 'react';
import { RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { ALL_GENRES, SCHEDULE_DAYS, ALL_COUNTRIES, FilterOptions } from '../types';

interface FilterBarProps {
  filters: FilterOptions;
  onChange: (newFilters: FilterOptions) => void;
  onReset: () => void;
  totalResults: number;
}

const YEARS = ['all', '2026', '2025', '2024', '2023', '2022', '2021', '2020'];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  onReset,
  totalResults,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateField = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    onChange({
      ...filters,
      [key]: value,
      page: 1, // Reset to page 1 on filter change
    });
  };

  const hasActiveFilters =
    (filters.country && filters.country !== 'all') ||
    filters.type !== 'all' ||
    filters.genre !== 'all' ||
    filters.year !== 'all' ||
    filters.status !== 'all' ||
    filters.schedule !== 'all';

  return (
    <div className="bg-[#14141e] border border-[#252538] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#242436] pb-3">
        <div className="border-l-4 border-[#e50914] pl-3 py-0.5">
          <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            BỘ LỌC TÌM KIẾM CHI TIẾT
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </h2>
          <p className="text-[11px] text-gray-400">
            Tìm thấy <strong className="text-white font-mono">{totalResults}</strong> bộ phim phù hợp
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-800/40 transition-colors btn-3d"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Đặt lại bộ lọc
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="sm:hidden text-xs text-gray-300 font-bold flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1f1f2e] border border-[#2e2e42]"
          >
            {isExpanded ? (
              <>
                Thu gọn <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Mở rộng bộ lọc <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Matrix Content */}
      <div className={`space-y-4 sm:block ${isExpanded ? 'block' : 'hidden'}`}>
        
        {/* Row 0: Quốc Gia */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-gray-400 uppercase tracking-wider w-24 shrink-0">
            Quốc gia:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {ALL_COUNTRIES.map((c) => {
              const active = (filters.country || 'all') === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateField('country', c)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border btn-3d ${
                    active
                      ? 'bg-[#e50914] text-white border-red-500 shadow-md shadow-red-950/60'
                      : 'bg-[#1b1b28] text-gray-300 border-[#28283a] hover:bg-[#252538] hover:text-white'
                  }`}
                >
                  {c === 'all' ? 'Tất Cả Quốc Gia' : c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 1: Định dạng (Phim Bộ vs Phim Lẻ) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-gray-400 uppercase tracking-wider w-24 shrink-0">
            Định dạng:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Tất Cả' },
              { id: 'series', label: 'Phim Bộ' },
              { id: 'single', label: 'Phim Lẻ / Chiếu Rạp' },
            ].map((item) => {
              const active = filters.type === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateField('type', item.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border btn-3d ${
                    active
                      ? 'bg-[#e50914] text-white border-red-500 shadow-md shadow-red-950/60'
                      : 'bg-[#1b1b28] text-gray-300 border-[#28283a] hover:bg-[#252538] hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Thể Loại */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-gray-400 uppercase tracking-wider w-24 shrink-0">
            Thể loại:
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-24 sm:max-h-32 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => updateField('genre', 'all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                filters.genre === 'all'
                  ? 'bg-[#e50914] text-white border-red-500 shadow-md shadow-red-950/60'
                  : 'bg-[#1b1b28] text-gray-300 border-[#28283a] hover:bg-[#252538] hover:text-white'
              }`}
            >
              Tất Cả Thể Loại
            </button>
            {ALL_GENRES.map((g) => {
              const active = filters.genre === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => updateField('genre', g)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border btn-3d ${
                    active
                      ? 'bg-[#e50914] text-white border-red-500 shadow-md shadow-red-950/60'
                      : 'bg-[#1b1b28] text-gray-300 border-[#28283a] hover:bg-[#252538] hover:text-white'
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Năm Phát Hành */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-gray-400 uppercase tracking-wider w-24 shrink-0">
            Năm chiếu:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {YEARS.map((y) => {
              const active = filters.year === y;
              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => updateField('year', y)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border btn-3d ${
                    active
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/60'
                      : 'bg-[#1b1b28] text-gray-300 border-[#28283a] hover:bg-[#252538] hover:text-white'
                  }`}
                >
                  {y === 'all' ? 'Tất Cả Năm' : y}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 4: Lịch Chiếu Trong Tuần */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-gray-400 uppercase tracking-wider w-24 shrink-0">
            Lịch chiếu:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SCHEDULE_DAYS.map((d) => {
              const active = filters.schedule === d.key;
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => updateField('schedule', d.key)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border btn-3d ${
                    active
                      ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-950/60'
                      : 'bg-[#1b1b28] text-gray-300 border-[#28283a] hover:bg-[#252538] hover:text-white'
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 5: Sắp Xếp & Trạng Thái */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#222232]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
              Trạng thái:
            </span>
            <div className="flex gap-1.5">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'ongoing', label: 'Đang chiếu' },
                { id: 'completed', label: 'Hoàn thành' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => updateField('status', s.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border btn-3d ${
                    filters.status === s.id
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'bg-[#1b1b28] text-gray-400 border-[#28283a] hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
              Sắp xếp theo:
            </span>
            <select
              value={filters.sortBy}
              onChange={(e) => updateField('sortBy', e.target.value as any)}
              className="bg-[#1c1c2b] text-gray-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-[#2e2e45] focus:outline-none focus:border-[#e50914]"
            >
              <option value="updated">Mới cập nhật</option>
              <option value="year_desc">Năm chiếu mới nhất</option>
              <option value="rating">Đánh giá cao nhất</option>
              <option value="views">Lượt xem nhiều nhất</option>
              <option value="title">Tên phim A - Z</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};
