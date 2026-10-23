# EDUPLAN AI 5.5 ONLINE – WEBAPP HÓA HỌC THPT 10–11–12

**Tác giả giải pháp:** Lê Bá Nhẫn – Trường THPT Hòn Đất  
**Phiên bản:** 5.5.0 · 23/10/2026  
**Tình trạng:** Mã nguồn có thể cấu hình triển khai lên Vercel và Supabase. **Chưa được phát hành lên tên miền thực**, chưa chạy kiểm thử tích hợp với tài khoản dịch vụ thật. Không gọi phần mềm này là hệ thống online đã hoạt động cho tới khi có kiểm thử thực tế.

## 1. Cấu trúc bộ giao

- `app/`: Giao diện Next.js và API phía máy chủ.
- `lib/exam.mjs`: Trộn mã đề/đáp án, chấm điểm trắc nghiệm, Đúng/Sai bốn ý và trả lời ngắn.
- `lib/quota.mjs` + `lib/blueprint.mjs`: Ma trận câu hỏi NB/TH/VD/VDC, phân bổ số lượng khi làm tròn và quota NLS/AI.
- `lib/insights.mjs`: Phân tích theo chương, bài, độ khó; gợi ý học tập dựa trên phần học sinh làm sai.
- `supabase/schema.sql`: Cơ sở dữ liệu, phân quyền RLS, thống kê tổng lượt truy cập.
- `data/seed.json`: 12 câu hỏi minh họa để nạp thử vào bản online. **Không phải bộ 576 câu cũ.**
- `tests/`: Kiểm thử bộ máy trộn đề, chấm điểm, ma trận, phân tích kết quả.
- `DEMO_EDUPLAN_AI_5_5.html`: Bản HTML độc lập dùng thử (18 câu minh họa). Chỉ lưu dữ liệu trên trình duyệt, không có Supabase hoặc Gemini.

## 2. Những nâng cấp so với EduPlan AI 5.4

1. **Ma trận đề 4 mức độ:** Giáo viên nhập số câu, tỉ lệ Nhận biết – Thông hiểu – Vận dụng – Vận dụng cao và số câu NLS/AI tối thiểu. Bộ máy chủ lập ma trận, báo thiếu chính xác, không lén hạ độ khó.
2. **Trộn và xuất đề:** Trộn câu và phương án A–D trên máy chủ, hỗ trợ 1–6 mã đề trong một lần. Giáo viên tải tệp TXT gồm **đề và đáp án**, không hiển thị công khai cho học sinh.
3. **Ngân hàng an toàn:** Nhập JSON theo lô, kiểm tra cấu trúc, ngăn câu trùng nội dung trong cùng kho/lô nhập, lưu chờ duyệt. Có nút **sao lưu JSON** từng khối.
4. **AI bổ sung nguồn online:** Nếu ma trận thiếu câu, AI có thể tìm gợi ý từ Wikipedia/PubChem và sinh **bản nháp theo mức độ còn thiếu**; giáo viên đối chiếu, duyệt lại. Không tự phát hành câu AI tạo. Hạn chế: AI có thể sai nội dung, phương án hoặc mức độ nhận thức.
5. **Giải bài online:** Gemini trên máy chủ nhận bài tập Hóa 10–12, trình bày cách giải, kiểm tra đơn vị/công thức và cảnh báo lỗi. Không gửi khóa API vào trình duyệt.
6. **Kết quả học sinh:** Chấm thang 10; sau nộp xem đủ nội dung câu hỏi, đáp án, cách giải; học sinh có lộ trình ôn theo bài còn yếu và các dạng khó.
7. **Phân tích giáo viên:** Tỷ lệ đạt theo mức độ, theo chương/bài, danh sách câu tỷ lệ trả lời đúng thấp (tối thiểu hai lượt), dựa trên tối đa 1.000 bài nộp mới nhất và điểm phần của Đúng/Sai bốn ý.
8. **Chống mất dữ liệu bài làm:** Trình duyệt lưu tạm đáp án theo tài khoản/mã đề và khôi phục khi mở lại đề trên thiết bị; khi hết giờ tự gửi một lần nếu còn kết nối. Máy chủ cho 30 giây truyền dữ liệu kể từ hạn kết thúc.
9. **Đếm truy cập:** Tổng lượt, mã trình duyệt duy nhất (không phải số người chính xác), theo ngày, tài khoản đăng ký và điểm số được lưu trên Supabase kể từ khi triển khai bản này.
10. **Giao diện:** Thêm ma trận, cảnh báo thiếu học liệu, theo dõi số câu đã làm, phân tích câu hỏi và nút tiếp tục tự học. Hỗ trợ thiết bị di động.

## 3. Chạy HTML demo – không cần đăng nhập

Giải nén ZIP, mở `DEMO_EDUPLAN_AI_5_5.html` bằng Chrome/Edge. Chọn **Tạo & trộn đề** → chọn Hóa 10 và 4 câu, ma trận 30%–40%–20%–10% → **Tạo & trộn đề** → **Mở làm thử** → **Nộp bài**. Kết quả và thống kê demo nằm trong LocalStorage của chính trình duyệt. **Không nhập thông tin cá nhân học sinh thật** vì bản demo không có máy chủ và phân quyền.

## 4. Cầm tay chỉ việc triển khai WebApp online

### Bước 1. Tạo Supabase

1. Truy cập https://supabase.com/dashboard → tạo **New Project**.
2. Vào **SQL Editor**, mở `supabase/schema.sql`, sao chép và chạy toàn bộ.
3. Kiểm tra đã có bảng: `profiles`, `question_bank`, `tests`, `attempts`, `test_sessions`, `visits`, `ai_usage`.
4. Lấy **Project URL**, **publishable/anon key** và **service role/secret key** trong mục cấu hình API. Service role/secret key là bí mật, **không đưa lên GitHub, không đặt tên biến `NEXT_PUBLIC_*`**.

### Bước 2. Chạy thử trên máy tính

Tải Node.js 20 trở lên. Mở terminal tại thư mục chứa `package.json` rồi chạy:

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm run dev
```

Chỉnh `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://TEN-DU-AN.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_SECRET_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-2.5-flash
```

Mở http://localhost:3000. `GEMINI_API_KEY` là tùy chọn; thiếu key thì **chức năng AI báo lỗi rõ ràng**, đề kiểm tra đã duyệt vẫn chạy. Các khóa phải để ở máy chủ, không nhúng vào HTML.

### Bước 3. Tạo giáo viên

- Đăng ký tài khoản qua giao diện; Supabase mặc định cấp quyền `student`.
- Quản trị viên vào SQL Editor và chỉ cấp vai trò giáo viên cho tài khoản đã được xác nhận:

```sql
update public.profiles
set role='teacher'
where id=(select id from auth.users where email='EMAIL_GIAO_VIEN_DA_XAC_MINH');
```

- Đăng xuất/đăng nhập lại để hiện bảng chức năng giáo viên. Không cho người dùng tự chọn `teacher` khi đăng ký.

### Bước 4. Xác thực các chức năng

1. Giáo viên nạp 12 câu mẫu, kiểm tra và duyệt; dùng **sao lưu JSON** kiểm chứng dữ liệu.
2. Giáo viên tạo/trộn đề theo ma trận đúng phân phối; kiểm tra nhãn NLS/AI và số câu theo cấp độ.
3. Dùng nút **Tải đề + đáp án** và xác minh mỗi mã đề có ánh xạ đáp án khác nhau nhưng chấm thống nhất.
4. Học sinh thứ nhất mở mã đề, làm bài; thử tải lại trang, nhập lại mã để khôi phục câu đã lưu tạm.
5. Nộp bài, kiểm tra điểm /10, đáp án/giải thích và lộ trình ôn tập.
6. Tài khoản giáo viên xem **Kết quả & người dùng**, bảng phân tích từng cấp độ và thống kê truy cập.
7. Kiểm tra tình huống câu ngân hàng không đủ: nếu Gemini có key, hệ thống tạo câu nháp, nhưng không được tự công bố khi chưa duyệt.

### Bước 5. Đưa lên Vercel

1. Tạo kho GitHub mới, tải **nội dung thư mục** dự án lên (không đưa `.env.local` lên kho).
2. Vào https://vercel.com/new → **Import Git Repository** → chọn kho; Framework = **Next.js**.
3. Thêm các biến ở mục **Environment Variables**, bảo đảm `SUPABASE_SERVICE_ROLE_KEY` và `GEMINI_API_KEY` không công khai.
4. Bấm **Deploy**; sau khi có URL Vercel, thử bằng ít nhất một tài khoản giáo viên và hai tài khoản học sinh riêng.
5. Chỉ đổi tên miền từ dự án cũ khi đã xác nhận đăng nhập, tạo đề, làm bài, chấm, RLS, thống kê và AI đều đạt yêu cầu.

### Nâng cấp từ 5.4 lên 5.5

Không thêm bảng hoặc cột bắt buộc: dữ liệu 5.4 theo cùng `schema.sql` có thể được giữ lại nếu cấu trúc đang khớp. **Trước khi thay mã nguồn, sao lưu Supabase và ngân hàng JSON.** Việc đổi mã nguồn không tự làm thay đổi URL đã triển khai cũ; quản trị viên phải deploy lại. Dữ liệu từ phiên bản 5.2 hoặc cấu trúc khác cần kiểm tra và chuyển đổi riêng. Không được khẳng định đã tích hợp bộ 576 câu khi chưa thực sự nhập/tái thẩm định.

## 5. An toàn và giới hạn

- Không có công nghệ nào bảo đảm chống gian lận tuyệt đối; cần thêm giám sát đối với bài kiểm tra chính thức.
- Dữ liệu cá nhân học sinh phải được bảo vệ theo quy định của nhà trường. Chỉ dùng tên/mã học sinh khi có mục đích giáo dục phù hợp.
- Mã trình duyệt không chứng minh số người thật, có thể bị thay đổi hoặc xóa, và đếm lượt không được chống lạm dụng ở quy mô Internet lớn. Nếu đưa ra công cộng cần bổ sung rate limit/WAF.
- Tìm kiếm online hiện dùng Wikipedia và PubChem, không tự truy cập mọi website trên Internet. Không tự động sao chép tài liệu có bản quyền.
- AI có thể sinh lỗi hóa học; giáo viên **phải duyệt** phương trình, công thức, đáp án, mức độ, nguồn học liệu và nhãn năng lực số/AI.
- Số liệu mới bắt đầu từ ngày kích hoạt Supabase; không khôi phục được lịch sử truy cập nền tảng cũ nếu không có dữ liệu xuất từ nền tảng đó.

## 6. Tình trạng kiểm thử đã thực hiện

Xem `BAO_CAO_KIEM_THU_5_5.md` để biết phạm vi kiểm tra. Đã chạy 12 kiểm thử thuật toán, kiểm tra cú pháp API/JSX, và kiểm thử giao diện HTML độc lập trên Chromium ở màn hình desktop và di động. **Chưa thực hiện `npm install`/`npm run build` đầy đủ hoặc kiểm thử Supabase/Gemini live do môi trường tạo gói không truy cập được npm và không có khóa dịch vụ.**
