/** Shared login + PIN for HDSD capture scripts. */
export async function typePinIfShown(page, pin) {
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

export async function loginRole(page, posUrl, email, password, pin, { shotLogin, shotPin, outDir, shotFn }) {
  await page.goto(`${posUrl}/login`, { waitUntil: "networkidle" });
  if (shotLogin && outDir && shotFn) await shotFn(page, outDir, shotLogin);
  await page.getByPlaceholder("admin@pos.com").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: /^đăng nhập$/i }).click();
  await page.waitForTimeout(800);
  if (await typePinIfShown(page, pin)) {
    if (shotPin && outDir && shotFn) await shotFn(page, outDir, shotPin);
    await typePinIfShown(page, pin);
  }
  await page.waitForTimeout(1_000);
  await page.goto(`${posUrl}/dashboard`, { waitUntil: "networkidle" });
  if (page.url().includes("/login")) {
    await typePinIfShown(page, pin);
    await page.goto(`${posUrl}/dashboard`, { waitUntil: "networkidle" });
  }
  if (page.url().includes("/login")) {
    throw new Error(`Login failed for ${email} — set MANAGER_EMAIL / password or run DB reset for demo users.`);
  }
}

export async function shot(page, outDir, name) {
  const fs = await import("node:fs");
  const path = await import("node:path");
  fs.mkdirSync(outDir, { recursive: true });
  await page.screenshot({ path: path.join(outDir, name), fullPage: false });
  console.log("wrote", name);
}

export async function logoutShot(page, posUrl, outDir, name) {
  await page.goto(`${posUrl}/dashboard`, { waitUntil: "networkidle" });
  const accountBtn = page.getByRole("button", { name: /menu tài khoản/i });
  if (await accountBtn.isVisible().catch(() => false)) {
    await accountBtn.click();
    await page.waitForTimeout(300);
  }
  await shot(page, outDir, name);
}
