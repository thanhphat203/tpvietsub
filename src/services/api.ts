/**
 * @file src/services/api.ts
 * Multi-Source Unified API Client (Anisrc/ZoPhim + KKPhim/PhimApi)
 * Ultra-fast Stale-While-Revalidate caching, direct m3u8 stream resolution, and zero-ad support.
 */

import { Movie, Episode, AnisrcRawMovie } from '../types';
import startupRaw from '../../data/startup_raw.json';
const unifiedMoviesSeed = startupRaw.map(transformKKPhimMovie);

const CACHE_MOVIES_KEY = 'tp_api_movies_cache_v5';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// In-memory runtime cache
const memoryCache = new Map<string, { data: any; timestamp: number }>();

const isDev = import.meta.env.DEV;

/**
 * Universal safe fetcher with timeout & fast proxy
 */
async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<Response> {
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
const textPending = new Map<string, Promise<string>>();
const textCache = new Map<string, { value: string; time: number }>();
function fetchSafeText(targetUrl: string, proxyPath?: string): Promise<string> {
  const hit = textCache.get(targetUrl);
  if (hit && Date.now() - hit.time < 120000) return Promise.resolve(hit.value);
  const pending = textPending.get(targetUrl);
  if (pending) return pending;
  const task = fetchTextUncached(targetUrl, proxyPath).then(value => {
    textCache.set(targetUrl, { value, time: Date.now() });
    if (textCache.size > 40) textCache.delete(textCache.keys().next().value!);
    return value;
  }).finally(() => textPending.delete(targetUrl));
  textPending.set(targetUrl, task); return task;
}
async function fetchTextUncached(targetUrl: string, proxyPath?: string): Promise<string> {
  const urlsToTry: string[] = [];

  // In dev mode, use Vite proxy first
  if ((isDev || import.meta.env.VITE_API_PROXY === 'true') && proxyPath) {
    urlsToTry.push(proxyPath);
  }

  // Direct fetch
  urlsToTry.push(targetUrl);



  for (const url of urlsToTry) {
    try {
      const res = await fetchWithTimeout(url, 8000);
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
 * Get Ultra HD Resolution image URL (Always returns full accessible HTTP URL)
 */
export function getHdImageUrl(url?: string): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80';
  }
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed.replace(/\/t\/p\/(?:original|w[0-9]+(?:_and_h[0-9]+_face)?)\//, '/t/p/w500/');
  }
  const clean = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `https://phimimg.com${clean}`;
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
  const rating = Number(item.tmdb?.vote_average || item.imdb?.vote_average) || 0;
  const views = Number(item.view) || 0;
  const year = item.year || parseInt(item.release_date) || 2024;

  const poster = getHdImageUrl(item.poster_url || item.thumb_url);
  const backdrop = getHdImageUrl(item.thumb_url || item.poster_url);

  let country = 'Chưa rõ';
  if (Array.isArray(item.country) && item.country.length > 0) {
    country = item.country[0]?.name || item.country[0] || 'Trung Quốc';
  } else if (typeof item.country === 'string' && item.country.trim()) {
    country = item.country.trim();
  }

  const rawCategories = Array.isArray(item.category)
    ? item.category.map((c: any) => c.name || c).filter(Boolean)
    : [];

  const lowerName = (item.name + ' ' + (item.origin_name || '')).toLowerCase();
  const genres = [...rawCategories];
  if (item.type === 'hoathinh' || lowerName.includes('hoạt hình')) {
    if (!genres.includes('Hoạt Hình')) genres.unshift('Hoạt Hình');
    if (country === 'Trung Quốc' && !genres.includes('Hoạt Hình 3D')) {
      genres.push('Hoạt Hình 3D');
    }
  }
  if (lowerName.includes('tu tiên') && !genres.includes('Tu Tiên')) {
    genres.push('Tu Tiên');
  }

  const isSingle = item.type === 'single' || item.tmdb?.type === 'movie';
  if (item.chieurap === true && !genres.includes('Chiếu Rạp')) genres.push('Chiếu Rạp');

  const status = item.episode_current || item.status || 'Full HD';

  return {
    id: slug,
    slug: slug,
    title: item.name || 'Chưa Đặt Tên',
    titleOriginal: item.origin_name || '',
    poster,
    backdrop,
    description: (item.content || item.description || 'Nội dung phim đang cập nhật.').replace(/<[^>]+>/g, '').trim(),
    genres: genres.length > 0 ? genres : [],
    country,
    year,
    status,
    episodeInfo: status,
    duration: item.time || (isSingle ? 'Bản Đầy Đủ' : 'Nhiều Tập'),
    rating,
    views,
    updatedAt: item.modified?.time ? item.modified.time.split('T')[0] : new Date().toISOString().split('T')[0],
    isHot: views > 850000,
    isNew: year >= new Date().getFullYear(),
    type: isSingle ? 'single' : 'series',
    airSchedule: '',
    tmdbId: item.tmdb?.id || '',
    source: 'kkphim',
    watchLinks: [],
    episodes: [],
  };
}

/**
 * Convert NguonC raw item to Movie model
 */
export function transformNguonCMovie(
  item: any,
  defaultType: 'single' | 'series' = 'series',
  defaultGenre = 'Phim Tuyển Chọn'
): Movie {
  const slug = item.slug || 'phim';
  const hash = hashString(slug + (item.name || ''));
  const rating = Number((8.3 + (hash % 16) / 10).toFixed(1));
  const views = 85000 + (hash % 1750000);
  const year = parseInt(item.year) || 2024;

  const poster = getHdImageUrl(item.poster_url || item.thumb_url);
  const backdrop = getHdImageUrl(item.thumb_url || item.poster_url);

  const isSingle =
    defaultType === 'single' ||
    item.total_episodes === 1 ||
    String(item.current_episode || '').toLowerCase().includes('full');

  const genres = [defaultGenre];
  const lower = (item.name + ' ' + (item.original_name || '') + ' ' + (item.description || '')).toLowerCase();

  let country = 'Trung Quốc';
  if (lower.includes('nhật bản') || lower.includes('anime') || lower.includes('manga')) {
    country = 'Nhật Bản';
    genres.push('Anime');
  } else if (lower.includes('hàn quốc') || lower.includes('korea')) {
    country = 'Hàn Quốc';
  } else if (lower.includes('mỹ') || lower.includes('hollywood') || lower.includes('âu mỹ')) {
    country = 'Âu Mỹ';
    genres.push('Hành Động');
  }

  if (lower.includes('tu tiên') || lower.includes('huyền huyễn')) {
    genres.push('Tu Tiên');
    genres.push('Hoạt Hình 3D');
  }
  if (lower.includes('hành động') || lower.includes('võ thuật')) {
    genres.push('Hành Động');
  }
  if (isSingle && !genres.includes('Chiếu Rạp')) {
    genres.push('Chiếu Rạp');
  }

  const status = item.current_episode || (isSingle ? 'Full' : `Tập ${item.total_episodes || '1'}`);

  return {
    id: slug,
    slug,
    title: item.name || 'Chưa Đặt Tên',
    titleOriginal: item.original_name || '',
    poster,
    backdrop,
    description: (item.description || 'Nội dung phim đang cập nhật.').replace(/<[^>]+>/g, '').trim(),
    genres: Array.from(new Set(genres)),
    country,
    year,
    status,
    episodeInfo: status,
    duration: item.time || (isSingle ? 'Bản Đầy Đủ' : `${item.total_episodes || 'Nhiều'} Tập`),
    rating,
    views,
    updatedAt: item.modified ? item.modified.split('T')[0] : new Date().toISOString().split('T')[0],
    isHot: views > 800000,
    isNew: year >= 2024,
    type: isSingle ? 'single' : 'series',
    airSchedule: '',
    tmdbId: item.tmdb?.id ? String(item.tmdb.id) : '',
    source: 'nguonc',
    watchLinks: [],
    episodes: [],
  };
}

/**
 * Convert Phim4K (VSMOV) raw item to Movie model
 */
export function transformPhim4KMovie(
  item: any,
  defaultType: 'single' | 'series' = 'single',
  defaultGenre = 'Phim Tuyển Chọn'
): Movie {
  const slug = item.slug || 'phim';
  const hash = hashString(slug + (item.name || ''));
  const rating = Number((8.5 + (hash % 14) / 10).toFixed(1));
  const views = 110000 + (hash % 1900000);
  const year = parseInt(item.year) || 2024;

  const poster = getHdImageUrl(item.poster_url || item.thumb_url);
  const backdrop = getHdImageUrl(item.thumb_url || item.poster_url);

  const genres = [defaultGenre, '4K Ultra HD'];
  const lower = (item.name + ' ' + (item.origin_name || '')).toLowerCase();

  let country = 'Âu Mỹ';
  if (lower.includes('hàn quốc')) country = 'Hàn Quốc';
  else if (lower.includes('trung quốc')) country = 'Trung Quốc';
  else if (lower.includes('nhật bản') || lower.includes('anime')) {
    country = 'Nhật Bản';
    genres.push('Anime');
  }

  const isSingle = defaultType === 'single';
  if (isSingle) genres.push('Chiếu Rạp');

  return {
    id: slug,
    slug,
    title: item.name || 'Chưa Đặt Tên',
    titleOriginal: item.origin_name || '',
    poster,
    backdrop,
    description: 'Bản phim chuẩn 4K Ultra HD sắc nét, âm thanh sống động.',
    genres: Array.from(new Set(genres)),
    country,
    year,
    status: isSingle ? '4K Full' : '4K Vietsub',
    episodeInfo: isSingle ? '4K Full' : '4K Vietsub',
    duration: isSingle ? 'Bản Đầy Đủ' : 'Nhiều Tập',
    rating,
    views,
    updatedAt: item.modified?.time ? item.modified.time.split('T')[0] : new Date().toISOString().split('T')[0],
    isHot: views > 850000,
    isNew: year >= 2024,
    type: isSingle ? 'single' : 'series',
    airSchedule: '',
    tmdbId: item.tmdb?.id ? String(item.tmdb.id) : '',
    source: 'phim4k',
    watchLinks: [],
    episodes: [],
  };
}

/**
 * Get initial seed movies (100% real unified catalog, 0 broken images, full coverage)
 */
export function getSeedMovies(): Movie[] {
  return (unifiedMoviesSeed as unknown as Movie[]);
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
    const targetUrl = `https://phimapi.com/v1/api/danh-sach/phim-moi?limit=24&page=${page}`;
    const proxyPath = `/api/kkphim/v1/api/danh-sach/phim-moi?limit=24&page=${page}`;
    const text = await fetchSafeText(targetUrl, proxyPath);
    const json = JSON.parse(text);

    if (json.status && Array.isArray(json.data?.items)) {
      const movies = json.data.items.map(transformKKPhimMovie);
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
 * GET - Danh sách phim theo Thể Loại từ API
 */
export async function fetchKKPhimCategory(categorySlug: string, page = 1): Promise<Movie[]> {
  const cacheKey = `category_${categorySlug}_page_${page}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const targetUrl = `https://phimapi.com/v1/api/the-loai/${categorySlug}?page=${page}`;
    const proxyPath = `/api/kkphim/v1/api/the-loai/${categorySlug}?page=${page}`;
    const text = await fetchSafeText(targetUrl, proxyPath);
    const json = JSON.parse(text);

    if (json.data && Array.isArray(json.data.items)) {
      const movies = json.data.items.map(transformKKPhimMovie);
      memoryCache.set(cacheKey, { data: movies, timestamp: Date.now() });
      return movies;
    }
  } catch (err) {
    console.warn(`Category fetch error for ${categorySlug}:`, err);
  }

  return [];
}

/**
 * GET - Danh sách phim theo Quốc Gia từ API
 */
export async function fetchKKPhimCountry(countrySlug: string, page = 1): Promise<Movie[]> {
  const cacheKey = `country_${countrySlug}_page_${page}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const targetUrl = `https://phimapi.com/v1/api/quoc-gia/${countrySlug}?page=${page}`;
    const proxyPath = `/api/kkphim/v1/api/quoc-gia/${countrySlug}?page=${page}`;
    const text = await fetchSafeText(targetUrl, proxyPath);
    const json = JSON.parse(text);

    if (json.data && Array.isArray(json.data.items)) {
      const movies = json.data.items.map(transformKKPhimMovie);
      memoryCache.set(cacheKey, { data: movies, timestamp: Date.now() });
      return movies;
    }
  } catch (err) {
    console.warn(`Country fetch error for ${countrySlug}:`, err);
  }

  return [];
}

/**
 * GET - Danh sách phim theo List (phim-le, phim-bo, hoat-hinh...)
 */
export async function fetchKKPhimList(listSlug: string, page = 1): Promise<Movie[]> {
  const cacheKey = `list_${listSlug}_page_${page}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const targetUrl = `https://phimapi.com/v1/api/danh-sach/${listSlug}?page=${page}`;
    const proxyPath = `/api/kkphim/v1/api/danh-sach/${listSlug}?page=${page}`;
    const text = await fetchSafeText(targetUrl, proxyPath);
    const json = JSON.parse(text);

    if (json.data && Array.isArray(json.data.items)) {
      const movies = json.data.items.map(transformKKPhimMovie);
      memoryCache.set(cacheKey, { data: movies, timestamp: Date.now() });
      return movies;
    }
  } catch (err) {
    console.warn(`List fetch error for ${listSlug}:`, err);
  }

  return [];
}

/**
 * GET - NguonC danh sách phim (phim-moi-cap-nhat, danh-sach/phim-le, danh-sach/phim-bo, danh-sach/hoat-hinh)
 */
export async function fetchNguonCList(catalogPath: string, page = 1): Promise<Movie[]> {
  const cacheKey = `nguonc_${catalogPath}_${page}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const targetUrl = `https://phim.nguonc.com/api/films/${catalogPath}?page=${page}`;
    const proxyPath = `/api/nguonc/api/films/${catalogPath}?page=${page}`;
    const text = await fetchSafeText(targetUrl, proxyPath);
    const json = JSON.parse(text);

    if (json.status === 'success' && Array.isArray(json.items)) {
      const isSingle = catalogPath.includes('phim-le');
      const defaultGenre = catalogPath.includes('hoat-hinh') ? 'Hoạt Hình' : isSingle ? 'Chiếu Rạp' : 'Phim Bộ';
      const movies = json.items.map((it: any) =>
        transformNguonCMovie(it, isSingle ? 'single' : 'series', defaultGenre)
      );
      memoryCache.set(cacheKey, { data: movies, timestamp: Date.now() });
      return movies;
    }
  } catch (err) {
    console.warn(`NguonC list error for ${catalogPath}:`, err);
  }
  return [];
}

/**
 * GET - Phim4K danh sách phim (danh-sach/phim-le, danh-sach/phim-bo, danh-sach/hoat-hinh)
 */
export async function fetchPhim4KList(catalogPath: string, page = 1): Promise<Movie[]> {
  const cacheKey = `phim4k_${catalogPath}_${page}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const targetUrl = `https://vsmov.com/api/${catalogPath}?page=${page}&limit=24`;
    const proxyPath = `/api/phim4k/api/${catalogPath}?page=${page}&limit=24`;
    const text = await fetchSafeText(targetUrl, proxyPath);
    const json = JSON.parse(text);

    const items = json.data?.items || json.items;
    if (Array.isArray(items)) {
      const isSingle = catalogPath.includes('phim-le');
      const defaultGenre = catalogPath.includes('hoat-hinh') ? 'Hoạt Hình' : isSingle ? 'Chiếu Rạp' : 'Phim Bộ';
      const movies = items.map((it: any) =>
        transformPhim4KMovie(it, isSingle ? 'single' : 'series', defaultGenre)
      );
      memoryCache.set(cacheKey, { data: movies, timestamp: Date.now() });
      return movies;
    }
  } catch (err) {
    console.warn(`Phim4K list error for ${catalogPath}:`, err);
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
      const targetUrl = `https://phimapi.com/v1/api/tim-kiem?keyword=${encoded}&limit=24&page=${page}`;
      const proxyPath = `/api/kkphim/v1/api/tim-kiem?keyword=${encoded}&limit=24&page=${page}`;
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

  // Search NguonC
  const searchNguonC = async (): Promise<Movie[]> => {
    try {
      const encoded = encodeURIComponent(trimmedKey);
      const targetUrl = `https://phim.nguonc.com/api/films/search?keyword=${encoded}&page=${page}`;
      const proxyPath = `/api/nguonc/api/films/search?keyword=${encoded}&page=${page}`;
      const text = await fetchSafeText(targetUrl, proxyPath);
      const json = JSON.parse(text);
      if (json.status === 'success' && Array.isArray(json.items)) {
        return json.items.map((it: any) => transformNguonCMovie(it));
      }
    } catch {
      // fallback
    }
    return [];
  };

  // Search Phim4K
  const searchPhim4K = async (): Promise<Movie[]> => {
    try {
      const encoded = encodeURIComponent(trimmedKey);
      const targetUrl = `https://vsmov.com/api/tim-kiem?keyword=${encoded}&page=${page}`;
      const proxyPath = `/api/phim4k/api/tim-kiem?keyword=${encoded}&page=${page}`;
      const text = await fetchSafeText(targetUrl, proxyPath);
      const json = JSON.parse(text);
      const items = json.data?.items || json.items;
      if (Array.isArray(items)) {
        return items.map((it: any) => transformPhim4KMovie(it));
      }
    } catch {
      // fallback
    }
    return [];
  };

  try {
    // Primary source first; query backups only if it returns no results.
    let merged = await searchKKPhim();
    if (!merged.length) merged = await searchAnisrc();
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
  ).slice((page - 1) * 24, page * 24);
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

        const existing: Episode = episodesMap.get(tap) || { tap };
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
 * Parse episodes from NguonC API response
 */
function parseEpisodesFromNguonC(data: any): Episode[] {
  const episodesMap = new Map<string, Episode>();
  const movie = data.movie || data;
  if (movie && Array.isArray(movie.episodes)) {
    for (const server of movie.episodes) {
      const sName = (server.server_name || '').toLowerCase();
      const isTm = sName.includes('thuyết minh') || sName.includes('thuyet minh');
      for (const ep of server.items || server.server_data || []) {
        const rawName = ep.name || ep.slug || '';
        const numMatch = rawName.match(/\d+/);
        const tap = numMatch ? String(parseInt(numMatch[0], 10)) : rawName.trim();
        const existing: Episode = episodesMap.get(tap) || { tap };
        const streamUrl = ep.m3u8 || ep.embed;
        if (isTm) {
          existing.tm = streamUrl;
          if (ep.m3u8) existing.m3u8_tm = ep.m3u8;
        } else {
          existing.vs = streamUrl;
          if (ep.m3u8) existing.m3u8 = ep.m3u8;
        }
        existing.link_embed = existing.link_embed || ep.embed || ep.link_embed;
        episodesMap.set(tap, existing);
      }
    }
  }
  return Array.from(episodesMap.values()).sort(
    (a, b) => (parseInt(a.tap, 10) || 0) - (parseInt(b.tap, 10) || 0)
  );
}

/**
 * Parse episodes from Phim4K (VSMOV) API response
 */
function parseEpisodesFromPhim4K(data: any): Episode[] {
  const episodesMap = new Map<string, Episode>();
  const eps = data.episodes || data.data?.episodes || [];
  for (const server of eps) {
    const sName = (server.server_name || '').toLowerCase();
    const isTm = sName.includes('thuyết minh') || sName.includes('thuyet minh');
    for (const ep of server.server_data || server.items || []) {
      const rawName = ep.name || ep.slug || '';
      const numMatch = rawName.match(/\d+/);
      const tap = numMatch ? String(parseInt(numMatch[0], 10)) : rawName.trim();
      const existing: Episode = episodesMap.get(tap) || { tap };
      const streamUrl = ep.link_m3u8 || ep.link_embed || ep.embed;
      if (isTm) {
        existing.tm = streamUrl;
        if (ep.link_m3u8) existing.m3u8_tm = ep.link_m3u8;
      } else {
        existing.vs = streamUrl;
        if (ep.link_m3u8) existing.m3u8 = ep.link_m3u8;
      }
      existing.link_embed = existing.link_embed || ep.link_embed || ep.embed;
      episodesMap.set(tap, existing);
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
  if (memCached && Date.now() - memCached.timestamp < CACHE_TTL_MS) {
    return memCached.data;
  }

  // 2. Check LocalStorage cache (0ms instant!)
  try {
    const localRaw = localStorage.getItem(`tp_eps_${cleanSlug}`);
    if (localRaw) {
      const entry = JSON.parse(localRaw);
      const parsed = entry.episodes;
      if (Date.now() - entry.timestamp < CACHE_TTL_MS && Array.isArray(parsed) && parsed.length > 0) {
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

  // Method D: Query NguonC
  const fetchNguonC = async (): Promise<Episode[]> => {
    const targetUrl = `https://phim.nguonc.com/api/film/${cleanSlug}`;
    const proxyPath = `/api/nguonc/api/film/${cleanSlug}`;
    const text = await fetchSafeText(targetUrl, proxyPath);
    const json = JSON.parse(text);
    if (json.status === 'success' && json.movie) {
      const episodes = parseEpisodesFromNguonC(json);
      if (episodes.length > 0) return episodes;
    }
    throw new Error('NguonC returned no episodes');
  };

  // Method E: Query Phim4K
  const fetchPhim4K = async (): Promise<Episode[]> => {
    const targetUrl = `https://vsmov.com/api/phim/${cleanSlug}`;
    const proxyPath = `/api/phim4k/api/phim/${cleanSlug}`;
    const text = await fetchSafeText(targetUrl, proxyPath);
    const json = JSON.parse(text);
    if (json) {
      const episodes = parseEpisodesFromPhim4K(json);
      if (episodes.length > 0) return episodes;
    }
    throw new Error('Phim4K returned no episodes');
  };

  try {
    const successfulLists: { provider: string; eps: Episode[] }[] = [];
    // First usable provider wins; slow/dead providers no longer block playback.
    const providers = [
      { provider: 'KKPhim', load: fetchKKPhim },
      { provider: 'Anisrc', load: fetchAnisrc },
      { provider: 'NguonC', load: fetchNguonC },
      { provider: 'Phim4K', load: fetchPhim4K },
      { provider: 'Blogspot', load: fetchBlogspot },
    ];
    for (const source of providers) {
      try {
        const eps = await source.load();
        if (eps.length) { successfulLists.push({ provider: source.provider, eps }); break; }
      } catch { /* next provider */ }
    }

    if (successfulLists.length > 0) {
      // Merge episodes by tap number
      const tapMap = new Map<string, Episode>();

      for (const listObj of successfulLists) {
        for (const ep of listObj.eps) {
          const existing: Episode = tapMap.get(ep.tap) || {
            tap: ep.tap,
            servers: [],
          };
          const currentServers = existing.servers ? [...existing.servers] : [];

          if (listObj.provider === 'NguonC') {
            if (ep.vs || ep.link_embed) {
              currentServers.push({
                id: 'server_nguonc',
                name: 'Server VIP 1 (Không Chặn)',
                url: ep.vs || ep.link_embed || '',
                m3u8: ep.m3u8,
                isEmbed: !ep.m3u8,
              });
            }
          } else if (listObj.provider === 'KKPhim') {
            if (ep.vs || ep.m3u8) {
              const isBlacklisted = (ep.m3u8 || ep.vs || '').includes('kkphimplayer');
              currentServers.push({
                id: 'server_kkphim',
                name: isBlacklisted ? 'Server VIP 2 (HLS)' : 'Server VIP 2 (HLS Siêu Nét)',
                url: ep.vs || ep.m3u8 || '',
                m3u8: ep.m3u8,
                isEmbed: false,
              });
            }
            if (ep.tm || ep.m3u8_tm) {
              currentServers.push({
                id: 'server_tm',
                name: 'Server Thuyết Minh',
                url: ep.tm || ep.m3u8_tm || '',
                m3u8: ep.m3u8_tm,
                isEmbed: false,
              });
            }
          } else if (listObj.provider === 'Anisrc') {
            if (ep.vs) {
              currentServers.push({
                id: 'server_anisrc',
                name: 'Server VIP 3 (Dự Phòng)',
                url: ep.vs,
                isEmbed: true,
              });
            }
          } else if (listObj.provider === 'Phim4K') {
            if (ep.vs || ep.link_embed) {
              currentServers.push({
                id: 'server_phim4k',
                name: 'Server 4K UHD',
                url: ep.vs || ep.link_embed || '',
                m3u8: ep.m3u8,
                isEmbed: !ep.m3u8,
              });
            }
          } else if (listObj.provider === 'Blogspot') {
            if (ep.vs) {
              currentServers.push({
                id: 'server_blogspot',
                name: 'Server VIP Dự Phòng',
                url: ep.vs,
                isEmbed: true,
              });
            }
          }

          // Deduplicate servers by id
          const uniqueServers = currentServers.filter(
            (s, idx, self) => idx === self.findIndex((t) => t.id === s.id)
          );

          // Pick safest default stream (preferring non-kkphimplayer URL if possible)
          const safeServer = uniqueServers.find((s) => !s.url.includes('kkphimplayer')) || uniqueServers[0];
          if (safeServer) {
            existing.vs = safeServer.url;
            existing.m3u8 = safeServer.m3u8;
            existing.link_embed = safeServer.isEmbed ? safeServer.url : existing.link_embed || safeServer.url;
          } else {
            existing.vs = ep.vs || existing.vs;
            existing.m3u8 = ep.m3u8 || existing.m3u8;
            existing.link_embed = ep.link_embed || existing.link_embed;
          }

          if (ep.tm) existing.tm = ep.tm;
          if (ep.m3u8_tm) existing.m3u8_tm = ep.m3u8_tm;

          existing.servers = uniqueServers;
          tapMap.set(ep.tap, existing);
        }
      }

      const mergedEpisodes = Array.from(tapMap.values()).sort(
        (a, b) => (parseInt(a.tap, 10) || 0) - (parseInt(b.tap, 10) || 0)
      );

      if (mergedEpisodes.length > 0) {
        memoryCache.set(memoryKey, { data: mergedEpisodes, timestamp: Date.now() });
        try {
          localStorage.setItem(`tp_eps_${cleanSlug}`, JSON.stringify({ episodes: mergedEpisodes, timestamp: Date.now() }));
        } catch {
          // ignore
        }
        return mergedEpisodes;
      }
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

  // If not found, try NguonC
  if (!movie) {
    try {
      const targetUrl = `https://phim.nguonc.com/api/film/${decoded}`;
      const proxyPath = `/api/nguonc/api/film/${decoded}`;
      const text = await fetchSafeText(targetUrl, proxyPath);
      const json = JSON.parse(text);
      if (json.status === 'success' && json.movie) {
        movie = transformNguonCMovie(json.movie);
        if (json.movie.episodes) {
          movie.episodes = parseEpisodesFromNguonC(json);
        }
      }
    } catch {
      // fallback
    }
  }

  // If not found, try Phim4K
  if (!movie) {
    try {
      const targetUrl = `https://vsmov.com/api/phim/${decoded}`;
      const proxyPath = `/api/phim4k/api/phim/${decoded}`;
      const text = await fetchSafeText(targetUrl, proxyPath);
      const json = JSON.parse(text);
      const rawM = json?.movie || json?.data?.movie;
      if (rawM) {
        movie = transformPhim4KMovie(rawM);
        if (json.episodes || json.data?.episodes) {
          movie.episodes = parseEpisodesFromPhim4K(json);
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
    const episodes = movie.episodes?.length ? movie.episodes : await fetchMovieEpisodes(movie.slug);
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
 * Preload and aggregate real movies from ALL Providers (KKPhim + NguonC + Phim4K + Anisrc)
 */
export async function fetchAggregatedMovies(_maxPages = 1): Promise<Movie[]> {
  // Catalog pagination loads other pages on demand; startup makes just one request.
  const movies = await fetchKKPhimUpdates(1);
  if (movies.length) saveCachedLocalMovies(movies);
  return movies.length ? movies : getCachedLocalMovies();
}
