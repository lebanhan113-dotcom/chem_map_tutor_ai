# Báo cáo kiểm thử EduPlan AI 5.2
Ngày đóng gói: 23/10/2026
Tác giả: Lê Bá Nhẫn – Trường THPT Hòn Đất

## Kiểm thử trình duyệt Chromium (giả lập giao diện; không phải kiểm thử tải lớn hay bảo mật độc lập)
- Hiển thị 576 câu ngân hàng; lọc lớp 10: 236, lớp 11: 152, lớp 12: 188.
- Tìm và xem chi tiết câu theo phần, đáp án, lời giải và nguồn đối chiếu.
- Biên tập KHBD bốn hoạt động và cập nhật bản xem trước ngay sau nhập mục tiêu.
- Tạo phiếu học tập lấy 11 câu theo cấu trúc thử 6–2–2–1; bản học sinh không chứa đáp án hay lời giải.
- Công thức CuSO4·5H2O → M = 249.677 g/mol, tính tỷ lệ 4 nguyên tố.
- Gọi tên ngẫu nhiên từ 3 tên trong lượt.
- Menu điện thoại mở/đóng và tự đóng khi chọn mục; không có tràn ngang ở 390px và 1440px.
- Nút mở hệ thống bài thi cũ và quay về trung tâm mới đạt.
- Không ghi nhận lỗi JavaScript trong các kịch bản kiểm thử trên.

## Kiểm thử API bằng mô phỏng (không phải hạ tầng Supabase thật)
- Thiếu môi trường analytics: trả về 503 và ghi lý do rõ ràng.
- Source-check từ chối private IP/host ngoài allowlist (400).
- Source-check cho phép OpenStax HTTPS và trả lời dạng JSON (mock 200).
- API lượt truy cập chấp nhận UUID hợp lệ; truy vấn thống kê yêu cầu ADMIN_REPORT_KEY.
- Khóa quản trị sai trả về 403; khóa đúng nhận dữ liệu tổng hợp mô phỏng.

## Giới hạn chưa xác minh
- Chưa kết nối Supabase thật hoặc tên miền Vercel của người dùng; chưa có số lượt truy cập thực tế toàn website.
- Chưa thực hiện kiểm thử tải lớn / chống bot / xâm nhập bảo mật độc lập.
- Ngân hàng 576 câu chưa phản biện hóa học độc lập toàn bộ.
- Kết quả kiểm tra HTTP nguồn không bảo đảm nguồn có nội dung khớp câu hỏi hay đáp án đúng.
- Khi dùng HTML offline, nguồn online/API cần mở thủ công hoặc triển khai online.
- Dữ liệu soạn giảng và danh sách học sinh mặc định lưu tại trình duyệt hiện tại, không đồng bộ giữa thiết bị.
