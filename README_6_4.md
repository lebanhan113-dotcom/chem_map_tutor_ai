# HƯỚNG DẪN EDUPlan AI 6.4 – 1.035 CÂU HỎI

**Tác giả:** Lê Bá Nhẫn – Trường THPT Hòn Đất.

## A. Bản chạy cục bộ
Mở `index.html` trên máy tính GIÁO VIÊN. Bản này tự bổ sung các câu mới nếu trước đây đã có dữ liệu 6.3 trong localStorage cùng origin. Các câu được lưu phân loại theo bài/mức độ đề xuất. Nhấp Ngân hàng → Lọc theo khối/chương/bài → Mở câu nguồn → Đối chiếu Word và lời giải → Lưu/duyệt.

**Quan trọng:** 1.035 là tổng câu nguồn từ 34 tệp. Có 363 câu mới từ 13 đề Word; riêng Hóa 10 Chương 2 có 5 câu trả lời ngắn trong nguồn, không tự tạo câu 6. Có 2 câu lưu trong textbox được tái dựng từ bản nguồn và vẫn có cờ yêu cầu đối chiếu. Câu có bảng/hình/công thức cần mở DOCX gốc.

## B. Nhập online
Đây là mã nguồn Next.js đã gắn `data/uploaded_bank.json` chứa 1.035 câu nguồn. Tạo dự án Supabase, chạy `supabase/schema.sql`, cấu hình biến môi trường trong Vercel (xem README.md). Sau khi đăng nhập bằng tài khoản giáo viên, gọi API `import-provided-64` theo từng lô offset (mỗi lô tối đa 30 câu). Hệ thống nhập mới theo `source_fingerprint`, tránh nhập trùng; không tự tạo đáp án trong bảng cơ sở dữ liệu cho câu chưa được phê duyệt.

API `approve-curated-63` chỉ duyệt nhóm đã có kiểm chứng (190 câu cũ + 108 câu mới) với xác nhận giáo viên, không tự duyệt các câu có đáp án nguồn nhưng còn nghi vấn.

## C. Chất lượng và riêng tư
Không tải `index.html` giáo viên lên Internet; dữ liệu gợi ý đáp án cần được đặt ở server riêng. Không tiết lộ dữ liệu học sinh, sử dụng phân quyền Supabase RLS. Trạng thái `SUBJECT_CROSSCHECKED_64` dành cho các câu đã đối chiếu đáp án, bài và mức độ; các câu còn lại KHÔNG được phát hành để chấm tự động.

**Chưa triển khai Vercel hoặc kết nối Supabase production từ phiên này.**
