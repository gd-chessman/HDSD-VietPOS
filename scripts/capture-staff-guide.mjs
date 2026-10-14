/**
 * Chụp ảnh HDSD nhân viên từ POS web dev (5175 + API 3003).
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../images/user-guide-staff");
const POS_URL = (process.env.POS_URL ?? "http://127.0.0.1:5175").replace(/\/$/, "");
const EMAIL = process.env.STAFF_EMAIL ?? "staff.local@local.demo";
const PASSWORD = process.env.STAFF_PASSWORD ?? "admin123";
const STAFF_PIN = process.env.STAFF_PIN ?? "1234";
const SAMPLE = process.env.POS_SAMPLE_BARCODE ?? "LN001";

fs.mkdirSync(OUT, { recursive: true });

async function shot(page, name, opts = {}) {
  await page.screenshot({ path: path.join(OUT, name), fullPage: false, ...opts });
  console.log("wrote", name);
}

async function typePinIfShown(page, pin) {
  const otp = page.locator('input[inputmode="numeric"]').first();
  if (!(await otp.isVisible({ timeout: 12_000 }).catch(() => false))) return false;
  await otp.click();
  await page.keyboard.type(pin, { delay: 120 });
  await page.waitForTimeout(900);
  const btn = page.getByRole("dialog").getByRole("button", { name: /^xác nhận$/i });
  if (await btn.isEnabled({ timeout: 2_000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(600);
  }
  return true;
}

async function login(page) {
  await page.goto(`${POS_URL}/login`, { waitUntil: "networkidle" });
  await shot(page, "01-login.png");
  await page.getByPlaceholder("admin@pos.com").fill(EMAIL);
  await page.getByPlaceholder("••••••••").fill(PASSWORD);
  await page.getByRole("button", { name: /^đăng nhập$/i }).click();
  await page.waitForTimeout(800);
  if (await typePinIfShown(page, STAFF_PIN)) {
    await shot(page, "01b-pin-nhap.png");
    await typePinIfShown(page, STAFF_PIN);
  }
  await page.waitForURL(/\/(dashboard|pos)/, { timeout: 90_000 });
}

async function confirmShift(page) {
  const dialog = page.getByRole("dialog").filter({ hasText: "Chọn nhân viên trong ca" });
  if (!(await dialog.isVisible({ timeout: 10_000 }).catch(() => false))) return;
  await shot(page, "03-pos-chon-nv.png");
  await dialog.locator("label").first().click();
  await dialog.getByRole("button", { name: /^xác nhận$/i }).click();
  await dialog.waitFor({ state: "hidden", timeout: 30_000 }).catch(() => {});
  await page.getByText(/NV ca/i).waitFor({ timeout: 25_000 }).catch(() => {});
  await page.waitForTimeout(500);
  await shot(page, "03c-pos-sau-mo-ca.png");
}

async function addProductToCart(page) {
  await page.waitForResponse((r) => r.url().includes("/api/products") && r.ok(), { timeout: 45_000 }).catch(() => {});
  const scan = page.getByRole("textbox", { name: /Quét barcode/i }).first();
  await scan.click();
  await scan.fill(SAMPLE);
  await page.waitForTimeout(600);
  const row = page.locator("ul li button").filter({ hasText: new RegExp(SAMPLE, "i") }).first();
  if (await row.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await row.click();
  } else {
    await scan.press("Enter");
  }
  await page.waitForTimeout(800);
  const checkout = page.getByRole("button", { name: /checkout —/i });
  return checkout.isEnabled({ timeout: 12_000 }).catch(() => false);
}

async function tryCheckoutReceipt(page) {
  const checkout = page.getByRole("button", { name: /checkout —/i });
  if (await checkout.isEnabled({ timeout: 3_000 }).catch(() => false)) {
    await checkout.click();
  } else {
    await page.keyboard.press("Alt+1");
  }
  await page.waitForTimeout(2_000);
  const dialog = page.getByRole("dialog").filter({ hasText: /hóa đơn|receipt|thanh toán|tiền mặt/i });
  if (!(await dialog.isVisible({ timeout: 10_000 }).catch(() => false))) return false;
  await shot(page, "05-bill-sau-checkout.png");
  const cancel = dialog.getByText(/đề nghị huỷ|huỷ đơn/i).first();
  if (await cancel.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await cancel.scrollIntoViewIfNeeded().catch(() => {});
    await shot(page, "06-de-nghi-huy.png");
  }
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  return true;
}

async function captureBillFromOrders(page) {
  await page.goto(`${POS_URL}/orders`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1_200);
  const reprint = page.getByTitle(/in lại/i).first();
  if (!(await reprint.isVisible({ timeout: 8_000 }).catch(() => false))) return false;
  await reprint.click();
  await page.waitForTimeout(500);
  const warn = page.getByRole("alertdialog").or(page.getByRole("dialog"));
  const confirm = warn.getByRole("button", { name: /in lại|tiếp tục|đồng ý|xác nhận/i }).first();
  if (await confirm.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await confirm.click();
    await page.waitForTimeout(800);
  }
  const receipt = page.getByRole("dialog").filter({ hasText: /hóa đơn|receipt|thanh toán/i });
  if (!(await receipt.isVisible({ timeout: 8_000 }).catch(() => false))) return false;
  await shot(page, "05-bill-sau-checkout.png");
  await page.keyboard.press("Escape");
  return true;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "vi-VN" });
  const page = await context.newPage();

  await login(page);
  await page.goto(`${POS_URL}/dashboard`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await shot(page, "02-dashboard.png");

  await page.goto(`${POS_URL}/my-permissions`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await shot(page, "02b-my-permissions.png");

  await page.goto(`${POS_URL}/pos`, { waitUntil: "networkidle" });
  await confirmShift(page);

  const hasCart = await addProductToCart(page);
  await shot(page, "04b-pos-gio-hang.png");

  const search = page.getByPlaceholder(/tìm tên/i).first();
  if (await search.isVisible().catch(() => false)) {
    await search.fill("Nón");
    await page.waitForTimeout(600);
    await shot(page, "04d-pos-tim-kiem.png");
  }

  const browseBtn = page.getByRole("button", { name: /duyệt sản phẩm|lưới/i });
  if (await browseBtn.isVisible({ timeout: 4_000 }).catch(() => false)) {
    await browseBtn.click();
    await page.waitForTimeout(400);
    await shot(page, "04-pos-duyet-sp.png");
  }

  let gotBill = false;
  if (hasCart) gotBill = await tryCheckoutReceipt(page);
  if (!gotBill) gotBill = await captureBillFromOrders(page);

  if (!fs.existsSync(path.join(OUT, "06-de-nghi-huy.png")) && gotBill && hasCart) {
    await page.goto(`${POS_URL}/pos`, { waitUntil: "networkidle" });
    if (await addProductToCart(page)) await tryCheckoutReceipt(page);
  }

  await page.goto(`${POS_URL}/orders`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await shot(page, "07-orders.png");

  await page.goto(`${POS_URL}/inventory`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await shot(page, "08-inventory.png");

  await page.goto(`${POS_URL}/products`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await shot(page, "09-products.png");

  await page.goto(`${POS_URL}/stock-requests`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await shot(page, "10-stock-requests.png");

  await page.goto(`${POS_URL}/pos`, { waitUntil: "domcontentloaded" });
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" }).catch(() => {});
  await page.waitForTimeout(1_500);
  await shot(page, "11-offline-banner.png");
  await context.setOffline(false);

  await page.goto(`${POS_URL}/dashboard`, { waitUntil: "networkidle" });
  const accountBtn = page.getByRole("button", { name: /menu tài khoản/i });
  if (await accountBtn.isVisible().catch(() => false)) {
    await accountBtn.click();
    await page.waitForTimeout(300);
  }
  await shot(page, "12-dashboard-dang-xuat.png");

  await browser.close();
  console.log("Done →", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
