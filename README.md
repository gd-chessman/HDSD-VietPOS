# HDSD VietPOS

Hướng dẫn sử dụng VietPOS theo vai trò. Deploy lên Vercel — vào domain là chọn đúng tài liệu.

## Tài liệu

- [Mục lục](index.html) — chọn vai trò
- [Nhân viên bán hàng (HTML)](Huong-dan-su-dung-VietPOS-Nhan-vien.html)
- [Nhân viên bán hàng (PDF)](Huong-dan-su-dung-VietPOS-Nhan-vien.pdf)
- [Thủ kho (HTML)](Huong-dan-su-dung-VietPOS-Thu-kho.html)

Phiên bản nhân viên: **1.2** · Thủ kho: **1.1** · Ngày: 04/09/2026

## Xem trên Vercel

Repo này là **static HTML**. Vercel không cần Node, không cần lệnh build.

### Lần đầu (một lần)

1. Push `main` lên GitHub (`gd-chessman/HDSD-VietPOS`).
2. Vào [vercel.com/new](https://vercel.com/new) → **Import** repo `HDSD-VietPOS`.
3. Giữ nguyên:
   - **Framework Preset:** Other
   - **Build Command:** để trống
   - **Output Directory:** để trống
   - **Install Command:** để trống
4. Bấm **Deploy**.

URL dạng `https://hdsd-vietpos.vercel.app`. Gốc `/` là mục lục.

Gắn domain riêng: Project → **Settings → Domains**.

### Sau đó

Mỗi lần `git push` lên `main`, Vercel tự deploy lại.

## Nội dung theo vai trò

**Nhân viên:** đăng nhập, mở ca, POS, hóa đơn, đề nghị hủy, đơn trong ca, tồn kho, offline, đóng ca.

**Thủ kho:** tồn kho, sản phẩm, phiếu nhập/xuất (tạo → duyệt → vận chuyển → nhận hàng). Không có POS / đơn hàng.
