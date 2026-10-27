/**
 * @file src/components/ContinueWatchingRow.tsx
 * Horizontal row displaying recently watched movies & episodes with 1-click resume
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, History, Trash2, ChevronRight } from 'lucide-react';
import { getWatchHistory, clearWatchHistory } from '../services/storage';
import { WatchHistoryItem } from '../types';
import { getHdImageUrl } from '../services/api';

export const ContinueWatchingRow: React.FC = () => {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  const loadHistory = () => {
    setHistory(getWatchHistory());
  };

  useEffect(() => {
    loadHistory();
    window.addEventListener('tp_storage_updated', loadHistory);
    return () => window.removeEventListener('tp_storage_updated', loadHistory);
  }, []);

  if (history.length === 0) return null;

  return (
    <section className="bg-[#14141e] border border-[#252538] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-[#242436] pb-3">
        <div className="border-l-4 border-[#e50914] pl-3 py-0.5">
          <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
            TIẾP TỤC XEM
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">Tiếp tục theo dõi tập phim đang xem dở</p>
        </div>

        <button
          type="button"
          onClick={clearWatchHistory}
          className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181824] border border-white/5 hover:border-red-500/30 btn-3d"
          title="Xóa lịch sử xem"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Xóa lịch sử</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {history.slice(0, 6).map((item) => (
          <Link
            key={item.slug}
            to={`/phim/${item.slug}?tap=${item.episode}&server=${item.server}`}
            className="group relative bg-[#151522] border border-[#262638] hover:border-red-500 rounded-xl overflow-hidden p-2.5 flex flex-col justify-between transition-all card-3d"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-2">
              <img
                src={getHdImageUrl(item.poster)}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&auto=format&fit=crop&q=80';
                }}
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-1 right-1 bg-black/80 text-amber-300 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">
                Tập {item.episode}
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-gray-200 group-hover:text-red-400 truncate" title={item.title}>
                {item.title}
              </h4>
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                <span className="uppercase text-emerald-400 font-bold">{item.server}</span>
                <span>Tiếp tục &rarr;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
