# Sửa lỗi trình phát v2

Ảnh người dùng có hai vấn đề: nguồn s5.phim1280.tv bị Avast URL:Blacklist, và lỗi HLS bị hiển thị nhầm thành không có nguồn. Không kết luận được tên miền có an toàn hay cảnh báo nhầm chỉ từ ảnh.

Đã sửa: giữ nguyên toàn bộ server KKPhim thay vì ghi đè theo ngôn ngữ; giữ link HLS và embed riêng; deduplicate URL thực; bỏ khẳng định một domain là “an toàn” chỉ vì không chứa kkphimplayer; không đưa m3u8 vào iframe; lỗi phát và thiếu nguồn có trạng thái riêng; thử lại/đổi nguồn thủ công; timeout khởi tạo 15 giây; bỏ quảng bá xem mượt 100% và hướng dẫn né antivirus; vô hiệu hóa nguồn phim1280.tv cùng các subdomain đã được người dùng báo cảnh báo; cache tập v2; sửa asset base và workflow GitHub Pages.

Kiểm tra: npm run lint; npm test; npm run build. Chrome trên bản production với fixture: HLS lỗi hiện thông báo đúng, không tự nhúng; người xem chọn embed hoạt động với URL gốc từ fixture; thuyết minh nhúng chọn riêng được; nguồn bị cảnh báo bị disable và không phát sinh request; tất cả nguồn bị tạm ngưng hiện trạng thái rõ ràng; không có lỗi JavaScript chưa xử lý. Đây là kiểm thử xử lý lỗi, không xác nhận CDN phim thật đã hoạt động hay được gỡ cảnh báo.

API thật: Endgame có 2 bản từ s6.kkphimplayer6.com và embed player.phimapi.com. Avatar: Dòng Chảy Của Nước có 2 bản đều từ s5.phim1280.tv và embed player.phimapi.com. Bản Avatar bị ngưng toàn bộ server kể cả link nhúng liên quan, tránh che nguồn cảnh báo bằng player khác.

Cập nhật GitHub: thay mã nguồn của repo bằng bản v2, giữ thư mục .github, commit/push main; workflow build và deploy lại với /tpvietsub/. Không chỉ thay file TSX mà bỏ qua bước build. GitHub Pages không chạy Express và không hỗ trợ proxy video trong ứng dụng này. Không cần bật VITE_API_PROXY.
