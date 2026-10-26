/**
 * @file src/pages/BookmarksHistoryPage.tsx
 * Watch History & Saved Bookmarks Page
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Bookmark, Trash2, Play, Film } from 'lucide-react';
import { getWatchHistory, clearWatchHistory, getBookmarks } from '../services/storage';
import { WatchHistoryItem, Movie } from '../types';
import { MovieCard } from '../components/MovieCard';

export const BookmarksHistoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'history' | 'bookmarks'>('history');
  const [history, setHistory] = useState<WatchHistoryItem[]>(getWatchHistory());
  const [bookmarks, setBookmarks] = useState<Movie[]>(getBookmarks());

  const sync = () => {
    setHistory(getWatchHistory());
    setBookmarks(getBookmarks());
  };

  useEffect(() => {
    sync();
    window.addEventListener('tp_storage_updated', sync);
    return () => window.removeEventListener('tp_storage_updated', sync);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f14] text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14141e] p-6 rounded-2xl border border-[#262638] shadow-xl">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              TỦ PHIM CỦA BẠN
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Quản lý tiến độ xem tập dở dang và danh sách các bộ phim đã lưu
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#1b1b28] p-1.5 rounded-xl border border-[#2c2c40]">
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'history' ? 'bg-[#e50914] text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              Lịch Sử Xem ({history.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bookmarks')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'bookmarks' ? 'bg-[#e50914] text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              Yêu Thích ({bookmarks.length})
            </button>
          </div>
        </div>

        {/* Tab 1: History */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                Các tập phim vừa xem gần đây
              </span>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={clearWatchHistory}
                  className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-800/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa toàn bộ lịch sử
                </button>
              )}
            </div>

            {history.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {history.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/phim/${item.slug}?tap=${item.episode}&server=${item.server}`}
                    className="group bg-[#151520] border border-[#262638] hover:border-red-500 rounded-xl overflow-hidden p-3 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-2.5">
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center">
                        <div className="w-9 h-9 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-1 right-1 bg-black/90 text-amber-300 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">
                        Tập {item.episode}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-gray-200 group-hover:text-red-400 truncate">
                        {item.title}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                        <span className="text-emerald-400 uppercase font-bold">
                          {item.server}
                        </span>
                        <span className="text-gray-300">Xem tiếp &rarr;</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[#14141e] rounded-2xl border border-[#242436] space-y-3">
                <History className="w-12 h-12 text-gray-600 mx-auto" />
                <p className="text-gray-300 font-bold">Bạn chưa xem tập phim nào</p>
                <Link
                  to="/"
                  className="inline-block bg-[#e50914] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors"
                >
                  Khám phá phim ngay
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Bookmarks */}
        {activeTab === 'bookmarks' && (
          <div>
            {bookmarks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {bookmarks.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[#14141e] rounded-2xl border border-[#242436] space-y-3">
                <Bookmark className="w-12 h-12 text-gray-600 mx-auto" />
                <p className="text-gray-300 font-bold">Danh sách yêu thích đang trống</p>
                <p className="text-xs text-gray-400">
                  Bấm vào biểu tượng bookmark trên poster bất kỳ phim nào để lưu vào đây!
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
