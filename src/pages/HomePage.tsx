/**
 * @file src/pages/HomePage.tsx
 * Cinema-Grade Homepage Layout with Hero, Schedule, Categories, and Multi-Column Layout
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeroSlider } from '../components/HeroSlider';
import { MovieRow } from '../components/MovieRow';
import { TopMoviesList } from '../components/TopMoviesList';
import { ScheduleSection } from '../components/ScheduleSection';
import { ContinueWatchingRow } from '../components/ContinueWatchingRow';
import { GenreTag } from '../components/GenreTag';
import {
  getAllMovies,
  getHotMovies,
  getNewMovies,
  getTopViewed,
  getSeriesMovies,
  getSingleMovies,
  getMoviesByGenre,
  getAllAvailableGenres,
  initializeMovies,
} from '../../lib/movies';
import {
  Sparkles,
  Clock,
  Layers,
  Flame as FlameIcon,
  Film,
  Calendar,
  Compass,
  Trophy,
  ChevronRight,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [allMovies, setAllMovies] = useState(getAllMovies());

  useEffect(() => {
    const handleUpdate = () => {
      setAllMovies(getAllMovies());
    };
    window.addEventListener('tp_movies_updated', handleUpdate);
    initializeMovies();
    return () => window.removeEventListener('tp_movies_updated', handleUpdate);
  }, []);

  const hotMovies = getHotMovies(10);
  const newMovies = getNewMovies(12);
  const topViewed = getTopViewed(10);
  const seriesMovies = getSeriesMovies().slice(0, 12);
  const singleMovies = getSingleMovies().slice(0, 12);
  const genres = getAllAvailableGenres();

  // Genre-specific highlights
  const tuTienMovies = getMoviesByGenre('Tu Tiên').slice(0, 10);
  const luyenCapMovies = getMoviesByGenre('Luyện Cấp').slice(0, 10);
  const huyenHuyenMovies = getMoviesByGenre('Huyền Huyễn').slice(0, 10);

  return (
    <div className="min-h-screen bg-[#0f0f14] text-gray-100 pb-20">
      
      {/* 1. Hero Banner Slider */}
      <HeroSlider movies={hotMovies} />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        
        {/* 2. Continue Watching (if user has active history) */}
        <ContinueWatchingRow />

        {/* 3. Quick Genre Matrix Pill Bar */}
        <section className="bg-[#14141e] p-4 sm:p-5 rounded-2xl border border-[#242436] shadow-lg">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-300">
              <Layers className="w-4 h-4 text-[#e50914]" />
              <span>KHÁM PHÁ THEO THỂ LOẠI HOẠT HÌNH (DONGHUA)</span>
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

        {/* 4. Section: Hot / Trending Movies */}
        <MovieRow
          title="🔥 Đang Hot Tuần Này"
          subtitle="Top hoạt hình Trung Quốc thu hút lượt xem khủng nhất"
          icon={<FlameIcon className="w-6 h-6 text-red-500 fill-red-500" />}
          movies={hotMovies}
          moreLink="/bang-xep-hang"
        />

        {/* 5. Section: Lịch Chiếu Trong Tuần (Weekly Air Schedule) */}
        <ScheduleSection movies={allMovies} />

        {/* 6. Section: Mới Cập Nhật Tập Mới Nhất */}
        <MovieRow
          title="🆕 Mới Cập Nhật"
          subtitle="Tập phim vừa lên sóng vietsub & thuyết minh siêu nét"
          icon={<Clock className="w-6 h-6 text-emerald-400" />}
          movies={newMovies}
          moreLink="/kham-pha?sort=updated"
        />

        {/* 7. Phim Bộ vs Phim Lẻ Highlights */}
        <div className="grid grid-cols-1 gap-12">
          {/* Phim Bộ */}
          <MovieRow
            title="🎬 Phim Hoạt Hình Bộ (Series)"
            subtitle="Các bộ phim dài tập với hành trình tu luyện kinh điển"
            icon={<Film className="w-6 h-6 text-amber-400" />}
            movies={seriesMovies}
            moreLink="/phim-bo"
          />

          {/* Phim Lẻ / Chiếu Rạp */}
          {singleMovies.length > 0 && (
            <MovieRow
              title="🍿 Phim Lẻ & Bản Chiếu Rạp"
              subtitle="Những movie điện ảnh và tập đặc biệt chất lượng 4K"
              icon={<Sparkles className="w-6 h-6 text-sky-400" />}
              movies={singleMovies}
              moreLink="/phim-le"
            />
          )}
        </div>

        {/* 8. Main 2-Column Section: Genre Rows + Top 10 Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          
          {/* Left Column (2 Cols): Categorized Rows */}
          <div className="lg:col-span-2 space-y-12">
            {tuTienMovies.length > 0 && (
              <MovieRow
                title="⚔️ Tu Tiên - Cầu Đạo Trường Sinh"
                subtitle="Đao quang kiếm ảnh, phá toái hư không"
                movies={tuTienMovies}
                moreLink="/the-loai/Tu%20Ti%C3%AAn"
              />
            )}

            {luyenCapMovies.length > 0 && (
              <MovieRow
                title="⚡ Luyện Cấp - Nghịch Thiên Đổi Vận"
                subtitle="Từng bước quật khởi, trở thành cường giả tối cao"
                movies={luyenCapMovies}
                moreLink="/the-loai/Luy%E1%BB%87n%20C%E1%BA%A5p"
              />
            )}

            {huyenHuyenMovies.length > 0 && (
              <MovieRow
                title="🔮 Huyền Huyễn - Dị Giới"
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
            <div className="bg-gradient-to-br from-red-950/60 via-[#161624] to-[#12121a] p-6 rounded-2xl border border-red-800/40 space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-950">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">
                Bộ Lọc Tìm Kiếm Nâng Cao
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Tùy chỉnh chọn lựa theo Thể loại, Năm chiếu, Lịch chiếu và Trạng thái hoàn thành nhanh chóng.
              </p>
              <Link
                to="/kham-pha"
                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#e50914] hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors shadow-lg shadow-red-950/60"
              >
                Mở Bộ Lọc Toàn Diện &rarr;
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
