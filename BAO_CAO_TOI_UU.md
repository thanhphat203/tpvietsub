# Báo cáo thay đổi và kiểm tra

Ngày kiểm tra: 29/10/2026.

## Các nguyên nhân đã sửa

1. Khởi tạo cũ gọi 16 yêu cầu đa nguồn và có thể bị gọi lặp khi vào trang. Nay đồng bộ nền dùng 1 nguồn chính, dùng chung tác vụ đang chạy và giới hạn tần suất; nội dung khác tải theo nhu cầu.
2. `getAllMovies` cũ đọc và JSON.parse toàn bộ catalog mỗi lần selector chạy. Nay đọc catalog quản trị một lần, dùng dữ liệu trong RAM cho các selector.
3. Catalog nhúng ban đầu giảm từ 595 phim xuống 24 phim có metadata thật; bộ phim biên tập tải riêng. Toàn bộ phim API vẫn truy cập được qua phân trang.
4. Trang chủ cũ render nhiều hàng trùng nhau và hàng trăm thẻ. Nay mỗi hàng tối đa 12 phim; IntersectionObserver trì hoãn tải/mount hàng dưới; ảnh lazy load có kích thước, không ép TMDB tải original.
5. Các trang ít dùng được tách chunk. hls.js chỉ tải khi trình phát thực sự cần MediaSource; Safari HLS gốc không phải tải thư viện đó.
6. Catalog tải dữ liệu và tổng trang thật từ API, kết hợp country/category/year/định dạng; bỏ phân loại phim lẻ theo chuỗi “phút” vốn nhầm phim bộ “phút/tập”. Tách chiếu rạp, phim lẻ và bộ sưu tập bom tấn.
7. Cache catalog có TTL, giới hạn 40 trang và gộp yêu cầu trùng. Bỏ qua phản hồi cũ khi thay bộ lọc/trang. Có trạng thái tải, không có kết quả, lỗi và nút thử lại.
8. Tìm kiếm gửi đúng số trang; chỉ gọi khi submit trên trang tìm kiếm; gợi ý header debounce và bỏ phản hồi cũ.
9. Giảm bóng đổ, blur, animation shimmer và bỏ will-change thường trực trên thẻ. Giữ grid responsive, vùng bấm/focus rõ và hỗ trợ reduced-motion.
10. Player giới hạn buffer, hủy HLS/media khi rời trang; chọn nguồn khả dụng trước thay vì đợi mọi nguồn; cache tập hết hạn sau 15 phút. Chuyển server có giới hạn để tránh vòng lặp vô hạn, giữ điều khiển video gốc và tự qua tập khi hết phim.
11. Proxy Express có timeout 10 giây, cache 60 giây giới hạn 10 MB / 100 mục, gộp yêu cầu trùng. Bỏ cấu hình vô hiệu hóa kiểm tra TLS toàn cục. Assets có cache immutable theo hash.
12. Phim yêu thích dùng cache RAM, đồng bộ các thẻ trùng và tab khác; tách nút lưu khỏi thẻ liên kết để tránh phần tử tương tác lồng nhau.

## Kiểm tra đã qua

- `npm run lint`: TypeScript, bao gồm sửa lỗi kiểu dữ liệu có sẵn trong ZIP.
- `npm test`: phân biệt phim bộ/lẻ, cờ chiếu rạp, metadata/đánh giá, URL ảnh, số trang không hợp lệ, bộ lọc API, gộp request, TTL cache hit, phân trang, retry sau HTTP lỗi, tính duy nhất của phim tuyển chọn. Bài kiểm tra này dùng phản hồi giả lập, không phụ thuộc trạng thái nguồn thật.
- `npm run build`: bản Vite production.
- Chrome, 390×844 / 1440×1000 / 1920×1080: không tràn ngang; số thẻ khởi tạo có giới hạn.
- API thật: trang 1/2 Hàn Quốc khác nhau; Back trả về trang trước; bộ lọc Việt Nam + Hành Động trả về 76 phim tại lúc kiểm tra.
- Lưu phim tồn tại sau reload; lỗi mạng được hiển thị và nút thử lại hoạt động.
- Điều hướng mũi tên đặt được focus; danh sách bom tấn hiện 13 phim; URL page=bad được xử lý thành trang 1.
- Trang phim mở được, không có lỗi JavaScript chưa xử lý trong các luồng đã kiểm tra.
- Lặp lại kiểm tra trên bản production: viewport điện thoại/desktop/TV, phân trang, Back, mũi tên và trang phim đều qua. Proxy production trả HTTP 200 / 24 phim / đúng trang 2, có Cache-Control max-age=60; đường dẫn SPA trả HTML 200, API không tồn tại trả 404.

## Chưa xác nhận

Chưa có thiết bị Android/iOS/macOS/TV thật để đo FPS, RAM, thời gian phản hồi hoặc codec. Không công bố phần trăm tăng tốc hay bảo đảm mượt trên mọi thiết bị. CDN video thử nghiệm báo lỗi SSL, nên kiểm tra phát video xuyên suốt chưa đạt xác nhận. Các bước trên xác nhận mã, bố cục mô phỏng và luồng catalog; không xác nhận chất lượng mọi nguồn phim.

## Các file chính

- `src/services/catalog.ts`: truy vấn phân trang, lọc, cache, tuyển chọn.
- `src/pages/CatalogPage.tsx`: giao diện kho phim và URL state.
- `src/pages/HomePage.tsx`: bố cục mới và tải hàng theo vùng nhìn.
- `src/components/TVNavigation.tsx`: điều hướng remote/bàn phím.
- `src/components/VideoPlayer.tsx`: HLS, buffer, vòng đời media.
- `src/services/api.ts`, `lib/movies.ts`, `server.js`: dữ liệu, khởi tạo, cache và proxy.

Các file trang catalog cũ được giữ để tham khảo mã, nhưng router dùng CatalogPage mới cho khám phá, thể loại, phim lẻ và phim bộ.
