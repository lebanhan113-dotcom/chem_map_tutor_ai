EDUPLAN AI 5.6 – WEBAPP HÓA HỌC THPT (KẾT NỐI TRI THỨC)
Tác giả giải pháp: Lê Bá Nhẫn – Trường THPT Hòn Đất
Ngày đóng gói: 24/10/2026

I. TỆP QUAN TRỌNG
- index.html              : TỆP CHẠY CHÍNH (đúng tên theo yêu cầu).
- config.js               : cấu hình giá trị CÔNG KHAI của Supabase, địa chỉ AI.
- api/ai.js               : Vercel serverless API gọi Gemini + Google Search.
- supabase.sql            : tạo bảng, phân quyền và RPC lưu số liệu online.
- README_HUONG_DAN.txt    : hướng dẫn này.

II. DÙNG NGAY KHÔNG CẦN CÀI ĐẶT
1) Giải nén toàn bộ thư mục ra một vị trí trên máy tính.
2) Nhấp đúp tệp index.html để mở với Chrome, Edge hoặc trình duyệt hiện đại.
3) Chọn Hóa 10, 11 hoặc 12; các chức năng KHÔNG CẦN MÁY CHỦ chạy cục bộ.
4) Tạo đề với số câu hiện có trong ngân hàng; khi thiếu câu, WebApp báo thiếu.
5) Có thể soạn thêm câu và import JSON; dữ liệu cục bộ lưu trên trình duyệt.
6) Tuyệt đối không nhập dữ liệu cá nhân nhạy cảm của học sinh khi dùng bản thử.

III. TRIỂN KHAI WEBSITE ONLINE TRÊN VERCEL
1) Tạo tài khoản tại https://vercel.com/ ; đăng nhập với GitHub (nếu phù hợp).
2) Đưa nguyên thư mục có index.html, config.js và api/ai.js lên một repo GitHub.
3) Trong Vercel, Add New Project > Import repo; chọn Framework Preset: Other,
   không yêu cầu build (ứng dụng HTML tĩnh + serverless Node.js).
4) Deploy. Vercel sẽ xuất bản index.html trên domain HTTPS do Vercel cấp.
5) Để AI chạy: tạo API key từ https://aistudio.google.com/apikey
   Vào Vercel > Project > Settings > Environment Variables:
     GEMINI_API_KEY = [khóa bí mật của bạn]
     GEMINI_MODEL   = gemini-2.5-flash  (tùy chọn)
   Redeploy để Vercel áp dụng biến môi trường.
6) Kiểm tra https://<domain-của-bạn>/api/ai ; phải nhận JSON có ok: true,
   aiConfigured: true. Đừng điền GEMINI_API_KEY vào index.html/config.js.

IV. BẬT CƠ SỞ DỮ LIỆU ONLINE SUPABASE
1) Tạo dự án mới tại https://supabase.com/dashboard .
2) Vào SQL Editor, dán toàn bộ nội dung supabase.sql và chọn Run.
3) Tại Supabase > Project Settings > API hoặc mục API Keys: sao chép
   Project URL và anon/public/publishable key (KHÔNG dùng service_role key).
4) Chỉnh config.js trước khi deploy lên website:
     window.EDUPLAN_CONFIG = {
       supabaseUrl: 'https://PROJECT.supabase.co',
       supabaseAnonKey: 'PUBLIC_ANON_KEY',
       aiEndpoint: '/api/ai'
     };
5) Commit và redeploy lên Vercel. Mỗi học sinh vào website từ một thiết bị
   có thể được ghi nhận số lượt truy cập; khi bắt đầu đề và nộp bài, số liệu
   toàn hệ thống tăng trên Supabase.
6) Để CÔNG BỐ ĐỀ: tạo tài khoản email giáo viên trong Supabase Authentication > Users
   (trường nên cấp tài khoản bằng lời mời, không cho học sinh tự cấp quyền).
   Trong WebApp > Kết nối online & dữ liệu > đăng nhập giáo viên.
   Vào Tạo & trộn đề > Tạo đề > Công bố đề online > sao chép link cho học sinh.
7) Giáo viên đã đăng nhập sẽ xem được danh sách điểm online theo mã bí danh
   tại Kết quả kiểm tra học sinh. Bài làm chi tiết hiển thị ngay tại thiết bị
   người làm, và giáo viên dùng dữ liệu cục bộ/bản sao lưu để xem chi tiết.
8) Học sinh nhập mã bí danh (ví dụ: 11A1-08), KHÔNG nhập mật khẩu thật.

V. KHI NGÂN HÀNG KHÔNG ĐỦ CÂU
- Ứng dụng KHÔNG phát minh đáp án và không phát hành đề thiếu câu.
- Nếu chạy trên website có máy chủ AI, nút Tạo & trộn đề sẽ tự đề xuất nội dung
  qua Gemini với tra cứu Google Search rồi ghi vào ngân hàng ở trạng thái CHỜ DUYỆT.
- Giáo viên đọc, kiểm chứng phản ứng, số liệu, nguồn rồi nhấn Duyệt.
- Tạo lại đề sau khi có đủ câu đã kiểm chứng.
- Với số câu lớn hơn giới hạn mỗi lần đề xuất AI (12), cần bổ sung nhiều đợt.
- Không có cơ chế tải/sao chép hàng loạt các tài liệu có bản quyền.

VI. CÁC CHỨC NĂNG ĐÃ ĐÓNG GÓI
- Danh mục SGK KNTT Hóa 10: 7 chương, 23 bài kể cả ôn tập.
- Danh mục SGK KNTT Hóa 11: 6 chương, 25 bài kể cả ôn tập.
- Danh mục SGK KNTT Hóa 12: 8 chương, 30 bài kể cả ôn tập.
- Ngân hàng 56 câu MẪU có đáp án và lời giải; bốn kiểu câu;
  phân mức Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao.
- Nhập/xuất JSON ngân hàng, kiểm duyệt, tìm kiếm/lọc, phát hiện trùng cơ bản.
- Tạo đề từng bài, từng chương, thường xuyên, giữa kì I, giữa kì II;
  form 2025: 18-4-6-4; trộn thứ tự câu và đáp án A/B/C/D.
- Làm bài trực tuyến trên website, chấm tự động phần khách quan,
  hiện chi tiết nội dung câu, đáp án đúng, lời giải, bài làm, điểm thang 10.
- Tự luận để giáo viên chấm cục bộ, tổng điểm là điểm tạm tính trước chấm.
- Tạo phiếu học tập, in hoặc lưu HTML/PDF qua trình duyệt.
- Luyện bài tương tác, phân tích lỗi sai, trợ lý AI giải bài từng bước.
- Thư viện nguồn đáng tin cậy (NXBGDVN, Bộ GDĐT, ACS, RSC, PhET, IChO).
- Gọi tên ngẫu nhiên, tránh trùng vòng; KHGD/KHBD; trợ giúp từng công cụ.
- Dữ liệu truy cập/đã vào đề/đã nộp và số người học được lưu máy chủ sau cấu hình.

VII. LƯU Ý QUAN TRỌNG
A. BẢN NÀY LÀ SẢN PHẨM MÃ NGUỒN SẴN SÀNG ĐỂ TRIỂN KHAI,
   CHƯA ĐƯỢC TRIỂN KHAI VÀO TÀI KHOẢN VERCEL/SUPABASE CỦA BẠN.
B. Bộ 56 câu mẫu KHÔNG thay thế ngân hàng 576 câu của phiên bản cũ.
   Không có tệp nguồn phiên bản 5.5 trong phiên làm việc này; cần import
   ngân hàng JSON/backup cũ để kế thừa đủ dữ liệu. Các cấu trúc JSON khác nhau
   có thể cần ánh xạ trước khi nhập.
C. Bài kiểm tra dùng trong luyện tập/đánh giá thường xuyên, KHÔNG có bảo mật
   chống gian lận cho kỳ thi quan trọng: đáp án nằm trong gói đề trên máy học sinh.
D. API AI công khai có thể phát sinh phí và rủi ro lạm dụng. Khi triển khai trường
   học cần thêm CAPTCHA, rate-limit bền vững, nhật ký giám sát và ngân sách AI.
E. Trình duyệt xóa dữ liệu sẽ mất ngân hàng/đề/bài làm cục bộ nếu chưa sao lưu.
F. Giáo viên phải thẩm định nội dung AI trước khi sử dụng chính thức.

VIII. NGUỒN ĐỐI CHIẾU NỘI DUNG
- Hóa 10 (mục lục): https://sach-giao-khoa.com/sach/sgk-hoa-hoc-10-4700854983
- Hóa 11 (mục lục): https://vietjack.com/hoa-hoc-11-kn/index.jsp
- Hóa 12 (mục lục): https://sgkvn.com/lop-12-15/ket-noi-tri-thuc-voi-cuoc-song-3/hoa-hoc-12-3683.html
- NLS: https://chinhphu.vn/?classid=1&docid=212648&pageid=27160&typegroupid=6
- Nguồn HSG: https://icho.sk/preparatory-problems/
- Tài liệu khoa học: https://edu.rsc.org/resources/ và https://www.acs.org/education/highschool.html
- Gemini grounding: https://ai.google.dev/gemini-api/docs/google-search

Tên tệp chính luôn là: index.html
