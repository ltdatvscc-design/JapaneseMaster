Hãy triển khai key visual “Forgotten Kana City — Thành phố ký tự bị lãng quên” cho website Japanese Master trong repository này.

Đây là một thay đổi giao diện và hiệu ứng cho ứng dụng đang hoạt động. Trước khi sửa, đọc README.md, package.json, các hướng dẫn AGENTS.md nếu có, src/main.js, src/style.css, src/engine.js và dữ liệu Hiragana/Katakana. Dùng checkout hiện có. Kiểm tra git status và giữ nguyên công việc chưa commit của người dùng.

TÀI LIỆU VÀ ẢNH ĐÃ CHỐT
- Đọc design/forgotten-kana-city/ART-DIRECTION.md, đây là đặc tả chi tiết về cảnh nền, màu và chuyển động.
- Xem cả ba ảnh trước khi triển khai:
  1. design/forgotten-kana-city/city-desktop.png
  2. design/forgotten-kana-city/city-mobile.png
  3. design/forgotten-kana-city/city-foreground.png (nền trong suốt)
- Dùng trực tiếp các ảnh đã cung cấp làm tài nguyên đầu vào. Chuyển sang WebP/AVIF tối ưu và đặt ở vị trí phù hợp với Vite. Không thay bằng ảnh stock hoặc tự sinh một concept khác. Nếu thiếu ảnh, báo chính xác tệp cần bổ sung trước khi làm phần phụ thuộc.

ĐỊNH HƯỚNG
- Anime điện ảnh: thành phố Nhật bỏ hoang sau mưa, mặt đường ướt, nhật thực viền cam cháy phía trên bên phải. Tông đỏ thẫm–đen than, tím chỉ là màu phụ rất ít.
- Áp dụng toàn website: nền, sidebar, header, Quiz, bảng chữ, nút, thống kê, chọn Hiragana/Katakana, cẩm nang, modal, toast và giao diện điện thoại phải thống nhất.
- Không vẽ lại UI vào background. Nội dung vẫn là HTML thật có thể thao tác và đọc bằng trình đọc màn hình.
- Bề mặt nội dung tối 94–97% opacity; overlay riêng trên ảnh nền. Dùng token CSS cho màu nền #100B10, thẻ #1B1118, đỏ #47151F, cam #F59B61, chữ #F4E9E2, chữ phụ #C5AFB0. Trạng thái đúng xanh ngọc #8DD5B0; sai hồng đỏ #FF8C9B kèm chữ/biểu tượng.
- Giữ vùng câu hỏi và bảng chữ yên tĩnh, dễ đọc. Không chạy ánh lửa hoặc hạt bụi phía trên nội dung. Dùng font hiện có, giữ ký tự Nhật nguyên hình dạng.

HIỆU ỨNG CẦN TRIỂN KHAI
1. Nền: desktop có parallax rất nhẹ, cảnh xa tối đa 5 px, tiền cảnh tối đa 10 px; chỉ hoạt động với con trỏ chuột chính xác. Lớp nền pointer-events:none, aria-hidden và không cản click.
2. Tro/sương: tối đa 14 hạt nhỏ ở mép ảnh; ưu tiên CSS transform/opacity. Không dùng thư viện 3D hoặc shader nặng.
3. Hover nút: viền cam sáng, vệt phản chiếu nhẹ, nâng tối đa 2 px trong 160–220 ms. Click có ripple nhỏ giới hạn trong nút, không cản xử lý sự kiện.
4. Ô Romaji: focus-ring rõ, glow vừa phải, không làm chữ dịch chuyển. Trả lời đúng có tick, +10, ánh xanh ngọc và ít hạt ở mép thẻ; sai hiển thị viền hồng đỏ và giữ đáp án cho người học đọc. Không tự chuyển câu sai.
5. Bảng kana: hover làm sáng ô, click mở modal hiện có. Chữ học được vẫn xanh ngọc, âm sai vẫn hồng đỏ có dấu hiệu bổ sung; tuyệt đối không để nền đỏ làm mất phân biệt trạng thái.
6. Lựa chọn Hiragana/Katakana: hiệu ứng viền nhẹ, không làm mất câu trả lời hoặc điểm do render ngoài ý muốn.
7. Mục tiêu ngày: chỉ phát hiệu ứng hoàn thành một lần khi thực sự vượt mốc, không phát lại mỗi lần đổi tab hoặc render.
8. Thêm tùy chọn “Hiệu ứng: Bật/Tắt” dễ tìm, hỗ trợ bàn phím và lưu cục bộ. Khi giảm chuyển động trong hệ điều hành được bật, luôn tắt chuyển động trang trí dù tùy chọn ứng dụng đang bật.
9. Mobile: ảnh dọc riêng, tắt parallax/tiền cảnh/particle; hiệu ứng chạm gọn. Nút đủ lớn, không có tràn ngang hoặc nội dung bị thanh điều hướng che.
10. Tab ẩn phải dừng vòng animation; tháo event listener/rAF khi render lại hoặc đổi chế độ, tránh đăng ký lặp. Không thêm âm thanh tự động.

RÀNG BUỘC CHỨC NĂNG
- Giữ nguyên bộ dữ liệu, đáp án hợp lệ, cách chấm Romaji, điểm, SRS, các bộ lọc, phím Enter, chuyển câu đúng, đáp án khi sai, đánh dấu âm yếu, cẩm nang, tải bản sao tiến độ và xác nhận đặt lại.
- Giữ nguyên khóa lưu dữ liệu Hiragana và Katakana; không xóa hoặc chuyển dữ liệu cũ ngoài yêu cầu.
- Không đưa hover transform vào phần chữ kana theo cách làm méo chữ; không dùng nền trắng cũ còn sót trong modal hoặc trạng thái trống.
- Giữ cấu hình Vercel/Vite hoạt động. Không cần thêm backend, tài khoản hoặc API key.
- Không thay toàn bộ DOM theo từng frame; sử dụng CSS variables/transform trên lớp nền riêng.

KIỂM TRA VÀ BÀN GIAO
- Chạy npm test và npm run build, điều tra và sửa lỗi phát sinh.
- Kiểm tra bằng trình duyệt ở 320/390/768/1440 px: tương phản, font Nhật, crop ảnh, chọn cả hai bảng chữ, trả lời đúng/sai bằng Enter, lọc âm yếu, mở/đóng modal, lưu tiến độ sau tải lại và đặt lại riêng từng bảng.
- Kiểm tra prefers-reduced-motion, nút tắt hiệu ứng, không có thao tác bị lớp hình ảnh chặn; không có vòng rAF hoặc listener nhân đôi khi đổi bảng nhiều lần.
- Chụp ảnh màn hình desktop và mobile để xem kết quả. Báo rõ các kiểm tra đã chạy, thay đổi chính và giới hạn còn lại.
- Hoàn thiện bản local có thể review. Không tự push hoặc deploy trong nhiệm vụ thiết kế này trừ khi người dùng yêu cầu rõ.
