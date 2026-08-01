# 🎬 LÙ PHIM DONGHUA - WEBSITE PHIM TĨNH DONGHUA TỰ ĐỘNG DEPLOY GITHUB PAGES

Website xem phim tĩnh (Static Site) chuyên biệt về **Hoạt hình Trung Quốc (Donghua)** chuyển thể từ tiểu thuyết mạng (Tu Tiên, Xuyên Không, Trọng Sinh, Hệ Thống, Mạt Thế...). 

Giao diện lấy cảm hứng từ `luphim.com`, tích hợp theme tối sang trọng, banner slider phim hot, top 10 xem nhiều, popup phim hot góc màn hình và hệ thống nút chuyển hướng xem phim bản quyền trên YouTube, Bilibili, iQiyi, Tencent Video, Netflix...

---

## 🚀 HƯỚNG DẪN 4 BƯỚC THÊM PHIM MỚI (CỰC KỲ ĐƠN GIẢN CHO NON-DEVELOPER)

Bạn **KHÔNG CẦN BIẾT CODE**. Mỗi khi muốn đăng phim mới, bạn chỉ cần mở 1 file duy nhất là `data/movies.json`:

1. **Mở file `data/movies.json`** trên GitHub hoặc thư mục máy tính của bạn.
2. **Mở file `THEM_PHIM.md`**, copy đoạn JSON mẫu, dán vào đầu mảng `data/movies.json` (ngay phía sau dấu mở ngoặc vuông `[`).
3. **Thay đổi thông tin phim**: Sửa lại tiêu đề (`title`), ảnh poster (`poster`), ảnh nền (`backdrop`), thể loại (`genres`), và các link xem ngoài (`watchLinks`).
4. **Lưu file, Commit & Push lên GitHub**:
   ```bash
   git add .
   git commit -m "Thêm phim mới: Tên Phim"
   git push
   ```
   Chờ **1 - 2 phút**, GitHub Actions sẽ tự động build và cập nhật web của bạn lên live! 

---

## ⚙️ HƯỚNG DẪN THIẾT LẬP DEPLOY LÊN GITHUB PAGES (CHỈ LÀM 1 LẦN DUY NHẤT)

1. Đưa mã nguồn này lên repository trên GitHub của bạn.
2. Trên trang GitHub Repository, vào **Settings** → **Pages** (cột menu bên trái).
3. Ở mục **Build and deployment** > **Source**: Chọn **`GitHub Actions`** (thay vì "Deploy from a branch").
4. Mỗi khi bạn push code hoặc sửa file `data/movies.json` trên nhánh `main`, GitHub Actions tự động chạy workflow `.github/workflows/deploy.yml` và deploy site lên domain: `https://username.github.io/ten-repo/`.

---

## 💻 CHẠY VÀ CHỈNH SỬA THỬ Ở MÁY TÍNH (LOCAL DEVELOPMENT)

Yêu cầu máy tính đã cài Node.js (phiên bản 18 trở lên).

1. Mở terminal tại thư mục dự án và cài đặt thư viện:
   ```bash
   npm install
   ```
2. Chạy môi trường xem trước (Dev Server):
   ```bash
   npm run dev
   ```
3. Mở trình duyệt truy cập: `http://localhost:3000`

4. Tự kiểm tra build static trước khi push lên GitHub:
   ```bash
   npm run build
   ```

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN

```
/
├── data/
│   └── movies.json                 # ⭐ FILE DUY NHẤT CẦN SỬA KHI THÊM PHIM MỚI
├── lib/
│   └── movies.ts                   # Các hàm query dữ liệu phim
├── src/
│   ├── components/
│   │   ├── Header.tsx              # Thanh điều hướng & ô tìm kiếm live
│   │   ├── Footer.tsx              # Chân trang & tuyên bố bản quyền
│   │   ├── HeroSlider.tsx          # Banner phim hot tự chuyển slide
│   │   ├── MovieCard.tsx           # Thẻ hiển thị poster & rating phim
│   │   ├── MovieRow.tsx            # Hàng phim cuộn ngang mượt mà
│   │   ├── GenreTag.tsx            # Nhãn thể loại phim
│   │   ├── WatchButton.tsx         # Nút xem phim mở link ngoài
│   │   ├── TopMoviesList.tsx       # Bảng xếp hạng Top 10 xem nhiều
│   │   └── HotMoviesPopup.tsx      # Popup phim hot góc màn hình
│   ├── pages/
│   │   ├── HomePage.tsx            # Trang chủ
│   │   ├── MovieDetailPage.tsx     # Trang chi tiết phim & danh sách nút xem
│   │   ├── GenrePage.tsx           # Trang lọc phim theo thể loại
│   │   └── SearchPage.tsx          # Trang tìm kiếm
│   ├── types.ts                    # Khai báo kiểu dữ liệu TypeScript
│   ├── App.tsx                     # Định tuyến giao diện (Routing)
│   └── index.css                   # Tailwind CSS Theme
├── .github/workflows/deploy.yml    # GitHub Actions auto-deploy
├── THEM_PHIM.md                    # Template mẫu copy-paste thêm phim nhanh
└── README.md                       # File hướng dẫn này
```

---

## 🏷️ CÁC THỂ LOẠI DONGHUA ĐƯỢC HỖ TRỢ TRONG HỆ THỐNG
`Tu Tiên`, `Xuyên Không`, `Xuyên Thư`, `Trọng Sinh`, `Hệ Thống`, `Võ Hiệp`, `Mạt Thế`, `Đô Thị Dị Năng`, `Vô Hạn Lưu`, `Võng Du`, `Vả Mặt`, `Nam Chính`, `Nữ Chính`, `Nghịch Tập`, `Học Đường`, `Hiện Đại`, `Kinh Dị`, `Tình Cảm`, `Hài Hước`, `Fantasy`, `Siêu Thực`, `Phim 2D`, `Phim 3D`.
