# EDUPlan AI 6.9 - Tich hop 11 phan he tren mot ngan hang cau hoi

Tac gia giai phap: **Le Ba Nhan - Truong THPT Hon Dat**.

## Mo nhanh tren may giao vien

Mo **index.html** bang Chrome/Edge. Ung dung dung lai mot `state.bank` gom **1.958 cau nguon Hoa hoc 10-12**, khong tao kho hoi rieng cho cac tab. Chon **Tong quan** de xem bo loc lop - chuong - bai va dung nut chuyen lien thong den **Bai tap tuong tac**, **Luyen 5/10/15**, **Tao/tron de**, **Phieu hoc tap** va **Tai lieu**. Danh muc SGK va Cong cu Hoa hoc cung co lien ket den cau hoi trong pham vi hien chon.

**Bao mat:** `index.html` co chua dap an phuc vu quan tri; khong chia se cho hoc sinh hoac tai len public web. Ban offline chi luu tien do tai thiet bi, KHONG phai ket qua tren server.

## Nang cap phan he online

1. `lib/learning-hub.mjs`: mo hinh du lieu thong ke doc tu cung `question_bank`. Mot `question_id` duoc tham chieu boi nhieu hoat dong; khong sinh ban sao cua cau hoi.
2. `GET /api/learning-hub`: phan quyen teacher (chi nguon minh quan ly) va student (chi cau da duoc cho phep xem); tra ve thong ke cac muc do, dang cau, bai/chương; **khong tra ve answer hoac explanation**. Hoc sinh duoc goi y on tap dua tren bai nop va phien luyen **da hoan thanh**.
3. `app/LearningHub.jsx`: giao dien hoc tap trung tam voi lien ket theo cung grade/chapter/lesson vao `StudyLibrary` va `SmartPractice`, phieu, de, tai lieu. Khi chuyen tab, bo loc duoc mang theo.
4. API `smart-practice-available` va `smart-practice-start`: phan trang cac cau phu hop den 5.000 ban ghi (truoc do chi lay toi da 1.000). **Chi lay** `verified=true, practice_enabled=true` va dap an dat kiem tra logic; khong tu phat minh them cau.
5. `supabase/migrate_6_8_to_6_9.sql`: THEM `student_study_notes`, index va RLS chi chu so huu. Khong xoa ket qua thi, khong thay doi bang ngan hang cu. Cac ghi chu chua duoc cham; khi co mang se dong bo Supabase va van giu ban tam o trinh duyet.
6. `GET /api/study-note-list` va `POST /api/study-note-save`: moi nguoi chi tai/ghi ghi chu cua minh; cau can duoc cho phep xem. Khong co endpoint công bo dap an nguon chua xac minh.

## Quy trinh trien khai thuc te tren Vercel + Supabase

1. SAO LUU du an Git, Supabase data va schema hien tai. Khong bo cai bang cu. Kiem tra tinh trang `question_bank`, `attempts`, `smart_practice_sessions`, `study_library` hien co.
2. Dua ma nguon trong goi ZIP len repo Git da ket noi Vercel. KHONG upload `index.html` quan tri vao thu muc `public`.
3. Chay migration SQL trong `supabase/migrate_6_8_to_6_9.sql` sau cac migration 6.7 va 6.8; script bo sung bang, khong xoa cot hay du lieu cu.
4. Duy tri bien Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` tren Vercel. `SUPABASE_SERVICE_ROLE_KEY` chi de o server. Khong yeu cau hoc sinh/giao vien nhap GEMINI_API_KEY de su dung chon cau, cham bai, thong ke va dong bo.
5. Dang nhap tai khoan teacher, xac minh nguon du lieu duoc nhap tren Supabase. **Du lieu JSON trong ZIP khong tu dong tu nhap vao DB khi deploy.** Can doi soat ID va nhap theo cong cu co san.
6. Cong bo cau nguon cho tu on (study_enabled) voi cau phu hop; chi bat `practice_enabled` cho cau da duyet co dap an tin cay.
7. Dang nhap tai khoan student tren **hai thiet bi** de test: tim chuong/bai, ghi chu mot cau, tai lai trang, thay ghi chu; lam 5/10/15 cau da duyet, nop bai va xem lich su; thu loi mang va khac quyen.
8. Sau khi kiem tra du, moi moi hoc sinh truy cap tren ten mien online.

## 11 phan he va muc do hoan thien

- **Tong quan:** moi them bang thong ke va goi y theo du lieu thuc (offline va API server).
- **Ngan hang:** dung chung 1 nguon; van can giao vien xem va duyet khoa cau hoi.
- **Danh muc KNTT:** mang theo bo loc bai vao tu hoc va phieu/de; giu 21 chuong/78 bai.
- **Tao/tron de:** giu logic cua ban 6.8; de da phat hanh dong bang bang snapshot; chua thu online.
- **Phieu hoc tap:** giu logic ban 6.8; chua thu online.
- **Lam bai kiem tra:** giu logic ban 6.8 va ma de; chua thu online.
- **Ket qua kiem tra:** danh sach, profile tu bai nop va bai tu luyen da hoan thanh; chua thu online.
- **Tro ly AI:** ho tro kho loi giai co san, AI sinh moi chi khi quan tri da cau hinh dich vu hop le. Khong gia lap kha nang AI.
- **Bai tap tuong tac:** bo loc lien thong voi Tong quan, ghi chu tren Supabase (online) + browser.
- **Luyen 5/10/15:** mo rong pham vi truy van; van chi dung cau co khoa da duyet, da cho phep luyen.
- **Cong cu Hoa hoc:** nut mo cau hoi cung bai/chuong dang chon (khong phan doan tu dong noi dung do cong cu tinh ra).

## Kiem thu va gioi han

- `npm test`: **93/93** phep thu logic va hop dong dat.
- Ban `index.html`: Chromium voi 1440px va 390px, 1.958 cau; chon Hoa 10 - Lien ket hoa hoc - Lien ket ion; chuyen sang Bài tập tương tac; lay 5 cau khong trung; mo Danh muc/Cong cu; khong loi JS hoac tran ngang trong luong thu.
- Parse JSX TypeScript: `page.jsx`, `StudyLibrary.jsx`, `SmartPractice.jsx`, `LearningHub.jsx`: 0 loi cu phap.
- **CHUA THU:** production Next build, Supabase query tren du an nha truong, migration tren DB thuc, dong bo ghi chu tren hai thiet bi, AI online, cac luong cu day du tren production.
- **KHONG DONG NGHIA KIEM CHUNG HOA HOC:** nguon hien co bao gom 379 cau co co `verified`; cac cau khac khong duoc cham tu dong. Dieu kien khoa dung con can doi chieu doc lap voi tai lieu goc truoc khi thi chinh thuc.
