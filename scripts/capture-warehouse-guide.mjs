/**
 * Chụp ảnh HDSD thủ kho từ POS web dev (5175 + API 3003).
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../images/user-guide-warehouse");
const POS_URL = (process.env.POS_URL ?? "http://127.0.0.1:5175").replace(/\/$/, "");
const EMAIL = process.env.WAREHOUSE_EMAIL ?? "warehouse.local@local.demo";
const PASSWORD = process.env.WAREHOUSE_PASSWORD ?? "admin123";
const PIN = process.env.WAREHOUSE_PIN ?? "1234";

fs.mkdirSync(OUT, { recursive: true });

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, name), fullPage: false });
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
  if (await typePinIfShown(page, PIN)) {
    await shot(page, "01b-pin-nhap.png");
    await typePinIfShown(page, PIN);
  }
  await page.waitForURL(/\/dashboard/, { timeout: 90_000 });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "vi-VN" });
  const page = await context.newPage();

  await login(page);
  await page.waitForTimeout(500);
  await shot(page, "02-dashboard.png");

  await page.goto(`${POS_URL}/my-permissions`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await shot(page, "02b-my-permissions.png");

  await page.goto(`${POS_URL}/inventory`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1_000);
  await shot(page, "04-inventory.png");
  const rowCheck = page.locator('tbody tr').first().locator('[role="checkbox"]').first();
  if (await rowCheck.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await rowCheck.click();
    await page.waitForTimeout(400);
    const createBtn = page.getByRole("button", { name: /tạo phiếu nhập/i });
    if (await createBtn.isVisible().catch(() => false)) {
      await shot(page, "04b-inventory-chon-nhap.png");
    }
  }

  await page.goto(`${POS_URL}/products`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await shot(page, "03-products.png");

  await page.goto(`${POS_URL}/stock-requests`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1_000);
  await shot(page, "05-stock-requests.png");

  const rowToggle = page.locator("table tbody tr button").first();
  if (await rowToggle.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await rowToggle.click();
    await page.waitForTimeout(600);
    await shot(page, "05c-stock-requests-chitiet.png");
    await rowToggle.click().catch(() => {});
    await page.waitForTimeout(300);
  }

  const pendingFilter = page.getByRole("button", { name: /^chờ duyệt/i }).first();
  if (await pendingFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await pendingFilter.click();
    await page.waitForTimeout(700);
    await shot(page, "05b-stock-requests-cho-duyet.png");
    await page.getByRole("button", { name: /^tất cả/i }).first().click().catch(() => {});
    await page.waitForTimeout(400);
  }

  const importBtn = page.getByRole("button", { name: /tạo phiếu nhập/i }).first();
  if (await importBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await importBtn.click();
    await page.waitForTimeout(900);
    const dlg = page.getByRole("dialog");
    if (await dlg.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await shot(page, "06-tao-phieu-nhap.png");
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
    }
  }

  await page.goto(`${POS_URL}/stock-requests`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const exportBtn = page.getByRole("button", { name: /tạo phiếu xuất/i }).first();
  if (await exportBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await exportBtn.click();
    await page.waitForTimeout(900);
    if (await page.getByRole("dialog").isVisible({ timeout: 5_000 }).catch(() => false)) {
      await shot(page, "07-tao-phieu-xuat.png");
      await page.keyboard.press("Escape");
    }
  }

  await page.goto(`${POS_URL}/dashboard`, { waitUntil: "networkidle" });
  const accountBtn = page.getByRole("button", { name: /menu tài khoản/i });
  if (await accountBtn.isVisible().catch(() => false)) {
    await accountBtn.click();
    await page.waitForTimeout(300);
  }
  await shot(page, "08-dang-xuat.png");

  await browser.close();
  console.log("Done →", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
