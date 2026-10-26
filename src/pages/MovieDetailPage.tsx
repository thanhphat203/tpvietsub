/**
 * @file src/pages/MovieDetailPage.tsx
 * Cinema-Grade Movie Detail & Streaming Player Page
 */

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
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
  Clock,
  Layers,
  Bookmark,
  ExternalLink,
} from 'lucide-react';
import { Movie, Episode } from '../types';
import { fetchMovieDetail } from '../services/api';
import { getRelatedMovies } from '../../lib/movies';
import { isBookmarked, toggleBookmark } from '../services/storage';
import { VideoPlayer } from '../components/VideoPlayer';
import { GenreTag } from '../components/GenreTag';
import { MovieCard } from '../components/MovieCard';
import { WatchButton } from '../components/WatchButton';

export const MovieDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [cinemaMode, setCinemaMode] = useState(false);
  const [selectedPartIndex, setSelectedPartIndex] = useState(0);

  const initialTap = searchParams.get('tap') || undefined;
  const [currentTap, setCurrentTap] = useState<string | undefined>(initialTap);

  // Load movie & episodes
  useEffect(() => {
    let isMounted = true;
    window.scrollTo(0, 0);

    if (slug) {
      setLoading(true);
      fetchMovieDetail(slug)
        .then((data) => {
          if (isMounted) {
            setMovie(data || null);
            setLoading(false);
            if (data?.slug) {
              setBookmarked(isBookmarked(data.slug));
            }
          }
        })
        .catch((err) => {
          console.error('Error fetching movie detail', err);
          if (isMounted) setLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Sync tap selection with query param
  const handleSelectEpisode = (tap: string) => {
    setCurrentTap(tap);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('tap', tap);
      return p;
    });
  };

  const handleToggleBookmark = () => {
    if (movie) {
      const updated = toggleBookmark(movie);
      setBookmarked(updated);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f14] text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
        <p className="text-gray-400 font-bold text-sm tracking-wide">
          Đang tải dữ liệu và danh sách tập phim...
        </p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0f0f14] text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Film className="w-16 h-16 text-gray-600 animate-bounce" />
        <h1 className="text-2xl font-black">Không tìm thấy bộ phim này!</h1>
        <p className="text-gray-400 text-xs max-w-md">
          Phim có thể đã đổi tên hoặc đang trong quá trình cập nhật link máy chủ.
        </p>
        <Link
          to="/"
          className="bg-[#e50914] hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Về Trang Chủ
        </Link>
      </div>
    );
  }

  const relatedMovies = getRelatedMovies(movie, 6);
  const episodes = movie.episodes || [];

  return (
    <div
      className={`min-h-screen text-gray-100 pb-20 transition-colors duration-500 ${
        cinemaMode ? 'bg-[#050508]' : 'bg-[#0f0f14]'
      }`}
    >
      {/* Top Backdrop Header (Hidden or dimmed in Cinema Mode) */}
      {!cinemaMode && (
        <div className="relative w-full h-[280px] sm:h-[380px] md:h-[440px] bg-[#0b0b10] overflow-hidden">
          <img
            src={movie.backdrop || movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover object-center blur-sm scale-105 opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f14] via-[#0f0f14]/80 to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f14] via-[#0f0f14]/80 to-transparent" />

          {/* Back button */}
          <div className="absolute top-6 left-4 sm:left-8 z-20">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 bg-black/60 hover:bg-[#e50914] text-white text-xs font-bold px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 transition-colors shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 space-y-10 ${
          cinemaMode ? 'pt-6' : '-mt-36 sm:-mt-48 md:-mt-56'
        }`}
      >
        
        {/* Stream Player Area (Theater Section) */}
        <div className="space-y-4">
          <VideoPlayer
            movie={movie}
            episodes={episodes}
            currentTap={currentTap}
            onSelectEpisode={handleSelectEpisode}
            cinemaMode={cinemaMode}
            onToggleCinemaMode={() => setCinemaMode(!cinemaMode)}
          />
        </div>

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-4">
          
          {/* Left Column: Poster & Quick Meta Info */}
          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-[#2a2a3e] bg-[#14141e] aspect-[2/3]">
              <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
              {movie.isHot && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-orange-500 text-white font-black text-xs px-2.5 py-1 rounded shadow-lg uppercase">
                  🔥 HOT
                </div>
              )}
            </div>

            {/* Quick Badges Box */}
            <div className="bg-[#161622] p-4 rounded-2xl border border-[#262638] space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span className="flex items-center gap-1.5 font-medium text-gray-400">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Đánh giá
                </span>
                <span className="font-extrabold text-amber-400 text-sm">
                  {movie.rating.toFixed(1)} / 10
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-300">
                <span className="flex items-center gap-1.5 font-medium text-gray-400">
                  <Film className="w-4 h-4 text-emerald-400" /> Năm chiếu
                </span>
                <span className="font-bold text-gray-100 font-mono">{movie.year}</span>
              </div>

              {movie.airSchedule && (
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span className="flex items-center gap-1.5 font-medium text-gray-400">
                    <Clock className="w-4 h-4 text-sky-400" /> Lịch chiếu
                  </span>
                  <span className="font-bold text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded font-mono">
                    {movie.airSchedule}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-300">
                <span className="flex items-center gap-1.5 font-medium text-gray-400">
                  <Globe className="w-4 h-4 text-purple-400" /> Quốc gia
                </span>
                <span className="font-bold text-gray-100">{movie.country}</span>
              </div>

              {movie.tmdbId && (
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span className="font-medium text-gray-400">TMDB ID</span>
                  <span className="font-mono text-gray-300 text-[11px] bg-black/40 px-2 py-0.5 rounded border border-white/5">
                    {movie.tmdbId}
                  </span>
                </div>
              )}
            </div>

            {/* Bookmark & Share Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleToggleBookmark}
                className={`w-full py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                  bookmarked
                    ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-950'
                    : 'bg-[#1e1e2d] hover:bg-[#28283e] text-gray-200 border-[#2e2e42]'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                {bookmarked ? 'Đã lưu' : 'Lưu phim'}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className={`w-full py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                  copied
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-[#1e1e2d] hover:bg-[#28283e] text-gray-200 border-[#2e2e42]'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4 text-gray-400" />}
                {copied ? 'Đã copy' : 'Chia sẻ'}
              </button>
            </div>
          </div>

          {/* Right Column: Title, Synopsis, External Options */}
          <div className="md:col-span-8 lg:col-span-9 space-y-6">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#e50914] text-white font-black text-xs px-3 py-1 rounded-md uppercase tracking-wider shadow-md">
                  {movie.status}
                </span>
                <span className="bg-black/80 backdrop-blur-md text-amber-300 font-bold text-xs px-3 py-1 rounded-md border border-amber-500/30 font-mono">
                  {movie.episodeInfo || movie.duration}
                </span>
                <span className="bg-emerald-950/80 text-emerald-300 font-bold text-xs px-3 py-1 rounded-md border border-emerald-800/40 font-mono">
                  Full HD Vietsub + TM
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {movie.title}
              </h1>

              {movie.titleOriginal && (
                <p className="text-base sm:text-lg text-gray-400 font-light italic">
                  {movie.titleOriginal}
                </p>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">
                Thể loại:
              </span>
              {movie.genres.map((genre) => (
                <GenreTag key={genre} genre={genre} size="md" />
              ))}
            </div>

            {/* Synopsis */}
            <div className="bg-[#14141d] rounded-2xl p-6 border border-[#242436] space-y-3 shadow-lg">
              <h3 className="font-extrabold text-sm sm:text-base text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#242436] pb-2">
                <Info className="w-4 h-4 text-[#e50914]" />
                TÓM TẮT NỘI DUNG PHIM
              </h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed whitespace-pre-line font-normal">
                {movie.description}
              </p>
            </div>

            {/* Multi-Part / Season Switcher (if available) */}
            {movie.parts && movie.parts.length > 0 && (
              <div className="bg-[#161622] rounded-2xl p-4 sm:p-5 border border-[#2a2a3d] space-y-3">
                <div className="flex items-center justify-between border-b border-[#28283a] pb-2.5">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                      CÁC PHẦN PHIM LIÊN QUAN
                    </h3>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {movie.parts.map((part, index) => (
                    <button
                      key={part.id || index}
                      type="button"
                      onClick={() => setSelectedPartIndex(index)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedPartIndex === index
                          ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white border-red-500 shadow-md'
                          : 'bg-[#12121a] text-gray-300 border-[#28283a] hover:bg-[#202030]'
                      }`}
                    >
                      {part.partName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* External Links Section */}
            {movie.watchLinks && movie.watchLinks.length > 0 && (
              <div className="bg-[#14141e] rounded-2xl p-5 border border-[#242436] space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4 text-red-500" />
                  Nền Tảng Bản Quyền Khác
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {movie.watchLinks.map((link, idx) => (
                    <WatchButton key={idx} link={link} movieTitle={movie.title} size="md" />
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Related Movies */}
        {relatedMovies.length > 0 && (
          <section className="pt-10 border-t border-[#222232] space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                CÓ THỂ BẠN CŨNG THÍCH
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
