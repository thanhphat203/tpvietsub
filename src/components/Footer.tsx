/**
 * @file src/components/Footer.tsx
 * Site footer with disclaimer, quick links, and copyright
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Github, ShieldAlert, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0a0a0e] text-gray-400 text-xs border-t border-[#1e1e28] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <Link to="/" className="flex items-center group">
              <span className="font-black text-xl text-white tracking-tight">
                <span className="text-[#e50914]">TP</span> VIETSUB
              </span>
            </Link>
            <p className="text-gray-400 text-xs leading-relaxed">
              Kênh tổng hợp xem phim Vietsub & Thuyết minh chất lượng cao: Phim Hoạt Hình 3D, Anime Nhật Bản, Phim Hành Động, Phim Hàn Quốc, Phim Trung Quốc, Phim Lẻ Chiếu Rạp. Trải nghiệm xem phim mượt mà, tốc độ cao.
            </p>
          </div>

          {/* Col 2: Thể Loại Hot */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider">
              Thể Loại Nổi Bật
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <Link to="/the-loai/Tu%20Ti%C3%AAn" className="hover:text-[#e50914] transition-colors">
                  Phim Tu Tiên - Võ Hiệp
                </Link>
              </li>
              <li>
                <Link to="/the-loai/Xuy%C3%AAn%20Kh%C3%B4ng" className="hover:text-[#e50914] transition-colors">
                  Phim Xuyên Không - Trọng Sinh
                </Link>
              </li>
              <li>
                <Link to="/the-loai/H%E1%BB%87%20Th%E1%BB%91ng" className="hover:text-[#e50914] transition-colors">
                  Phim Hệ Thống - Vả Mặt
                </Link>
              </li>
              <li>
                <Link to="/the-loai/M%E1%BA%A1t%20Th%E1%BA%BF" className="hover:text-[#e50914] transition-colors">
                  Phim Mạt Thế - Dị Năng
                </Link>
              </li>
              <li>
                <Link to="/the-loai/Phim%203D" className="hover:text-[#e50914] transition-colors">
                  Phim 3D Đồ Họa Đỉnh Cao
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Nền Tảng Liên Kết */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider">
              Nền Tảng Bản Quyền
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Các liên kết xem phim trên website chuyển tiếp trực tiếp đến các nền tảng phát sóng chính thức:
            </p>
            <div className="flex flex-wrap gap-2 pt-1 font-semibold text-[11px]">
              <span className="bg-[#181822] px-2.5 py-1 rounded border border-[#282838]">YouTube</span>
              <span className="bg-[#181822] px-2.5 py-1 rounded border border-[#282838]">Bilibili</span>
              <span className="bg-[#181822] px-2.5 py-1 rounded border border-[#282838]">iQiyi</span>
              <span className="bg-[#181822] px-2.5 py-1 rounded border border-[#282838]">Tencent Video</span>
              <span className="bg-[#181822] px-2.5 py-1 rounded border border-[#282838]">Netflix</span>
            </div>
          </div>

          {/* Col 4: Disclaimer & GitHub */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              Tuyên Bố Bản Quyền
            </h4>
            <p className="text-[11px] text-gray-400 leading-relaxed italic bg-[#14141d] p-3 rounded-xl border border-gray-800">
              "Nội dung và bản quyền video hoàn toàn thuộc về các nền tảng phát sóng chính thức. TP VietSub chỉ tổng hợp thông tin metadata và dẫn liên kết ngoài (External Links)."
            </p>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-6 border-t border-[#1a1a24] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} TP VietSub Cinema. Tất cả quyền được bảo lưu.
          </p>

          <div className="flex items-center gap-4 text-gray-400">
            <span className="flex items-center gap-1">
              Phát triển với <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> dành cho cộng đồng yêu phim
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
};
