# EduPlan AI 6.7 – Lưu ý bảo mật
- `index.html` ngoại tuyến chứa toàn bộ bank và answer key, CHỈ dùng trên máy giáo viên, KHÔNG copy vào `public/` hoặc đăng URL web cho học sinh.
- Next.js dùng xác thực Supabase `getUser` và role profile. Dữ liệu câu hỏi đưa học sinh qua API `publicSmartQuestion` loại bỏ khóa đáp án.
- API `smart-practice-answer` tự chấm trên server theo `question_snapshots` được đóng băng khi tạo phiên; học sinh không thể sửa câu đã xác nhận.
- Đáp án chỉ được mở ngay sau nộp câu trong chế độ instant, hoặc khi kết thúc phiên trong chế độ cuối bài.
- `smart_practice_sessions` và `smart_practice_responses` bật RLS nhưng không cấp quyền client; truy cập qua Next.js và service-role key bí mật.
- Giáo viên chỉ được xem báo cáo theo `owner_id` của câu trong ngân hàng mình quản lý; học sinh chỉ thấy phiên của chính họ.
- Báo cáo chứa lịch sử học tập cá nhân: chỉ chia sẻ với người có trách nhiệm, tránh đăng tải công khai.
