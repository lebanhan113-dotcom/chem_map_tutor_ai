# EduPlan AI 6.6 - NGÂN HÀNG 1.958 CÂU HÓA HỌC THPT

Tác giả: Lê Bá Nhẫn – Trường THPT Hòn Đất.

## Nguồn dữ liệu
Bản cũ 6.5: 1.455 câu từ 49 DOCX. Đợt này: thêm 503 câu có thật từ 18 DOCX (Hóa 10: 390, Hóa 11: 113). Tổng cộng 1.958 câu/67 tài liệu nguồn; 325 MCQ, 70 Đúng/Sai bốn ý, 108 câu trả lời ngắn trong đợt mới.

## Thẩm định khoa học (đúng nghĩa)
81 câu trắc nghiệm mới có đáp án, lý giải nội dung, gán bài KNTT và mức độ được đối chiếu với khóa nguồn, không phụ thuộc ảnh/bảng/MathType. 422 câu còn lại không tự duyệt. Một số công thức Equation/MathType và hình trong DOCX chưa chuyển hoàn toàn thành ký hiệu dạng văn bản. 298 câu của phiên bản 6.5 mang cờ verified cũ được bảo toàn, không khẳng định đã đối chiếu độc lập trong lần nâng cấp này. Xem data/conflicts66.json để biết câu cần sửa đề/khóa.

## Bản HTML trực tiếp
Dùng `index.html` trên máy GIÁO VIÊN: tất cả 503 câu mới được thêm theo ID ổn định vào localStorage; không ghi đè câu đã chỉnh sửa trước đó. 81 câu đã có `answer`, `explanation`, `verified:true`; các câu còn lại chỉ hiện `proposed_answer` (đáp án nguồn chưa kiểm tra) và không được tự động chấm. Đây là bản quản trị có đáp án, không đăng công khai.

## Bản online Next.js/Supabase
Triển khai private repo, tạo bảng theo supabase/schema.sql, cấu hình môi trường theo README.md, phân quyền `teacher`. Với quyền giáo viên, POST `/api/import-provided-66` JSON `{ "offset": 0 }`, lặp offset trả về để nhập đủ 1.958 bản ghi (mỗi lượt 30). Không ghi đè mã đã nhập. Sau nhập, POST `/api/approve-curated-66` JSON `{ "offset": 0, "accept": true }` và lặp offset trả về để duyệt DUY NHẤT nhóm 81 câu mới đã kiểm chứng, sau khi giáo viên xem danh sách. API kiểm tra tính khớp thân câu và chương/bài, không sửa câu đã duyệt. Không cần GEMINI_API_KEY để import/tạo đề/kiểm tra từ câu đã duyệt. Chức năng AI tạo văn bản dựa trên nhà cung cấp Gemini vẫn cần cấu hình server (hoặc mở ChatGPT website riêng).

**Chưa triển khai production**: môi trường hiện chưa kết nối Vercel/Supabase thực tế, chưa kiểm chứng nhiều thiết bị. Trình duyệt `index.html` và Next.js là hai chế độ quản trị khác nhau; dữ liệu không tự đồng bộ cho tới khi dùng API.

## Bảo vệ dữ liệu
`data/uploaded_bank.json` chứa khóa đáp án, không được đưa vào thư mục `public` hoặc phát hành link công khai. `index.html` là bản giáo viên, chứa khóa đáp án trong mã nguồn. Cấu hình Supabase RLS và bảo vệ tài khoản. Sao lưu trước khi nhập/bulk approve. Người học chỉ dùng trang online có xác thực.
