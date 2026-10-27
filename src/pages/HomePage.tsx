/**
 * @file src/pages/HomePage.tsx
 * Cinema-Grade Homepage Layout with Unified Catalog, Category Quick Hub, Schedule & Top 10
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { HeroSlider } from '../components/HeroSlider';
import { MovieRow } from '../components/MovieRow';
import { MovieCard } from '../components/MovieCard';
import { TopMoviesList } from '../components/TopMoviesList';
import { ScheduleSection } from '../components/ScheduleSection';
import { ContinueWatchingRow } from '../components/ContinueWatchingRow';
import { GenreTag } from '../components/GenreTag';
import {
  getAllMovies,
  getTopViewed,
  getAllAvailableGenres,
  get3DAnimationMovies,
  getAnimeMovies,
  getActionMovies,
  getChineseMovies,
  getKoreanMovies,
  getSingleMovies,
  getSeriesMovies,
  initializeMovies,
} from '../../lib/movies';
import { ChevronRight, Sparkles, ChevronDown } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [allMovies, setAllMovies] = useState(getAllMovies());
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | '3d' | 'anime' | 'action' | 'china' | 'korea' | 'series' | 'single'
  >('all');
  const [categoryVisibleCount, setCategoryVisibleCount] = useState<number>(24);

  useEffect(() => {
    const handleUpdate = () => {
      setAllMovies(getAllMovies());
    };
    window.addEventListener('tp_movies_updated', handleUpdate);
    initializeMovies();
    return () => window.removeEventListener('tp_movies_updated', handleUpdate);
  }, []);

  // Filtered lists by content category (Unified, 0 source branding)
  const hotMovies = useMemo(() => {
    const hot = allMovies.filter((m) => m.isHot || m.views > 700000);
    return hot.length > 0 ? hot.slice(0, 16) : allMovies.slice(0, 16);
  }, [allMovies]);

  const newMovies = useMemo(() => {
    return [...allMovies]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 24);
  }, [allMovies]);

  const topViewed = useMemo(() => {
    return [...allMovies]
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }, [allMovies]);

  const seriesMovies = useMemo(() => {
    return getSeriesMovies().slice(0, 24);
  }, [allMovies]);

  const singleMovies = useMemo(() => {
    return getSingleMovies().slice(0, 24);
  }, [allMovies]);

  const donghua3DMovies = useMemo(() => {
    return get3DAnimationMovies().slice(0, 24);
  }, [allMovies]);

  const animeMovies = useMemo(() => {
    return getAnimeMovies().slice(0, 24);
  }, [allMovies]);

  const actionMovies = useMemo(() => {
    return getActionMovies().slice(0, 24);
  }, [allMovies]);

  const chineseMovies = useMemo(() => {
    return getChineseMovies().slice(0, 24);
  }, [allMovies]);

  const koreanMovies = useMemo(() => {
    return getKoreanMovies().slice(0, 24);
  }, [allMovies]);

  // Genre-specific highlights
  const tuTienMovies = useMemo(() => {
    return allMovies
      .filter((m) => m.genres.some((g) => g.toLowerCase().includes('tu tiên') || g.toLowerCase().includes('võ hiệp')))
      .slice(0, 16);
  }, [allMovies]);

  const luyenCapMovies = useMemo(() => {
    return allMovies
      .filter((m) => m.genres.some((g) => g.toLowerCase().includes('luyện cấp') || g.toLowerCase().includes('tu chân')))
      .slice(0, 16);
  }, [allMovies]);

  const huyenHuyenMovies = useMemo(() => {
    return allMovies
      .filter((m) => m.genres.some((g) => g.toLowerCase().includes('huyền huyễn') || g.toLowerCase().includes('kỳ ảo')))
      .slice(0, 16);
  }, [allMovies]);

  const genres = getAllAvailableGenres();

  // Dynamic category items when user clicks a specific category pill
  const activeCategoryList = useMemo(() => {
    switch (selectedCategory) {
      case '3d':
        return { title: 'Hoạt Hình 3D', movies: get3DAnimationMovies(), link: '/the-loai/Ho%E1%BA%A1t%20H%C3%ACnh' };
      case 'anime':
        return { title: 'Anime Tuyển Chọn', movies: getAnimeMovies(), link: '/the-loai/Anime' };
      case 'action':
        return { title: 'Phim Hành Động', movies: getActionMovies(), link: '/the-loai/H%C3%A0nh%20%C4%90%E1%BB%99ng' };
      case 'china':
        return { title: 'Phim Trung Quốc', movies: getChineseMovies(), link: '/kham-pha?country=Trung+Quốc' };
      case 'korea':
        return { title: 'Phim Hàn Quốc', movies: getKoreanMovies(), link: '/kham-pha?country=Hàn+Quốc' };
      case 'series':
        return { title: 'Phim Bộ Tuyển Chọn', movies: getSeriesMovies(), link: '/phim-bo' };
      case 'single':
        return { title: 'Phim Lẻ Chiếu Rạp', movies: getSingleMovies(), link: '/phim-le' };
      default:
        return null;
    }
  }, [selectedCategory, allMovies, seriesMovies, singleMovies]);

  return (
    <div className="min-h-screen bg-[#0f0f14] text-gray-100 pb-20">
      
      {/* 1. Hero Banner Slider */}
      <HeroSlider movies={hotMovies} />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        
        {/* 2. Unified Category Quick Hub (No Source Names, Content Categories Only) */}
        <section className="bg-[#14141e] p-3.5 sm:p-4 rounded-2xl border border-[#242436] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="border-l-4 border-[#e50914] pl-3 py-0.5">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
              DANH MỤC PHIM TỔNG HỢP
            </h3>
            <p className="text-[11px] text-gray-400">
              Hoạt hình 3D, Anime, Phim hành động, Phim Trung, Phim Hàn...
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'all', label: 'Tất Cả Phim' },
              { id: '3d', label: 'Hoạt Hình 3D' },
              { id: 'anime', label: 'Anime Tuyển Chọn' },
              { id: 'action', label: 'Phim Hành Động' },
              { id: 'china', label: 'Phim Trung Quốc' },
              { id: 'korea', label: 'Phim Hàn Quốc' },
              { id: 'series', label: 'Phim Bộ' },
              { id: 'single', label: 'Phim Lẻ' },
            ].map((tab) => {
              const active = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(tab.id as any);
                    setCategoryVisibleCount(24);
                  }}
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

        {/* 4. Filtered Category Highlight Showcase (When a specific category pill is chosen) */}
        {activeCategoryList && (
          <section className="bg-[#14141e] p-5 sm:p-6 rounded-2xl border border-red-900/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#242436] pb-3">
              <div className="border-l-4 border-[#e50914] pl-3 py-0.5">
                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  CHUYÊN MỤC: {activeCategoryList.title}
                  <span className="text-xs font-mono font-bold bg-red-950/80 text-red-400 border border-red-800/60 px-2 py-0.5 rounded">
                    {activeCategoryList.movies.length} BỘ PHIM
                  </span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Danh sách tuyển chọn theo chuyên mục bạn vừa chọn
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-xl bg-[#1b1b28] border border-[#28283a] transition-colors"
                >
                  Xem toàn bộ danh mục &times;
                </button>
                <Link
                  to={activeCategoryList.link}
                  className="text-xs text-red-400 hover:text-white font-bold flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-800/40 transition-colors"
                >
                  Khám phá thêm &rarr;
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 pt-2">
              {activeCategoryList.movies.slice(0, categoryVisibleCount).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {activeCategoryList.movies.length > categoryVisibleCount && (
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={() => setCategoryVisibleCount((c) => c + 24)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 border border-red-500 shadow-xl shadow-red-950/60 btn-3d transition-all hover:scale-105"
                >
                  <Sparkles className="w-4 h-4" />
                  Xem Thêm 24 Phim ({activeCategoryList.movies.length - categoryVisibleCount} Phim Còn Lại)
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* 5. Quick Genre Matrix Pill Bar */}
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

        {/* 6. Section: Phim Thịnh Hành */}
        <MovieRow
          title="Phim Thịnh Hành"
          subtitle="Top tác phẩm thu hút lượt xem cao nhất trên hệ thống"
          movies={hotMovies}
          moreLink="/bang-xep-hang"
        />

        {/* 7. Section: Lịch Chiếu Trong Tuần (Weekly Air Schedule) */}
        <ScheduleSection movies={allMovies} />

        {/* 8. Section: Mới Cập Nhật */}
        <MovieRow
          title="Mới Cập Nhật"
          subtitle="Tập phim vừa lên sóng vietsub & thuyết minh siêu nét"
          movies={newMovies}
          moreLink="/kham-pha?sort=updated"
        />

        {/* 9. Section: Hoạt Hình 3D Trung Quốc (Donghua 3D) */}
        {donghua3DMovies.length > 0 && (
          <MovieRow
            title="Hoạt Hình 3D Trung Quốc"
            subtitle="Đồ họa 3D đỉnh cao, kỹ xảo mãn nhãn với những trận đại chiến kinh điển"
            movies={donghua3DMovies}
            moreLink="/the-loai/Tu%20Ti%C3%AAn"
          />
        )}

        {/* 10. Section: Anime & Manga Tuyển Chọn */}
        {animeMovies.length > 0 && (
          <MovieRow
            title="Anime & Hoạt Hình Tuyển Chọn"
            subtitle="Thế giới kỳ ảo, chuyển sinh dị giới và hành trình phiêu lưu hấp dẫn"
            movies={animeMovies}
            moreLink="/the-loai/Ho%E1%BA%A1t%20H%C3%ACnh"
          />
        )}

        {/* 11. Section: Phim Hành Động - Võ Thuật */}
        {actionMovies.length > 0 && (
          <MovieRow
            title="Phim Hành Động - Võ Thuật"
            subtitle="Những pha giao đấu nghẹt thở, đao quang kiếm ảnh mãn nhãn"
            movies={actionMovies}
            moreLink="/the-loai/H%C3%A0nh%20%C4%90%E1%BB%99ng"
          />
        )}

        {/* 12. Section: Phim Hàn Quốc & Phim Trung Quốc Tuyển Chọn */}
        {koreanMovies.length > 0 && (
          <MovieRow
            title="Phim Hàn Quốc Tuyển Chọn"
            subtitle="Các bộ phim hấp dẫn từ xứ sở kim chi vietsub sắc nét"
            movies={koreanMovies}
            moreLink="/kham-pha?country=Hàn+Quốc"
          />
        )}

        {chineseMovies.length > 0 && (
          <MovieRow
            title="Phim Trung Quốc Tuyển Chọn"
            subtitle="Phim bộ, phim truyền hình và hoạt hình Trung Quốc đặc sắc"
            movies={chineseMovies}
            moreLink="/kham-pha?country=Trung+Quốc"
          />
        )}

        {/* 13. Phim Bộ vs Phim Lẻ Highlights */}
        <div className="grid grid-cols-1 gap-12">
          {/* Phim Bộ */}
          <MovieRow
            title="Phim Bộ Tuyển Chọn"
            subtitle="Các bộ phim dài tập với hành trình tu luyện và cốt truyện kịch tính"
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

        {/* 14. Main 2-Column Section: Genre Rows + Top 10 Sidebar */}
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
                  Khám phá theo định dạng, thể loại, quốc gia và năm phát hành
                </p>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Hệ thống tổng hợp kho phim phong phú kết hợp công nghệ streaming trực tiếp mượt mà không quảng cáo.
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
