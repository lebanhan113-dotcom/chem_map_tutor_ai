# EduPlan AI 6.3 - KNTT Hóa học THPT (672 câu)
**Tác giả giải pháp:** Lê Bá Nhẫn - Trường THPT Hòn Đất.

## Số liệu thực tế của dữ liệu
- 672 câu từ 21 tệp Word người dùng cung cấp; Hóa 10: 224; Hóa 11: 192; Hóa 12: 256.
- 190 câu trắc nghiệm nhiều phương án hoặc trả lời ngắn có đáp án và lời giải đã kiểm tra nội dung trong lần này; cần đối chiếu độc lập trước khi sử dụng thi chính thức.
- 86 câu có đáp án đề xuất chưa duyệt (trong đó 3 câu có hình/bảng cần kiểm tra); 396 câu chưa có đáp án đề xuất.
- 672 câu có đề xuất bài học và 4 mức độ NB, TH, VD, VDC. Có 93 câu chưa đủ căn cứ bài cụ thể, được xếp tạm 'Ôn tập chương'; tất cả mức độ và bài học cần kiểm tra lại theo mục tiêu bài dạy.
- Chưa giải toàn bộ 672 câu. Chưa có kết quả kiểm thử production Next.js/Supabase thực tế.

## Mở trên máy: bắt buộc file index.html
Giải nén ZIP, mở `index.html` tại thư mục gốc bằng Chrome/Edge. Không yêu cầu Gemini API key cho các chức năng cơ bản. Dữ liệu lưu cục bộ trên thiết bị. Không phát công khai tệp HTML chứa câu hỏi/đáp án cho học sinh trong kỳ thi thật.

## Triển khai Next.js online
1. Đưa mã nguồn lên GitHub repository riêng tư; dùng Vercel để triển khai Next.js.
2. Tạo Supabase project, chạy `supabase/schema.sql` và các file migration bản trước đúng thứ tự (nếu cần).
3. Cấu hình các biến môi trường Supabase theo `.env.example`, tuyệt đối không đưa service role key vào client.
4. Trong giao diện Next.js, giáo viên đăng nhập -> Ngân hàng câu hỏi -> **Nhập 672 câu từ dữ liệu riêng**. Máy chủ đọc dữ liệu từ `data/uploaded_bank.json` bảo mật, không cung cấp qua URL công khai.
5. Giáo viên kiểm tra nội dung và quyết định -> **Xác nhận & duyệt 190 câu đã giải**. API kiểm tra quyền, đối sánh mã nguồn/ID, không ghi đè câu giáo viên đã tự sửa hoặc duyệt trước. Các câu khác vẫn chờ duyệt.
6. Tạo đề và phiếu Word từ câu có khóa đã duyệt; học sinh đăng nhập làm bài, nộp bài và lưu kết quả trên Supabase.
7. Để xem báo cáo người dùng cần triển khai thật và tạo dữ liệu từ truy cập; không có số liệu lịch sử giả.

## Các file quan trọng
- `index.html`: WebApp ngoại tuyến, 672 câu + 190 lời giải, lưu trên trình duyệt.
- `data/uploaded_bank.json`: dữ liệu riêng (bao gồm đáp án), KHÔNG ĐƯA RA THƯ MỤC `public`.
- `data/validation63.json`: kết quả phân loại, thống kê phê duyệt.
- `data/kntt_curriculum.json`: danh mục Hóa KNTT 10–12.
- `app/api/[action]/route.js`: API máy chủ phân quyền, nhập/duyệt ngân hàng.
- `SECURITY_6_3.md`: cảnh báo an ninh bài thi và dữ liệu học sinh.

**Nguyên tắc chính xác:** Không coi mọi câu đã được nhập là câu đã được giải; không dùng câu còn thiếu đáp án để chấm tự động; không nhận nhãn AI là chứng nhận chính thức của giáo viên.
