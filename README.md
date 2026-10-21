# EDUPLAN AI 3.2 — WebApp Hóa học THPT

**Tác giả giải pháp:** Lê Bá Nhẫn – Trường THPT Hòn Đất.

## Cập nhật

- Thư viện kiến thức cốt lõi cho 32 bài minh họa thuộc 21 chương, Hóa học 10–12 (Kết nối tri thức với cuộc sống). Đây là **phạm vi tuyển chọn**, không phải toàn bộ các bài SGK.
- 128 câu hỏi **tự biên soạn mới**, bao gồm 32 nhiều lựa chọn, 32 đúng/sai (mỗi câu 4 ý), 32 trả lời ngắn và 32 tự luận có tiêu chí chấm.
- 96 câu khách quan được thêm một lần vào ngân hàng cục bộ (không ghi đè ngân hàng có sẵn). 32 câu tự luận được truy cập tại mục **Kiến thức & Ngân hàng 4 phần**, không đưa vào bộ chấm tự động cũ.
- Có bộ lọc khối, chương, bài, loại câu, mức độ và từ khóa; luyện tập, xem phản hồi sau nộp; xuất JSON và Word giáo viên/học sinh.
- Gắn URL đối chiếu nội dung chương trình, ghi rõ câu hỏi không sao chép nguyên văn; các câu cần giáo viên kiểm định trước khi dùng chính thức.

## Cách dùng offline

Mở `index.html` bằng Google Chrome hoặc Microsoft Edge. Chọn khối 10, 11, 12 rồi mở **📚 Kiến thức & Ngân hàng 4 phần** ở thanh điều hướng.

Trên điện thoại, bấm **Hiện tất cả chức năng** để mở thanh menu. Sử dụng **Lịch sử đã tạo** để sao lưu dữ liệu JSON định kỳ.

## Cách triển khai trên Vercel

1. Đưa toàn bộ thư mục này lên GitHub repository hoặc nhập trực tiếp từ GitHub trong Vercel.
2. Framework Preset: `Other`. Output directory: mặc định. Không yêu cầu bước build.
3. Nếu sử dụng trợ lý AI máy chủ, cấu hình `GEMINI_API_KEY` trong Project Settings > Environment Variables. **Không** chèn khóa API vào `index.html` hay commit vào repository.
4. Kiểm tra lại giao diện sau triển khai, đăng nhập và giới hạn quyền truy cập trước khi lưu dữ liệu học sinh thật.

## Nguồn đối chiếu

- Bộ GD&ĐT, cấu trúc đề thi từ năm 2025: https://vqa.moet.gov.vn/vi/news/thong-bao/cau-truc-dinh-dang-de-thi-tot-nghiep-thpt-tu-nam-2025-74.html
- Hóa 10 KNTT: https://thi247.com/sach-giao-khoa-hoa-hoc-10-ket-noi-tri-thuc-voi-cuoc-song/
- Hóa 11 KNTT: https://hayhochoi.vn/muc-luc-sgk-hoa-11-ket-noi-tri-thuc-ly-thuyet-va-bai-tap-hoa-11-sgk-ket-noi-tri-thuc.html
- Hóa 12 KNTT: https://www.sgkvn.com/lop-12-15/ket-noi-tri-thuc-voi-cuoc-song-3/hoa-hoc-12-3683.html
- OpenStax Chemistry 2e: https://openstax.org/books/chemistry-2e/pages/1-introduction
- OpenStax Organic Chemistry: https://openstax.org/books/organic-chemistry/pages/1-introduction

## Lưu ý chính xác khoa học và bài thi

- **Phần I–III** là các dạng trắc nghiệm theo cấu trúc thi tốt nghiệp THPT áp dụng từ năm 2025.
- **Phần IV** là bài tập tự luận bổ sung cho dạy học, đánh giá tại lớp và bồi dưỡng, không phải phần bắt buộc của đề thi tốt nghiệp.
- Bộ câu hỏi được xây dựng mới để phục vụ demo và gợi ý ôn luyện, **chưa được kiểm định chuẩn hóa tâm trắc**. Giáo viên cần rà soát độ chính xác, mức nhận thức, điều kiện thí nghiệm và đáp án trước khi phát hành.
- Bản chạy offline lưu dữ liệu trong bộ nhớ trình duyệt, không đồng bộ nhiều người dùng. Không nhập thông tin cá nhân nhạy cảm của học sinh.
- Tự luận chỉ hiện đáp án tham khảo và rubric sau khi nộp; chấm tự luận cần giáo viên.
