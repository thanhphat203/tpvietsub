import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { MovieCard } from '../components/MovieCard';
import { CatalogResult, countries, genres, fetchCatalog, positivePage } from '../services/catalog';

export function CatalogPage({ type = '' }: { type?: string }) {
  const [params, setParams] = useSearchParams();
  const { genre: routeGenre } = useParams();
  const page = positivePage(params.get('page'));
  const country = params.get('country') || '';
  const genre = routeGenre || params.get('genre') || '';
  const selectedType = genre === 'Chiếu Rạp' ? 'single' : type || params.get('type') || '';
  const collection = params.get('collection') || '';
  const year = params.get('year') || '';
  const sort = params.get('sort') || 'updated';
  const [data, setData] = useState<CatalogResult>({ movies: [], totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    fetchCatalog({ page, country, genre, type: selectedType, year, sort, collection })
      .then(result => { if (active) setData(result); })
      .catch(() => { if (active) setError('Chưa tải được danh sách. Vui lòng kiểm tra mạng và thử lại.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, country, genre, selectedType, year, sort, collection, retry]);
  function change(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next); window.scrollTo(0, 0);
  }
  const title = collection === 'blockbusters' ? 'Bom tấn tuyển chọn' : routeGenre || (type === 'single' ? 'Phim lẻ' : type === 'series' ? 'Phim bộ' : 'Khám phá kho phim');
  const select = (label: string, key: string, value: string, options: Record<string, string>) => (
    <label className="catalog-filter">{label}<select value={value} onChange={e => change(key, e.target.value)}>
      <option value="">Tất cả</option>{Object.entries(options).map(([name, val]) => <option key={val} value={val}>{name}</option>)}
    </select></label>
  );
  const first = Math.max(1, Math.min(page - 2, data.totalPages - 4));
  return <div className="catalog-shell">
    <h1>{title}</h1>
    <p className="text-gray-400 my-3">Chọn quốc gia, thể loại và năm phát hành. Mỗi trang hiển thị tối đa 24 phim.</p>
    <nav className="category-links" aria-label="Danh mục phim">
      <Link to="/kham-pha?collection=blockbusters">Bom tấn tuyển chọn</Link><Link to="/phim-le">Phim lẻ</Link><Link to="/phim-bo">Phim bộ</Link>
      {Object.keys(countries).slice(0, 3).map(c => <Link key={c} to={`/kham-pha?country=${encodeURIComponent(c)}`}>Phim {c}</Link>)}
      <Link to="/kham-pha?genre=Chi%E1%BA%BFu+R%E1%BA%A1p">Chiếu rạp</Link>
      <Link to="/the-loai/V%C3%B5%20Thu%E1%BA%ADt">Võ thuật</Link>
    </nav>
    <div className="catalog-filters">
      {select('Quốc gia', 'country', country, Object.fromEntries(Object.keys(countries).map(c => [c, c])))}
      {!routeGenre && select('Thể loại', 'genre', genre, Object.fromEntries([...Object.keys(genres), 'Chiếu Rạp'].map(g => [g, g])))}
      {!type && genre !== 'Chiếu Rạp' && select('Định dạng', 'type', selectedType, { 'Phim lẻ': 'single', 'Phim bộ': 'series' })}
      {select('Năm', 'year', year, Object.fromEntries(Array.from({ length: 40 }, (_, i) => { const y = String(new Date().getFullYear() - i); return [y, y]; })))}
      <label className="catalog-filter">Sắp xếp<select value={sort} onChange={e => change('sort', e.target.value)}><option value="updated">Mới cập nhật</option><option value="year_desc">Năm mới nhất</option></select></label>
    </div>
    <div aria-live="polite" role="status" className="my-5">{loading ? 'Đang tải phim…' : error || `${data.total.toLocaleString('vi-VN')} phim · Trang ${page}/${data.totalPages}`}</div>
    {error ? <button className="catalog-button" onClick={() => setRetry(n => n + 1)}>Thử lại</button> : loading ? <div className="catalog-grid" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <div key={i} className="aspect-[2/3] bg-[#191925] rounded-xl" />)}</div> : <>
      <div className="catalog-grid">{data.movies.map(movie => <MovieCard key={movie.slug} movie={movie} />)}</div>
      {!data.movies.length && <p>Không có phim phù hợp. Hãy đổi bộ lọc hoặc quay lại trang 1.</p>}
      <nav className="catalog-pagination" aria-label="Phân trang">
        <button disabled={page <= 1} onClick={() => change('page', String(page - 1))}>Trước</button>
        {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => first + i).map(n => <button key={n} aria-current={page === n ? 'page' : undefined} onClick={() => change('page', String(n))}>{n}</button>)}
        <button disabled={page >= data.totalPages} onClick={() => change('page', String(page + 1))}>Sau</button>
        <form onSubmit={e => { e.preventDefault(); const value = new FormData(e.currentTarget).get('page') as string; change('page', String(Math.min(data.totalPages, positivePage(value)))); }}><label>Đến trang <input aria-label="Số trang" name="page" type="number" min="1" max={data.totalPages} defaultValue={page} key={page} /></label><button>Đi</button></form>
      </nav>
    </>}
    <p className="text-sm text-gray-400 mt-6">Bom tấn là danh sách biên tập tuyển chọn, xác thực bằng ID TMDB; không phải toàn bộ phim lẻ. Các danh mục khác phân trang theo dữ liệu API.</p>
  </div>;
}
