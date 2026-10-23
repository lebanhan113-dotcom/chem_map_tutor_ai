# EduPlan AI 5.1 – BẢN PHÁT HÀNH CHÍNH THỨC (CHẾ ĐỘ OFFLINE)

**Tác giả giải pháp:** Lê Bá Nhẫn – Trường THPT Hòn Đất  
**Phạm vi:** Hóa học lớp 10, 11, 12 | Dành cho giáo viên và học sinh.  
**Lưu ý:** “Phát hành chính thức” ở đây có nghĩa là bản HTML được đóng gói, kiểm thử giao diện và luồng dùng thử. CHƯA có xác thực tài khoản, khảo thí nhiều người dùng hay phê duyệt chuyên môn toàn bộ ngân hàng.

## Mở ngay trên máy tính
1. Tải `index.html` hoặc file HTML độc lập, mở trong Chrome hoặc Edge.
2. Chọn vai trò ở thanh trên cùng, khối Hóa 10–12, dùng bảng điều khiển hoặc ☰ Danh mục.
3. Vào “Thiết lập bài học”, chọn bài, form đề, nhập họ tên và lớp (khi là học sinh). Bấm bắt đầu.
4. Mỗi màn hình một câu; tự chuyển với trắc nghiệm, đúng/sai sau bốn ý; trả lời ngắn và tự luận cần xác nhận.
5. Vào “Ôn lỗi sai”, “Sơ đồ tư duy”, “Rà soát ngân hàng” hoặc “Công cụ soạn giảng” tùy nhu cầu.
6. Khi mở các công cụ soạn giảng kế thừa, có nút nổi “Trở về EduPlan AI 5.1”.

## Trên điện thoại
- Triển khai thư mục này lên Vercel (hoặc máy chủ web tĩnh), sau đó mở URL bằng Chrome, Edge hoặc Safari.
- Nhấn nút ☰ để mở menu. Khi chọn chức năng, menu tự đóng; không cần cài đặt ứng dụng.
- Tệp HTML cũng có thể được mở trực tiếp từ thiết bị tùy giới hạn của hệ điều hành và trình duyệt.

## Triển khai Vercel
1. Giải nén toàn bộ ZIP vào thư mục dự án, đưa lên GitHub hoặc tải thư mục lên Vercel qua quy trình triển khai hỗ trợ.
2. Vercel: Import Project, chọn thư mục gốc chứa `index.html` và `vercel.json`.
3. Khả năng tạo đề, học offline và dữ liệu đã nhúng hoạt động không cần khóa API. Thư mục `api/ai.js` kế thừa chỉ hoạt động khi cấu hình bí mật API phía máy chủ; chưa được kiểm thử kết nối API trong lần phát hành này.
4. Sau khi xuất bản hãy mở bằng máy tính và điện thoại; chạy lại đề 28 câu và 32 câu với dữ liệu giả lập.

## Các chức năng có sẵn
- Giao diện hai vai trò, tìm công cụ nhanh, menu dạng ngăn trượt, thay đổi khối 10–12.
- Tạo đề form 2025 (18 MCQ + 4 Đúng/Sai + 6 trả lời ngắn) hoặc đề mở rộng có thêm 4 tự luận.
- Một câu một màn hình, tự chuyển hoặc chuyển bằng nút, đánh dấu xem lại, khôi phục bản nháp và xuất kết quả JSON.
- Ngân hàng tích hợp 576 câu, 32 bài đại diện; có lời giải/nguồn đối chiếu ở mức sẵn có. Sơ đồ tư duy và CHEM-ERROR, công cụ KHGD/KHBD kế thừa.
- Kiểm tra cấu trúc và nguồn của ngân hàng, quản lý phản ánh câu hỏi.

## Giới hạn quan trọng
- **576 câu KHÔNG có nghĩa là 576 câu đã kiểm định đúng khoa học:** mọi đáp án, sản phẩm phản ứng, điều kiện, cách làm tròn vẫn cần giáo viên rà soát độc lập.
- Chế độ Giáo viên/Học sinh chỉ thay đổi giao diện, KHÔNG phải phân quyền bảo mật.
- Lưu trữ nằm tại trình duyệt đang dùng, không có đồng bộ tự động; có thể mất nếu xóa dữ liệu duyệt web hoặc chế độ riêng tư.
- Tệp xuất có thể mang họ tên học sinh, cần bảo vệ và chia sẻ đúng quy định của nhà trường.
- Không dùng bản offline làm hệ thống thi chính thức có giám sát, chống gian lận, chứng thực người thi hoặc nhiều người dùng.
- Phần tự luận cần giáo viên chấm; các phân loại lỗi sai và gợi ý học tập hiện theo quy tắc, chưa phải AI chẩn đoán được kiểm định.

© 2026 Lê Bá Nhẫn – Trường THPT Hòn Đất.
