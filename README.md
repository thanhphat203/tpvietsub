# TP VIETSUB — bản tối ưu

Yêu cầu Node.js 20.19+ hoặc Node.js 22 LTS. Giải nén toàn bộ dự án.

## Chạy trên máy

```sh
npm ci
npm run dev
```

Mở http://localhost:3000. Điện thoại/TV dùng cùng Wi-Fi có thể mở địa chỉ LAN mà Vite in ra. Chỉ dùng dev để phát triển/kiểm tra.

## Kiểm tra và build

```sh
npm run lint
npm test
npm run build
npm start
```

`dist/` là bản web production đã build sẵn. `npm start` phục vụ bản build bằng Express. PORT mặc định 3000.

## Đưa lên hosting

- Vercel / Netlify: build `npm run build`, output `dist`. Cấu hình SPA rewrite đã có trong dự án.
- GitHub Pages: workflow có sẵn; dùng HashRouter tự động trên hostname github.io. Khi cấu hình tên miền riêng, cần hosting hỗ trợ SPA fallback.
- Hosting tĩnh khác: đưa NỘI DUNG `dist/` lên thư mục web và rewrite các đường dẫn ứng dụng về index.html. Không rewrite file assets bị thiếu thành HTML.
- Node/VPS: `npm ci`, `npm run build`, `npm start`; đặt HTTPS/reverse proxy theo hosting của bạn.
- Mặc định trình duyệt gọi phimapi.com trực tiếp. Nếu cần proxy cùng miền trên Node/VPS, tạo `.env.local` với `VITE_API_PROXY=true`, chạy lại build và dùng `npm start`. Hosting tĩnh không có Express thì giữ giá trị mặc định.
- Cache các `/assets/*` theo hash với thời gian dài; index.html nên revalidate. Express đã cấu hình sẵn. Bật gzip/Brotli tại hosting/reverse proxy nếu có.

## Bố cục và kho phim

Trang chủ có phim mới cập nhật và các hàng Việt Nam, Hàn Quốc, Trung Quốc, chiếu rạp, bom tấn tuyển chọn, hành động, võ thuật, phim bộ, phim lẻ, hoạt hình. Hàng ở dưới chỉ tải khi gần vùng xem.

Kho phim `/kham-pha` dùng phân trang trực tiếp từ API, 24 phim/trang, có nút đến số trang. Bộ lọc quốc gia, thể loại, năm, định dạng được gửi lên API. URL lưu bộ lọc và trang để chia sẻ, tải lại và dùng nút Back/Forward. Không giới hạn người xem ở danh sách seed nhúng.

Mục bom tấn là 13 phim biên tập đã đối chiếu ID TMDB, không phải nhãn tự gán cho mọi phim lẻ. Muốn bổ sung, cập nhật `data/blockbusters.json` bằng dữ liệu thật và build lại. Đánh giá TMDB/IMDb không có dữ liệu được hiển thị dấu gạch ngang thay vì tự sinh điểm.

Nguồn và số phim có thể thay đổi. Khi kiểm tra ngày 29/10/2026, nguồn trả về 30.440 phim / 1.269 trang, trong đó mục chiếu rạp có 907 phim / 38 trang.

## Điện thoại và TV

- Grid tự đổi 2 / 4 / 6 cột theo kích thước màn hình; phim dạng hàng cuộn ngang.
- TV / bàn phím: mũi tên chọn liên kết/nút gần nhất, Enter/OK để mở; focus vàng dễ nhìn.
- Escape đóng các menu; trong ô nhập, select hoặc video, phím được để cho điều khiển gốc xử lý.
- Safari/iOS ưu tiên HLS gốc. Trình duyệt hỗ trợ MediaSource dùng hls.js khi cần. Bộ đệm có giới hạn, tự chọn chất lượng theo băng thông/kích thước trình phát, hủy tài nguyên khi đổi phim/trang.
- Chức năng N/P đổi tập, C đổi chế độ rạp, chọn server, tìm tập và phim đã lưu/lịch sử được giữ lại. Các nguồn video dự phòng được thử khi nguồn trước không có tập.

## Giới hạn đã xác định

Đã kiểm tra Chrome với viewport điện thoại, desktop và TV; đây là kiểm tra trình duyệt, không thay thế kiểm tra iPhone/Safari/macOS/Android/TV thật. TV quá cũ có thể thiếu CSS, codec hoặc MediaSource. Chất lượng mạng, API, CDN, codec và quảng cáo có sẵn trong nguồn phát nằm ngoài khả năng bảo đảm của frontend.

Trang phim và trình phát mở được trong kiểm tra. CDN của luồng Avatar thử nghiệm báo lỗi SSL tại môi trường chạy kiểm tra; chưa xác nhận xem xuyên suốt. Cần kiểm tra thêm bằng nguồn video đang hoạt động trên thiết bị triển khai. Không tắt xác minh TLS để che lỗi nguồn.

Xem `BAO_CAO_TOI_UU.md` để biết thay đổi và các kiểm tra đã chạy.
