# Forgotten Kana City — Thành phố ký tự bị lãng quên

## Background đã thống nhất

Một con phố Nhật Bản bỏ hoang sau cơn mưa, nhìn ngang tầm mắt. Những cửa tiệm cũ, bê tông nứt và dây điện tạo khung hai bên. Xa phía trên bên phải là nhật thực có viền cam cháy, sau các tòa nhà mờ trong sương. Mặt đường ướt phản chiếu đỏ trầm. Trung tâm rộng, tối và ít chi tiết để chứa bài học.

Phong cách anime điện ảnh, tranh nền vẽ kỹ, có chiều sâu; không nhân vật, không kinh dị, không máu, không giao diện hoặc chữ được vẽ sẵn trong ảnh. Không dùng thiên thạch dày đặc hay lửa phủ màn hình. Tím chỉ xuất hiện rất nhẹ trong phản chiếu; đỏ thẫm và đen than là màu chủ đạo.

Ý tưởng trải nghiệm: mỗi ký tự học được như một biển đèn được thắp lại giữa thành phố lãng quên. Giữ cảm giác bình tĩnh khi học; phần chuyển động nổi bật hơn nằm ở điều hướng và phản hồi câu trả lời.

## Bộ ảnh

- `city-desktop.png`: nền ngang cho PC/tablet ngang. Tâm nền là vùng trống; điểm sáng ở rìa và đường chân trời.
- `city-mobile.png`: bố cục dọc riêng cho điện thoại, không chỉ cắt giữa ảnh PC. Chủ thể nhật thực ở phía trên; vùng giữa/dưới yên tĩnh cho bài học.
- `city-foreground.png`: lớp PNG nền trong suốt, mảnh kiến trúc và dây cáp ở rìa dưới. Chỉ dùng trên PC với độ mờ thấp; tắt trên thiết bị nhỏ.

Nền chính đã chứa bầu trời và nhật thực. Không chồng thêm nhật thực hoặc vẽ lại cảnh bằng CSS. Sương, hạt bụi, ánh sáng hover và ripple là hiệu ứng lập trình; chúng không cần thêm ảnh raster.

## Màu và chất liệu

| Vai trò | Màu |
| --- | --- |
| Nền gốc | `#100B10` |
| Bề mặt thẻ | `#1B1118`, độ đục 94–97% |
| Đỏ thẫm | `#47151F` |
| Viền đang chọn | `#CC635D` |
| Điểm sáng cam | `#F59B61` |
| Chữ chính | `#F4E9E2` |
| Chữ phụ | `#C5AFB0` |
| Đúng / đã nhớ | `#8DD5B0` |
| Sai / cần ôn | `#FF8C9B` + nhãn hoặc biểu tượng |

Dùng phông tiếng Việt và Nhật đã có trong dự án. Không dùng font trang trí cho câu hỏi kana. Chữ trên nền ảnh phải nằm trên bề mặt tối đủ đục, không dựa vào bóng chữ để cứu tương phản.

## Kịch bản hiệu ứng

| Tình huống | Hiệu ứng | Giới hạn |
| --- | --- | --- |
| Mở trang | Cảnh nền fade-in nhẹ; nội dung xuất hiện ngay | 350–500 ms; không intro bắt buộc hoặc chặn thao tác |
| Rê chuột trên vùng nền | Cảnh xa dịch tối đa 5 px, tiền cảnh 10 px theo hướng ngược nhau | `transform`, 1 vòng requestAnimationFrame; chỉ pointer fine |
| Không thao tác | Một ít tro sáng trôi ở mép ảnh, sương dịch rất chậm | Tối đa 14 hạt PC; không có hạt trước nội dung hoặc ô nhập |
| Hover nút | Viền cam sáng dần, một vệt phản chiếu mảnh trên bề mặt | 160–220 ms; nâng tối đa 2 px |
| Click nút | Ripple nhỏ nằm trong nút, lan ra rồi tắt | 350 ms, không lan toàn màn hình; giữ phản hồi bấm tức thì |
| Chọn Hiragana/Katakana | Viền lựa chọn sáng, biểu tượng あ/ア chuyển sắc nhẹ | Giữ tiến độ và logic chuyển bảng; không đổi nền đột ngột |
| Focus ô Romaji | Viền cam rõ và quầng sáng nhẹ, nền ô nhập ổn định | Không rung chữ, không chạy particle trong ô |
| Trả lời đúng | Ký tự viền sáng xanh ngọc, dấu tick và +10; 6–8 hạt nhỏ ở mép thẻ | Khoảng 450 ms; hoàn tất trước tự chuyển câu hiện có |
| Trả lời sai | Viền hồng đỏ + biểu tượng lỗi; phần âm sai sáng lên một lần | Không lắc màn hình; đáp án ở nguyên để đọc |
| Hover ô bảng chữ | Nền ô sáng hơn, kana rõ hơn và viền mảnh | Không tilt chữ, không làm méo ký tự |
| Click ô bảng chữ | Mở hộp chi tiết như một bảng thông tin của trạm học | Fade 160 ms; focus và đóng Escape hoạt động |
| Hoàn thành mục tiêu ngày | Vòng tiến độ sáng cam ngắn kèm thông báo | Một lần khi vượt mốc; không phát lại mỗi lần render |

## Dễ đọc, di động và khả năng tiếp cận

- Cảnh nền cố định bên dưới toàn bộ ứng dụng. Lớp tối phủ trên ảnh khoảng 35–55%, điều chỉnh theo ảnh thật. Không giảm độ đục của chữ/thẻ cùng với ảnh.
- Bài Quiz và bảng chữ là nơi tập trung: không có chuyển động liên tục bên trong hai vùng này.
- Chữ thường đạt tương phản WCAG AA 4.5:1; chữ lớn ít nhất 3:1. Nút, focus và trạng thái không chỉ dựa vào màu.
- Điện thoại: dùng ảnh dọc, nền tĩnh, không parallax/tiền cảnh/particle; giữ hiệu ứng nhấn nhẹ. Không đổi con trỏ mặc định.
- `prefers-reduced-motion: reduce`: tắt parallax, particle, shimmer, ripple và các chuyển động trang trí; phản hồi đúng/sai vẫn xuất hiện tức thì bằng chữ và màu.
- Thêm nút “Hiệu ứng: Bật/Tắt”, lưu lựa chọn. Reduced motion luôn được ưu tiên hơn lựa chọn bật.
- Dừng animation khi tab không hiển thị. Không tự phát âm thanh. Âm báo hiện tại chỉ hoạt động khi người dùng bật.
- Dùng WebP/AVIF trong bản web; giữ PNG gốc làm tư liệu thiết kế. Mục tiêu ảnh nền desktop dưới 700 KB, mobile dưới 350 KB nếu chất lượng cho phép.
