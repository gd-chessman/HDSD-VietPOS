# HDSD VietPOS

Hướng dẫn sử dụng VietPOS theo vai trò. Deploy lên Vercel — vào domain là chọn đúng tài liệu.

## Tài liệu

- [Mục lục](index.html) — chọn vai trò
- [Nhân viên bán hàng (HTML)](Huong-dan-su-dung-VietPOS-Nhan-vien.html) — v1.4
- [Quản lý (HTML)](Huong-dan-su-dung-VietPOS-Quan-ly.html) — v1.4
- [Kế toán (HTML)](Huong-dan-su-dung-VietPOS-Ke-toan.html) — v1.4
- [Thủ kho (HTML)](Huong-dan-su-dung-VietPOS-Thu-kho.html) — v1.4
- [Widget — chọn trang](Huong-dan-su-dung-VietPOS-Widget.html)
- [Widget · Quản trị (HTML)](Huong-dan-su-dung-VietPOS-Widget-Quan-tri.html)
- [Widget · Ghép quầy (HTML)](Huong-dan-su-dung-VietPOS-Widget-Nhan-vien.html)

Phiên bản: Nhân viên / Quản lý / Kế toán / Thủ kho **1.4** · Widget ghép quầy **1.4** · Widget quản trị **1.3** · 14/10/2026

### Chụp lại ảnh minh họa

```bash
cd scripts && pnpm install
pnpm run capture:staff      # POS :5175 + API :3003
pnpm run capture:warehouse  # warehouse.local@local.demo
pnpm run capture:manager    # mặc định manager2.local@local.demo
pnpm run capture:accountant # accountant.local@local.demo
pnpm run capture:widget     # mock app Widget (assets/widget-mock)
pnpm run capture:all
```

### Cập nhật theo Shop-Manager (nhánh QuyLV, 10/2026)

- **Auth:** phiên cookie HttpOnly (`pos_session`) trên POS; Widget quản trị tương thích.
- **PIN:** khóa sai PIN **5 phút**; **quên PIN** (staff/admin shop) qua yêu cầu + duyệt tại **NV bán hàng**; super_admin không quên PIN trên app.
- **Widget quản trị:** API `/widget/home`, thông báo `order_new` (số món, PT thanh toán), poll ~20s; «hôm nay» theo lịch VN.
- **Widget ghép quầy:** Desktop **Thiết bị LAN → Điện thoại**, mã 6 số (~2 phút), chỉ khi quầy login **staff** + PIN máy quầy; **Cài đặt camera** → camera Widget; chụp CK qua LAN.
- **POS:** camera desktop/USB; tải file qua dialog Tauri; đơn hàng/VAT queue (admin) — chi tiết POS chưa ghi hết trong HDSD thu ngân.

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

**Quản lý:** dashboard, quyền, NV bán hàng / quên PIN, đơn hàng & duyệt hủy, VAT xuất, phiếu kho, tồn kho; có POS khi cần.

**Kế toán:** VAT xuất/nhập, thống kê HUB, phiếu kho (xem) — **không** POS / đơn hàng / sản phẩm.

**Thủ kho:** tồn kho, sản phẩm, phiếu nhập/xuất (tạo → duyệt → vận chuyển → nhận hàng). Không có POS / đơn hàng.

**Widget Android (2 trang):** [Quản trị](Huong-dan-su-dung-VietPOS-Widget-Quan-tri.html) (super_admin, widget, thông báo đơn) · [Ghép quầy](Huong-dan-su-dung-VietPOS-Widget-Nhan-vien.html) (LAN, PIN, chụp CK).
