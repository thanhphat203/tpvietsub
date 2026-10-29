import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => <footer className="bg-[#0a0a0e] border-t border-[#252538] text-gray-400 text-sm">
  <div className="catalog-shell grid grid-cols-1 md:grid-cols-3 gap-6">
    <div><Link to="/" className="text-white text-xl font-bold">TP VIETSUB</Link><p className="mt-3">Khám phá phim Việt Nam, Hàn Quốc, Trung Quốc, điện ảnh và phim dài tập theo chuyên mục.</p></div>
    <nav aria-label="Khám phá phim"><h2 className="text-white font-bold mb-3">Chọn phim</h2><div className="flex flex-wrap gap-4"><Link to="/phim-le">Phim lẻ</Link><Link to="/phim-bo">Phim bộ</Link><Link to="/kham-pha?genre=Chiếu+Rạp">Chiếu rạp</Link><Link to="/kham-pha?collection=blockbusters">Bom tấn tuyển chọn</Link><Link to="/the-loai/Hành%20Động">Hành động</Link><Link to="/the-loai/Võ%20Thuật">Võ thuật</Link><Link to="/the-loai/Hoạt%20Hình">Hoạt hình</Link></div></nav>
    <nav aria-label="Tiện ích"><h2 className="text-white font-bold mb-3">Tiện ích</h2><div className="flex flex-wrap gap-4"><Link to="/tim-kiem">Tìm phim</Link><Link to="/lich-su">Phim đã lưu & lịch sử</Link><Link to="/kham-pha">Bộ lọc phim</Link></div><p className="mt-4">© {new Date().getFullYear()} TP VietSub.</p></nav>
  </div>
</footer>;
