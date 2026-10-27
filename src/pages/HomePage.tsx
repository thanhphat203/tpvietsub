/**
 * @file src/pages/HomePage.tsx
 * Cinema-Grade Homepage Layout with Hero, Schedule, Categories, Multi-Source Switching, and Multi-Column Layout
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { HeroSlider } from '../components/HeroSlider';
import { MovieRow } from '../components/MovieRow';
import { TopMoviesList } from '../components/TopMoviesList';
import { ScheduleSection } from '../components/ScheduleSection';
import { ContinueWatchingRow } from '../components/ContinueWatchingRow';
import { GenreTag } from '../components/GenreTag';
import {
  getAllMovies,
  getTopViewed,
  getAllAvailableGenres,
  initializeMovies,
} from '../../lib/movies';
import {
  Compass,
  ChevronRight,
  Database,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [allMovies, setAllMovies] = useState(getAllMovies());
  const [sourceFilter, setSourceFilter] = useState<'all' | 'kkphim' | 'anisrc'>('all');

  useEffect(() => {
    const handleUpdate = () => {
      setAllMovies(getAllMovies());
    };
    window.addEventListener('tp_movies_updated', handleUpdate);
    initializeMovies();
    return () => window.removeEventListener('tp_movies_updated', handleUpdate);
  }, []);

  // Filter movies based on selected API source
  const sourceMovies = useMemo(() => {
    if (sourceFilter === 'all') return allMovies;
    return allMovies.filter((m) => m.source === sourceFilter);
  }, [allMovies, sourceFilter]);

  const hotMovies = useMemo(() => {
    const hot = sourceMovies.filter((m) => m.isHot || m.views > 700000);
    return hot.length > 0 ? hot.slice(0, 10) : sourceMovies.slice(0, 10);
  }, [sourceMovies]);

  const newMovies = useMemo(() => {
    return [...sourceMovies]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 12);
  }, [sourceMovies]);

  const topViewed = useMemo(() => {
    return [...sourceMovies]
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }, [sourceMovies]);

  const seriesMovies = useMemo(() => {
    return sourceMovies.filter((m) => m.type !== 'single').slice(0, 12);
  }, [sourceMovies]);

  const singleMovies = useMemo(() => {
    const singles = sourceMovies.filter((m) => m.type === 'single');
    if (singles.length > 0) return singles.slice(0, 12);
    return sourceMovies
      .filter(
        (m) =>
          m.genres.some((g) => g.includes('Lẻ') || g.includes('Chiếu Rạp')) ||
          m.duration?.toLowerCase().includes('phút')
      )
      .slice(0, 12);
  }, [sourceMovies]);

  const genres = getAllAvailableGenres();

  // Genre-specific highlights
  const tuTienMovies = useMemo(() => {
    return sourceMovies
      .filter((m) => m.genres.some((g) => g.toLowerCase().includes('tu tiên') || g.toLowerCase().includes('võ hiệp')))
      .slice(0, 10);
  }, [sourceMovies]);

  const luyenCapMovies = useMemo(() => {
    return sourceMovies
      .filter((m) => m.genres.some((g) => g.toLowerCase().includes('luyện cấp') || g.toLowerCase().includes('hành động')))
      .slice(0, 10);
  }, [sourceMovies]);

  const huyenHuyenMovies = useMemo(() => {
    return sourceMovies
      .filter((m) => m.genres.some((g) => g.toLowerCase().includes('huyền huyễn') || g.toLowerCase().includes('kỳ ảo')))
      .slice(0, 10);
  }, [sourceMovies]);

  return (
    <div className="min-h-screen bg-[#0f0f14] text-gray-100 pb-20">
      
      {/* 1. Hero Banner Slider */}
      <HeroSlider movies={hotMovies} />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        
        {/* 2. Source Selector Tabs */}
        <section className="bg-[#14141e] p-3.5 sm:p-4 rounded-2xl border border-[#242436] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="border-l-4 border-[#e50914] pl-3 py-0.5">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                NGUỒN DỮ LIỆU PHIM
              </h3>
              <p className="text-[11px] text-gray-400">
                Tích hợp song song API KKPhim & Anisrc ZoPhim
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'Tất Cả Nguồn (Đồng Bộ Song Song)' },
              { id: 'kkphim', label: 'Nguồn KKPhim (HLS Direct)' },
              { id: 'anisrc', label: 'Nguồn Anisrc (Donghua)' },
            ].map((tab) => {
              const active = sourceFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSourceFilter(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border btn-3d ${
                    active
                      ? 'bg-[#e50914] text-white border-red-500 shadow-md shadow-red-950/70'
                      : 'bg-[#1b1b28] text-gray-300 border-[#28283a] hover:bg-[#252538] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Continue Watching (if user has active history) */}
        <ContinueWatchingRow />

        {/* 4. Quick Genre Matrix Pill Bar */}
        <section className="bg-[#14141e] p-4 sm:p-5 rounded-2xl border border-[#242436] shadow-lg">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="border-l-4 border-[#e50914] pl-3 py-0.5">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                KHÁM PHÁ THEO THỂ LOẠI
              </span>
            </div>
            <Link
              to="/kham-pha"
              className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 transition-colors"
            >
              Bộ lọc đa chiều <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {genres.slice(0, 16).map((g) => (
              <GenreTag key={g} genre={g} size="sm" />
            ))}
          </div>
        </section>

        {/* 5. Section: Hot / Trending Movies */}
        <MovieRow
          title="Phim Thịnh Hành"
          subtitle="Top tác phẩm thu hút lượt xem cao nhất trên hệ thống"
          movies={hotMovies}
          moreLink="/bang-xep-hang"
        />

        {/* 6. Section: Lịch Chiếu Trong Tuần (Weekly Air Schedule) */}
        <ScheduleSection movies={allMovies} />

        {/* 7. Section: Mới Cập Nhật Tập Mới Nhất */}
        <MovieRow
          title="Mới Cập Nhật"
          subtitle="Tập phim vừa lên sóng vietsub & thuyết minh siêu nét"
          movies={newMovies}
          moreLink="/kham-pha?sort=updated"
        />

        {/* 8. Phim Bộ vs Phim Lẻ Highlights */}
        <div className="grid grid-cols-1 gap-12">
          {/* Phim Bộ */}
          <MovieRow
            title="Phim Bộ Tuyển Chọn"
            subtitle="Các bộ phim dài tập với hành trình tu luyện kinh điển"
            movies={seriesMovies}
            moreLink="/phim-bo"
          />

          {/* Phim Lẻ / Chiếu Rạp */}
          {singleMovies.length > 0 && (
            <MovieRow
              title="Phim Lẻ & Chiếu Rạp"
              subtitle="Những tác phẩm điện ảnh và tập đặc biệt chất lượng cao"
              movies={singleMovies}
              moreLink="/phim-le"
            />
          )}
        </div>

        {/* 9. Main 2-Column Section: Genre Rows + Top 10 Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          
          {/* Left Column (2 Cols): Categorized Rows */}
          <div className="lg:col-span-2 space-y-12">
            {tuTienMovies.length > 0 && (
              <MovieRow
                title="Tu Tiên - Võ Hiệp"
                subtitle="Đao quang kiếm ảnh, phá toái hư không"
                movies={tuTienMovies}
                moreLink="/the-loai/Tu%20Ti%C3%AAn"
              />
            )}

            {luyenCapMovies.length > 0 && (
              <MovieRow
                title="Luyện Cấp - Tu Chân"
                subtitle="Từng bước quật khởi, trở thành cường giả tối cao"
                movies={luyenCapMovies}
                moreLink="/the-loai/Luy%E1%BB%87n%20C%E1%BA%A5p"
              />
            )}

            {huyenHuyenMovies.length > 0 && (
              <MovieRow
                title="Huyền Huyễn - Dị Giới"
                subtitle="Thế giới kỳ ảo với vạn tộc tranh hùng"
                movies={huyenHuyenMovies}
                moreLink="/the-loai/Huy%E1%BB%81n%20Huy%E1%BB%85n"
              />
            )}
          </div>

          {/* Right Column (1 Col): Top 10 Leaderboard Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <TopMoviesList movies={topViewed} />

            {/* Quick Explore Banner Card */}
            <div className="bg-[#14141e] p-6 rounded-2xl border border-[#242436] space-y-4 shadow-xl">
              <div className="border-l-4 border-[#e50914] pl-3 py-0.5">
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Bộ Lọc Toàn Diện
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Khám phá theo định dạng, thể loại, năm chiếu và nguồn API
                </p>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Hệ thống hỗ trợ tra cứu đa nguồn kết hợp công nghệ streaming HLS Direct không quảng cáo.
              </p>
              <Link
                to="/kham-pha"
                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#e50914] hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors shadow-lg shadow-red-950/60 uppercase tracking-wider"
              >
                Mở Bộ Lọc Tìm Kiếm &rarr;
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
