# Báo cáo kiểm thử – EduPlan AI 6.4

- Tổng dữ liệu: 1035 câu, 34 tệp nguồn Word.
- 13 đề mới: 363 câu, 234 MCQ, 52 Đúng/Sai, 77 trả lời ngắn.
- Đáp án khóa nguồn hoặc đề xuất đã nhập cho 359/363 câu mới.
- Được đối chiếu và duyệt kỹ thuật bước đầu: 108 câu mới; tổng 298 câu cũ + mới.
- Đã phát hiện 2 câu mâu thuẫn đáp án nguồn ở chương Alkane Hóa 11; giữ ở trạng thái không duyệt.
- Mức bài và độ khó ở những câu còn lại chỉ là đề xuất; không tự động duyệt khi chưa kiểm tra độc lập.
- Đã chạy 50/50 bộ kiểm thử tự động Node (bao gồm 5 bài 6.4).
- Kiểm tra cú pháp: API Next.js và JS của `index.html` đạt `node --check`.
- DOCX báo cáo: đã render và kiểm tra 2 trang.
- Thử nghiệm thực tế với Vercel/Supabase production và trình duyệt thật: chưa xác nhận (Chromium headless trong môi trường phát sinh lỗi khởi chạy).

## An toàn

`index.html` bản quản trị chứa nguồn dữ liệu đáp án; không đăng bản này công khai. Next.js chỉ nhập đáp án nguồn qua API với phân quyền giáo viên. Không tuyên bố 1.035 câu đã có đáp án chuẩn chính thức.
