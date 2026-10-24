# EDUPLAN AI 7.0 - LUYEN TUNG CAU VA NHOM 5/10/15 TU TOAN NGAN HANG
**Tac gia:** Le Ba Nhan - Truong THPT Hon Dat

## Noi dung nang cap

Ke thua **EduPlan AI 6.9**, giu nguyen nguon du lieu 1.958 cau hoi va 67 tai lieu Word goc. Khong tao ngan hang cau hoi thu hai.

### A. Ban index.html - quan tri NGOAI TUYEN
1. Mo `index.html` trong Chrome/Edge. Tu thanh dieu huong chon `Luyen tung cau & nhom 5/10/15`.
2. Chon Khoi -> Chuong -> Bai -> Dang cau -> Muc do.
3. Chon `Pham vi cau hoi`:
   - `Tu on toan bo ngan hang`: co the tu giai moi cau co van ban nguon, ke ca cau chua kiem duyet. KHONG cham diem va KHONG cong bo dap an chua xac minh.
   - `Luyen co cham diem`: chi su dung cau du dieu kien: `verified===true`, `practice_enabled===true`, phuong an/day du khoa dap an hop le. Giao vien phai duyet va bat quyen tu luyen tung cau.
4. Chon `Bat dau 5 cau`, `10 cau`, `15 cau` hoac mot che do khac. Khong lay cau ngoai bai da chon; neu thieu thi chi dung so hien co.
5. Hoc sinh nhap dap an -> Xac nhan -> tu chuyen cau hoac bam `Cau tiep`. Cau tu on khong co diem so.
6. Lich su luu tren trinh duyet cua thiet bi. Toan bo cau hoi chua duyet van bao toan trong `state.bank`.

**CANH BAO:** `index.html` co chua du lieu quan tri va khoa dap an. KHONG tai `index.html` len thu muc `public/` cua Vercel; KHONG chia se ban nay cho hoc sinh.

### B. Ban Next.js - quan ly va phuc vu HOC SINH ONLINE

Da them `app/SourceSmartPractice.jsx` va gan vao `app/SmartPractice.jsx` de dung cung ngan hang `question_bank` Supabase. Hai nut chuyen `Tu on toan ngan hang` / `Luyen co cham - da duyet` co tren cung trang.

- `Tu on toan ngan hang`: may chu dung API `study-library` voi phan trang 25 cau; role `teacher` xem cau so huu, `student` CHI xem cau `study_enabled=true` da duoc giao vien cong bo. API chi gui noi dung cau/phan loai, **khong gui answer, explanation hay cac khoa bi mat**.
- Cac phien tu on 5/10/15/20/30/50 duoc chon theo thu tu quay vong trong pham vi va khong lap trong nhom. Tinh trang phien co the phuc hoi sau tai lai trang o cung trinh duyet; hoat dong xac nhan duoc luu qua API `study-note-save` vao `student_study_notes` Supabase (sau khi migration v6.8, v6.9 da chay).
- Nhung cau nguon chua duoc kiem duyet **khong co chuc nang tu cham**. Khi muon co diem, nguoi dung chuyen sang `Luyen co cham` theo API `smart-practice-start` / `smart-practice-answer` hien co, su dung cau da duyet va `practice_enabled`.
- De hoc sinh tham gia tu on ca nhom cau nguon, giao vien dang nhap mo tab `Bai tap tuong tac` va bam `Cong bo cau nguon cho hoc sinh` theo khoi/chuong/bai. KHONG bat dong bo tat ca neu chua xem xet noi dung hinh anh va tinh phu hop.
- Khong can GEMINI_API_KEY cho bo loc, doc cau, luu ghi chu, tu chuyen va cham nhung cau da duyet. AI sinh loi giai tu dong khong hoat dong neu chua co dich vu AI cau hinh o may chu.

### C. Trien khai Vercel va Supabase

1. Sao luu Supabase truoc khi nang cap; lay code tu ZIP, dua len GitHub private.
2. Doc `README_6_9.md` va chay cac migration theo thu tu neu chua co. Khong chay lai schema xoa du lieu.
3. Dat bien moi truong Supabase nhu tai lieu cu, khong dat service role key trong frontend.
4. Import ngan hang bang quy trinh co san cua ban 6.9. Khong nen tai ban `index.html` chua dap an len may chu.
5. Deploy Vercel, kiem tra dang nhap role giao vien/hoc sinh, cong bo cau nguon, tu on 5/10/15, tu tai lai, va qua trinh cham cau da duyet.

### D. Kiem thu

- `node --test tests/*.test.mjs`: 98/98 PASS (gia lap thuat toan, hop dong, cu phap chuong trinh).
- Chromium voi `index.html` HTML thuc: nap 1.958 cau; loc Hoa 10/Chuong Lien ket hoa hoc/Bai Lien ket ion duoc 20 cau nguon; tao nhom 5; khong trung ID; xac nhan mot cau co `correct=null`; khong loi JS; desktop 1440px/mobile 390px khong tran ngang.
- JSX syntax cua SourceSmartPractice/SmartPractice: khong co loi phan tich.

**CHUA XAC NHAN:** Next.js production build (thieu thu vien npm o moi truong kiem thu), ket noi du lieu Supabase that, tai khoan/phan quyen tren hạ tang Vercel, thong ke truy cap online va dong bo tren nhieu thiet bi. Khong coi nhung muc nay la da nghiem thu.

**Quy mo:** 1.958 cau nguon; 379 cau co co kiem duyet trong JSON, nhung co kiem duyet khong dong nghia la da xac minh doc lap; can duyet va bat `practice_enabled` truoc khi cham.
