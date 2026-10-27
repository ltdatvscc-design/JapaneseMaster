# Cách sử dụng bộ key visual

1. Giải nén gói vào thư mục gốc repository JapaneseMaster. Thư mục `design/forgotten-kana-city/` cần giữ nguyên tên để prompt tham chiếu đúng các ảnh.
2. Mở `CODEX-PROMPT.md`, sao chép toàn bộ nội dung và gửi vào task Codex đang làm việc với repository.
3. Codex sẽ đọc `ART-DIRECTION.md`, dùng ảnh có sẵn và triển khai bản giao diện có thể review. Sau khi xem kết quả, yêu cầu đẩy lên GitHub nếu muốn Vercel cập nhật website.

Bộ này là tài sản thiết kế và đặc tả triển khai. Website hiện tại chưa được đổi giao diện hoặc triển khai lại. Các thông số chuyển động, tương phản và kích thước ảnh tối ưu trong đặc tả là yêu cầu cho bước triển khai, chưa phải kết quả đo của một giao diện đã dựng.

Các ảnh nền không chứa chữ hoặc nút. Hiệu ứng hover/click, sương, hạt bụi và phản hồi Quiz được tạo bằng code theo đặc tả để có thể tắt trên điện thoại và khi người dùng bật giảm chuyển động.
