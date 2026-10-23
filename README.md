# EduPlan AI 5.2 – WebApp Hóa học THPT
**Tác giả:** Lê Bá Nhẫn – Trường THPT Hòn Đất

## Cách chạy
- Offline: mở `index.html` bằng Chrome/Edge. Ngân hàng 576 câu, rà soát cấu trúc, xưởng soạn giảng, phiếu học tập theo bài/chương, công cụ Hóa học, gọi tên ngẫu nhiên, hướng dẫn chi tiết hoạt động trên máy này.
- Online: đưa thư mục (bao gồm `index.html` và `api/`) lên GitHub, import repository vào Vercel rồi Deploy. `api/check-source` mới có thể kiểm tra trực tuyến nguồn theo danh sách miền cho phép.
- Báo cáo truy cập toàn website: tạo Supabase project, thực thi `docs/database.sql`, cấu hình 4 biến môi trường trong Vercel:
  - `SUPABASE_URL`: URL của Supabase project.
  - `SUPABASE_SERVICE_ROLE_KEY`: secret service-role key, *chỉ đặt ở Vercel*, không đưa vào HTML.
  - `ANALYTICS_SALT`: chuỗi bí mật dài để băm ngẫu nhiên visitor/session IDs.
  - `ADMIN_REPORT_KEY`: mật khẩu dài (>= 24 ký tự) dùng để xem báo cáo. Không lưu/mang vào mã nguồn.
Sau khi Deploy lại, kiểm tra `/api/visit`. Mở mục “Thống kê truy cập” và nhập `ADMIN_REPORT_KEY` để xem báo cáo và xuất CSV.

## Giới hạn đo lường
- Không thể thống kê thực tế toàn website khi chỉ mở file HTML offline; số liệu cục bộ chỉ tính số phiên mở trên thiết bị đó.
- Online chỉ ghi 1 event cho từng phiên browser/ngày, không ghi họ tên, lớp, điểm hay câu trả lời. Số **trình duyệt ước tính** không phải số người thật được xác thực.
- Có thể bị chặn bởi trình duyệt, xóa dữ liệu, chặn script hoặc người dùng từ chối thống kê, do đó không coi là số truy cập tuyệt đối.

## Đánh giá nội dung
- Ngân hàng Hóa 10–12 kế thừa 576 câu, cần giáo viên thẩm định khoa học từng câu. Kiểm tra link nguồn chỉ cho biết đường dẫn phản hồi, không chứng minh đáp án đúng.
- Biểu mẫu soạn giảng là công cụ nhập liệu và xem trước; chưa kết nối mô hình AI biên soạn trực tiếp. Phiếu học tập học sinh không đưa đáp án ra tệp.
- Công cụ Hóa học thực hiện tính khối lượng mol/thành phần phần trăm và kiểm tra số nguyên tử, không tự cân bằng phương trình hay xác nhận khả năng phản ứng.

## Giao diện
- Không còn bước lựa chọn “Giáo viên”; một không gian chung, trên máy tính có menu bên trái và trên điện thoại có menu trượt tự ẩn.
- Nút “Mở không gian học tập và đề thi” giúp truy cập hệ thống EduPlan kế thừa.
- Mỗi phân hệ có hướng dẫn từng bước ở cuối trang.

## Nguồn tham khảo
- Vercel Functions: https://vercel.com/docs/functions
- Supabase Postgres REST: https://supabase.com/docs/guides/api
- OpenStax Chemistry 2e: https://openstax.org/books/chemistry-2e/pages/preface
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
