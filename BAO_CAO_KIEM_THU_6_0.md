# Báo cáo kiểm thử EduPlan AI 6.0

- 35/35 kiểm thử thuật toán gốc đạt (`node --test tests/*.test.mjs`).
- Cú pháp JavaScript `index.html`, mã nguồn API, bộ sinh Word: đạt.
- `app/page.jsx`, `app/ExtraTools.jsx`: JSX parse diagnostics = 0 (TypeScript parser).
- Chromium (nạp HTML): danh mục 78 bài, ngân hàng 18 câu demo đã duyệt; tạo 2 mã đề từ 2 câu TH đúng phạm vi; tải Word; mở mã đề; nộp bài và hiển thị /10; kết quả tự lưu trên trình duyệt; tạo 2 mã phiếu và tải Word. Không có lỗi JavaScript trong luồng.
- Kiểm tra hai tệp Word thực từ trình duyệt: ZIP OOXML `unzip -t` đạt, render Word/LibreOffice mỗi tệp 2 trang, không thấy chồng chữ tại các trang kiểm tra.
- Kiểm thử logic khi thiếu câu: từ chối tạo nếu nguồn đã duyệt không đủ cho mức yêu cầu, không tự thay bằng câu không đúng bài.
- Chưa chạy build Next.js production vì không có dependencies npm trong môi trường này; chưa thử kết nối cơ sở dữ liệu/API ngoài; chưa có website mới công khai.
