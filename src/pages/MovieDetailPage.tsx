/**
 * @file src/pages/MovieDetailPage.tsx
 * Cinema-Grade Movie Detail & Streaming Player Page with Zero-Delay Rendering
 */

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Globe,
  Share2,
  Check,
  ArrowLeft,
  Film,
  Sparkles,
  Info,
  Clock,
  Bookmark,
} from 'lucide-react';
import { Movie, Episode } from '../types';
import { getMovieDetailSync, fetchMovieDetail, fetchMovieEpisodes, getHdImageUrl } from '../services/api';
import { getRelatedMovies } from '../../lib/movies';
import { isBookmarked, toggleBookmark } from '../services/storage';
import { VideoPlayer } from '../components/VideoPlayer';
import { GenreTag } from '../components/GenreTag';
import { MovieCard } from '../components/MovieCard';

export const MovieDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Instant synchronous movie initialization (0ms delay!)
  const initialMovie = slug ? getMovieDetailSync(slug) : undefined;
  const [movie, setMovie] = useState<Movie | null>(initialMovie || null);
  const [loadingMovie, setLoadingMovie] = useState(!initialMovie);
  const [loadingEpisodes, setLoadingEpisodes] = useState(!initialMovie?.episodes?.length);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(slug ? isBookmarked(slug) : false);
  const [cinemaMode, setCinemaMode] = useState(false);

  const initialTap = searchParams.get('tap') || undefined;
  const [currentTap, setCurrentTap] = useState<string | undefined>(initialTap);

  // Load / Revalidate movie & episodes
  useEffect(() => {
    let isMounted = true;
    window.scrollTo(0, 0);

    if (!slug) return;

    // 1. Sync check
    const syncData = getMovieDetailSync(slug);
    if (syncData) {
      setMovie(syncData);
      setLoadingMovie(false);
      setBookmarked(isBookmarked(syncData.slug));
      if (syncData.episodes && syncData.episodes.length > 0) {
        setLoadingEpisodes(false);
      }
    }

    // 2. Background fetch episodes or full detail
    if (syncData && (!syncData.episodes || syncData.episodes.length === 0)) {
      setLoadingEpisodes(true);
      fetchMovieEpisodes(slug)
        .then((episodes) => {
          if (isMounted) {
            setMovie((prev) => (prev ? { ...prev, episodes } : null));
            setLoadingEpisodes(false);
          }
        })
        .catch(() => {
          if (isMounted) setLoadingEpisodes(false);
        });
    } else if (!syncData) {
      setLoadingMovie(true);
      fetchMovieDetail(slug)
        .then((data) => {
          if (isMounted) {
            setMovie(data || null);
            setLoadingMovie(false);
            setLoadingEpisodes(false);
            if (data?.slug) {
              setBookmarked(isBookmarked(data.slug));
            }
          }
        })
        .catch(() => {
          if (isMounted) {
            setLoadingMovie(false);
            setLoadingEpisodes(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

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
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loadingMovie && !movie) {
    return (
      <div className="min-h-screen bg-[#0b0b10] text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
        <p className="text-gray-400 font-bold text-xs tracking-wider uppercase">
          Đang chuẩn bị bộ phim...
        </p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0b0b10] text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Film className="w-16 h-16 text-gray-600 animate-bounce" />
        <h1 className="text-2xl font-black">Không tìm thấy bộ phim này!</h1>
        <p className="text-gray-400 text-xs max-w-md">
          Phim có thể đã đổi tên hoặc chưa có trong danh sách phát hành.
        </p>
        <Link
          to="/"
          className="bg-[#e50914] hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-all btn-3d inline-flex items-center gap-2"
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
        cinemaMode ? 'bg-[#040407]' : 'bg-[#0b0b10]'
      }`}
    >
      {/* Top Backdrop Header */}
      {!cinemaMode && (
        <div className="relative w-full h-[280px] sm:h-[360px] md:h-[420px] bg-[#07070a] overflow-hidden">
          <img
            src={getHdImageUrl(movie.backdrop || movie.poster)}
            alt={movie.title}
            className="w-full h-full object-cover object-center filter blur-2xl scale-125 opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b10] via-[#0b0b10]/80 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b10] via-[#0b0b10]/80 to-transparent" />

          {/* Back button */}
          <div className="absolute top-6 left-4 sm:left-8 z-20">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 bg-black/60 hover:bg-[#e50914] text-white text-xs font-bold px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 transition-all btn-3d shadow-xl"
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
            isLoadingEpisodes={loadingEpisodes}
          />
        </div>

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-4">
          
          {/* Left Column: Poster & Quick Meta Info */}
          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#26263b] bg-[#12121c] aspect-[2/3] card-3d">
              <img src={getHdImageUrl(movie.poster)} alt={movie.title} className="w-full h-full object-cover" />
              {movie.isHot && (
                <div className="absolute top-3 left-3 bg-[#e50914] text-white font-black text-[11px] px-2.5 py-1 rounded shadow-lg uppercase tracking-wider">
                  HOT
                </div>
              )}
            </div>

            {/* Quick Badges Box */}
            <div className="bg-[#13131d] p-4 rounded-2xl border border-[#232336] space-y-3 shadow-xl">
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
            </div>

            {/* Bookmark & Share Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleToggleBookmark}
                className={`w-full py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border btn-3d ${
                  bookmarked
                    ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-950'
                    : 'bg-[#181826] hover:bg-[#222234] text-gray-200 border-[#28283c]'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                {bookmarked ? 'Đã lưu' : 'Lưu phim'}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className={`w-full py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border btn-3d ${
                  copied
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-[#181826] hover:bg-[#222234] text-gray-200 border-[#28283c]'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4 text-gray-400" />}
                {copied ? 'Đã copy' : 'Chia sẻ'}
              </button>
            </div>
          </div>

          {/* Right Column: Title & Synopsis */}
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
            <div className="bg-[#13131d] rounded-2xl p-6 border border-[#232336] space-y-3 shadow-xl">
              <h3 className="font-extrabold text-sm sm:text-base text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#20202e] pb-2">
                <Info className="w-4 h-4 text-[#e50914]" />
                TÓM TẮT NỘI DUNG PHIM
              </h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed whitespace-pre-line font-normal">
                {movie.description}
              </p>
            </div>
          </div>
        </div>

        {/* Related Movies */}
        {relatedMovies.length > 0 && (
          <section className="pt-10 border-t border-[#20202e] space-y-6">
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
