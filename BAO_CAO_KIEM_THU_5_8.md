# KIỂM THỬ EDUPlan AI 5.8

- Kiểm tra tĩnh `node --check` thành công: mã JavaScript trong bản HTML demo và API `app/api/[action]/route.js`.
- Kiểm thử `npm test`: **30/30 đạt**, gồm tạo/trộn ma trận, chấm điểm, ánh xạ đáp án, chấm Đúng/Sai bốn ý, 21 chương/78 bài KNTT, phiếu 4 mức độ, lọc câu đã duyệt và tra nguồn tin cậy.
- Đã rà lại tên thanh công cụ: giao diện chính giữ 13 mục thống nhất, không có thanh công cụ giáo viên riêng.
- Đã bổ sung SQL migration mới `migrate_5_7_to_5_8.sql` để báo cáo lượt 7/30 ngày và theo khối.
- Chưa kiểm thử live với Supabase/Gemini; chưa thể kết luận hoạt động sản xuất, chưa có lượt truy cập/học sinh thực tế.
- Môi trường chưa thể hoàn thành `npm install` để chạy Next.js production build; **không khẳng định build thành công**.
- Công cụ chụp giao diện Chromium không xuất ảnh được; chưa có kiểm thử hiển thị trực quan cuối cùng bằng trình duyệt. Người triển khai cần kiểm thử giao diện desktop/mobile trên Vercel Preview trước khi dùng với lớp học.
