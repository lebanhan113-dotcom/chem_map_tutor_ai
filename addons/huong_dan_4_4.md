# EDUPLAN AI 4.4 – CHEM SOLUTION ERROR-MAPPING AI
**Tác giả giải pháp:** Lê Bá Nhẫn – Trường THPT Hòn Đất

## Mở WebApp
- Bản HTML: tải về và mở bằng Chrome/Edge.
- Đưa lên Vercel: giải nén ZIP rồi triển khai thư mục gốc có `index.html`, `vercel.json` và `api/`.
- Khi chọn mục **Xưởng lời giải & lỗi sai** trong khu công cụ, hệ thống mở phân hệ mới (menu cũ tự ẩn).

## Chức năng mới
1. **Xưởng biên soạn:** chọn câu trong ngân hàng 576 câu; nạp đề/đáp án/lời giải đã có ở dạng **bản nháp**. Hỗ trợ đủ 4 loại câu (A–D, Đúng/Sai, trả lời ngắn, tự luận).
2. **Phân tích phương án nhiễu:** nhập bước sai đầu tiên, nguyên nhân, hệ quả, ghi rõ chọn nhầm A/C/D; KHÔNG tự bịa lỗi để ép khớp.
3. **Prompt Master theo câu:** xuất prompt TXT/sao chép để dùng với ChatGPT bên ngoài.
4. **Kiểm định:** kiểm tra cấu trúc, đủ bốn lựa chọn, phân tích nhiễu, trạng thái công thức gốc, năm xác nhận thủ công của giáo viên.
5. **Xuất Word thực (.docx):** bản giáo viên có đáp án + lời giải + lỗi sai; bản học sinh chỉ câu hỏi/phương án, xuất khi câu đã được giáo viên xác nhận. Kiểm tra hiển thị Times New Roman, A4.
6. **Luyện phát hiện lỗi:** trả lời câu A–D được duyệt rồi mới xem đáp án và phân tích nguyên nhân sai.
7. **Sao lưu:** xuất/nhập JSON hồ sơ biên soạn; nhập lại đưa trạng thái về Chưa thẩm định; báo cáo CSV.

## Quy trình sử dụng
1. Vào **Trung tâm → Xưởng lời giải & lỗi sai**.
2. Chọn khối lớp, phần câu hỏi; tìm theo mã hoặc nội dung, nhấn để nạp từ ngân hàng.
3. Điền nội dung còn trống: mã lỗi, bước sai đầu tiên, giải đúng và giải thích riêng từng phương án nhiễu.
4. Soạn bằng tay hoặc chọn **Prompt Master** để sao chép yêu cầu sang công cụ AI bên ngoài. KIỂM CHỨNG mọi lời giải trước khi ghi vào biểu mẫu.
5. Đối chiếu 11 tài liệu gốc, nhất là công thức OLE/MathType; nếu thiếu thông tin, đánh dấu CẦN ĐỐI CHIẾU.
6. Kiểm tra 5 mục bằng tay, bấm xác nhận; xuất Word riêng cho giáo viên hoặc học sinh; sao lưu JSON.

## Giới hạn và nguyên tắc an toàn
- **Chưa xử lý tự động toàn bộ câu hỏi trong 11 tài liệu.** Phân hệ sử dụng dữ liệu văn bản trích xuất có trong gói CHEM-ERROR 4.1 và thư viện 576 câu của EduPlan.
- Giao diện mới dựa trên quy tắc và trường nhập thủ công; **không kết nối AI trực tiếp** trong bản offline, không khẳng định đã kiểm chứng hóa học tự động.
- **Bộ nhớ lưu tại trình duyệt:** không bảo đảm lưu trữ giữa thiết bị, không có tài khoản hoặc phân quyền. Giao diện giáo viên/học sinh không phải cơ chế bảo mật chống lộ đáp án trong một kỳ thi chính thức.
- Nhãn “Đã giáo viên duyệt” là sự xác nhận trong trình duyệt, chưa phải thẩm định khoa học độc lập; chỉ dùng phát hành đề chính thức sau khi được giáo viên/nhà trường phê duyệt.
- Không nhập dữ liệu cá nhân thật hoặc thông tin nhạy cảm của học sinh.
- Không tự suy đoán biểu thức hóa học mất khi trích xuất .doc.
- Thư viện ngân hàng gốc 576 câu có thể chứa câu chưa qua phản biện; chỉ xuất phiếu học sinh từ hồ sơ đã được giáo viên xác nhận.
