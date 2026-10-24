# EduPlan AI 6.7 – Luyện tập thông minh & tự chuyển câu
**Tác giả:** Lê Bá Nhẫn – Trường THPT Hòn Đất.

## A. Đây là bản cập nhật trực tiếp từ bộ mã nguồn 6.6

Bộ nguồn giữ nguyên ngân hàng câu hỏi **1.958 câu**, 67 tệp DOCX nguồn, các phân hệ tạo đề/trộn đề, phiếu học tập, làm bài online, kết quả, công cụ Hóa học, trợ lý và báo cáo. Mục mới trên thanh điều hướng: **Luyện từng câu & nhóm 5/10/15**. Không sinh dữ liệu hoặc đáp án tự tạo. Không yêu cầu người sử dụng nhập `GEMINI_API_KEY` để sử dụng luyện tập, chấm điểm và báo cáo.

### Hai môi trường sử dụng
- `index.html` tại gốc ZIP: **bản quản trị ngoại tuyến** chứa khóa đáp án và ngân hàng; mở trực tiếp bằng Chrome/Edge để dùng và kiểm tra trên máy giáo viên. Ghi lịch sử bài luyện vào `localStorage` trên máy. **Không được công khai tập tin này cho học sinh qua website**. Tệp này KHÔNG phân quyền thật; lựa chọn vai trò chỉ là tùy biến giao diện.
- `app/` và `app/api/[action]/route.js`: **ứng dụng online chính** Next.js, Supabase. Giáo viên/học sinh xác thực bằng Supabase; khóa đáp án và chấm điểm ở máy chủ. Có phiên luyện tập trên DB và tải lại/đăng nhập lại để tiếp tục. Bản này phải được cấu hình & triển khai mới hoạt động.

## B. Các bước nâng cấp trực tuyến giữ nguyên dữ liệu
1. **Sao lưu** mã nguồn đang chạy và toàn bộ Supabase (schema + data), đặc biệt `question_bank`, `profiles`, `tests`, `attempts`, `practice_attempts`.
2. Cập nhật source code phiên bản 6.7 vào nhánh mới của repository hiện tại. **KHÔNG xóa và tạo lại database**.
3. Trong Supabase SQL Editor, chạy **duy nhất migration** `supabase/migrate_6_6_to_6_7.sql` (tạo 2 bảng và chỉ mục mới). Không dùng lại `schema.sql` để làm mới database đang có dữ liệu.
4. Giữ các biến môi trường Supabase cũ trên Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Không bao giờ dùng service role key phía client.
5. Triển khai lại Next.js trên Vercel, bảo đảm kết nối API. Không cần Gemini để luyện tập: phần AI nâng cao ở menu Trợ lý AI cần dịch vụ riêng nếu dùng.
6. Người quản trị đăng nhập với quyền giáo viên vào **Ngân hàng câu hỏi**, kiểm tra từng câu có `verified=true`, đáp án/lời giải và bật `practice_enabled=true` đối với câu thật sự cho phép tự luyện. Các đề đang mở không nên tái sử dụng câu trong luyện tập.
7. Tạo tài khoản học sinh thử, chọn mục **Luyện từng câu & nhóm 5/10/15**; chạy thử 5 câu, đăng xuất/đăng nhập, nộp hết và xem báo cáo.
8. Khi đã kiểm chứng với dữ liệu thật và RLS, mới phát hành URL chính thức cho học sinh.

## C. Hướng dẫn từng công cụ
### Luyện từng câu
1. Chọn khối → chương → bài → dạng câu → mức độ; nhập lớp (họ tên lấy từ tài khoản đăng nhập).
2. Chọn `Làm từng câu`, thời gian, cách công bố đáp án và bật `Tự chuyển câu`.
3. Bấm **Bắt đầu luyện tập**, đọc câu và đánh dấu nếu chưa chắc chắn.
4. Chọn/nhập đáp án, bấm **Xác nhận**. Hệ thống lưu và chuyển câu sau một khoảng để đọc lời giải.
5. Kết thúc: xem đúng/sai/lời giải (đúng theo cấu hình), xem lại câu sai hoặc luyện tiếp.

### Luyện tập tập trung 5 câu
1. Chọn một bài (hoặc cả chương) và bấm **Bắt đầu 5 câu**.
2. WebApp ưu tiên câu từng làm sai, trải đều mức độ, không lặp trong một phiên và ưu tiên câu chưa gặp ở nhóm tiếp theo.
3. Nếu có dưới 5 câu hợp lệ, báo đúng số câu hiện có và luyện số đó, **không** đưa câu chưa được duyệt vào để bù.
4. Chọn `Xem sơ đồ bài học`, `Luyện câu sai`, `Thay bài học`, `Nhóm 5 câu tiếp theo` tùy nhu cầu.
5. Chế độ tương tự hoạt động với 10, 15, hoặc số câu tự chọn 20–50.

### Giáo viên
1. Duyệt đáp án, lời giải và công thức; bật cho phép tự luyện cho từng câu.
2. Chọn thanh công cụ luyện tập, bấm **Tổng hợp kết quả học sinh**.
3. Xem báo cáo theo lớp và khối; tải Excel dưới dạng CSV (Excel mở được), Word DOCX, hoặc In/Lưu PDF.

## D. Những kiểm tra đã thực hiện
- Kiểm tra cú pháp Next.js API bằng `node --check` và JSX bằng parser TypeScript.
- `npm test`: 73/73 kiểm thử hiện có và kiểm thử nâng cấp đạt, trong đó 13 test mới bao gồm chọn đúng bài, không lặp, thiếu câu, sai ưu tiên, chấm tf4/trả lời ngắn, bảo mật đáp án và migration không xóa bảng.
- Mở bản HTML bằng Chromium qua DOM trực tiếp: nạp 1.958 câu, bật quyền tự luyện cho nhóm thử nghiệm tạm thời, luyện 5 câu, ghi đúng/sai, nạp lại DOM, tiếp tục, kết thúc, lưu lịch sử. Không phát sinh lỗi JavaScript trong luồng thử.
- Thử bố cục máy tính 1440px, điện thoại 390px, xem ảnh QA.
- Thử tạo DOCX báo cáo giáo viên và render bằng LibreOffice.

## E. Chưa hoàn thành / chưa kiểm chứng
- **Chưa build Next.js production:** môi trường hiện không có các thư viện npm đã cài và không thể xác minh kết nối Vercel/Supabase thật của người quản trị. Chưa thực hiện thử nghiệm tải lại **qua máy chủ Supabase thực** và không có số liệu học sinh thật.
- Chưa bổ sung bộ dựng MathJax/KaTeX cho mọi công thức lấy từ MathType/OLE; câu có hình và công thức phức tạp cần kiểm tra hiển thị thủ công trước khi bật tự luyện.
- Chưa hoàn thiện mẫu trắc nghiệm theo cấu trúc nguyên đề 18+4+6 trong phân hệ luyện từng câu; phân hệ tạo đề và kiểm tra cũ vẫn độc lập.
- Chưa triển khai lựa chọn **tập con nhiều chương** (hiện chọn một chương hoặc toàn bộ chương). Chưa có phân tích AI tạo sinh chạy trong luồng luyện tập; phản hồi sử dụng lời giải đã duyệt và quy tắc xác định lỗi thường gặp.
- Chưa có bản cập nhật số câu mới vượt mức 1.958: việc rà soát khóa đáp án vẫn theo trạng thái trước đó. Chỉ câu `verified && practice_enabled` được lựa chọn.
- Bản HTML ngoại tuyến không chứng minh độ an toàn của vai trò, không dùng làm website công khai.

## F. Quy tắc an toàn
- Không dùng câu đang được giao kiểm tra chính thức cho kho luyện tập công khai.
- Giữ mã định danh câu và bản chụp câu/đáp án **tại thời điểm bắt đầu phiên**; cập nhật ngân hàng về sau không thay đổi cách chấm của phiên đã tạo.
- SQL migration chỉ thêm bảng, chỉ mục, RLS; không xóa dữ liệu cũ.
- Kết quả tự luận chỉ ghi nhận câu trả lời, chờ người có chuyên môn đánh giá. Không tự cấp điểm sai.
