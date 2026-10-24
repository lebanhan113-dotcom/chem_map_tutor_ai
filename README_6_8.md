# EDUPLAN AI 6.8 - BAI TAP TUONG TAC TU LUYEN TOAN BO NGAN HANG

Tac gia giai phap: Le Ba Nhan - Truong THPT Hon Dat.

## Du lieu duoc giu nguyen

- Ke thua EduPlan AI 6.7 va bo 1.958 cau hoi Hoa 10-12 KNTT tu 67 tai lieu nguon; giu nguyen ID cau, dap an va cac co kiem duyet da co.
- Vao thanh **Bai tap tuong tac tu luyen**, khong con gioi han chi rut 4 cau mau. Loc theo khoi, chuong, bai hoc, dang cau, muc do.
- Che do **Toan bo cau nguon** giup xem va tu giai ca cau chua duyet nhung KHONG cham va KHONG hien dap an/lua chon "dung" doi voi nhom nay. Che do **Chi da duyet** loc bo cau khong du dieu kien cham.
- Xem thong ke 4 dang A-D / Dung-Sai / ngan / tu luan ngay tai bo loc dang chon. Chon nhom 5, 10, 15, 20-50 hoac cau truc Form 2025 (18 A-D, 4 D/S, 6 ngan, 4 tu luan) theo so cau thuc co.
- Danh dau cau can on, tu chuyen cau (2,5 giay sau xac nhan), quay lai, ghi nho phan hoi va lich su tai thiet bi; khong lap cau trong mot phien.

## Dung index.html ngay

1. Mo `index.html` bang Chrome/Edge TREN MAY GIAO VIEN. Chon **Bai tap tuong tac tu luyen**.
2. Chon vai tro, khoi, chuong, bai, dang cau, muc do va pham vi.
3. Nhan **Bat dau tu luyen** hoac **Bat dau 5 cau**. Cau hoi duoc rut tu cung ngan hang da nhap.
4. Chon dap an / nhap loi giai; bam **Xac nhan dap an**. Cau da duyet moi duoc cham. Cau chua duyet chi ghi nhan cau tra loi.
5. Chuyen cau, danh dau can on, bam **Nop & luu ket qua**, xuat lich su CSV neu can.
6. Neu can diem va loi giai da duyet, chon **Luyen co cham diem** de sang phan he 6.7 co ma tran, luu phien va kiem soat dap an.

**CANH BAO BAO MAT:** index.html tich hop du lieu quan tri va khoa dap an; khong upload tep nay len ten mien cong khai hoac gui cho hoc sinh. Khong bao gio dua file JSON co answer vao thu muc `public/`.

## Trien khai Next.js ONLINE voi Supabase

1. Sao luu repository, Supabase (schema va data). Khong xoa bang cu.
2. Chen source 6.8 vao repository dang chay, chay `supabase/migrate_6_7_to_6_8.sql`. Migration chi them cot `study_enabled BOOLEAN DEFAULT FALSE` va chi muc, khong xoa du lieu.
3. Giu bien moi truong Supabase tren Vercel, khong dua service-role key vao client. **Khong can GEMINI_API_KEY** cho chon cau, tu hoc, cham va luu phien.
4. Neu co so du lieu online chua co ngan hang 1.958 cau, nguoi quan tri phai nhap/doi soat du lieu thong qua tinh nang nhap trong WebApp. Source packaged co `data/uploaded_bank.json` nhung KHONG tu dong sinh ban ghi trong Supabase khi deploy.
5. Dang nhap tai khoan `teacher`; o muc **Bai tap tuong tac online**, chon khoi/chuong/bai va bam **Cong bo cau nguon cho hoc sinh**. Cot `study_enabled=false` mac dinh, can xac nhan truoc khi cho hoc sinh xem. API chi cong bo stem/options/danh muc/nguon; khong bao gio tra ve khoa answer.
6. Dang nhap tai khoan `student`, vao **Bai tap tuong tac**, loc chuong/bai. Hoat dong doc/tu giai luu ghi chu tai trinh duyet, KHONG tinh diem cho cau chua duyet.
7. De lam bai co cham va luu ket qua tap trung, bam **Luyen co cham 5/10/15 cau**. API va bang `smart_practice_sessions` hien co duoc tai su dung, chi rut cau `verified=true`, `practice_enabled=true`.
8. Doi chieu ket qua tren 2 tai khoan rieng, kiem tra API khong de lo `answer`/`explanation`, thu tai trang va kiem tra lich su smart-practice; chi sau do moi su dung chinh thuc.

## Quy tac chat luong

- Toan bo **1.958** cau co trong nguon NHUNG khong phai deu da xac minh dap an. Thong ke offline du lieu hien tai: **379 cau co `verified=true`**, con lai khong duoc cham tu dong (chuoi gia tri co the thay doi do giao vien duyet tren trinh duyet).
- Cau tu luan KHONG tu dong danh gia dung/sai. Cau co hinh/phuong trinh MathType phuc tap phai doi chieu Word goc; neu mat hinh thi khong cham.
- Khong tu tao cau thay the khi ngan hang thieu. Khong bat dau phien co cau hoi ngoai pham vi da chon.
- Ban ngoai tuyen chi luu cuc bo. Phan Online can hoan tat cau hinh Vercel/Supabase va doi soat du lieu. Chua co trang online duoc phat hanh trong moi truong nay.

## Kiem thu thuc hien

- `npm test`: 80/80 kiem thu tu dong pass (gồm 7 ca cho study-library); API route `node --check` pass; JSX duoc parse bang TypeScript parser.
- Chromium cho ban HTML: nap du 1.958 cau, loc Hoa 10 chuong Lien ket hoa hoc, bat dau 5 cau, luu cau tra loi, chuyen cau; khong phat sinh JS error trong luong nay. Da kiem tra bo cuc 1440 px va 390 px, khong tran ngang sau sua loi.
- Chua chay `next build` trong moi truong nay do chua cai duoc dependency npm; chua kiem thu ket noi Supabase that va phan quyen trong deployment.

## Cac han muc can lam them truoc khi day hoc dai tra

- Xac minh/duyet noi dung khoa hoc cho cac cau chua duyet; khong dung nhom nay de cham diem.
- Test chay Next.js production voi Supabase cua nha truong, dung 2 tai khoan teacher/student; test quota, RLS, dong thoi va xu ly mat ket noi.
- Phan he doc cau chua duyet luu ghi chu tren trinh duyet; neu muon lich su ungraded dong bo da thiet bi, phai bo sung bang rieng va RLS, khong co trong ban 6.8.
