# EduPlan AI 6.4 – Bảo mật câu hỏi và đáp án

`index.html` trong gói là **bản quản trị dùng cục bộ**, chứa cả dữ liệu nguồn và gợi ý đáp án để giáo viên rà soát. KHÔNG tải tệp này lên hosting công khai cho học sinh, vì mã HTML/JavaScript có thể bị xem nguồn và lộ đáp án.

Để triển khai online, sử dụng dự án Next.js: dữ liệu trong `data/uploaded_bank.json` chỉ được truy xuất từ máy chủ qua API có xác thực giáo viên; tuyệt đối không sao chép tệp đó vào `public/`.

Bản website online chính Next.js không đồng nghĩa với việc có thể sử dụng tệp HTML offline để thi trực tuyến nhiều thiết bị. Cần cấu hình Supabase, Vercel, phân quyền và thử nghiệm kết nối.
