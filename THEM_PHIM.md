# 📝 TEMPLATE MẪU THÊM PHIM MỚI VÀO DATA/MOVIES.JSON

Chỉ cần copy đoạn JSON mẫu dưới đây, dán vào vị trí đầu tiên bên trong mảng `[` `]` trong file `data/movies.json` và thay đổi thông tin.

```json
  {
    "id": "ten-phim-khong-dau",
    "slug": "ten-phim-khong-dau",
    "title": "Tên Phim Tiếng Việt Viết Hoa",
    "titleOriginal": "Tên Tiếng Trung Hoặc Tiếng Anh Nguyên Bản",
    "poster": "https://link-anh-poster-doc.jpg",
    "backdrop": "https://link-anh-nen-ngang-lon.jpg",
    "description": "Mô tả vắn tắt nội dung phim từ 2 đến 4 câu...",
    "genres": ["Tu Tiên", "Trọng Sinh", "Hệ Thống", "Vả Mặt", "Phim 3D"],
    "country": "Trung Quốc",
    "year": 2024,
    "status": "Đang cập nhật",
    "episodeInfo": "Tập 20 - Vietsub",
    "rating": 9.5,
    "views": 1500000,
    "updatedAt": "2026-08-01",
    "isHot": true,
    "isNew": true,
    "watchLinks": [
      {
        "platform": "YouTube",
        "url": "https://www.youtube.com/watch?v=XXXXX",
        "quality": "Full HD 1080p Vietsub"
      },
      {
        "platform": "Bilibili",
        "url": "https://www.bilibili.tv/vi/play/XXXXX",
        "quality": "4K Vietsub Bản Quyền"
      }
    ]
  }
```

---

### 💡 CHI TIẾT CÁC TRƯỜNG DỮ LIỆU:

1. **`id` & `slug`**: Viết thường, không dấu, dùng dấu gạch ngang nối từ (ví dụ: `vo-luyen-dinh-phong`). Không trùng với phim khác.
2. **`title`**: Tên Tiếng Việt của phim hiển thị trên giao diện.
3. **`titleOriginal`**: Tên phiên âm Hán Việt hoặc tên tiếng Anh.
4. **`poster`**: Đường dẫn URL ảnh poster dọc (tỉ lệ 2:3). Nên dùng link ảnh trực tiếp (imgur, TMDB, unsplash, v.v.).
5. **`backdrop`**: Đường dẫn URL ảnh nền ngang lớn hiển thị trên banner đầu trang và trang chi tiết phim.
6. **`description`**: Tóm tắt nội dung hấp dẫn.
7. **`genres`**: Danh sách thể loại (chọn trong các thẻ: *Tu Tiên, Xuyên Không, Xuyên Thư, Trọng Sinh, Hệ Thống, Võ Hiệp, Mạt Thế, Đô Thị Dị Năng, Vô Hạn Lưu, Võng Du, Vả Mặt, Nam Chính, Nữ Chính, Nghịch Tập, Học Đường, Hiện Đại, Kinh Dị, Tình Cảm, Hài Hước, Fantasy, Siêu Thực, Phim 2D, Phim 3D*).
8. **`status`**: `"Đang cập nhật"` hoặc `"Full"`.
9. **`episodeInfo`**: Hiển thị số tập hiện tại (ví dụ: `"Tập 87 - Vietsub"`, `"Full 26/26 Tập"`).
10. **`isHot`**: `true` (để hiện ở Slider Banner đầu trang & Popup góc màn hình) hoặc `false`.
11. **`isNew`**: `true` (để hiện nhãn MỚI) hoặc `false`.
12. **`watchLinks`**: Mảng các nút bấm xem phim ngoài. Mỗi nút gồm:
    - `platform`: Nền tảng phát sóng (`"YouTube"`, `"Bilibili"`, `"iQiyi"`, `"Tencent Video"`, `"Netflix"`).
    - `url`: Link dẫn đến trang video xem phim trên nền tảng đó.
    - `quality`: Ghi chú chất lượng (`"Full HD Vietsub"`, `"4K Thuyết Minh"`).
