# BÁO CÁO KIỂM THỬ – EDUPLAN AI 5.7 (23/10/2026)

**Tác giả giải pháp:** Lê Bá Nhẫn – Trường THPT Hòn Đất.

## Kết quả đã xác nhận

- **24/24 phép kiểm thử Node.js đạt**: trộn đề, ánh xạ đáp án, chấm Đúng/Sai bốn ý, ma trận NB/TH/VD/VDC, mục lục chương/bài KNTT và các phép tính Hóa học; kiểm tra có endpoint phiếu học tập/báo cáo; đủ hướng dẫn các mục.
- **0 lỗi cú pháp** khi kiểm tra `app/api/[action]/route.js` với `node --check`.
- **0 lỗi phân tích cú pháp JSX** tại `app/page.jsx`, `app/ExtraTools.jsx` thông qua TypeScript compiler parser.
- **Bản HTML thử độc lập:** kiểm tra cú pháp JavaScript đạt; giả lập DOM cho các mục điều hướng thành công; tạo phiếu học tập, tính khối lượng mol và chọn học sinh ngẫu nhiên qua mô phỏng DOM thành công.
- **Danh mục bài KNTT:** 7 chương/23 bài lớp 10, 6 chương/25 bài lớp 11, 8 chương/30 bài lớp 12; tự động liên kết với biểu mẫu chọn lớp/chương/bài.

## Chưa xác nhận trong môi trường bàn giao

- **Build Next.js cuối cùng:** `npm install` thất bại do môi trường không phân giải `registry.npmjs.org` (EAI_AGAIN). Chưa kiểm tra build và chạy production thực.
- **Kiểm thử giao diện bằng trình duyệt thực:** Chromium trong môi trường bị lỗi/treo khi dựng trang; đã thay bằng kiểm tra mã, các hàm DOM giả lập, không coi là kiểm thử toàn diện thiết bị.
- **Supabase và Gemini live:** chưa có URL/khóa dự án thật nên chưa thử đăng nhập, chấm đề thật, tạo phiếu AI thật, báo cáo lượt truy cập thật hoặc giới hạn API. 
- **Triển khai Internet:** chưa kết nối Vercel/GitHub quản trị nên không có tên miền WebApp trực tuyến mới. Bản ZIP là mã nguồn để triển khai, không phải website đã được xuất bản.

## An toàn dữ liệu và giáo dục

- Không hiện nhóm thanh công cụ giáo viên; những thao tác xem đáp án/duyệt/phát hành được bảo vệ theo quyền trên máy chủ.
- Câu do AI bổ sung từ nguồn trực tuyến lưu ở trạng thái **chưa duyệt**. Không tạo/phát hành đề khi thiếu câu đã duyệt theo đúng ma trận.
- Phân biệt số lượt truy cập, mã trình duyệt duy nhất, số học sinh nộp kiểm tra và số học sinh làm bài tương tác. Số liệu chỉ bắt đầu từ lúc Supabase thực sự kết nối.
- Gọi tên ngẫu nhiên lưu trên trình duyệt, không gửi tên học sinh đến AI.
- Thư viện tài liệu dẫn đến nguồn gốc; không sao chép toàn bộ sách có bản quyền.

## Các bước nghiệm thu sau khi triển khai Vercel

1. Chạy schema/migration đúng phiên bản trên Supabase và cấu hình biến môi trường.
2. Kiểm tra đăng ký và phân quyền bằng **hai tài khoản khác nhau** (quyền biên soạn/học sinh).
3. Tạo câu và đáp án, kiểm chứng, duyệt rồi phát hành ít nhất hai mã đề; đối chiếu ánh xạ đáp án.
4. Nộp bài từ trình duyệt khác, kiểm tra thời gian máy chủ và điểm /10.
5. Tạo phiếu KNTT qua AI, kiểm tra hóa học và tải bản HTML để in.
6. Luyện tập, xem trả lời, đồng thời kiểm tra thống kê lượt luyện và học sinh tham gia.
7. Kiểm tra lượt truy cập tăng sau khi mở bằng trình duyệt mới (đã đồng ý và không bật Do Not Track).
8. Thử giao diện điện thoại, sao lưu cơ sở dữ liệu, xác minh phân quyền và rà soát trước khi dùng với học sinh thật.
