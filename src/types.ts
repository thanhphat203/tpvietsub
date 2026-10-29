/**
 * @file src/types.ts
 * Type definitions for TP VietSub Donghua Movie Site
 */

export interface WatchLink {
  platform: string; // e.g. "YouTube", "Bilibili", "iQiyi", "Netflix", "Tencent Video"
  url: string;      // External link to video stream or platform
  quality: string;  // e.g. "Full HD Vietsub", "4K Thuyết Minh"
}

export interface MoviePart {
  id: string;           // e.g. "part-1", "part-2"
  partName: string;     // e.g. "Phần 1", "Phần 2", "Phần 3", "Phần 4"
  episodeInfo?: string; // e.g. "Full 52 Tập Vietsub"
  watchLinks: WatchLink[];
}

export interface EpisodeServer {
  id: string;           // e.g. 'vip1', 'vip2', 'tm', 'vip3'
  name: string;         // e.g. 'Server VIP 1 (NguonC)', 'Server VIP 2 (HLS)', 'Server Thuyết Minh'
  url: string;          // stream or embed URL
  m3u8?: string;        // direct m3u8 stream
  isEmbed?: boolean;
}

export interface Episode {
  tap: string;          // e.g. "1", "2", "3", "SP1"
  vs?: string;          // e.g. "https://ssplay.net/v/961119259811110.html"
  tm?: string;          // e.g. "https://ssplay.net/v/530750368204381.html"
  m3u8?: string;        // Direct m3u8 stream (Ad-Free native playback!)
  m3u8_tm?: string;     // Direct m3u8 stream for Thuyết Minh
  link_embed?: string;  // Fallback player embed
  serverName?: string;
  servers?: EpisodeServer[];
}

export interface AnisrcRawMovie {
  slug: string;
  ten_phim: string;
  ten_goc: string;
  poster: string;
  tmdb: string;
  nam_chieu: string;
  trang_thai: string;
  thoi_luong: string;
  quoc_gia: string;
  the_loai: string;
  lich_chieu: string;
  noi_dung: string;
}

export type MovieType = 'series' | 'single' | 'all';

export interface Movie {
  id: string;
  slug: string;
  title: string;
  titleOriginal?: string;
  poster: string;
  backdrop: string;
  description: string;
  genres: string[];
  country: string;
  year: number;
  status: string;         // e.g. "163 VS+TM" or "Full" or "Hoàn Tất"
  episodeInfo: string;    // e.g. "Tập 163" or "??? Tập"
  duration?: string;      // e.g. "??? Tập" or "90 phút"
  rating: number;         // e.g. 8.8
  views: number;          // e.g. 1250000
  updatedAt: string;      // ISO string e.g. "2026-07-15"
  isHot?: boolean;
  isNew?: boolean;
  type?: 'series' | 'single'; // Phim bộ vs Phim lẻ
  airSchedule?: string;   // e.g. "T2", "T3", "CN", "T4,CN"
  tmdbId?: string;
  source?: 'all' | 'anisrc' | 'kkphim' | 'nguonc' | 'phim4k'; // API source identifier
  watchLinks: WatchLink[];
  episodes?: Episode[];
  parts?: MoviePart[];    // Multi-part support
}

export interface WatchHistoryItem {
  slug: string;
  title: string;
  poster: string;
  episode: string;
  server: 'vs' | 'tm';
  updatedAt: number;
}

export const ALL_GENRES = [
  "Tu Tiên",
  "Luyện Cấp",
  "Trùng Sinh",
  "Chuyển Sinh",
  "Huyền Huyễn",
  "Xuyên Không",
  "Hệ Thống",
  "Võ Hiệp",
  "Mạt Thế",
  "Đô Thị",
  "Hiện Đại",
  "Vả Mặt",
  "Hài Hước",
  "Tình Yêu",
  "Tình Cảm",
  "Học Đường",
  "Hành Động",
  "Viễn Tưởng",
  "Cổ Trang",
  "Phiêu Lưu",
  "Phim 3D",
  "Phim 2D",
  "Hoạt Hình"
] as const;

export type Genre = typeof ALL_GENRES[number];

export const SCHEDULE_DAYS = [
  { key: 'all', label: 'Tất Cả Lịch' },
  { key: 'T2', label: 'Thứ Hai', short: 'T2' },
  { key: 'T3', label: 'Thứ Ba', short: 'T3' },
  { key: 'T4', label: 'Thứ Tư', short: 'T4' },
  { key: 'T5', label: 'Thứ Năm', short: 'T5' },
  { key: 'T6', label: 'Thứ Sáu', short: 'T6' },
  { key: 'T7', label: 'Thứ Bảy', short: 'T7' },
  { key: 'CN', label: 'Chủ Nhật', short: 'CN' },
] as const;

export const ALL_COUNTRIES = [
  'all',
  'Trung Quốc',
  'Hàn Quốc',
  'Nhật Bản',
  'Âu Mỹ',
  'Thái Lan',
] as const;

export interface FilterOptions {
  type: MovieType;
  genre: string;
  country?: string;
  year: string;
  status: 'all' | 'ongoing' | 'completed';
  schedule: string;
  sortBy: 'updated' | 'year_desc' | 'rating' | 'views' | 'title';
  page: number;
  source?: 'all' | 'anisrc' | 'kkphim' | 'nguonc' | 'phim4k';
}
