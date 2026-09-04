# HDSD VietPOS

Hướng dẫn sử dụng VietPOS cho nhân viên bán hàng (thu ngân / quầy).

Mở file HTML hoặc deploy lên Vercel — vào đúng domain là xem được ngay (không cần build).

## Tài liệu

- [Hướng dẫn nhân viên (web)](index.html) — bản xem trên trình duyệt, có ảnh
- [Hướng dẫn nhân viên (PDF)](Huong-dan-su-dung-VietPOS-Nhan-vien.pdf) — bản in / gửi cửa hàng

Phiên bản: **1.2** · Ngày: 04/09/2026 · Ảnh chụp từ tài khoản staff trên môi trường demo.

## Xem trên Vercel

Repo này là **static HTML** (`index.html` + `images/`). Vercel không cần Node, không cần lệnh build.

### Lần đầu (một lần)

1. Push `main` lên GitHub (`gd-chessman/HDSD-VietPOS`).
2. Vào [vercel.com/new](https://vercel.com/new) → **Import** repo `HDSD-VietPOS`.
3. Giữ nguyên:
   - **Framework Preset:** Other
   - **Build Command:** để trống
   - **Output Directory:** để trống
   - **Install Command:** để trống
4. Bấm **Deploy**.

URL sẽ dạng `https://hdsd-vietpos.vercel.app` (hoặc tên bạn đặt). Vào gốc `/` là ra hướng dẫn.

Gắn domain riêng: Project → **Settings → Domains**.

### Sau đó

Mỗi lần `git push` lên `main`, Vercel tự deploy lại. Không cần cấu hình thêm.

## Nội dung

1. Đăng nhập
2. Màn hình sau đăng nhập
3. Mở ca làm việc
4. Bán hàng tại POS
5. Hóa đơn sau checkout
6. Đề nghị hủy đơn
7. Đơn hàng trong ca
8. Tồn kho & sản phẩm
9. Phiếu nhập / xuất
10. Offline
11. Đăng xuất & đóng ca
12. Phím tắt
13. Nhiều quầy
14. Sự cố thường gặp
15. Quy tắc làm việc

Ảnh minh họa nằm tại `images/user-guide-staff/`.
