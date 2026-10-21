EDUPLAN AI 1.3 – WEBAPP GIÁO VIÊN HÓA HỌC THPT
Tác giả giải pháp: Lê Bá Nhẫn – Trường THPT Hòn Đất
Phiên bản: 1.3 | 21/10/2026

1. CÁCH MỞ
- Dùng thử cục bộ: tải tệp EduPlan_AI_1_3_HoaHoc_WebApp.html, bấm đúp và mở bằng Chrome hoặc Edge.
- Triển khai trên hosting tĩnh: giải nén bộ ZIP. Thư mục đã có index.html và vercel.json để dùng với dịch vụ hosting tĩnh (ví dụ Vercel). Việc tạo tên miền cần tài khoản triển khai của người sử dụng.
- Ứng dụng có 20 mục chức năng điều hướng, được giữ từ EduPlan AI 1.2.

2. CÁC LỖI ĐÃ SỬA VÀ CHỨC NĂNG MỚI
- Ngăn chấm, ghi điểm trùng khi bấm “Nộp bài” nhiều lần với cùng đề; cần tạo đề mới cho lượt mới.
- Dashboard chỉ tính kết quả thuộc khối lớp đang chọn; có tổng quan và thống kê theo chủ đề.
- Nhập CSV phân phối chương trình có dấu phân cách trong ngoặc kép và nội dung nhiều dòng; khi hiển thị trong ô tên bài, xuống dòng được chuẩn hóa thành khoảng trắng.
- Nhập thêm ngân hàng câu hỏi JSON xuất từ ứng dụng, kiểm tra cấu trúc và bỏ qua câu trùng theo nội dung.
- Phân tích phần trăm khối lượng nguyên tố trong công thức hóa học: ví dụ CuSO₄·5H₂O.
- Bổ sung kiểu văn bản Normal trong DOCX để Word nhận dạng rõ kiểu văn bản mặc định Times New Roman.
- Nhãn phiên bản được giữ nhất quán khi chuyển trang; giao diện đã kiểm thử ở kích thước di động.

3. QUY TRÌNH THỬ NHANH
- Chọn Hóa 10 → Tạo & Trộn đề → Tạo đề → Làm bài → Nộp → Dashboard.
- Chuyển sang Hóa 11 để xác nhận Dashboard không lẫn dữ liệu Hóa 10.
- Chọn Kế hoạch giáo dục → nhập bảng hoặc CSV → xuất DOCX.
- Chọn Công cụ Hóa học → nhập CuSO4·5H2O → Tính tỷ lệ thành phần.
- Chọn Tạo & Trộn đề → Xuất ngân hàng JSON / Khôi phục ngân hàng JSON.
- Chọn Lịch sử đã tạo → Sao lưu JSON trước khi đổi thiết bị hay chuyển website.

4. GIỚI HẠN BẮT BUỘC LƯU Ý
- Đây là ứng dụng chạy trong trình duyệt, không có máy chủ riêng, chưa kết nối AI API, chưa có OCR trực tiếp cho PDF/ảnh, chưa hỗ trợ tài khoản và thi trực tuyến đồng bộ nhiều người dùng.
- Dữ liệu được lưu cục bộ trong trình duyệt và không được mã hóa; không sử dụng để lưu họ tên, hồ sơ hay thông tin nhạy cảm của học sinh thật.
- Khi chuyển từ tệp HTML sang website, dữ liệu không tự đồng bộ: phải xuất Sao lưu JSON ở nơi cũ và khôi phục thủ công ở nơi mới.
- Giáo viên cần thẩm định nội dung và đáp án Hóa học trước khi phát đề hoặc sử dụng hồ sơ chính thức.
- Một số liên kết tài liệu tham khảo cần Internet.

5. NÂNG CẤP TIẾP THEO
Nền tảng có máy chủ và cơ chế bảo mật: OCR PDF → kiểm tra công thức, phản ứng, đáp án bằng AI → ngân hàng câu hỏi → trộn đề → thống kê kết quả → bài ôn tập cá nhân hóa.
