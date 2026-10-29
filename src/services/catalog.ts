import { Movie } from '../types';
import { transformKKPhimMovie } from './api';

export const countries = { 'Việt Nam': 'viet-nam', 'Hàn Quốc': 'han-quoc', 'Trung Quốc': 'trung-quoc', 'Nhật Bản': 'nhat-ban', 'Âu Mỹ': 'au-my', 'Thái Lan': 'thai-lan' };
export const genres = { 'Hành Động': 'hanh-dong', 'Võ Thuật': 'vo-thuat', 'Tình Cảm': 'tinh-cam', 'Hài Hước': 'hai-huoc', 'Kinh Dị': 'kinh-di', 'Viễn Tưởng': 'vien-tuong', 'Phiêu Lưu': 'phieu-luu', 'Cổ Trang': 'co-trang', 'Hoạt Hình': 'hoat-hinh', 'Chính Kịch': 'chinh-kich', 'Gia Đình': 'gia-dinh', 'Tâm Lý': 'tam-ly', 'Khoa Học': 'khoa-hoc', 'Hình Sự': 'hinh-su', 'Bí Ẩn': 'bi-an', 'Chiến Tranh': 'chien-tranh', 'Tài Liệu': 'tai-lieu', 'Âm Nhạc': 'am-nhac', 'Thể Thao': 'the-thao', 'Thần Thoại': 'than-thoai', 'Kinh Điển': 'kinh-dien' };
export interface CatalogQuery { page: number; country?: string; genre?: string; type?: string; year?: string; sort?: string; collection?: string; }
export interface CatalogResult { movies: Movie[]; totalPages: number; total: number; }
const cache = new Map<string, { value: CatalogResult; time: number }>();
const pending = new Map<string, Promise<CatalogResult>>();
export function positivePage(value: string | null) {
  const n = Number(value); return Number.isSafeInteger(n) && n > 0 ? Math.min(n, 10000) : 1;
}
export function fetchCatalog(q: CatalogQuery): Promise<CatalogResult> {
  if (q.collection === 'blockbusters') return import('../../data/blockbusters.json').then(module => {
    let movies = module.default.map(transformKKPhimMovie);
    if (q.country) movies = movies.filter(m => m.country === q.country);
    if (q.genre) movies = movies.filter(m => m.genres.includes(q.genre!));
    if (q.type) movies = movies.filter(m => m.type === q.type);
    if (q.year) movies = movies.filter(m => m.year === Number(q.year));
    if (q.sort === 'year_desc') movies.sort((a, b) => b.year - a.year);
    return { movies: movies.slice((q.page - 1) * 24, q.page * 24), total: movies.length, totalPages: Math.max(1, Math.ceil(movies.length / 24)) };
  });
  const params = new URLSearchParams({ page: String(q.page), limit: '24', sort_field: q.sort === 'year_desc' ? 'year' : 'modified.time', sort_type: 'desc' });
  if (q.country) params.set('country', countries[q.country] || q.country);
  if (q.year) params.set('year', q.year);
  if (q.genre && q.genre !== 'Chiếu Rạp') params.set('category', genres[q.genre] || q.genre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/\s+/g, '-'));
  const list = q.genre === 'Chiếu Rạp' ? 'phim-chieu-rap' : q.type === 'single' ? 'phim-le' : q.type === 'series' ? 'phim-bo' : q.genre === 'Hoạt Hình' ? 'hoat-hinh' : 'phim-moi';
  const path = `v1/api/danh-sach/${list}?${params}`;
  const hit = cache.get(path);
  if (hit && Date.now() - hit.time < 300000) return Promise.resolve(hit.value);
  if (pending.has(path)) return pending.get(path)!;
  const task = (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_PROXY === 'true' ? '/api/kkphim/' : 'https://phimapi.com/'}${path}`, { signal: controller.signal });
      if (!response.ok) throw new Error(`API HTTP ${response.status}`);
      const json = await response.json();
      if (!Array.isArray(json.data?.items)) throw new Error('Dữ liệu API không hợp lệ');
      const pagination = json.data.params?.pagination;
      const total = Number(pagination?.totalItems) || 0;
      const size = Number(pagination?.totalItemsPerPage) || 24;
      const value = { movies: json.data.items.map(transformKKPhimMovie), total, totalPages: Math.max(1, Math.ceil(total / size)) };
      cache.set(path, { value, time: Date.now() });
      if (cache.size > 40) cache.delete(cache.keys().next().value!);
      return value;
    } finally { clearTimeout(timer); pending.delete(path); }
  })();
  pending.set(path, task); return task;
}
