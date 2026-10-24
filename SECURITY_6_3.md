# An toàn dữ liệu ngân hàng câu hỏi (EduPlan AI 6.3)

- `data/uploaded_bank.json`: dữ liệu riêng máy chủ, giữ câu hỏi, lời giải kiểm chứng và 83 đáp án đề xuất chưa duyệt. KHÔNG sao chép sang `public/`.
- `public/bank-data/uploaded_bank.json` và `public/index.html` đã được loại khỏi bản online để không làm lộ nội dung và đáp án qua URL công khai.
- Người dùng mở `index.html` trong thư mục gốc của ZIP để trải nghiệm ngoại tuyến; KHÔNG đăng tệp ngoại tuyến có đáp án lên hosting phục vụ học sinh.
- Trong Next.js, tài khoản giáo viên bấm **Nhập 672 câu từ dữ liệu riêng**; máy chủ kiểm soát quyền và nhập mỗi lô 30 câu.
- Sau khi kiểm tra, giáo viên bấm **Xác nhận & duyệt 190 câu đã giải**; máy chủ kiểm tra dấu vân tay và nội dung câu hỏi, không sửa đè đáp án do giáo viên đã chỉnh.
- 83 gợi ý A–D chưa được kiểm tra cuối cùng không được duyệt tự động. Câu tự luận, Đúng/Sai và câu có hình vẫn cần chấm/kiểm tra riêng.
- `index.html` chỉ lưu dữ liệu trên thiết bị; Next.js cần cấu hình Supabase/Vercel, chưa có website triển khai.
