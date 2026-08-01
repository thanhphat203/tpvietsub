/**
 * @file src/pages/MovieDetailPage.tsx
 * Detailed view for a single Donghua movie with external platform watch links
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Calendar,
  Globe,
  Share2,
  Check,
  ArrowLeft,
  Tv,
  Film,
  Sparkles,
  Info,
  Tv2,
  Layers,
} from 'lucide-react';
import { getMovieBySlug, getRelatedMovies } from '../../lib/movies';
import { WatchButton } from '../components/WatchButton';
import { GenreTag } from '../components/GenreTag';
import { MovieCard } from '../components/MovieCard';

export const MovieDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [selectedPartIndex, setSelectedPartIndex] = useState(0);

  const movie = slug ? getMovieBySlug(slug) : undefined;
  const relatedMovies = movie ? getRelatedMovies(movie, 6) : [];

  // Scroll to top on slug change & reset selected part index
  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedPartIndex(0);
  }, [slug]);

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0f0f14] text-white flex flex-col items-center justify-center p-6 text-center">
        <Film className="w-16 h-16 text-gray-600 mb-4 animate-bounce" />
        <h1 className="text-2xl font-black mb-2">Không tìm thấy phim này!</h1>
        <p className="text-gray-400 text-sm mb-6 max-w-md">
          Phim có thể đã đổi tên hoặc chưa được cập nhật trong hệ thống dữ liệu.
        </p>
        <Link
          to="/"
          className="bg-[#e50914] hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Về Trang Chủ
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f14] text-gray-100 pb-20">
      
      {/* Top Backdrop Header */}
      <div className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] bg-[#0b0b10] overflow-hidden">
        <img
          src={movie.backdrop || movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover object-center blur-sm scale-105 opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f14] via-[#0f0f14]/70 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f14] via-[#0f0f14]/80 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-6 left-4 sm:left-8 z-20">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 bg-black/60 hover:bg-[#e50914] text-white text-xs font-bold px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 transition-colors shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
        </div>
      </div>

      {/* Main Info Section (Overlapping Backdrop) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 sm:-mt-52 md:-mt-64 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Poster + Action) */}
          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-[#2a2a3b] bg-[#14141e] aspect-[2/3]">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              {movie.isHot && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-orange-500 text-white font-black text-xs px-2.5 py-1 rounded shadow-lg uppercase">
                  🔥 HOT
                </div>
              )}
            </div>

            {/* Quick Meta Info Badges */}
            <div className="bg-[#161622] p-4 rounded-2xl border border-[#262638] space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span className="flex items-center gap-1.5 font-medium text-gray-400">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  Đánh giá
                </span>
                <span className="font-extrabold text-amber-400 text-sm">
                  {movie.rating.toFixed(1)} / 10
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-300">
                <span className="flex items-center gap-1.5 font-medium text-gray-400">
                  <Tv2 className="w-4 h-4 text-sky-400" />
                  Chất lượng
                </span>
                <span className="font-bold font-mono text-sky-400 text-xs bg-sky-950/50 px-2 py-0.5 rounded border border-sky-800/40">
                  Full HD / 4K
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-300">
                <span className="flex items-center gap-1.5 font-medium text-gray-400">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  Năm phát hành
                </span>
                <span className="font-bold text-gray-100">{movie.year}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-300">
                <span className="flex items-center gap-1.5 font-medium text-gray-400">
                  <Globe className="w-4 h-4 text-purple-400" />
                  Quốc gia
                </span>
                <span className="font-bold text-gray-100">{movie.country}</span>
              </div>
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 border ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-[#1e1e2c] hover:bg-[#28283a] text-gray-200 border-[#2e2e42]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  Đã sao chép link phim!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-gray-400" />
                  Chia sẻ phim này
                </>
              )}
            </button>
          </div>

          {/* Right Column (Title, Description, Watch Buttons) */}
          <div className="md:col-span-8 lg:col-span-9 space-y-6 pt-2">
            
            {/* Title Block */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#e50914] text-white font-black text-xs px-3 py-1 rounded-md uppercase tracking-wider shadow-md">
                  {movie.status}
                </span>
                <span className="bg-black/80 backdrop-blur-md text-amber-300 font-bold text-xs px-3 py-1 rounded-md border border-amber-500/30">
                  {movie.episodeInfo}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {movie.title}
              </h1>

              {movie.titleOriginal && (
                <p className="text-base sm:text-lg text-gray-300 font-medium italic">
                  {movie.titleOriginal}
                </p>
              )}
            </div>

            {/* Genre Tags List */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">
                Thể loại:
              </span>
              {movie.genres.map((genre) => (
                <GenreTag key={genre} genre={genre} size="md" />
              ))}
            </div>

            {/* ⭐ MULTI-PART / SEASON SELECTION SECTION (Phần 1, Phần 2, Phần 3, Phần 4...) */}
            {movie.parts && movie.parts.length > 0 && (
              <div className="bg-[#161622] rounded-2xl p-4 sm:p-5 border border-[#2a2a3d] space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#28283a] pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <Layers className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
                      CHỌN PHẦN PHIM (CÁC MÙA PHÁT SÓNG)
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-gray-400 bg-black/40 px-2.5 py-0.5 rounded-md border border-white/5">
                    Tổng: {movie.parts.length} Phần
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  {movie.parts.map((part, index) => {
                    const isSelected = selectedPartIndex === index;
                    return (
                      <button
                        key={part.id || index}
                        type="button"
                        onClick={() => setSelectedPartIndex(index)}
                        className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 border ${
                          isSelected
                            ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white border-red-500 shadow-lg shadow-red-950/70 scale-105'
                            : 'bg-[#12121a] text-gray-300 border-[#28283a] hover:bg-[#202030] hover:text-white hover:border-gray-600'
                        }`}
                      >
                        <span>{part.partName}</span>
                        {part.episodeInfo && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                              isSelected
                                ? 'bg-black/40 text-amber-200'
                                : 'bg-[#1b1b28] text-gray-400'
                            }`}
                          >
                            {part.episodeInfo}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ⭐ WATCH LINKS SECTION */}
            {(() => {
              const currentWatchLinks =
                movie.parts && movie.parts.length > 0
                  ? movie.parts[selectedPartIndex]?.watchLinks || []
                  : movie.watchLinks;

              const currentPartName =
                movie.parts && movie.parts.length > 0
                  ? movie.parts[selectedPartIndex]?.partName
                  : null;

              return (
                <div className="bg-[#161622] rounded-2xl p-6 border-2 border-red-600/30 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-[#2a2a3d] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-red-600/20 text-[#e50914]">
                        <Tv className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                          CHỌN NỀN TẢNG XEM PHIM
                          {currentPartName && (
                            <span className="text-xs font-extrabold text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded-lg font-sans">
                              {currentPartName}
                            </span>
                          )}
                        </h2>
                        <p className="text-xs text-gray-400">
                          Bấm để mở video xem trực tiếp trên nền tảng chính thức (Tab Mới)
                        </p>
                      </div>
                    </div>
                    <span className="hidden sm:inline-flex text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full">
                      Link chuẩn Full HD / 4K
                    </span>
                  </div>

                  {/* External Platform Buttons */}
                  {currentWatchLinks && currentWatchLinks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {currentWatchLinks.map((link, index) => (
                        <WatchButton
                          key={`${link.platform}-${index}`}
                          link={link}
                          movieTitle={
                            currentPartName
                              ? `${movie.title} - ${currentPartName}`
                              : movie.title
                          }
                          size="lg"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400 text-sm">
                      Đang cập nhật nguồn xem cho phần này...
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Description Block */}
            <div className="bg-[#14141d] rounded-2xl p-6 border border-[#242436] space-y-3">
              <h3 className="font-bold text-base text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#242436] pb-2">
                <Info className="w-4 h-4 text-[#e50914]" />
                Nội Dung Phim
              </h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal whitespace-pre-line">
                {movie.description}
              </p>
            </div>

            {/* Disclaimer Box */}
            <div className="bg-[#12121a] p-4 rounded-xl border border-gray-800 text-xs text-gray-400 leading-relaxed italic">
              📌 <strong>Lưu ý:</strong> Website TP VietSub chỉ là cổng tổng hợp thông tin và link dẫn trực tiếp tới các trang phát sóng bản quyền (YouTube, Bilibili, iQiyi, Tencent...). Chúng tôi không tự host hoặc đăng tải bất kỳ tệp tin phương tiện nào.
            </div>

          </div>
        </div>

        {/* Section: Related Movies ("Có thể bạn thích") */}
        {relatedMovies.length > 0 && (
          <section className="mt-16 pt-8 border-t border-[#222232] space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-extrabold text-white uppercase tracking-wider">
                Có Thể Bạn Cùng Thích
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedMovies.map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};
