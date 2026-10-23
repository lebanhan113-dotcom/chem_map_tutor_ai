# Báo cáo kiểm thử – EduPlan AI 5.5 Online

Ngày: 23/10/2026 · Người thực hiện: công cụ kiểm tra mã nguồn tự động và kiểm thử HTML trên Chromium.

| Hạng mục | Kết quả | Phạm vi |
|---|---|---|
| Bộ test Node.js | ĐẠT 12/12 | Trộn đáp án, chấm MCQ/Đ-S 4 ý/điền ngắn, quota ma trận, cảnh báo thiếu câu, NLS quota, phân tích học tập |
| Kiểm tra cú pháp máy chủ | ĐẠT | `node --check app/api/[action]/route.js` |
| Kiểm tra JSX | ĐẠT | Trình phân tích cú pháp TypeScript JSX: 0 lỗi parse |
| HTML demo | ĐẠT | Chromium: Trang chủ → Ma trận → Tạo 2 mã đề → Làm bài → Nộp → Xem lời giải → Thống kê. Không có pageerror |
| Responsive demo 390 px | ĐẠT | Không tràn ngang ở trang chủ và ma trận |
| Next.js build hoàn chỉnh | CHƯA KIỂM TRA | Không tải được dependency npm từ mạng trong môi trường biên soạn |
| Supabase Auth/RLS/database thật | CHƯA KIỂM TRA | Chưa có thông tin kết nối dự án do người dùng quản lý |
| Gemini API/sources thật | CHƯA KIỂM TRA | Chưa có API key và quyền dịch vụ |
| Site online tại domain do người dùng quản lý | CHƯA TRIỂN KHAI | Cần tài khoản Vercel, Supabase và cấu hình chính thức |

## Chức năng cần nghiệm thu thực địa trước khi dùng thật

1. Nạp và rà soát toàn bộ ngân hàng câu hỏi từ các tài liệu đã được phép sử dụng.
2. Chỉ định và xác nhận giáo viên qua Supabase, tuyệt đối không tự cấp vai trò giáo viên trong giao diện người dùng.
3. Với mỗi mã đề, đối chiếu một lượt chấm câu hỏi bị trộn đáp án bằng tay.
4. Thử tình huống hết giờ, rớt mạng, hai thiết bị cùng nộp, hết hạn token, không đủ câu ở ma trận.
5. Kiểm tra học sinh A không đọc được bảng điểm/dữ liệu học sinh B qua API.
6. Kiểm tra nguồn, phương trình, đơn vị, dấu chỉ số trên/dưới, lời giải hóa học của từng câu do AI tạo.
7. Thống kê truy cập chỉ là số liệu vận hành tương đối; cần biện pháp chống request ảo trước khi dùng làm chỉ tiêu công bố.

**Kết luận:** Bản mã nguồn và demo đã có luồng hoạt động, nhưng không phải bằng chứng rằng hệ thống máy chủ trực tuyến đã sẵn sàng phục vụ người dùng thật. Việc nghiệm thu end-to-end sau triển khai là bắt buộc.
