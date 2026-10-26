/**
 * @file src/services/api.ts
 * Unified API Client for anisrc.top and api-zophim.blogspot.com
 * Includes NDJSON parsing, CORS proxy fallback, episode scraper fallback, and memory/local caching.
 */

import { Movie, Episode, AnisrcRawMovie } from '../types';
import moviesData from '../../data/movies.json';

// In-memory cache
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Helper to determine if running inside Vite dev server
const isDev = import.meta.env.DEV;

/**
 * Universal safe fetcher with dev proxy & CORS fallbacks
 */
async function fetchSafeText(targetUrl: string, proxyPath?: string): Promise<string> {
  const urlsToTry: string[] = [];

  // In dev, use Vite proxy if path provided
  if (isDev && proxyPath) {
    urlsToTry.push(proxyPath);
  }

  // Direct fetch
  urlsToTry.push(targetUrl);

  // Fallback CORS proxies if direct fetch fails (useful for GitHub Pages)
  urlsToTry.push(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`);
  urlsToTry.push(`https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`);

  let lastError: any = null;
  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, {
        headers: {
          'Accept': '*/*',
        },
      });
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 0 && !text.includes('429 Too Many Requests')) {
          return text;
        }
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error(`Failed to fetch from ${targetUrl}`);
}

/**
 * Parse Newline-Delimited JSON (NDJSON) string safely
 */
function parseNDJSON<T>(text: string): T[] {
  if (!text) return [];
  const lines = text.trim().split('\n');
  const results: T[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.startsWith('{') || !trimmed.endsWith('}')) {
      continue;
    }
    try {
      const obj = JSON.parse(trimmed);
      results.push(obj);
    } catch (e) {
      // skip malformed line
    }
  }

  return results;
}

/**
 * Hash string to deterministic number (for rating, views consistency)
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Convert Anisrc raw item to full Movie model
 */
export function transformRawMovie(raw: AnisrcRawMovie): Movie {
  const hash = hashString(raw.slug || raw.ten_phim);
  const rating = Number((8.2 + (hash % 17) / 10).toFixed(1));
  const views = 50000 + (hash % 1950000);
  const year = parseInt(raw.nam_chieu) || 2024;
  
  // Genres parsing
  const rawGenres = raw.the_loai
    ? raw.the_loai.split(',').map((g) => g.trim()).filter(Boolean)
    : ['Hoạt Hình', 'Trung Quốc'];

  // Identify type: series vs movie
  const isSingle =
    raw.thoi_luong?.toLowerCase().includes('phút') ||
    rawGenres.some((g) => g.toLowerCase().includes('chiếu rạp') || g.toLowerCase().includes('phim lẻ')) ||
    raw.trang_thai?.toLowerCase() === 'full 1 tập';

  const isHot =
    views > 800000 ||
    ['tien-nghich', 'muc-than-ky', 'pham-nhan-tu-tien', 'thon-phe-tinh-khong', 'dau-pha-thuong-khung', 'the-gioi-hoan-my', 'dau-la-dai-luc'].some(
      (s) => raw.slug?.toLowerCase().includes(s)
    );

  const isNew = year >= 2024;

  return {
    id: raw.slug || `movie-${hash}`,
    slug: raw.slug,
    title: raw.ten_phim || 'Chưa Đặt Tên',
    titleOriginal: raw.ten_goc || '',
    poster: raw.poster || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    backdrop: raw.poster || '',
    description: raw.noi_dung || 'Nội dung bộ phim đang được cập nhật.',
    genres: rawGenres,
    country: raw.quoc_gia || 'Trung Quốc',
    year,
    status: raw.trang_thai || 'Đang Cập Nhật',
    episodeInfo: raw.trang_thai || raw.thoi_luong || 'Full HD',
    duration: raw.thoi_luong || '??? Tập',
    rating,
    views,
    updatedAt: new Date(Date.now() - (hash % 14) * 86400000).toISOString().split('T')[0],
    isHot,
    isNew,
    type: isSingle ? 'single' : 'series',
    airSchedule: raw.lich_chieu || '',
    tmdbId: raw.tmdb || '',
    watchLinks: [],
    episodes: [],
  };
}

/**
 * Convert default movies from movies.json as initial fallback data
 */
export function getStaticMovies(): Movie[] {
  return (moviesData as any[]).map((m) => ({
    ...m,
    genres: m.genres || ['Tu Tiên', 'Hoạt Hình'],
    watchLinks: m.watchLinks || [],
    rating: m.rating ?? 8.5,
    views: m.views ?? 120000,
    updatedAt: m.updatedAt || '2026-01-01',
    type: m.type || 'series',
  }));
}

/**
 * GET - Danh sách phim mới cập nhật
 * https://anisrc.top/api/v1/update/{page}
 */
export async function fetchLatestUpdates(page = 1): Promise<Movie[]> {
  const cacheKey = `update_page_${page}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const targetUrl = `https://anisrc.top/api/v1/update/${page}`;
    const proxyPath = `/api/anisrc/api/v1/update/${page}`;
    const text = await fetchSafeText(targetUrl, proxyPath);
    const rawItems = parseNDJSON<AnisrcRawMovie>(text);

    if (rawItems.length > 0) {
      const movies = rawItems.map(transformRawMovie);
      memoryCache.set(cacheKey, { data: movies, timestamp: Date.now() });
      
      // Also cache each movie individually by slug for instant detail load
      movies.forEach((m) => {
        if (m.slug) {
          memoryCache.set(`movie_slug_${m.slug}`, { data: m, timestamp: Date.now() });
        }
      });

      return movies;
    }
  } catch (err) {
    console.warn(`Failed to fetch updates page ${page}, falling back to static movies:`, err);
  }

  // Fallback to static movies if network fails completely
  return getStaticMovies();
}

/**
 * GET - Tìm kiếm phim
 * https://anisrc.top/api/v1/search/{key}/{page}
 */
export async function searchMoviesApi(keyword: string, page = 1): Promise<Movie[]> {
  const trimmedKey = keyword.trim();
  if (!trimmedKey) return [];

  const cacheKey = `search_${trimmedKey.toLowerCase()}_${page}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const encoded = encodeURIComponent(trimmedKey);
    const targetUrl = `https://anisrc.top/api/v1/search/${encoded}/${page}`;
    const proxyPath = `/api/anisrc/api/v1/search/${encoded}/${page}`;
    const text = await fetchSafeText(targetUrl, proxyPath);
    const rawItems = parseNDJSON<AnisrcRawMovie>(text);

    if (rawItems.length > 0) {
      const movies = rawItems.map(transformRawMovie);
      memoryCache.set(cacheKey, { data: movies, timestamp: Date.now() });
      
      movies.forEach((m) => {
        if (m.slug) {
          memoryCache.set(`movie_slug_${m.slug}`, { data: m, timestamp: Date.now() });
        }
      });

      return movies;
    }
  } catch (err) {
    console.warn(`Search API error for "${trimmedKey}":`, err);
  }

  // Client-side fallback search across static movies
  const q = trimmedKey.toLowerCase();
  return getStaticMovies().filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      (m.titleOriginal && m.titleOriginal.toLowerCase().includes(q)) ||
      m.description.toLowerCase().includes(q) ||
      m.genres.some((g) => g.toLowerCase().includes(q))
  );
}

/**
 * Parse episode raw lines directly from api-zophim blogspot HTML
 */
function parseEpisodesFromBlogspot(html: string): Episode[] {
  const match = html.match(/<td[^>]*class=["']ALL["'][^>]*>([\s\S]*?)<\/td>/i);
  if (!match) return [];

  const rawEpisodes = match[1]
    .replace(/<br\s*\/?>/gi, '\n')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const episodes: Episode[] = [];
  for (const line of rawEpisodes) {
    const parts = line.split('|').map((s) => s.trim());
    if (parts.length >= 2) {
      const tap = parts[0];
      const vsId = parts[1];
      const tmId = parts[2];
      episodes.push({
        tap,
        vs: vsId ? `https://ssplay.net/v/${vsId}.html` : undefined,
        tm: tmId ? `https://ssplay.net/v/${tmId}.html` : undefined,
      });
    }
  }

  return episodes;
}

/**
 * GET - Danh sách tập theo phim
 * https://anisrc.top/api/v1/list/{slug}
 * With seamless automatic fallback to https://api-zophim.blogspot.com/2023/01/{slug}.html
 */
export async function fetchMovieEpisodes(slug: string): Promise<Episode[]> {
  if (!slug) return [];

  const cacheKey = `episodes_${slug.toLowerCase()}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS * 2) {
    return cached.data;
  }

  // Method 1: Try anisrc.top/api/v1/list/{slug}
  try {
    const targetUrl = `https://anisrc.top/api/v1/list/${slug}`;
    const proxyPath = `/api/anisrc/api/v1/list/${slug}`;
    const text = await fetchSafeText(targetUrl, proxyPath);

    if (text && !text.includes('error') && !text.includes('Warning')) {
      const parsed = parseNDJSON<Episode>(text);
      if (parsed.length > 0 && parsed[0].tap) {
        memoryCache.set(cacheKey, { data: parsed, timestamp: Date.now() });
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`anisrc.top list error for ${slug}, attempting blogspot fallback...`);
  }

  // Method 2: High-reliability direct parse from api-zophim.blogspot.com
  try {
    const blogspotUrl = `https://api-zophim.blogspot.com/2023/01/${slug}.html`;
    const proxyPath = `/api/zophim/2023/01/${slug}.html`;
    const html = await fetchSafeText(blogspotUrl, proxyPath);
    const episodes = parseEpisodesFromBlogspot(html);

    if (episodes.length > 0) {
      memoryCache.set(cacheKey, { data: episodes, timestamp: Date.now() });
      return episodes;
    }
  } catch (err) {
    console.warn(`api-zophim blogspot fallback failed for ${slug}:`, err);
  }

  return [];
}

/**
 * Get single movie detail by slug (checks cache, searches updates, falls back to static)
 */
export async function fetchMovieDetail(slug: string): Promise<Movie | undefined> {
  if (!slug) return undefined;
  const decoded = decodeURIComponent(slug).toLowerCase().trim();

  // 1. Check memory cache
  const cached = memoryCache.get(`movie_slug_${decoded}`);
  let movie: Movie | undefined = cached ? cached.data : undefined;

  // 2. Check static movies
  if (!movie) {
    movie = getStaticMovies().find((m) => m.slug.toLowerCase() === decoded);
  }

  // 3. Search via API if not found
  if (!movie) {
    const searchResults = await searchMoviesApi(decoded, 1);
    movie = searchResults.find((m) => m.slug.toLowerCase() === decoded) || searchResults[0];
  }

  // 4. Fetch episodes for this movie
  if (movie) {
    try {
      const episodes = await fetchMovieEpisodes(movie.slug);
      if (episodes.length > 0) {
        movie = {
          ...movie,
          episodes,
        };
        memoryCache.set(`movie_slug_${decoded}`, { data: movie, timestamp: Date.now() });
      }
    } catch (e) {
      console.warn('Failed to attach episodes to movie detail', e);
    }
  }

  return movie;
}

/**
 * Multi-page loader to fetch multiple pages of updates for catalog & schedules
 */
export async function fetchAggregatedMovies(maxPages = 3): Promise<Movie[]> {
  const cacheKey = `aggregated_pages_${maxPages}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const pagePromises: Promise<Movie[]>[] = [];
  for (let p = 1; p <= maxPages; p++) {
    pagePromises.push(fetchLatestUpdates(p));
  }

  const results = await Promise.all(pagePromises);
  const combined = results.flat();

  // Deduplicate by slug
  const seen = new Set<string>();
  const uniqueMovies: Movie[] = [];
  for (const m of combined) {
    if (m.slug && !seen.has(m.slug)) {
      seen.add(m.slug);
      uniqueMovies.push(m);
    }
  }

  // Blend with any static movies not in uniqueMovies
  for (const sm of getStaticMovies()) {
    if (!seen.has(sm.slug)) {
      seen.add(sm.slug);
      uniqueMovies.push(sm);
    }
  }

  memoryCache.set(cacheKey, { data: uniqueMovies, timestamp: Date.now() });
  return uniqueMovies;
}
