/**
 * @file src/pages/HomePage.tsx
 * Primary homepage layout with Hero slider, categorized movie rows, and top 10 list
 */

import React, { useState, useEffect } from 'react';
import { HeroSlider } from '../components/HeroSlider';
import { MovieRow } from '../components/MovieRow';
import { TopMoviesList } from '../components/TopMoviesList';
import { HotMoviesPopup } from '../components/HotMoviesPopup';
import { GenreTag } from '../components/GenreTag';
import {
  getAllMovies,
  getHotMovies,
  getNewMovies,
  getTopViewed,
  getMoviesByGenre,
  getAllAvailableGenres,
} from '../../lib/movies';
import { Sparkles, Clock, Layers, Flame as FlameIcon } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [allMovies, setAllMovies] = useState(getAllMovies());

  useEffect(() => {
    const handleUpdate = () => {
      setAllMovies(getAllMovies());
    };
    window.addEventListener('tp_movies_updated', handleUpdate);
    return () => window.removeEventListener('tp_movies_updated', handleUpdate);
  }, []);

  const hotMovies = getHotMovies(8);
  const newMovies = getNewMovies(10);
  const topViewed = getTopViewed(10);
  const genres = getAllAvailableGenres();

  // Genre-specific rows
  const tuTienMovies = getMoviesByGenre('Tu Tiên');
  const xuyenKhongMovies = getMoviesByGenre('Xuyên Không');
  const heThongMovies = getMoviesByGenre('Hệ Thống');
  const matTheMovies = getMoviesByGenre('Mạt Thế');
  const phim3DMovies = getMoviesByGenre('Phim 3D');


  return (
    <div className="min-h-screen bg-[#0f0f14] text-gray-100 pb-16">
      {/* Hero Banner Slider */}
      <HeroSlider movies={hotMovies} />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        
        {/* Quick Genre Tags Pill Bar */}
        <section className="bg-[#14141d] p-4 rounded-2xl border border-[#222232] shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
            <Layers className="w-4 h-4 text-[#e50914]" />
            <span>Khám Phá Theo Thể Loại Phổ Biến</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {genres.slice(0, 14).map((g) => (
              <GenreTag key={g} genre={g} size="sm" />
            ))}
          </div>
        </section>

        {/* Section 1: Phim Hot Đang Phủ Sóng */}
        <MovieRow
          title="🔥 Đang Hot Tuần Này"
          subtitle="Top hoạt hình Trung Quốc thu hút lượt xem khủng"
          icon={<FlameIcon className="w-6 h-6 text-red-500 fill-red-500" />}
          movies={hotMovies}
          moreLink="/tim-kiem?q=hot"
        />

        {/* Section 2: Mới Cập Nhật Tập Mới */}
        <MovieRow
          title="🆕 Mới Cập Nhật"
          subtitle="Tập phim mới nhất vừa xuất bản"
          icon={<Clock className="w-6 h-6 text-emerald-400" />}
          movies={newMovies}
          moreLink="/tim-kiem?q=moi"
        />

        {/* Main Content Layout with Top 10 Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          
          {/* Left Column (2 Cols): Categorized Rows */}
          <div className="lg:col-span-2 space-y-12">
            {/* Row: Tu Tiên - Võ Hiệp */}
            {tuTienMovies.length > 0 && (
              <MovieRow
                title="⚔️ Tu Tiên - Võ Hiệp"
                subtitle="Đao quang kiếm ảnh, tầm đạo trường sinh"
                movies={tuTienMovies}
                moreLink="/the-loai/Tu%20Ti%C3%AAn"
              />
            )}

            {/* Row: Xuyên Không - Trọng Sinh */}
            {xuyenKhongMovies.length > 0 && (
              <MovieRow
                title="🌀 Xuyên Không & Trọng Sinh"
                subtitle="Chuyển sinh đổi đời, xới tung quá khứ"
                movies={xuyenKhongMovies}
                moreLink="/the-loai/Xuy%C3%AAn%20Kh%C3%B4ng"
              />
            )}

            {/* Row: Hệ Thống - Vả Mặt */}
            {heThongMovies.length > 0 && (
              <MovieRow
                title="🤖 Hệ Thống & Vả Mặt"
                subtitle="Mở hack bá đạo, trả thù sảng khoái"
                movies={heThongMovies}
                moreLink="/the-loai/H%E1%BB%87%20Th%E1%BB%91ng"
              />
            )}

            {/* Row: Mạt Thế - Dị Năng */}
            {matTheMovies.length > 0 && (
              <MovieRow
                title="⚡ Mạt Thế & Đô Thị Dị Năng"
                subtitle="Sinh tồn hậu tận thế, thức tỉnh năng lượng"
                movies={matTheMovies}
                moreLink="/the-loai/M%E1%BA%A1t%20Th%E1%BA%BF"
              />
            )}

            {/* Row: Phim 3D */}
            {phim3DMovies.length > 0 && (
              <MovieRow
                title="🎥 Hoạt Hình 3D Đồ Họa Siêu Thực"
                subtitle="Kỹ xảo visual mãn nhãn, combat chân thực"
                movies={phim3DMovies}
                moreLink="/the-loai/Phim%203D"
              />
            )}
          </div>

          {/* Right Column (1 Col): Top 10 Sidebar */}
          <div className="space-y-6">
            <TopMoviesList movies={topViewed} />

            {/* Static Info Box */}
            <div className="bg-[#14141d] p-5 rounded-2xl border border-[#242436] space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>MẸO XEM PHIM MƯỢT MÃ</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Khi bấm nút <strong>"Xem Ngay"</strong>, bạn sẽ được chuyển sang nền tảng phát chính thức (YouTube, Bilibili, iQiyi...) để xem chuẩn Full HD/4K không giật lag.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Hot Popup Widget */}
      <HotMoviesPopup movies={allMovies} />
    </div>
  );
};
