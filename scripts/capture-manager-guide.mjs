import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loginRole, shot, logoutShot } from "./capture-role-login.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../images/user-guide-manager");
const POS_URL = (process.env.POS_URL ?? "http://127.0.0.1:5175").replace(/\/$/, "");
const EMAIL = process.env.MANAGER_EMAIL ?? "manager2.local@local.demo";
const PASSWORD = process.env.MANAGER_PASSWORD ?? "admin123";
const PIN = process.env.MANAGER_PIN ?? "1234";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "vi-VN" })).newPage();

  await loginRole(page, POS_URL, EMAIL, PASSWORD, PIN, {
    outDir: OUT,
    shotFn: shot,
    shotLogin: "01-login.png",
    shotPin: "01b-pin-nhap.png",
  });

  for (const [file, route] of [
    ["02-dashboard.png", "/dashboard"],
    ["02b-my-permissions.png", "/my-permissions"],
    ["03-sales-staff.png", "/sales-staff"],
    ["04-orders.png", "/orders"],
    ["05-vat-invoices.png", "/vat-invoices"],
    ["06-stock-requests.png", "/stock-requests"],
    ["07-inventory.png", "/inventory"],
  ]) {
    await page.goto(`${POS_URL}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(750);
    await shot(page, OUT, file);
  }

  await logoutShot(page, POS_URL, OUT, "08-dang-xuat.png");
  await browser.close();
  console.log("Done →", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
