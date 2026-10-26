/**
 * @file src/components/VideoPlayer.tsx
 * Cinema-Grade Streaming Video Player with Server Switcher, Episode Selector & History Tracking
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Tv,
  RotateCcw,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Check,
  Search,
  Sparkles,
  Volume2,
  Moon,
  Sun,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { Episode, Movie } from '../types';
import { saveWatchProgress, markEpisodeWatched, getWatchedEpisodes } from '../services/storage';

interface VideoPlayerProps {
  movie: Movie;
  episodes: Episode[];
  currentTap?: string;
  onSelectEpisode: (tap: string) => void;
  cinemaMode: boolean;
  onToggleCinemaMode: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  movie,
  episodes,
  currentTap,
  onSelectEpisode,
  cinemaMode,
  onToggleCinemaMode,
}) => {
  const [server, setServer] = useState<'vs' | 'tm'>('vs');
  const [searchEp, setSearchEp] = useState('');
  const [activeChunk, setActiveChunk] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [watchedList, setWatchedList] = useState<string[]>([]);
  const playerRef = useRef<HTMLDivElement>(null);

  // Determine active episode object
  const activeEpisode = useMemo(() => {
    if (!episodes || episodes.length === 0) return null;
    if (currentTap) {
      const found = episodes.find((e) => e.tap === currentTap);
      if (found) return found;
    }
    return episodes[0];
  }, [episodes, currentTap]);

  // Synchronize watched list and history
  useEffect(() => {
    if (movie.slug) {
      setWatchedList(getWatchedEpisodes(movie.slug));
    }
  }, [movie.slug, activeEpisode]);

  // Auto record history when active episode changes
  useEffect(() => {
    if (activeEpisode && movie.slug) {
      const epTap = activeEpisode.tap;
      markEpisodeWatched(movie.slug, epTap);
      saveWatchProgress({
        slug: movie.slug,
        title: movie.title,
        poster: movie.poster,
        episode: epTap,
        server,
      });
      setWatchedList(getWatchedEpisodes(movie.slug));
    }
  }, [activeEpisode?.tap, movie.slug, server]);

  // Determine streaming URL based on selected server
  const streamUrl = useMemo(() => {
    if (!activeEpisode) return '';
    if (server === 'tm' && activeEpisode.tm) {
      return activeEpisode.tm;
    }
    if (activeEpisode.vs) {
      return activeEpisode.vs;
    }
    return activeEpisode.tm || '';
  }, [activeEpisode, server]);

  // Group episodes into chunks of 50 for clean UI
  const chunkSize = 50;
  const totalChunks = Math.ceil((episodes?.length || 0) / chunkSize);

  const displayedEpisodes = useMemo(() => {
    if (!episodes || episodes.length === 0) return [];
    if (searchEp.trim()) {
      const q = searchEp.trim().toLowerCase();
      return episodes.filter((e) => e.tap.toLowerCase().includes(q));
    }
    const start = activeChunk * chunkSize;
    return episodes.slice(start, start + chunkSize);
  }, [episodes, activeChunk, searchEp]);

  // Auto adjust chunk when current episode is selected
  useEffect(() => {
    if (activeEpisode && episodes.length > 0) {
      const idx = episodes.findIndex((e) => e.tap === activeEpisode.tap);
      if (idx >= 0) {
        const chunkIndex = Math.floor(idx / chunkSize);
        setActiveChunk(chunkIndex);
      }
    }
  }, [activeEpisode?.tap, episodes.length]);

  // Next / Prev Episode handlers
  const currentIndex = episodes.findIndex((e) => e.tap === activeEpisode?.tap);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < episodes.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      onSelectEpisode(episodes[currentIndex - 1].tap);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onSelectEpisode(episodes[currentIndex + 1].tap);
    }
  };

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  if (!episodes || episodes.length === 0) {
    return (
      <div className="bg-[#14141e] border border-[#2a2a3e] rounded-2xl p-8 text-center space-y-4">
        <Tv className="w-12 h-12 text-gray-500 mx-auto animate-pulse" />
        <h3 className="text-lg font-bold text-white">Chưa có danh sách tập phát sóng</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          Tập phim đang được tổng hợp từ máy chủ chính thức. Bạn có thể xem tạm các link phát sóng bên dưới.
        </p>
      </div>
    );
  }

  return (
    <div ref={playerRef} className="space-y-4">
      {/* Top Bar above player */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#161622] px-4 py-3 rounded-2xl border border-[#262638]">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <div>
            <div className="text-xs font-mono text-gray-400">ĐANG PHÁT</div>
            <div className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span className="text-[#e50914]">Tập {activeEpisode?.tap}</span>
              <span className="text-gray-400 font-normal truncate max-w-xs sm:max-w-md">
                - {movie.title}
              </span>
            </div>
          </div>
        </div>

        {/* Player Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Cinema Mode Toggle */}
          <button
            onClick={onToggleCinemaMode}
            type="button"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border ${
              cinemaMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-[#1e1e2d] text-gray-300 border-[#2f2f45] hover:text-white'
            }`}
            title="Bật/Tắt chế độ rạp chiếu (Làm tối màn hình xung quanh)"
          >
            {cinemaMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Rạp Chiếu</span>
          </button>

          {/* Refresh stream */}
          <button
            onClick={handleReload}
            type="button"
            className="p-2 rounded-xl bg-[#1e1e2d] hover:bg-[#28283d] text-gray-300 hover:text-white border border-[#2f2f45] transition-colors"
            title="Tải lại trình phát"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Video Screen (16:9 Aspect Ratio Container) */}
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-[#2b2b40] group">
        {streamUrl ? (
          <iframe
            key={iframeKey}
            src={streamUrl}
            title={`${movie.title} - Tập ${activeEpisode?.tap}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0 absolute inset-0"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-black/90 p-6 text-center space-y-3">
            <Tv className="w-12 h-12 text-gray-500" />
            <p className="text-gray-300 font-bold text-sm">
              Không tìm thấy link phát sóng cho server này. Vui lòng chuyển sang Server khác.
            </p>
          </div>
        )}
      </div>

      {/* Control Bar: Server Switch & Next/Prev Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#161622] p-3.5 rounded-2xl border border-[#262638]">
        {/* Server Selectors */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-red-500" /> Server:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setServer('vs')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border ${
                server === 'vs'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-950/60 scale-105'
                  : 'bg-[#1b1b2a] text-gray-300 border-[#2f2f45] hover:bg-[#25253a] hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Server Vietsub
            </button>

            <button
              type="button"
              onClick={() => setServer('tm')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border ${
                server === 'tm'
                  ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-950/60 scale-105'
                  : 'bg-[#1b1b2a] text-gray-300 border-[#2f2f45] hover:bg-[#25253a] hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Server Thuyết Minh
            </button>
          </div>
        </div>

        {/* Prev / Next Episode Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handlePrev}
            disabled={!hasPrev}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
              hasPrev
                ? 'bg-[#1f1f2e] text-white hover:bg-[#2c2c42] border-[#373750]'
                : 'bg-[#161622] text-gray-600 border-gray-800 cursor-not-allowed opacity-50'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Tập Trước
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!hasNext}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
              hasNext
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white hover:from-red-500 hover:to-amber-500 border-red-500 shadow-md shadow-red-950/40'
                : 'bg-[#161622] text-gray-600 border-gray-800 cursor-not-allowed opacity-50'
            }`}
          >
            Tập Tiếp
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Episode Navigation Section */}
      <div className="bg-[#14141e] rounded-2xl p-4 sm:p-5 border border-[#262638] space-y-4">
        {/* Episode Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242436] pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Play className="w-4 h-4 text-[#e50914] fill-current" />
              DANH SÁCH TẬP PHIM ({episodes.length} TẬP)
            </h3>
            <p className="text-xs text-gray-400">Chọn số tập để bắt đầu xem trực tuyến ngay</p>
          </div>

          {/* Jump / Search episode input */}
          <div className="relative w-full sm:w-56">
            <input
              type="text"
              value={searchEp}
              onChange={(e) => setSearchEp(e.target.value)}
              placeholder="Nhập số tập (vd: 25)..."
              className="w-full bg-[#1c1c2a] text-white text-xs rounded-xl pl-8 pr-3 py-2 border border-[#2e2e45] focus:outline-none focus:border-[#e50914]"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Chunk selector tabs (if more than 50 episodes) */}
        {totalChunks > 1 && !searchEp.trim() && (
          <div className="flex flex-wrap gap-2 pt-1">
            {Array.from({ length: totalChunks }).map((_, idx) => {
              const start = idx * chunkSize + 1;
              const end = Math.min((idx + 1) * chunkSize, episodes.length);
              const isSelected = activeChunk === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveChunk(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-[#e50914] text-white border-red-500 shadow-md shadow-red-950/60'
                      : 'bg-[#1c1c2a] text-gray-300 border-[#2c2c40] hover:bg-[#252538] hover:text-white'
                  }`}
                >
                  Tập {start} - {end}
                </button>
              );
            })}
          </div>
        )}

        {/* Episode Buttons Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-[380px] overflow-y-auto pr-1">
          {displayedEpisodes.map((ep) => {
            const isPlaying = ep.tap === activeEpisode?.tap;
            const isWatched = watchedList.includes(ep.tap);

            return (
              <button
                key={ep.tap}
                type="button"
                onClick={() => onSelectEpisode(ep.tap)}
                className={`relative py-2.5 px-2 rounded-xl text-xs font-black transition-all duration-200 flex flex-col items-center justify-center gap-0.5 border ${
                  isPlaying
                    ? 'bg-gradient-to-br from-red-600 to-amber-600 text-white border-red-400 shadow-lg shadow-red-900/60 scale-105 z-10'
                    : isWatched
                    ? 'bg-[#1b222a] text-emerald-300 border-emerald-900/50 hover:bg-[#232b35] hover:border-emerald-600'
                    : 'bg-[#1b1b28] text-gray-300 border-[#28283c] hover:bg-[#27273a] hover:text-white hover:border-gray-500'
                }`}
                title={`Xem Tập ${ep.tap}`}
              >
                <div className="flex items-center gap-1">
                  {isPlaying && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                  <span>Tập {ep.tap}</span>
                </div>

                {isWatched && !isPlaying && (
                  <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-0.5">
                    <Check className="w-2.5 h-2.5" /> Đã xem
                  </span>
                )}
                {isPlaying && (
                  <span className="text-[9px] text-amber-200 font-mono">Đang xem</span>
                )}
              </button>
            );
          })}
        </div>

        {displayedEpisodes.length === 0 && (
          <div className="text-center py-6 text-gray-400 text-xs">
            Không tìm thấy tập nào khớp với từ khóa tìm kiếm.
          </div>
        )}
      </div>
    </div>
  );
};
