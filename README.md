# EDUPLAN AI 6.2 – NGÂN HÀNG 672 CÂU HÓA HỌC 10–12

**Tác giả:** Lê Bá Nhẫn – Trường THPT Hòn Đất.

## Bản nâng cấp 6.2 – 8 tài liệu Hóa học 12 mới

- Nâng từ **416 câu/13 tệp** lên **672 câu/21 tệp**. Hóa 10: 224, Hóa 11: 192, Hóa 12: 256. Hình thức: 378 MCQ, 84 Đúng/Sai 4 ý, 126 câu ngắn, 84 tự luận.
- 8 chương Hóa 12, mỗi chương 32 câu; **227 câu có gợi ý bài** theo tiêu đề trong nguồn, còn 29 câu chỉ cấp chương. Gợi ý bài **chưa phải phân loại được duyệt**.
- Toàn bộ 672 câu mới/nguồn Word học sinh vẫn **CHỜ DUYỆT** (chưa có khóa đáp án đã xác nhận). Nguồn có chữ “Dap an_HS” trong tên file nhưng nội dung tệp là **bản học sinh chỉ có câu hỏi**; tuyệt đối không tự gán đáp án.
- Bản HTML: **`index.html`** thư mục gốc; tự bổ sung 256 câu khi mở trên cùng trình duyệt dùng 6.1, không thay thế câu cũ đã thẩm định. Dữ liệu cũ giữ trong localStorage.
- Next.js: Nút **“Nhập 672 câu từ 21 Word HS”** lấy `public/bank-data/uploaded_bank.json` và gửi lên Supabase theo lô. Có cơ chế dấu vân tay chống nhập trùng. Nếu đã nhập 416 câu, chạy lại để thêm 256 câu còn thiếu; không xóa hoặc duyệt thay 416 câu trước.
- **Không cần GEMINI_API_KEY** để nhập ngân hàng, duyệt, tạo đề, tạo phiếu, xuất Word hoặc chấm câu có đáp án xác nhận. Khóa AI chỉ là tùy chọn cho các tác vụ AI online.

### Hướng dẫn sử dụng trên bản HTML

1. Mở `index.html` → Ngân hàng câu hỏi 10–12 → chọn Hóa 12 và chương. Chọn bài để lọc những câu đã được gợi ý vào bài đó (những câu chưa gán bài chỉ hiện ở cấp chương).
2. Mở câu → kiểm tra nguyên văn với DOCX trong `source_docs/`, kiểm tra đáp án/công thức/hình/bảng → gán hoặc xác nhận bài và mức độ → nhập đáp án → **Lưu và duyệt**.
3. Chuyển **Tạo và trộn đề** hoặc **Phiếu học tập**, chọn khối/chương/bài, mức độ, số câu và số mã đề. Nếu thiếu câu đủ chuẩn, hệ thống báo thiếu; **không tự làm giả câu hoặc đáp án**.
4. Sau khi có đề, xem tại **Làm bài kiểm tra**, nhập tên, chọn đáp án, nộp bài; kiểm tra **Kết quả kiểm tra**.
5. Tải bản Word học sinh/giáo viên và đối chiếu lại bảng/hình phức tạp với tệp gốc.

### Triển khai online và giới hạn

- Vercel/Next.js + Supabase mới lưu kết quả tập trung trên các thiết bị. Chạy `schema.sql` và `supabase/migrate_6_0_to_6_1.sql` theo hướng dẫn bản 6.1 nếu cài mới; khi cập nhật từ 6.1 **không tạo lại schema** và không cần migration bổ sung cho 6.2 vì không đổi bảng.
- Chỉ nhập dữ liệu sau khi đăng nhập tài khoản được cấp quyền; trường `source_fingerprint` giúp chống nhập lại. Nên sao lưu trước khi nâng cấp.
- Bản chạy cục bộ chỉ lưu ở trình duyệt; **không có dữ liệu truy cập thực** của website chưa triển khai. Không gửi file HTML có chứa đáp án đã duyệt cho học sinh.
- DOCX của 8 chương mới có 1 hình và nhiều bảng; bản xem dữ liệu giữ hình/bảng nguồn, nhưng bộ xuất Word không đảm bảo 100% bố cục nguyên bản.
- **Kiểm thử:** 44/44 test Node.js; Chromium: nhập 672 câu, duyệt 1 MCQ Hóa 12, tạo 2 mã đề Word, làm bài đạt 10/10, xem lịch sử, mở câu có hình. Chưa kiểm thử build Next.js production, Supabase và Vercel vì thiếu thông tin kết nối và thư viện.

---

### Thông tin nền 6.1 (lưu lại để tham khảo)




## Sản phẩm được bàn giao

- **`index.html`** (gốc thư mục): WebApp chạy trực tiếp trên máy tính, có **416 câu trích xuất thật** từ 13 Word; không yêu cầu Gemini API key. Dữ liệu và thay đổi đã duyệt lưu trên trình duyệt bằng localStorage.
- **`source_docs/`**: giữ nguyên 13 tệp DOCX đầu vào để đối chiếu hình, bảng và công thức.
- **`data/uploaded_bank.json`**: ngân hàng trích xuất có mã ID, nguồn tệp, chương, dạng câu, thứ tự, trạng thái, mã băm SHA-256, nội dung nguyên dạng HTML đã escape, cờ kiểm tra hình/bảng.
- **`data/import_report.json`**: thống kê chính xác.
- **`public/bank-data/uploaded_bank.json`**: ngân hàng nạp từ WebApp Next.js sau khi tài khoản giáo viên đăng nhập.
- **`supabase/migrate_6_0_to_6_1.sql`**: bổ sung trường nguồn dữ liệu, trạng thái phân loại và dạng tự luận; không xóa dữ liệu hiện có.
- **`app/`**, **`lib/`**, **`tests/`**: ứng dụng Next.js, API, công cụ Hóa học, xuất Word, tạo đề, chấm bài và các bài kiểm thử.

## Số lượng đã nhập chính xác

13 tệp DOCX, 416 câu: Hóa 10 = 224 (7 chương), Hóa 11 = 192 (6 chương). Gồm 234 trắc nghiệm nhiều lựa chọn, 52 Đúng/Sai bốn ý, 78 trả lời ngắn, 52 tự luận. **Không có tệp câu hỏi Hóa 12 trong đợt cung cấp này**; mục lục Hóa 12 trong WebApp vẫn được giữ.

**Tình trạng chuyên môn:** 416 câu thuộc tài liệu HS **chưa có đáp án chính thức**, tất cả **chờ duyệt**; mức độ và bài học chính chưa được xác nhận. Không tạo câu mới giả, không tự đoán đáp án, không tự đưa câu chưa duyệt vào bài kiểm tra. Có 1 câu trắc nghiệm cần thẩm định lại cấu trúc A–D, 4 hình minh họa, 7 câu có bảng cần đối chiếu khi xuất Word. Các tài liệu gốc có thể chứa lỗi nội dung; việc nhập chỉ bảo toàn nguồn, không khẳng định đã thẩm định khoa học.

## Sử dụng `index.html` trực tiếp

1. Mở `index.html` bằng Chrome hoặc Edge.
2. Bấm **Ngân hàng câu hỏi 10–11**; chọn khối, chương, bài. Các câu nhập từ tệp Word hiển thị với trạng thái **Chờ duyệt**.
3. Bấm **Kiểm tra – Phân loại – Gắn đáp án**; so sánh câu gốc. Chọn bài phù hợp trong chương (hoặc để trống khi chỉ gán cấp chương), chọn mức độ NB/TH/VD/VDC, nhập đáp án, lời giải rồi bấm **Lưu và duyệt**. Câu có hình/bảng cần so sánh với DOCX gốc.
4. Tạo đề: chọn **Tạo & trộn đề** → khối, chương, bài, số câu, số mã đề, tỉ lệ mức độ. Hệ thống **chỉ lấy câu MCQ đã duyệt có đáp án và đúng phạm vi**; không đủ câu sẽ thông báo số lượng thiếu. Lưu và tải Word HS/GV.
5. Phiếu học tập: chọn **Tạo phiếu học tập** → khối/chương/bài, số câu và tỉ lệ; lấy các dạng câu đã duyệt có đủ thông tin. Xuất Word HS/GV.
6. Học sinh chọn **Làm bài kiểm tra**, mở mã đề, điền tên, trả lời và nộp bài để xem kết quả. Kết quả được lưu trong mục **Kết quả kiểm tra** trên thiết bị.
7. Trước khi chia sẻ cho học sinh, nhớ rằng `index.html` là WebApp **cục bộ, không có phân quyền máy chủ**. **Không gửi tệp `index.html` mà giáo viên đã điền đáp án cho học sinh**. Dùng bản Next.js/Supabase có đăng nhập và bảo vệ đáp án cho kiểm tra thật trên nhiều máy.

## Triển khai Next.js / Supabase trên Vercel

1. Sao lưu Supabase hiện tại. Nếu nâng từ 6.0 đã chạy, **không chạy lại `schema.sql`**, mà chỉ chạy `supabase/migrate_6_0_to_6_1.sql` trong SQL Editor. Nếu tạo cơ sở dữ liệu mới, thực hiện `schema.sql` trước rồi migration 6.1.
2. Cấu hình `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` trên Vercel, chỉ lưu `SUPABASE_SERVICE_ROLE_KEY` ở phía máy chủ; không đưa lên `index.html`. **Không cần GEMINI_API_KEY cho nhập câu hỏi, quản trị, Word, tạo đề và chấm bài thông thường**. Khóa Gemini chỉ cần cho việc tạo câu hỏi/giải bằng AI.
3. Thiết lập Supabase Auth và cấp quyền `teacher` an toàn. Đăng nhập tài khoản giáo viên, mở **Ngân hàng câu hỏi** → **Nhập 416 câu từ 13 Word HS**. Ứng dụng đưa dữ liệu vào Supabase theo từng lô 25 câu, bỏ qua các câu đã nhập trước đó theo dấu vân tay và nội dung. **Không tự duyệt**.
4. Giáo viên lần lượt bổ sung bài học, mức độ và đáp án từng câu rồi duyệt; bắt đầu tạo đề/phiếu, công bố mã đề; học sinh đăng nhập và làm bài. Kết quả mới được lưu tập trung trong bảng Supabase.
5. Kiểm tra `npm test`, `npm install`, `npm run build` sau khi có kết nối npm và biến môi trường; chỉ sau đó mới phát hành trực tuyến.

## Trạng thái kiểm thử và giới hạn

- **40/40** phép kiểm thử Node.js đạt; thử thực tế giao diện Chromium với 416 câu, duyệt một câu có khóa đã đối chiếu, tạo hai mã đề, xuất DOCX, nộp bài đạt 10/10, lưu kết quả. Tệp DOCX kiểm thử đã dựng được trên LibreOffice.
- **Chưa** hoàn thành kiểm thử build Next.js production hoặc kết nối Supabase trực tuyến: môi trường này không có thông tin truy cập dự án Vercel/Supabase của người quản trị. Chưa ghi nhận số truy cập hoặc bài nộp của người thật trên Internet.
- Chức năng tự đọc thêm tệp DOC/DOCX/PDF/XLSX bất kỳ trực tiếp từ giao diện chưa được mở rộng đầy đủ; bộ **13 DOCX đã cung cấp** được trích xuất sẵn thành dữ liệu thật. File scan cần OCR riêng, phải kiểm tra thủ công.
- Bộ xuất Word hiện ưu tiên bảo toàn văn bản và phương án. **Chưa chuyển lại chính xác mọi đồ thị/hình ảnh/bảng phức tạp sang DOCX được tạo**, vì vậy cần đối chiếu với các DOCX nằm trong `source_docs/` trước khi phát cho học sinh.

## Quy định chất lượng và bảo mật

Không suy đoán đáp án hay mức độ, không đưa câu chưa duyệt vào đề. Hình ảnh, bảng số liệu, công thức và đơn vị của nguồn cần giáo viên soát xét. Thông tin học sinh và mã đáp án không được gửi tự động sang dịch vụ AI. Để dùng thật trên nhiều thiết bị, bắt buộc bật xác thực, phân quyền và lưu kết quả trên máy chủ.
