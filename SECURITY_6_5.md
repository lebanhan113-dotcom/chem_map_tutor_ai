# An toàn hệ thống 6.5

Bản `index.html` là giao diện dành riêng giáo viên dùng cục bộ, có chứa đáp án nguồn và dữ liệu thẩm định. Tuyệt đối không phát hành công khai cho học sinh. API Next.js đọc dữ liệu ngân hàng từ server và yêu cầu xác thực giáo viên khi nhập/duyệt. Không đưa `data/uploaded_bank.json`, file nguồn có đáp án hoặc `index.html` này vào `public` trên hosting.

Dữ liệu đã tạo đề cần đóng băng nội dung trước khi học sinh làm. Không tự duyệt khóa đáp án sai, câu đa nghĩa, hình/bảng/công thức thiếu hoặc bài/mức độ còn nghi vấn. Giữ RLS và sao lưu Supabase trước khi migrate. Hiện chưa có xác minh production.
