/**
 * @file src/components/WatchButton.tsx
 * CTA button opening external streaming links in a new tab
 */

import React from 'react';
import { ExternalLink, Play, Tv, Youtube } from 'lucide-react';
import { WatchLink } from '../types';

interface WatchButtonProps {
  link: WatchLink;
  movieTitle: string;
  size?: 'md' | 'lg';
}

export const WatchButton: React.FC<WatchButtonProps> = ({
  link,
  movieTitle,
  size = 'lg',
}) => {
  const getPlatformStyle = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('youtube')) {
      return {
        bg: 'bg-red-600 hover:bg-red-700 text-white border-red-500',
        icon: <Youtube className="w-5 h-5" />,
      };
    }
    if (p.includes('bilibili')) {
      return {
        bg: 'bg-sky-500 hover:bg-sky-600 text-white border-sky-400',
        icon: <Tv className="w-5 h-5" />,
      };
    }
    if (p.includes('iqiyi')) {
      return {
        bg: 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500',
        icon: <Play className="w-5 h-5 fill-current" />,
      };
    }
    if (p.includes('tencent') || p.includes('qq')) {
      return {
        bg: 'bg-amber-600 hover:bg-amber-700 text-white border-amber-500',
        icon: <Play className="w-5 h-5 fill-current" />,
      };
    }
    if (p.includes('netflix')) {
      return {
        bg: 'bg-stone-900 hover:bg-black text-red-500 border-red-600',
        icon: <Play className="w-5 h-5 fill-current text-red-500" />,
      };
    }
    // Default fallback
    return {
      bg: 'bg-[#e50914] hover:bg-[#c10711] text-white border-[#e50914]',
      icon: <ExternalLink className="w-5 h-5" />,
    };
  };

  const style = getPlatformStyle(link.platform);

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      title={`Xem ${movieTitle} trên ${link.platform}`}
      className={`inline-flex items-center justify-between gap-3 px-5 py-3.5 rounded-xl font-bold transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg border ${
        style.bg
      } ${size === 'lg' ? 'w-full sm:w-auto text-base' : 'text-sm px-4 py-2.5'}`}
    >
      <div className="flex items-center gap-2.5">
        {style.icon}
        <div className="text-left leading-tight">
          <div className="text-xs font-normal opacity-90 uppercase tracking-wider">
            Xem trên {link.platform}
          </div>
          <div className="font-extrabold text-sm">{link.quality}</div>
        </div>
      </div>
      <ExternalLink className="w-4 h-4 opacity-75 shrink-0" />
    </a>
  );
};
