# Japanese Master

Ứng dụng luyện gõ Romaji và ghi nhớ Hiragana, giao diện tiếng Việt, dùng được trên máy tính và điện thoại. Xây dựng bằng JavaScript, CSS và Vite; không cần tài khoản, API key hay cơ sở dữ liệu.

## Chạy dự án

Yêu cầu Node.js 20.19+ hoặc 22.12+ (đã kiểm tra bằng Node.js 24).

```sh
npm ci
npm run dev
```

Trong môi trường cloud có thư mục home chỉ đọc, dùng `npm ci --cache /workspace/.npm-cache`.

```sh
npm test         # Kiểm thử dữ liệu, chấm đáp án, theo dõi lỗi và lịch SRS
npm run build    # Tạo bản tĩnh trong dist/
npm run preview  # Xem bản đã build
```

Có thể triển khai toàn bộ thư mục `dist/` lên một dịch vụ hosting tĩnh. Phông chữ được đóng gói cục bộ, không cần Google Fonts khi chạy.

## Tính năng

- Quiz chọn ngẫu nhiên từ/cụm từ hoặc thẻ âm; lọc theo nhóm quy tắc và những âm còn yếu.
- Bao phủ 46 âm cơ bản, 25 biến âm, 33 âm ghép phổ biến và 12 ký tự/cách ghép bổ sung (116 mục).
- Nhấn Enter để kiểm tra; đúng cộng 10 điểm và tự chuyển câu, sai hiện đáp án và đợi Enter để tiếp tục.
- Đối chiếu từng thành phần âm bằng khoảng cách chỉnh sửa; chỉ các âm bị nhận diện sai được đánh dấu đỏ. Với câu gõ sai nhiều chỗ, việc quy lỗi là ước lượng theo cách khớp gần nhất.
- Mỗi âm hết trạng thái đỏ sau 3 lần trả lời đúng liên tiếp có chứa âm đó.
- Điểm, chuỗi đúng, mục tiêu 20 câu/ngày, lịch ôn và lỗi được lưu trong localStorage. Có xuất bản sao JSON và đặt lại với bước xác nhận. Chưa có đồng bộ giữa thiết bị hoặc nhập lại bản sao.
- Lịch SRS đơn giản: đúng được ôn sau 1, 3, 7, 14, 30 ngày; sai sau 10 phút. Câu đến hạn được ưu tiên trong nhóm đã chọn, sau đó đến câu chưa luyện. Có thể luyện thêm trước hạn. Đây không phải FSRS của Anki.

## Quy ước tiếng Nhật

- ん: luôn nhận `nn`, nhận `n'` trong từ; nhận `n` ở cuối từ hoặc trước phụ âm phù hợp. Cả `minna` và `minnna` đều được nhận; `mina` không thay thế được みんな.
- ぢ / づ: dùng `di` / `du` theo quy tắc gõ bàn phím để phân biệt với じ / ず. Đây không phải phiên âm phát âm Hepburn.
- っ: nhân đôi phụ âm kế tiếp, ví dụ `kippu`; cũng nhận cách gõ riêng `xtsu`, `ltsu`, `xtu`, `ltu`.
- Trường âm giữ chữ viết: `tousan`, `ookii`, `sensei`. Không dùng dấu dài hoặc bỏ nguyên âm.
- は / を / へ: chỉ nhận lựa chọn phát âm `wa` / `o` / `e` ở các câu có đánh dấu vai trò trợ từ; cách gõ `ha` / `wo` / `he` vẫn được nhận.
- Nhận các biến thể IME phổ biến như `shi/si`, `chi/ti`, `tsu/tu`, `fu/hu`, `sha/sya`.
- Thẻ âm bổ sung giúp luyện đầy đủ mặt chữ. Những từ chỉ nhằm minh họa âm hiếm được ghi chú; bộ dữ liệu không được xem là danh mục từ vựng JLPT chính thức.

## Cấu trúc

- `src/data.js`: bảng âm, từ vựng, cách gõ và quy tắc.
- `src/engine.js`: chấm đáp án, đối chiếu âm sai, tiến độ và lịch ôn.
- `src/main.js`: tương tác giao diện.
- `src/style.css`, `src/fonts.css`: bố cục responsive và phông chữ cục bộ.
- `tests/engine.test.js`: kiểm thử bằng Node.js test runner.

Phông chữ Be Vietnam Pro và Noto Sans JP được phân phối qua Fontsource theo giấy phép OFL. `fonts.css` chọn các phần phông tiếng Nhật được sử dụng trong bài học để giảm dung lượng.

## Dùng thử không cần cài đặt

Sau khi build, chạy `node scripts/export-standalone.mjs` để tạo `dist/JapaneseMaster.html`. Tải tệp này về máy và mở bằng Chrome, Edge, Firefox hoặc Safari. Toàn bộ mã và phông chữ nằm trong một tệp; không cần chạy server. Tiến độ được lưu theo khả năng hỗ trợ localStorage của trình duyệt khi mở tệp cục bộ.

## Triển khai bằng Vercel

1. Đăng nhập Vercel bằng tài khoản GitHub và chọn **Add New → Project**.
2. Import repository `ltdatvscc-design/JapaneseMaster`, chọn nhánh `main`.
3. Giữ **Root Directory** là thư mục gốc. `vercel.json` đã cấu hình framework Vite, cài đặt bằng `npm ci`, build bằng `npm run build`, xuất bản thư mục `dist`.
4. Chọn **Deploy**. Ứng dụng không cần biến môi trường hoặc API key.

Những lần đẩy commit tiếp theo lên `main` sẽ tự triển khai lại nếu bạn bật Git integration của Vercel. Tiến độ học được lưu theo tên miền trên trình duyệt; dữ liệu từ tệp HTML dùng thử không tự chuyển sang tên miền Vercel.
