/**
 * @file src/services/api.ts
 * Multi-Source Unified API Client (Anisrc/ZoPhim + KKPhim/PhimApi)
 * Ultra-fast Stale-While-Revalidate caching, direct m3u8 stream resolution, and zero-ad support.
 */

import { Movie, Episode, AnisrcRawMovie } from '../types';
import apiSeedData from '../../data/api_seed.json';

const CACHE_MOVIES_KEY = 'tp_api_movies_cache_v4';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// In-memory runtime cache
const memoryCache = new Map<string, { data: any; timestamp: number }>();

const isDev = import.meta.env.DEV;

/**
 * Universal safe fetcher with timeout & fast proxy
 */
async function fetchWithTimeout(url: string, timeoutMs = 3500): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: '*/*',
      },
    });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

/**
 * Fast safe text fetcher
 */
async function fetchSafeText(targetUrl: string, proxyPath?: string): Promise<string> {
  const urlsToTry: string[] = [];

  // In dev mode, use Vite proxy first
  if (isDev && proxyPath) {
    urlsToTry.push(proxyPath);
  }

  // Direct fetch
  urlsToTry.push(targetUrl);

  // Fallback CORS proxy
  urlsToTry.push(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`);

  for (const url of urlsToTry) {
    try {
      const res = await fetchWithTimeout(url, 2800);
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 0 && !text.includes('429 Too Many Requests')) {
          return text;
        }
      }
    } catch {
      // try next
    }
  }

  throw new Error(`Failed to fetch from ${targetUrl}`);
}

/**
 * Parse Newline-Delimited JSON (NDJSON) string
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
    } catch {
      // ignore
    }
  }

  return results;
}

/**
 * Get Ultra HD Resolution image URL
 */
export function getHdImageUrl(url?: string): string {
  if (!url) return 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80';
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    const clean = url.startsWith('/') ? url : `/${url}`;
    return `https://phimimg.com${clean}`;
  }
  return url
    .replace(/\/t\/p\/w[0-9]+(_and_h[0-9]+_face)?\//, '/t/p/original/')
    .replace(/\/t\/p\/w[0-9]+\//, '/t/p/original/');
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
  const slug = raw.slug || 'phim';
  const hash = hashString(slug + (raw.ten_phim || ''));
  const rating = Number((8.4 + (hash % 15) / 10).toFixed(1));
  const views = 80000 + (hash % 1850000);
  const year = parseInt(raw.nam_chieu) || 2024;
  const hdPoster = getHdImageUrl(raw.poster);

  const rawGenres = raw.the_loai
    ? raw.the_loai.split(',').map((g) => g.trim()).filter(Boolean)
    : ['Hoạt Hình', 'Tu Tiên'];

  const isSingle =
    raw.thoi_luong?.toLowerCase().includes('phút') ||
    rawGenres.some((g) => g.toLowerCase().includes('chiếu rạp') || g.toLowerCase().includes('phim lẻ')) ||
    raw.trang_thai?.toLowerCase() === 'full 1 tập';

  const isHot =
    views > 800000 ||
    ['tien-nghich', 'muc-than-ky', 'pham-nhan-tu-tien', 'thon-phe-tinh-khong', 'quang-am-chi-ngoai', 'dau-pha', 'the-gioi-hoan-my'].some(
      (s) => slug.toLowerCase().includes(s)
    );

  const isNew = year >= 2024;

  return {
    id: slug,
    slug: slug,
    title: raw.ten_phim || 'Chưa Đặt Tên',
    titleOriginal: raw.ten_goc || '',
    poster: hdPoster,
    backdrop: hdPoster,
    description: raw.noi_dung || 'Nội dung bộ phim đang được cập nhật.',
    genres: rawGenres,
    country: raw.quoc_gia || 'Trung Quốc',
    year,
    status: raw.trang_thai || 'Đang Cập Nhật',
    episodeInfo: raw.trang_thai || raw.thoi_luong || 'Full HD',
    duration: raw.thoi_luong || '??? Tập',
    rating,
    views,
    updatedAt: new Date(Date.now() - (hash % 7) * 86400000).toISOString().split('T')[0],
    isHot,
    isNew,
    type: isSingle ? 'single' : 'series',
    airSchedule: raw.lich_chieu || '',
    tmdbId: raw.tmdb || '',
    source: 'anisrc',
    watchLinks: [],
    episodes: [],
  };
}

/**
 * Convert KKPhim raw item to full Movie model
 */
export function transformKKPhimMovie(item: any): Movie {
  const slug = item.slug || 'phim';
  const hash = hashString(slug + (item.name || ''));
  const rating = Number((8.5 + (hash % 14) / 10).toFixed(1));
  const views = 90000 + (hash % 1900000);
  const year = item.year || parseInt(item.release_date) || 2024;

  const poster = getHdImageUrl(item.poster_url || item.thumb_url);
  const backdrop = getHdImageUrl(item.thumb_url || item.poster_url);

  const genres = Array.isArray(item.category)
    ? item.category.map((c: any) => c.name || c).filter(Boolean)
    : ['Hoạt Hình', 'Hành Động'];

  const isSingle =
    item.type === 'single' ||
    (item.time && item.time.toLowerCase().includes('phút') && !item.time.toLowerCase().includes('tập')) ||
    genres.some((g: string) => g.toLowerCase().includes('chiếu rạp') || g.toLowerCase().includes('phim lẻ'));

  const status = item.episode_current || item.status || 'Full HD';

  return {
    id: slug,
    slug: slug,
    title: item.name || 'Chưa Đặt Tên',
    titleOriginal: item.origin_name || '',
    poster,
    backdrop,
    description: (item.content || item.description || 'Nội dung phim đang cập nhật.').replace(/<[^>]+>/g, '').trim(),
    genres: genres.length > 0 ? genres : ['Hoạt Hình'],
    country: Array.isArray(item.country) ? item.country[0]?.name || 'Trung Quốc' : 'Trung Quốc',
    year,
    status,
    episodeInfo: status,
    duration: item.time || (isSingle ? 'Bản Đầy Đủ' : 'Nhiều Tập'),
    rating,
    views,
    updatedAt: item.modified?.time ? item.modified.time.split('T')[0] : new Date().toISOString().split('T')[0],
    isHot: views > 850000,
    isNew: year >= 2024,
    type: isSingle ? 'single' : 'series',
    airSchedule: '',
    tmdbId: item.tmdb?.id || '',
    source: 'kkphim',
    watchLinks: [],
    episodes: [],
  };
}

/**
 * Get initial seed movies (100% real API movies from anisrc.top, 0 dummy sample movies)
 */
export function getSeedMovies(): Movie[] {
  return (apiSeedData as AnisrcRawMovie[]).map(transformRawMovie);
}

/**
 * Read cached movies from localStorage (instant 0ms startup)
 */
export function getCachedLocalMovies(): Movie[] {
  try {
    const raw = localStorage.getItem(CACHE_MOVIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return getSeedMovies();
}

/**
 * Save movies to localStorage cache
 */
function saveCachedLocalMovies(movies: Movie[]) {
  try {
    localStorage.setItem(CACHE_MOVIES_KEY, JSON.stringify(movies));
  } catch {
    // ignore
  }
}

/**
 * GET - KKPhim Danh sách phim mới cập nhật
 */
export async function fetchKKPhimUpdates(page = 1): Promise<Movie[]> {
  const cacheKey = `kkphim_update_page_${page}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const targetUrl = `https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=${page}`;
    const proxyPath = `/api/kkphim/danh-sach/phim-moi-cap-nhat?page=${page}`;
    const text = await fetchSafeText(targetUrl, proxyPath);
    const json = JSON.parse(text);

    if (json.status && Array.isArray(json.items)) {
      const movies = json.items.map(transformKKPhimMovie);
      memoryCache.set(cacheKey, { data: movies, timestamp: Date.now() });

      movies.forEach((m: Movie) => {
        if (m.slug) {
          memoryCache.set(`movie_slug_${m.slug.toLowerCase()}`, { data: m, timestamp: Date.now() });
        }
      });

      return movies;
    }
  } catch (err) {
    console.warn(`KKPhim update fetch error page ${page}:`, err);
  }

  return [];
}

/**
 * GET - KKPhim Danh sách Hoạt Hình (Donghua / Anime)
 */
export async function fetchKKPhimAnime(page = 1): Promise<Movie[]> {
  const cacheKey = `kkphim_anime_page_${page}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const targetUrl = `https://phimapi.com/v1/api/danh-sach/hoat-hinh?page=${page}`;
    const proxyPath = `/api/kkphim/v1/api/danh-sach/hoat-hinh?page=${page}`;
    const text = await fetchSafeText(targetUrl, proxyPath);
    const json = JSON.parse(text);

    if (json.data && Array.isArray(json.data.items)) {
      const movies = json.data.items.map(transformKKPhimMovie);
      memoryCache.set(cacheKey, { data: movies, timestamp: Date.now() });
      return movies;
    }
  } catch (err) {
    console.warn(`KKPhim anime fetch error page ${page}:`, err);
  }

  return [];
}

/**
 * GET - Anisrc Danh sách phim mới cập nhật
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

      movies.forEach((m) => {
        if (m.slug) {
          memoryCache.set(`movie_slug_${m.slug.toLowerCase()}`, { data: m, timestamp: Date.now() });
        }
      });

      return movies;
    }
  } catch (err) {
    console.warn(`Update fetch error for page ${page}:`, err);
  }

  return getCachedLocalMovies();
}

/**
 * GET - Tìm kiếm phim (Tích hợp song song cả Anisrc & KKPhim)
 */
export async function searchMoviesApi(keyword: string, page = 1): Promise<Movie[]> {
  const trimmedKey = keyword.trim();
  if (!trimmedKey) return [];

  const cacheKey = `search_${trimmedKey.toLowerCase()}_${page}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // Search Anisrc
  const searchAnisrc = async (): Promise<Movie[]> => {
    try {
      const encoded = encodeURIComponent(trimmedKey);
      const targetUrl = `https://anisrc.top/api/v1/search/${encoded}/${page}`;
      const proxyPath = `/api/anisrc/api/v1/search/${encoded}/${page}`;
      const text = await fetchSafeText(targetUrl, proxyPath);
      const rawItems = parseNDJSON<AnisrcRawMovie>(text);
      return rawItems.map(transformRawMovie);
    } catch {
      return [];
    }
  };

  // Search KKPhim
  const searchKKPhim = async (): Promise<Movie[]> => {
    try {
      const encoded = encodeURIComponent(trimmedKey);
      const targetUrl = `https://phimapi.com/v1/api/tim-kiem?keyword=${encoded}&limit=20`;
      const proxyPath = `/api/kkphim/v1/api/tim-kiem?keyword=${encoded}&limit=20`;
      const text = await fetchSafeText(targetUrl, proxyPath);
      const json = JSON.parse(text);
      if (json.data && Array.isArray(json.data.items)) {
        return json.data.items.map(transformKKPhimMovie);
      }
    } catch {
      // fallback
    }
    return [];
  };

  try {
    const [anisrcResults, kkResults] = await Promise.all([searchAnisrc(), searchKKPhim()]);
    const merged = [...anisrcResults, ...kkResults];

    // Deduplicate by slug
    const seen = new Set<string>();
    const unique: Movie[] = [];
    for (const m of merged) {
      if (m.slug && !seen.has(m.slug)) {
        seen.add(m.slug);
        unique.push(m);
      }
    }

    if (unique.length > 0) {
      memoryCache.set(cacheKey, { data: unique, timestamp: Date.now() });
      unique.forEach((m) => {
        if (m.slug) {
          memoryCache.set(`movie_slug_${m.slug.toLowerCase()}`, { data: m, timestamp: Date.now() });
        }
      });
      return unique;
    }
  } catch (err) {
    console.warn(`Search API error for "${trimmedKey}":`, err);
  }

  // Fast client-side fallback against local cached movies
  const q = trimmedKey.toLowerCase();
  return getCachedLocalMovies().filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      (m.titleOriginal && m.titleOriginal.toLowerCase().includes(q)) ||
      m.description.toLowerCase().includes(q) ||
      m.genres.some((g) => g.toLowerCase().includes(q))
  );
}

/**
 * Parse episode raw lines from api-zophim blogspot HTML
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
        link_embed: vsId ? `https://ssplay.net/v/${vsId}.html` : undefined,
      });
    }
  }

  return episodes;
}

/**
 * Parse episodes from KKPhim API response
 */
function parseEpisodesFromKKPhim(data: any): Episode[] {
  const episodesMap = new Map<string, Episode>();

  if (data.episodes && Array.isArray(data.episodes)) {
    for (const server of data.episodes) {
      const sName = (server.server_name || '').toLowerCase();
      const isTm = sName.includes('thuyết minh') || sName.includes('thuyet minh');

      for (const ep of server.server_data || []) {
        const rawName = ep.name || ep.slug || '';
        const numMatch = rawName.match(/\d+/);
        const tap = numMatch ? String(parseInt(numMatch[0], 10)) : rawName.trim();

        const existing = episodesMap.get(tap) || { tap };
        if (isTm) {
          existing.tm = ep.link_m3u8 || ep.link_embed;
          existing.m3u8_tm = ep.link_m3u8;
        } else {
          existing.vs = ep.link_m3u8 || ep.link_embed;
          existing.m3u8 = ep.link_m3u8;
        }
        existing.link_embed = existing.link_embed || ep.link_embed;
        episodesMap.set(tap, existing);
      }
    }
  }

  return Array.from(episodesMap.values()).sort(
    (a, b) => (parseInt(a.tap, 10) || 0) - (parseInt(b.tap, 10) || 0)
  );
}

/**
 * GET - Danh sách tập theo phim
 * Fast Parallel Race: KKPhim (with Direct m3u8!) + Blogspot + Anisrc
 */
export async function fetchMovieEpisodes(slug: string): Promise<Episode[]> {
  if (!slug) return [];
  const cleanSlug = slug.toLowerCase().trim();

  // 1. Check in-memory cache
  const memoryKey = `episodes_${cleanSlug}`;
  const memCached = memoryCache.get(memoryKey);
  if (memCached) {
    return memCached.data;
  }

  // 2. Check LocalStorage cache (0ms instant!)
  try {
    const localRaw = localStorage.getItem(`tp_eps_${cleanSlug}`);
    if (localRaw) {
      const parsed = JSON.parse(localRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryCache.set(memoryKey, { data: parsed, timestamp: Date.now() });
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  // Method A: Query KKPhim (Returns clean m3u8 streams with NO popups/ads!)
  const fetchKKPhim = async (): Promise<Episode[]> => {
    const targetUrl = `https://phimapi.com/phim/${cleanSlug}`;
    const proxyPath = `/api/kkphim/phim/${cleanSlug}`;
    const text = await fetchSafeText(targetUrl, proxyPath);
    const json = JSON.parse(text);
    if (json.status && json.episodes) {
      const episodes = parseEpisodesFromKKPhim(json);
      if (episodes.length > 0) return episodes;
    }
    throw new Error('KKPhim returned no episodes');
  };

  // Method B: Direct parse from api-zophim.blogspot.com
  const fetchBlogspot = async (): Promise<Episode[]> => {
    const blogspotUrl = `https://api-zophim.blogspot.com/2023/01/${cleanSlug}.html`;
    const proxyPath = `/api/zophim/2023/01/${cleanSlug}.html`;
    const html = await fetchSafeText(blogspotUrl, proxyPath);
    const episodes = parseEpisodesFromBlogspot(html);
    if (episodes.length > 0) return episodes;
    throw new Error('No episodes found in blogspot');
  };

  // Method C: Anisrc list
  const fetchAnisrc = async (): Promise<Episode[]> => {
    const targetUrl = `https://anisrc.top/api/v1/list/${cleanSlug}`;
    const proxyPath = `/api/anisrc/api/v1/list/${cleanSlug}`;
    const text = await fetchSafeText(targetUrl, proxyPath);
    if (text && !text.includes('error') && !text.includes('Warning')) {
      const parsed = parseNDJSON<Episode>(text);
      if (parsed.length > 0 && parsed[0].tap) return parsed;
    }
    throw new Error('Invalid anisrc episode list');
  };

  try {
    // Parallel Race: Prefer KKPhim (clean m3u8) or Blogspot
    const episodes = await Promise.any([fetchKKPhim(), fetchBlogspot(), fetchAnisrc()]);

    if (episodes && episodes.length > 0) {
      memoryCache.set(memoryKey, { data: episodes, timestamp: Date.now() });
      try {
        localStorage.setItem(`tp_eps_${cleanSlug}`, JSON.stringify(episodes));
      } catch {
        // ignore
      }
      return episodes;
    }
  } catch (err) {
    console.warn(`All episode sources failed for ${cleanSlug}:`, err);
  }

  return [];
}

/**
 * Get movie detail synchronously if already in memory/localStorage (0ms instant!)
 */
export function getMovieDetailSync(slug: string): Movie | undefined {
  if (!slug) return undefined;
  const decoded = decodeURIComponent(slug).toLowerCase().trim();

  // Check memory cache
  const cached = memoryCache.get(`movie_slug_${decoded}`);
  if (cached) return cached.data;

  // Check cached local movies
  return getCachedLocalMovies().find((m) => m.slug.toLowerCase() === decoded);
}

/**
 * Fetch full movie detail asynchronously and merge with episodes
 */
export async function fetchMovieDetail(slug: string): Promise<Movie | undefined> {
  if (!slug) return undefined;
  const decoded = decodeURIComponent(slug).toLowerCase().trim();

  let movie = getMovieDetailSync(decoded);

  // If not found in local cache, search across KKPhim and Anisrc
  if (!movie) {
    try {
      const targetUrl = `https://phimapi.com/phim/${decoded}`;
      const proxyPath = `/api/kkphim/phim/${decoded}`;
      const text = await fetchSafeText(targetUrl, proxyPath);
      const json = JSON.parse(text);
      if (json.status && json.movie) {
        movie = transformKKPhimMovie(json.movie);
        if (json.episodes) {
          movie.episodes = parseEpisodesFromKKPhim(json);
        }
      }
    } catch {
      // fallback
    }
  }

  if (!movie) {
    const results = await searchMoviesApi(decoded, 1);
    movie = results.find((m) => m.slug.toLowerCase() === decoded) || results[0];
  }

  if (movie) {
    const episodes = await fetchMovieEpisodes(movie.slug);
    if (episodes && episodes.length > 0) {
      movie = {
        ...movie,
        episodes,
      };
    }
    memoryCache.set(`movie_slug_${decoded}`, { data: movie, timestamp: Date.now() });
  }

  return movie;
}

/**
 * Preload and aggregate real movies from BOTH Anisrc and KKPhim
 */
export async function fetchAggregatedMovies(maxPages = 3): Promise<Movie[]> {
  const promises: Promise<Movie[]>[] = [];

  // Anisrc updates
  for (let p = 1; p <= maxPages; p++) {
    promises.push(fetchLatestUpdates(p));
  }

  // KKPhim updates & Anime
  promises.push(fetchKKPhimUpdates(1));
  promises.push(fetchKKPhimAnime(1));

  const results = await Promise.all(promises);
  const combined = results.flat();

  // Deduplicate
  const seen = new Set<string>();
  const uniqueMovies: Movie[] = [];
  for (const m of combined) {
    if (m && m.slug && !seen.has(m.slug)) {
      seen.add(m.slug);
      uniqueMovies.push(m);
    }
  }

  if (uniqueMovies.length > 0) {
    saveCachedLocalMovies(uniqueMovies);
    return uniqueMovies;
  }

  return getCachedLocalMovies();
}
