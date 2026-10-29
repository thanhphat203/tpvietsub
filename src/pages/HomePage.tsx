import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Movie } from '../types';
import { MovieRow } from '../components/MovieRow';
import { ContinueWatchingRow } from '../components/ContinueWatchingRow';
import { fetchCatalog, CatalogQuery } from '../services/catalog';
import { getAllMovies, initializeMovies } from '../../lib/movies';

const sections: { title: string; query: Omit<CatalogQuery, 'page'>; link: string }[] = [
  { title: 'Phim Việt Nam', query: { country: 'Việt Nam' }, link: '/kham-pha?country=Việt+Nam' },
  { title: 'Phim Hàn Quốc', query: { country: 'Hàn Quốc' }, link: '/kham-pha?country=Hàn+Quốc' },
  { title: 'Phim Trung Quốc', query: { country: 'Trung Quốc' }, link: '/kham-pha?country=Trung+Quốc' },
  { title: 'Bom tấn tuyển chọn', query: { collection: 'blockbusters' }, link: '/kham-pha?collection=blockbusters' },
  { title: 'Phim chiếu rạp', query: { genre: 'Chiếu Rạp' }, link: '/kham-pha?genre=Chiếu+Rạp' },
  { title: 'Phim hành động', query: { genre: 'Hành Động' }, link: '/the-loai/Hành%20Động' },
  { title: 'Phim võ thuật', query: { genre: 'Võ Thuật' }, link: '/the-loai/Võ%20Thuật' },
  { title: 'Phim bộ', query: { type: 'series' }, link: '/phim-bo' },
  { title: 'Phim lẻ', query: { type: 'single' }, link: '/phim-le' },
  { title: 'Hoạt hình', query: { genre: 'Hoạt Hình' }, link: '/the-loai/Hoạt%20Hình' },
];

function CatalogRow({ section }: { section: typeof sections[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { setVisible(true); observer.disconnect(); } }, { rootMargin: '150px' });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!visible) return;
    let active = true;
    fetchCatalog({ page: 1, ...section.query }).then(result => { if (active) setMovies(result.movies.slice(0, 12)); }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [visible, section]);
  return <div ref={ref} className="catalog-row">
    {movies.length ? <MovieRow title={section.title} movies={movies} moreLink={section.link} /> : <div className="p-5"><h2 className="text-xl font-bold">{section.title}</h2><p className="text-gray-400 my-4">{error ? 'Chưa tải được danh sách phim.' : visible ? 'Đang tải phim…' : 'Khám phá danh sách phim theo chuyên mục.'}</p><Link className="catalog-button" to={section.link}>Xem tất cả</Link></div>}
  </div>;
}

export const HomePage: React.FC = () => {
  const [movies, setMovies] = useState(() => getAllMovies().slice(0, 12));
  useEffect(() => {
    let active = true;
    initializeMovies().then(data => { if (active) setMovies(data.slice(0, 12)); }).catch(() => {});
    return () => { active = false; };
  }, []);
  return <div className="catalog-shell">
    <section className="home-intro">
      <p className="text-red-400 font-bold tracking-wider">TP VIETSUB</p>
      <h1>Chọn phim hay. Xem theo cách của bạn.</h1>
      <p className="text-gray-300">Phim Việt, Hàn, Trung Quốc, phim bộ, phim lẻ và các thể loại yêu thích.</p>
      <div className="category-links"><Link to="/kham-pha">Khám phá kho phim</Link><Link to="/tim-kiem">Tìm phim</Link></div>
      <p className="tv-help text-sm text-gray-400">Trên TV: dùng phím mũi tên để chọn, OK / Enter để mở. Trong trình phát, dùng điều khiển video của thiết bị.</p>
    </section>
    <nav className="category-links home-categories" aria-label="Chuyên mục">{sections.map(s => <Link key={s.title} to={s.link}>{s.title}</Link>)}</nav>
    <ContinueWatchingRow />
    <MovieRow title="Mới cập nhật" movies={movies} moreLink="/kham-pha" />
    {sections.map(section => <CatalogRow key={section.title} section={section} />)}
  </div>;
};
