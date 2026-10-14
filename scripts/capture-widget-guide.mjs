import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOCK = path.resolve(__dirname, "../assets/widget-mock");
const OUT = path.resolve(__dirname, "../images/user-guide-widget");
const files = [
  ["01-entry.html", "01-widget-entry.png"],
  ["02-staff-devices.html", "02-widget-chon-quay.png"],
  ["03-pair-code.html", "03-widget-ma-ghep.png"],
  ["04-pin.html", "04-widget-pin.png"],
  ["05-connected.html", "05-widget-da-ghep.png"],
];

fs.mkdirSync(OUT, { recursive: true });

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newContext({ viewport: { width: 420, height: 860 } }).then((c) => c.newPage());
  for (const [html, png] of files) {
    await page.goto(`file://${path.join(MOCK, html)}`, { waitUntil: "load" });
    await page.waitForTimeout(200);
    await page.locator(".phone").screenshot({ path: path.join(OUT, png) });
    console.log("wrote", png);
  }
  await browser.close();
  console.log("Done →", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
