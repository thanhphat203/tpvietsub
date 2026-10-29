/**
 * @file src/components/VideoPlayer.tsx
 * HLS/embedded player with explicit source errors and bounded startup timeout
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type Hls from 'hls.js';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
  Search,
  Moon,
  Sun,
  ShieldCheck,
  ShieldAlert,
  FastForward,
} from 'lucide-react';
import { episodeServers, sourceIssue, mediaUrl } from '../services/playback';
import { Episode, Movie } from '../types';
import { saveWatchProgress, markEpisodeWatched, getWatchedEpisodes } from '../services/storage';

interface VideoPlayerProps {
  movie: Movie;
  episodes: Episode[];
  currentTap?: string;
  onSelectEpisode: (tap: string) => void;
  cinemaMode: boolean;
  onToggleCinemaMode: () => void;
  isLoadingEpisodes?: boolean;
}

const AUTO_SKIP_KEY = 'tp_player_auto_skip_intro';

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  movie,
  episodes,
  currentTap,
  onSelectEpisode,
  cinemaMode,
  onToggleCinemaMode,
  isLoadingEpisodes = false,
}) => {
  const [selectedServerId, setSelectedServerId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [retry, setRetry] = useState(0);
  const [playbackState, setPlaybackState] = useState('Sẵn sàng');
  const [searchEp, setSearchEp] = useState('');
  const [activeChunk, setActiveChunk] = useState(0);
  const [watchedList, setWatchedList] = useState<string[]>([]);
  const [isSwitching, setIsSwitching] = useState(false);
  const [useNativePlayer, setUseNativePlayer] = useState(true);
  const [preferNativeHls, setPreferNativeHls] = useState(true);
  const [showSkipOverlay, setShowSkipOverlay] = useState(false);
  const [autoSkipIntro, setAutoSkipIntro] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTO_SKIP_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Active episode object
  const activeEpisode = useMemo(() => {
    if (!episodes || episodes.length === 0) return null;
    if (currentTap) {
      const found = episodes.find((e) => e.tap === currentTap);
      if (found) return found;
    }
    return episodes[0];
  }, [episodes, currentTap]);

  const availableServers = useMemo(() => episodeServers(activeEpisode), [activeEpisode]);
  const currentServer = useMemo(() => {
    const selected = availableServers.find(s => s.id === selectedServerId && !sourceIssue(s));
    return selected || availableServers.find(s => !sourceIssue(s)) || null;
  }, [availableServers, selectedServerId]);

  useEffect(() => {
    setSelectedServerId('');
    setUseNativePlayer(true);
    setErrorMessage('');
    setPlaybackState('Sẵn sàng');
  }, [movie.slug, activeEpisode?.tap]);

  const chooseServer = (id: string) => {
    setSelectedServerId(id); setErrorMessage(''); setUseNativePlayer(true);
    setPlaybackState('Đang kết nối'); setRetry(n => n + 1);
  };
  const fail = (message: string) => { setErrorMessage(message); setPlaybackState('Không phát được'); };

  // Sync watched list
  useEffect(() => {
    if (movie.slug) {
      setWatchedList(getWatchedEpisodes(movie.slug));
    }
  }, [movie.slug, activeEpisode]);

  // Auto record history
  useEffect(() => {
    if (activeEpisode && movie.slug) {
      const epTap = activeEpisode.tap;
      markEpisodeWatched(movie.slug, epTap);
      saveWatchProgress({
        slug: movie.slug,
        title: movie.title,
        poster: movie.poster,
        episode: epTap,
        server: currentServer?.id?.includes('tm') ? 'tm' : 'vs',
      });
      setWatchedList(getWatchedEpisodes(movie.slug));
    }
  }, [activeEpisode?.tap, movie.slug, currentServer?.id]);

  // Determine direct m3u8 stream vs embed URL
  const { activeM3u8, activeEmbed } = useMemo(() => {
    if (!currentServer) return { activeM3u8: undefined, activeEmbed: undefined };
    return {
      activeM3u8: mediaUrl(currentServer.m3u8),
      activeEmbed: /\.m3u8(?:[?#]|$)/i.test(currentServer.url) ? undefined : mediaUrl(currentServer.url),
    };
  }, [currentServer]);

  // Setup Hls.js on native <video> when m3u8 is available
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeM3u8 || !useNativePlayer || isLoadingEpisodes || errorMessage) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    setPlaybackState('Đang kết nối');
    let startupTimer = window.setTimeout(() => fail('Nguồn video không phản hồi. Hãy thử lại hoặc chọn nguồn khác đang hoạt động.'), 15000);
    const clearStartup = () => window.clearTimeout(startupTimer);
    video.addEventListener('loadedmetadata', clearStartup);
    const onMetadata = () => {
      video.play().catch(() => {});
      if (autoSkipIntro && video.currentTime < 85) video.currentTime = 85;
    };
    let disposed = false;
    const setup = async () => {
    if (preferNativeHls && video.canPlayType('application/vnd.apple.mpegurl') && (/Apple/.test(navigator.vendor) || /iPhone|iPad|iPod/.test(navigator.userAgent) || !('MediaSource' in window))) {
      video.src = activeM3u8;
      video.addEventListener('loadedmetadata', onMetadata);
    } else {
      const { default: Hls } = await import('hls.js');
      if (disposed) return;
      if (!Hls.isSupported()) { fail('Trình duyệt này không hỗ trợ phát HLS trực tiếp. Có thể chọn trình phát nhúng nếu nguồn cung cấp.'); return; }
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        capLevelToPlayerSize: true,
        startLevel: -1,
        maxBufferLength: 20,
        maxMaxBufferLength: 40,
        maxBufferSize: 30 * 1000 * 1000,
        backBufferLength: 15,
      });
      hlsRef.current = hls;

      hls.loadSource(activeM3u8);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          // Autoplay was prevented by browser policy, user can click play
        });
        // Auto-skip intro if enabled
        if (autoSkipIntro && video.currentTime < 85) {
          video.currentTime = 85;
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          fail('Không tải được video. Nguồn có thể lỗi mạng, TLS, CORS hoặc bị phần mềm bảo vệ chặn.');
        }
      });
    }
    };
    setup().catch(() => { if (!disposed) fail('Không khởi tạo được trình phát. Vui lòng thử lại.'); });

    return () => {
      disposed = true;
      clearStartup();
      video.removeEventListener('loadedmetadata', clearStartup);
      video.removeEventListener('loadedmetadata', onMetadata);
      video.pause();
      video.removeAttribute('src');
      video.load();
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeM3u8, useNativePlayer, activeEpisode?.tap, preferNativeHls, retry, isLoadingEpisodes, errorMessage]);

  // Listen to timeupdate to show/hide the "Skip Intro / Quảng Cáo" overlay button
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      // Show skip overlay during the first 90 seconds (where intro/ads reside)
      setShowSkipOverlay(cur > 1 && cur < 90);
    }
  };

  // Quick skip function
  const skipForwardSeconds = (seconds: number) => {
    if (videoRef.current && useNativePlayer && activeM3u8) {
      videoRef.current.currentTime += seconds;
    }
  };

  const skipIntroPast85 = () => {
    if (videoRef.current && useNativePlayer && activeM3u8) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime, 85);
      setShowSkipOverlay(false);
    }
  };

  const handleToggleAutoSkip = () => {
    const newVal = !autoSkipIntro;
    setAutoSkipIntro(newVal);
    try {
      localStorage.setItem(AUTO_SKIP_KEY, String(newVal));
    } catch {
      // ignore
    }
  };

  // Chunk episodes by 50
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

  // Adjust chunk when episode changes
  useEffect(() => {
    if (activeEpisode && episodes.length > 0) {
      const idx = episodes.findIndex((e) => e.tap === activeEpisode.tap);
      if (idx >= 0) {
        setActiveChunk(Math.floor(idx / chunkSize));
      }
    }
  }, [activeEpisode?.tap, episodes.length]);

  const currentIndex = episodes.findIndex((e) => e.tap === activeEpisode?.tap);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < episodes.length - 1;

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      setIsSwitching(true);
      onSelectEpisode(episodes[currentIndex - 1].tap);
      setTimeout(() => setIsSwitching(false), 200);
    }
  }, [hasPrev, currentIndex, episodes, onSelectEpisode]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      setIsSwitching(true);
      onSelectEpisode(episodes[currentIndex + 1].tap);
      setTimeout(() => setIsSwitching(false), 200);
    }
  }, [hasNext, currentIndex, episodes, onSelectEpisode]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        handleNext();
      } else if (e.key === 'p' || e.key === 'P') {
        handlePrev();
      } else if (e.key === 'c' || e.key === 'C') {
        onToggleCinemaMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onToggleCinemaMode]);

  return (
    <div ref={playerContainerRef} className="space-y-4">
      {/* Top Bar above player */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#13131d] px-4 py-3 rounded-2xl border border-[#232336] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <div>
            <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
              {errorMessage ? 'Không phát được' : playbackState}
            </div>
            <div className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span className="text-[#e50914] drop-shadow-[0_0_8px_rgba(229,9,20,0.5)]">
                Tập {activeEpisode?.tap || '1'}
              </span>
              <span className="text-gray-400 font-normal truncate max-w-xs sm:max-w-md">
                - {movie.title}
              </span>
            </div>
          </div>
        </div>

        {/* Player Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Auto-Skip Intro Ads Toggle */}
          <button
            type="button"
            onClick={handleToggleAutoSkip}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border btn-3d ${
              autoSkipIntro
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/60'
                : 'bg-[#181826] text-gray-400 border-[#28283c]'
            }`}
            title="Tự động tua qua đoạn quảng cáo/giới thiệu đầu video (85s)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tự bỏ intro: {autoSkipIntro ? 'BẬT' : 'TẮT'}</span>
          </button>

          {/* Cinema Mode Toggle */}
          <button
            onClick={onToggleCinemaMode}
            type="button"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border btn-3d ${
              cinemaMode
                ? 'bg-amber-500 text-black border-amber-400 shadow-amber-500/30'
                : 'bg-[#181826] text-gray-300 border-[#28283c] hover:text-white'
            }`}
            title="Bật/Tắt chế độ rạp chiếu (Phím tắt: C)"
          >
            {cinemaMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Rạp Chiếu (C)</span>
          </button>
        </div>
      </div>

      {/* Main Video Screen (16:9 Aspect Ratio) */}
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-[#26263b] group">
        {isLoadingEpisodes ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-black p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
            <p className="text-gray-300 font-bold text-xs tracking-wide">
              Đang kết nối luồng phát video...
            </p>
          </div>
        ) : errorMessage ? (
          <div role="alert" className="w-full h-full flex flex-col items-center justify-center p-6 gap-4 text-center">
            <p className="text-amber-200">{errorMessage}</p>
            <p className="text-gray-400 text-xs">Nguồn: {currentServer ? new URL(currentServer.m3u8 || currentServer.url).hostname : 'Chưa có nguồn khả dụng'}</p>
            <div className="flex gap-3 flex-wrap justify-center">
              <button className="catalog-button" onClick={() => { setErrorMessage(''); setRetry(n => n + 1); }}>Thử lại nguồn này</button>
              {activeEmbed && <button className="catalog-button" onClick={() => { setErrorMessage(''); setUseNativePlayer(false); }}>Dùng trình phát nhúng</button>}
            </div>
          </div>
        ) : activeM3u8 && useNativePlayer ? (
          // 1. Native Ad-Free HTML5 Video Player with Hls.js (Zero Popup / Zero Gambling Ads!)
          <div className="relative w-full h-full bg-black">
            {isSwitching && (
              <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center backdrop-blur-sm">
                <div className="w-8 h-8 rounded-full border-3 border-red-500 border-t-transparent animate-spin" />
              </div>
            )}
            <video
              ref={videoRef}
              controls
              preload="metadata"
              tabIndex={0}
              onEnded={handleNext}
              onPlaying={() => setPlaybackState('Đang phát')}
              onPause={() => setPlaybackState('Tạm dừng')}
              onError={() => { if (!hlsRef.current && preferNativeHls) setPreferNativeHls(false); else fail('Không giải mã được video hoặc không kết nối được nguồn. Hãy chọn nguồn khác.'); }}
              playsInline
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full object-contain bg-black"
            />

            {/* Floating Skip Intro / Skip Ad Button on Video Screen */}
            {showSkipOverlay && (
              <div className="absolute bottom-16 right-4 z-40 animate-fade-in">
                <button
                  type="button"
                  onClick={skipIntroPast85}
                  className="px-4 py-2 rounded-xl bg-black/85 hover:bg-[#e50914] text-white text-xs font-black backdrop-blur-md border border-white/20 hover:border-red-500 shadow-2xl transition-all flex items-center gap-1.5 btn-3d"
                >
                  <FastForward className="w-4 h-4" />
                  Bỏ qua intro (85s)
                </button>
              </div>
            )}
          </div>
        ) : activeEmbed ? (
          // 2. Embedded Player with Strict Sandbox Permissions (Prevents unwanted popup tabs)
          <div className="relative w-full h-full bg-black">
            {isSwitching && (
              <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center backdrop-blur-sm">
                <div className="w-8 h-8 rounded-full border-3 border-red-500 border-t-transparent animate-spin" />
              </div>
            )}
            <iframe
              key={`${currentServer?.id}-${retry}`}
              src={activeEmbed}
              title={`${movie.title} - Tập ${activeEpisode?.tap}`}
              sandbox="allow-scripts allow-same-origin allow-presentation"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              onLoad={() => setPlaybackState('Trình phát nhúng')}
              allowFullScreen
              className="w-full h-full border-0 absolute inset-0"
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-black/95 p-6 text-center space-y-3">
            <p className="text-gray-300 font-bold text-sm">
              {availableServers.some(server => sourceIssue(server)) ? 'Nguồn video hiện bị tạm ngưng hoặc không hợp lệ. Cần nhà cung cấp cập nhật nguồn khác.' : 'API chưa cung cấp nguồn phát hợp lệ cho tập này.'}
            </p>
          </div>
        )}
      </div>

      <div className="bg-[#181825] border border-amber-500/30 rounded-2xl p-4 text-sm text-amber-200" role="note">
        <p>Nếu phần mềm bảo vệ cảnh báo tên miền video, hãy giữ bảo vệ bật. Website không thể xác nhận nguồn an toàn hay gỡ cảnh báo của Avast.</p>
        {availableServers.filter(server => sourceIssue(server)).map(server => <p key={server.id} className="mt-2">{server.name}: {sourceIssue(server)}</p>)}
      </div>

      {/* Control Bar: Server Switch, Skip Controls & Next/Prev */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#13131d] p-3.5 rounded-2xl border border-[#232336] shadow-xl">
        
        {/* Dynamic Server Selectors & Fast Skip Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">
            Server:
          </span>
          {availableServers.map((srv, idx) => {
            const isActive = currentServer?.id === srv.id;
            return (
              <button
                key={srv.id}
                type="button"
                disabled={!!sourceIssue(srv)}
                title={sourceIssue(srv) || srv.name}
                aria-pressed={isActive}
                onClick={() => chooseServer(srv.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border btn-3d ${
                  isActive
                    ? idx === 0
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-950/70 scale-105'
                      : idx === 1
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-lg shadow-blue-950/70 scale-105'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400 shadow-lg shadow-purple-950/70 scale-105'
                    : 'bg-[#181826] text-gray-300 border-[#28283c] hover:bg-[#222234] hover:text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-gray-500'}`} />
                {srv.name} {sourceIssue(srv) ? '(Tạm ngưng)' : srv.m3u8 ? '(HLS)' : '(Nhúng)'}
              </button>
            );
          })}

          {/* Quick Ad-Skip Buttons (Active when playing via native player) */}
          {activeM3u8 && useNativePlayer && (
            <div className="flex items-center gap-1.5 ml-2">
              <button
                type="button"
                onClick={() => skipForwardSeconds(15)}
                className="px-2.5 py-1.5 rounded-lg bg-[#1f1f2e] hover:bg-[#2c2c40] text-gray-200 text-xs font-bold border border-[#2e2e42] transition-colors btn-3d"
                title="Tua qua 15 giây quảng cáo"
              >
                +15s
              </button>
              <button
                type="button"
                onClick={skipIntroPast85}
                className="px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-bold border border-red-800/40 transition-colors btn-3d"
                title="Bỏ qua đoạn mở đầu 85s"
              >
                Qua Intro (85s)
              </button>
            </div>
          )}
        </div>

        {/* Prev / Next Episode Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handlePrev}
            disabled={!hasPrev}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all btn-3d ${
              hasPrev
                ? 'bg-[#1b1b28] text-white hover:bg-[#262638] border-[#303046]'
                : 'bg-[#13131d] text-gray-600 border-gray-800 cursor-not-allowed opacity-40'
            }`}
            title="Tập trước (Phím tắt: P)"
          >
            <ChevronLeft className="w-4 h-4" />
            Tập Trước (P)
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!hasNext}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all btn-3d ${
              hasNext
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white hover:from-red-500 hover:to-amber-500 border-red-500 shadow-lg shadow-red-950/60'
                : 'bg-[#13131d] text-gray-600 border-gray-800 cursor-not-allowed opacity-40'
            }`}
            title="Tập tiếp (Phím tắt: N)"
          >
            Tập Tiếp (N)
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {activeM3u8 && activeEmbed && !errorMessage && <div className="flex flex-wrap gap-3">
        <button className="catalog-button" aria-pressed={useNativePlayer} onClick={() => { setUseNativePlayer(true); setRetry(n => n + 1); }}>Phát HLS trực tiếp</button>
        <button className="catalog-button" aria-pressed={!useNativePlayer} onClick={() => setUseNativePlayer(false)}>Dùng trình phát nhúng</button>
      </div>}
      {/* Episode Navigation Section */}
      <div className="bg-[#13131d] rounded-2xl p-4 sm:p-5 border border-[#232336] space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#20202e] pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
              DANH SÁCH TẬP PHIM ({episodes.length} TẬP)
            </h3>
            <p className="text-xs text-gray-400">Chọn số tập để bắt đầu xem trực tuyến</p>
          </div>

          {/* Jump / Search episode input */}
          <div className="relative w-full sm:w-56">
            <input
              type="text"
              value={searchEp}
              onChange={(e) => setSearchEp(e.target.value)}
              placeholder="Nhập số tập (vd: 50)..."
              className="w-full bg-[#181826] text-white text-xs rounded-xl pl-8 pr-3 py-2 border border-[#28283c] focus:outline-none focus:border-[#e50914] shadow-inner"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Chunk Selector Tabs (if more than 50 episodes) */}
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border btn-3d ${
                    isSelected
                      ? 'bg-[#e50914] text-white border-red-500 shadow-md shadow-red-950/60'
                      : 'bg-[#181826] text-gray-300 border-[#28283c] hover:bg-[#202032] hover:text-white'
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
                onClick={() => {
                  if (!isPlaying) {
                    setIsSwitching(true);
                    onSelectEpisode(ep.tap);
                    setTimeout(() => setIsSwitching(false), 200);
                  }
                }}
                className={`relative py-2.5 px-2 rounded-xl text-xs font-black transition-all duration-150 flex flex-col items-center justify-center gap-0.5 border btn-3d ${
                  isPlaying
                    ? 'bg-gradient-to-br from-red-600 to-amber-600 text-white border-red-400 shadow-lg shadow-red-900/60 scale-105 z-10'
                    : isWatched
                    ? 'bg-[#151c24] text-emerald-300 border-emerald-900/40 hover:bg-[#1c2630] hover:border-emerald-600'
                    : 'bg-[#181826] text-gray-300 border-[#252538] hover:bg-[#202032] hover:text-white hover:border-gray-500'
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
      </div>
    </div>
  );
};
