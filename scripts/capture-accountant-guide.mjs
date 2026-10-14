import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loginRole, shot, logoutShot } from "./capture-role-login.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../images/user-guide-accountant");
const POS_URL = (process.env.POS_URL ?? "http://127.0.0.1:5175").replace(/\/$/, "");
const EMAIL = process.env.ACCOUNTANT_EMAIL ?? "accountant.local@local.demo";
const PASSWORD = process.env.ACCOUNTANT_PASSWORD ?? "admin123";
const PIN = process.env.ACCOUNTANT_PIN ?? "1234";

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
    ["03-vat-invoices.png", "/vat-invoices"],
    ["04-stock-requests.png", "/stock-requests"],
  ]) {
    await page.goto(`${POS_URL}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(750);
    await shot(page, OUT, file);
  }

  await page.goto(`${POS_URL}/statistics`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  if (!page.url().includes("/dashboard")) {
    await shot(page, OUT, "05-statistics.png");
  }

  await page.goto(`${POS_URL}/vat-inbound`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  if (page.url().includes("vat-inbound")) {
    await shot(page, OUT, "06-vat-inbound.png");
  }

  await logoutShot(page, POS_URL, OUT, "07-dang-xuat.png");
  await browser.close();
  console.log("Done →", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
