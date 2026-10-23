EDUPLAN AI 5.7 – WEBAPP HÓA HỌC THPT KHÔNG CẦN KHÓA GEMINI
Tác giả giải pháp: Lê Bá Nhẫn – Trường THPT Hòn Đất
Ngày phát hành: 24/10/2026

1. CHẠY NGAY KHÔNG CẦN API KEY
- Mở file index.html bằng trình duyệt Chrome hoặc Edge. Có thể chạy không có mạng đối với công cụ có dữ liệu tích hợp.
- Không cài đặt hoặc nhập GEMINI_API_KEY. Không cần tải thêm config.js hay api/ai.js.
- Chọn lớp 10, 11 hoặc 12 và vai trò Giáo viên/Học sinh.
- Trợ lý Hóa học hỗ trợ giải thích chủ đề phổ biến, giải một số bài toán mẫu, gợi ý câu hỏi và phiếu học tập theo thư viện đã tích hợp.
- Khi nội dung không có trong bộ mẫu, WebApp báo giới hạn và gợi ý tài liệu nguồn, KHÔNG tự bịa đáp án hay trích dẫn.
- Nút "Sao chép prompt cho ChatGPT" chỉ hỗ trợ làm việc tại trang ChatGPT độc lập; không có tính năng lấy phản hồi ChatGPT tự động vào WebApp.

2. TÍNH NĂNG HOẠT ĐỘNG TRỰC TIẾP
- Chương trình sách Hóa học KNTT lớp 10, 11, 12.
- Ngân hàng câu hỏi, nhập và xuất JSON, câu chờ giáo viên duyệt.
- Tạo và trộn đề, phòng làm bài, xem kết quả /10 và phân tích đáp án.
- Tạo phiếu học tập, luyện bài tập tương tác, gọi tên học sinh, kế hoạch bài dạy.
- Trợ lý Hóa học tích hợp, nguồn tham khảo online theo liên kết.
- Sao lưu dữ liệu qua file JSON. Giữ dữ liệu cũ theo khóa localStorage 'eduplan56' để tránh mất kết quả khi cập nhật từ bản 5.6.

3. TRIỂN KHAI ONLINE KHÔNG CẦN GEMINI
- Để học sinh mở qua liên kết WebApp, có thể đưa duy nhất file index.html lên GitHub Pages, Vercel, Netlify hoặc hosting HTTPS.
- Hosting website KHÔNG đồng nghĩa với có cơ sở dữ liệu dùng chung: các dữ liệu tạo trên một trình duyệt mặc định chỉ lưu trên thiết bị đó.
- Nếu cần chia sẻ đề và thống kê dùng chung trên nhiều máy: cấu hình Supabase, sử dụng file supabase.sql. Đây là dịch vụ cơ sở dữ liệu riêng, KHÔNG phải dịch vụ AI. Chức năng đồng bộ là tùy chọn.
- Trong mục Kết nối online & dữ liệu, nhập Supabase Project URL và public anon/publishable key nếu cần đồng bộ. Tuyệt đối không điền service_role key vào HTML hay cấu hình công khai.
- Nên xây dựng cơ chế xác thực và phân quyền được nhà trường phê duyệt trước khi sử dụng với dữ liệu cá nhân học sinh.

4. CÁC GIỚI HẠN CẦN BIẾT
- Trợ lý tích hợp KHÔNG phải mô hình ngôn ngữ sinh nội dung tổng quát: không bảo đảm giải được mọi bài toán, mọi nội dung HSG, hay tự đọc toàn bộ Internet.
- Các câu tạo từ mẫu đều thuộc CHỜ DUYỆT và có thể chưa đủ độ khó Vận dụng cao; giáo viên phải xác minh công thức, điều kiện phản ứng, lời giải, mức độ, đáp án.
- Tài liệu online được mở tại trang nguồn; không tự tải hoặc sao chép sách có bản quyền.
- Thống kê lượt truy cập ở chế độ cục bộ chỉ phản ánh trình duyệt đã sử dụng; thống kê xuyên thiết bị cần backend đã cấu hình.
- Bản HTML đặt đáp án trong dữ liệu phía trình duyệt; dùng cho luyện tập, không phải nền tảng khảo thí chống gian lận mức cao.

5. QUY TRÌNH SỬ DỤNG TRỢ LÝ
- Mở Trợ lý Hóa học không cần khóa.
- Chọn Hỏi đáp / Giải bài mẫu / Tạo câu hỏi / Phiếu học tập / Tìm tài liệu.
- Nhập câu hỏi, ví dụ 'Tính oxi hóa của HNO3' hoặc 'Cho 5,6 g Fe phản ứng với HCl dư. Tính thể tích H2 ở đkc'.
- Nhấn 'Trợ lý hỗ trợ ngay'.
- Nếu tạo câu hỏi, nhấn nhập vào mục CHỜ DUYỆT và duyệt tại Ngân hàng câu hỏi trước khi ra đề.

6. KHẮC PHỤC SỰ CỐ
- Mở file trắng: thử Chrome/Edge mới, bật JavaScript.
- Thiếu câu kiểm tra: nhập câu đã kiểm chứng hoặc dùng bộ mẫu; không tự suy diễn câu chưa có nguồn.
- Máy khác không thấy điểm: dữ liệu mặc định lưu từng trình duyệt. Cần kết nối Supabase đúng cấu hình để dùng chung.
- Trợ lý không trả lời bài lạ: chọn chủ đề đã hỗ trợ hoặc mở nguồn đáng tin cậy trong mục tài liệu.

BẢN PHÁT HÀNH: 5.7 – KHÔNG YÊU CẦU GEMINI_API_KEY.
