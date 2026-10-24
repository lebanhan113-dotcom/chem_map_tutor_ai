# EduPlan 6.6: nguyên tắc bảo vệ đáp án

- `index.html` là bản quản trị cục bộ chứa thông tin đáp án, KHÔNG đăng công khai.
- Next.js API chỉ cho tài khoản `teacher` nhập hoặc phê duyệt câu hỏi. Mọi thao tác có lưu ID nguồn.
- Bộ đáp án chưa kiểm chứng hoặc có mâu thuẫn nguồn phải được giữ trong trạng thái chờ. 81 câu 6.6 đã có đối chiếu khóa nguồn và kiến thức, không đại diện cho mọi câu.
- Tuyệt đối không giả định cờ verified của các phiên bản trước đã được rà soát độc lập ở vòng này.
- Không đưa data/uploaded_bank.json vào public; chỉ dùng máy chủ Next.js.
