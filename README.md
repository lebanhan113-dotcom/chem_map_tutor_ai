# EduPlan AI 4.6 – WebApp Hóa học THPT

Tác giả giải pháp: Lê Bá Nhẫn – Trường THPT Hòn Đất.

## Sử dụng
- Mở index.html (hoặc EduPlan_AI_4_6_HoaHoc_THPT_WebApp.html) bằng Chrome/Edge.
- Chọn vai trò Giáo viên/Học sinh và khối Hóa học 10, 11 hoặc 12.
- Nút Danh mục mở menu, chọn chức năng sẽ tự ẩn. Ctrl+K để tìm công cụ.
- **Lộ trình hỗ trợ**: Học sinh hoàn tất hai lượt sửa lỗi; xuất JSON; giáo viên nhập ở Minh chứng rồi tạo lộ trình 7 ngày cho mã tương ứng.
- **Rubric tự luận**: Chọn bài và câu tự luận, chỉnh bốn tiêu chí có tổng 10 điểm; nhập điểm chấm thủ công; xuất CSV.
- **Bằng chứng học tập**: Thống kê số câu khác nhau và số lượt; xuất bảng CSV; không xem chênh lệch hai lượt là hiệu quả kiểm định.
- **Công cụ**: KHGD/KHBD, đề 18–4–6–4, CHEM-ERROR ANALYZER và các phân hệ cũ.
- **Sao lưu**: Công cụ -> Tải sao lưu 4.6; tương thích schema EduPlan45_BackupV1 với hai khóa bổ sung plans/rubrics. Có thể nhập dữ liệu 4.5.

## Giới hạn và tính chính xác
- Ứng dụng offline: chưa có xác thực, phân quyền tài khoản hoặc cơ sở dữ liệu tập trung. Chế độ giáo viên và học sinh chỉ là giao diện.
- Không nhập dữ liệu cá nhân nhạy cảm của học sinh; dùng mã giả lập.
- Ngân hàng kế thừa 576 câu từ 4.5, chưa có bộ câu mới hoặc thẩm định khoa học độc lập. 16/32 bài đại diện đủ 18–4–6–4; bài còn lại thiếu.
- Xếp mức bằng chứng và lộ trình là quy tắc, không phải AI tự đánh giá năng lực; không dùng cho đánh giá chính thức.
- Rubric mặc định là mẫu hỗ trợ chấm; chỉ giáo viên mới quyết định điểm và xác nhận nội dung.
- Tệp JSON chuyển offline có thể bị chỉnh sửa; bài nộp của bản 4.5 được chấm lại bằng ngân hàng ở phía giáo viên.
- Phần API kế thừa trong gói Vercel chỉ hoạt động khi có thiết lập máy chủ và bảo vệ khóa phù hợp.

## Cách triển khai Vercel
1. Tải ZIP và giải nén, đưa nguyên thư mục vào GitHub repository.
2. Import repository trên Vercel, dùng cấu hình vercel.json kèm theo.
3. Kiểm tra các thao tác trước khi cho giáo viên dùng thử; tuyệt đối không đưa API key vào HTML.

## Nguồn ý tưởng thiết kế được tham khảo
- Khan Academy (2026): bước học tiếp theo và báo cáo tiến độ: https://blog.khanacademy.org/meet-the-new-khan-academy-classroom-experience/
- Google Classroom: rubric do giáo viên rà soát/chỉnh sửa: https://workspaceupdates.googleblog.com/2026/08/streamlining-rubric-generation-in-Google-Classroom-with-Gemini.html
- PhET: thiết kế hoạt động khám phá với mục tiêu cụ thể: https://phet.colorado.edu/files/guides/TeacherGuide_ActivityDesign_en.pdf
Các nguồn chỉ là tham khảo ý tưởng UX, không tích hợp/ sao chép mã nguồn hoặc nội dung độc quyền.
