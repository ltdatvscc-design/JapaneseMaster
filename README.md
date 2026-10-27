# Japanese Master

Ứng dụng luyện gõ Romaji và ghi nhớ Hiragana và Katakana, giao diện tiếng Việt, dùng được trên máy tính và điện thoại. Xây dựng bằng JavaScript, CSS và Vite; không cần tài khoản, API key hay cơ sở dữ liệu.

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

- `src/data.js`: dữ liệu Hiragana.
- `src/katakana.js`: dữ liệu Katakana, từ mượn, trường âm và các cặp dễ nhầm.
- `src/engine.js`: chấm đáp án, đối chiếu âm sai, tiến độ và lịch ôn.
- `src/main.js`: tương tác giao diện.
- `src/style.css`, `src/fonts.css`: bố cục responsive và phông chữ cục bộ.
- `tests/engine.test.js`, `tests/katakana.test.js`: kiểm thử bằng Node.js test runner.

Phông chữ Be Vietnam Pro và Noto Sans JP được phân phối qua Fontsource theo giấy phép OFL. `fonts.css` chọn các phần phông tiếng Nhật được sử dụng trong bài học để giảm dung lượng.

## Dùng thử không cần cài đặt

Sau khi build, chạy `node scripts/export-standalone.mjs` để tạo `dist/JapaneseMaster.html`. Tải tệp này về máy và mở bằng Chrome, Edge, Firefox hoặc Safari. Toàn bộ mã và phông chữ nằm trong một tệp; không cần chạy server. Tiến độ được lưu theo khả năng hỗ trợ localStorage của trình duyệt khi mở tệp cục bộ.

## Triển khai bằng Vercel

1. Đăng nhập Vercel bằng tài khoản GitHub và chọn **Add New → Project**.
2. Import repository `ltdatvscc-design/JapaneseMaster`, chọn nhánh `main`.
3. Giữ **Root Directory** là thư mục gốc. `vercel.json` đã cấu hình framework Vite, cài đặt bằng `npm ci`, build bằng `npm run build`, xuất bản thư mục `dist`.
4. Chọn **Deploy**. Ứng dụng không cần biến môi trường hoặc API key.

Những lần đẩy commit tiếp theo lên `main` sẽ tự triển khai lại nếu bạn bật Git integration của Vercel. Tiến độ học được lưu theo tên miền trên trình duyệt; dữ liệu từ tệp HTML dùng thử không tự chuyển sang tên miền Vercel.


## Chế độ Katakana

Chọn **Katakana** ở đầu trang để chuyển cả Quiz, bảng chữ, hướng dẫn và thống kê sang Katakana. Lựa chọn gần nhất được ghi nhớ khi tải lại trang.

- 46 âm cơ bản, 25 biến âm, 33 âm ghép, 14 mục đặc biệt và 25 âm mượn mở rộng (143 mục); 53 từ/cụm từ minh họa, tổng 196 câu/thẻ luyện.
- Trường âm: `コーヒー` nhận `koohii` hoặc `ko-hi-`; `スーパー` nhận `suupaa` hoặc `su-pa-`. Không nhận bỏ nguyên âm dài. Dấu `ー` đứng riêng gõ `-`.
- Âm mượn: `ティ` nhận `ti/thi`, `ディ` nhận `di/dhi`, `トゥ` nhận `tu/twu`. Bảng hiện cách gõ IME; hướng dẫn giải thích các biến thể phiên âm được chấp nhận. Các từ minh họa âm mở rộng không được coi là toàn bộ từ vựng N5.
- Có cẩm nang và 5 cặp dễ nhầm: シ/ツ, ソ/ン, ク/ケ, ヌ/ス, ワ/ウ.
- Dữ liệu Hiragana cũ vẫn giữ ở `japanese-master-v1`; Katakana dùng `japanese-master-katakana-v1`. Điểm, chuỗi đúng, ngày luyện và lịch ôn độc lập. Đặt lại chỉ tác động bảng đang chọn; bản sao JSON ghi rõ bảng chữ trong tên tệp.
- Khi không thể lưu localStorage, chuyển bảng vẫn giữ tiến độ trong phiên đang mở; đóng hoặc tải lại trang có thể mất dữ liệu chưa lưu.

## Forgotten Kana City — key visual

Giao diện dùng bộ ảnh gốc trong `design/forgotten-kana-city/` và ảnh WebP tối ưu trong `src/assets/` (desktop ~158 KiB, mobile ~184 KiB, tiền cảnh ~74 KiB). `src/city-theme.css` định nghĩa màu, lớp cảnh và responsive; `src/city-effects.js` quản lý chuyển động độc lập với tiến độ học.

- Nút **Hiệu ứng: Bật/Tắt** ở header lưu bằng khóa `japanese-master-effects`. Cài đặt giảm chuyển động của hệ điều hành luôn được ưu tiên.
- Desktop dùng parallax tối đa 5 px/10 px; rAF chỉ được yêu cầu khi con trỏ thay đổi, không có vòng lặp chạy liên tục. 12 hạt tro nằm sau nội dung ở mép màn hình.
- Điện thoại/tablet nhỏ dùng ảnh dọc, không parallax, tiền cảnh hoặc hạt. Tắt hiệu ứng hoặc ẩn tab dừng chuyển động trang trí.
- Phản hồi đúng/sai vẫn hoạt động khi tắt hiệu ứng. Hoàn thành mục tiêu chỉ được thông báo lúc vượt mốc, có khóa chống phát lại riêng theo ngày và bảng chữ.
- Toàn bộ dữ liệu và khóa tiến độ cũ được giữ nguyên. Lớp cảnh có `aria-hidden` và `pointer-events: none`.

Kiểm thử trình duyệt mở rộng nằm trong `tests/city-browser.cjs`. Cài Playwright vào môi trường kiểm thử riêng nếu cần, khởi động app, rồi chạy:

```sh
PLAYWRIGHT_MODULE=/path/to/playwright APP_TEST_URL=http://127.0.0.1:5173 node tests/city-browser.cjs
```

`CHROMIUM_PATH` có thể chỉ định Chromium; mặc định `/usr/bin/chromium`. Bài kiểm thử chụp ảnh desktop/mobile vào `review/`, kiểm tra chuyển bảng, Enter, trạng thái lỗi, lưu tiến độ, export/reset, reduced motion, listener không bị lặp và mục tiêu ngày. `npm test` vẫn chạy 16 kiểm thử dữ liệu/logic không cần trình duyệt.

### Hover và hiện dần khi cuộn

Các khối thống kê, mục tiêu, cẩm nang và lựa chọn bảng chữ sáng hơn, nâng 3 px và phóng nhẹ 1,2% khi dùng chuột. Khối Quiz, bảng kana và ô chữ chỉ tăng độ sáng/viền để chữ và ô nhập không thay đổi kích thước. Thao tác này không làm đổi vị trí bố cục.

Những khối nằm dưới màn hình hiện dần khi cuộn đến bằng IntersectionObserver (550 ms desktop, 380 ms màn hình nhỏ). Nội dung đang có trong màn hình hiện ngay; mỗi khối chỉ xuất hiện một lần trong phiên, kể cả khi đổi bảng chữ. Observer cũ được ngắt khi render lại. Khi dùng bàn phím, focus sẽ làm lộ khối tương ứng ngay; tắt hiệu ứng hoặc bật giảm chuyển động hiển thị tất cả nội dung tức thì. Trình duyệt không hỗ trợ IntersectionObserver cũng hiển thị toàn bộ nội dung.

Kiểm tra riêng chuyển động: `PLAYWRIGHT_MODULE=/path/to/playwright APP_TEST_URL=http://127.0.0.1:4173 node tests/city-reveal-browser.cjs`.
