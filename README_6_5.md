# EduPlan AI 6.5 - NGÂN HÀNG HÓA 10–12 (1.455 CÂU)

Tác giả: Lê Bá Nhẫn – Trường THPT Hòn Đất.

## Ngân hàng dữ liệu
49 tệp nguồn: 34 tệp cũ (1.035 câu), 15 tệp Hóa 12 mới (420 câu). Các câu mới: 270 trắc nghiệm, 60 đúng/sai (4 ý), 90 trả lời ngắn. Từng câu có ID, dấu vân tay nguồn, khối/chương/bài/mức độ gợi ý, đáp án/giải thích nguồn nếu trích được, cờ yêu cầu kiểm tra đối tượng Equation/MathType và ảnh.

## Dùng trực tiếp không cần API key
Mở `index.html` trên máy giáo viên; ngân hàng nguồn sẽ tự nhập incremental 420 câu một lần qua ID, không ghi đè nội dung được sửa trong localStorage. Lưu ý cùng-origin do trình duyệt quản lý; sao lưu dữ liệu cũ trước khi cập nhật. Học liệu mới KHÔNG TỰ DUYỆT TOÀN BỘ; đáp án nguồn KHÔNG phải lời giải được xác minh độc lập. Mở Ngân hàng → lọc theo Hóa 12, chương/bài → xem nội dung Word gốc → xác minh → duyệt theo từng câu.

## Online
Đăng nhập tài khoản quyền giáo viên, chạy Supabase schema từ gói trước và dùng API `import-provided-65` POST với `{ "offset":0 }`, mỗi lần tối đa 30 câu; lặp offset do API trả về. API tránh nhập trùng theo source_fingerprint. Giữ nguyên các bảng dữ liệu và bản sao lưu hiện tại. Tạo đề/chấm bài thật chỉ nên sử dụng câu đáp án đã duyệt. Cấu hình Vercel/Supabase theo README.md, không yêu cầu Gemini key cho quản trị ngân hàng, tạo đề, chấm điểm từ câu đã duyệt. Các chức năng AI phụ thuộc nhà cung cấp riêng.

## Giới hạn bắt buộc
- KHÔNG đăng index.html giáo viên lên hosting công khai: nó chứa khóa/đáp án nguồn cho phép xem mã.
- Không khẳng định 1.455 câu đã chính xác/đã duyệt: từ đầu có 298 câu đã được hệ thống cũ đánh dấu verified; đợt này chỉ bổ sung dữ liệu, 114 MCQ đã được đối chiếu lần đầu, nhưng không tự duyệt nếu thiếu xác minh độc lập bước cuối.
- 100 câu mới chứa Equation/MathType dạng OLE, 51 câu chứa hình; bản xem nguồn dạng text có thể mất ký hiệu. DOCX gốc có trong source_docs/; luôn đối chiếu trước khi phát hành.
- Trạng thái Vercel/Supabase production: chưa triển khai và chưa kiểm chứng thực tế.
