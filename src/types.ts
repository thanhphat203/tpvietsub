/**
 * @file src/types.ts
 * Type definitions for Lù Phim Donghua Movie Site
 */

export interface WatchLink {
  platform: string; // e.g. "YouTube", "Bilibili", "iQiyi", "Netflix", "Tencent Video"
  url: string;      // External link to video stream or platform
  quality: string;  // e.g. "Full HD Vietsub", "4K Thuyết Minh"
}

export interface MoviePart {
  id: string;           // e.g. "part-1", "part-2"
  partName: string;     // e.g. "Phần 1", "Phần 2", "Phần 3", "Phần 4 (Mới Nhất)"
  episodeInfo?: string; // e.g. "Full 52 Tập Vietsub"
  watchLinks: WatchLink[];
}

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
  status: string;      // e.g. "Đang cập nhật" or "Full"
  episodeInfo: string;  // e.g. "Tập 87 - 95" or "Full SS3"
  rating: number;      // e.g. 8.8
  views: number;       // e.g. 1250000
  updatedAt: string;   // ISO string e.g. "2026-07-15"
  isHot?: boolean;
  isNew?: boolean;
  watchLinks: WatchLink[];
  parts?: MoviePart[]; // Multi-part support (Phần 1, Phần 2, Phần 3, Phần 4...)
}

export const ALL_GENRES = [
  "Tu Tiên",
  "Xuyên Không",
  "Xuyên Thư",
  "Trọng Sinh",
  "Hệ Thống",
  "Võ Hiệp",
  "Mạt Thế",
  "Đô Thị Dị Năng",
  "Vô Hạn Lưu",
  "Võng Du",
  "Vả Mặt",
  "Nam Chính",
  "Nữ Chính",
  "Nghịch Tập",
  "Học Đường",
  "Hiện Đại",
  "Kinh Dị",
  "Tình Cảm",
  "Hài Hước",
  "Fantasy",
  "Siêu Thực",
  "Phim 2D",
  "Phim 3D"
] as const;

export type Genre = typeof ALL_GENRES[number];
