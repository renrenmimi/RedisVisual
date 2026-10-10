import { test, expect } from "@playwright/test";

// The simulator page's own logic: number formatting and how faults are queued.

test.describe("German browser", () => {
  test.use({ locale: "de-DE" });

  test("hydrates without a mismatch and shows the same number format", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/simulator");
    await expect(page.locator(".sim8-slider-val").first()).toHaveText("1,200");
    await expect(page.locator(".sim8-tile").first()).toContainText("%");
    expect(errors).toEqual([]);
  });
});

test("Reset cancels a scenario's fault that has not gone in yet", async ({ page }) => {
  await page.goto("/simulator");
  await page.locator(".sim8-preset").first().click(); // "Demo: cache breakdown"
  await page.locator(".sim8-runbar .btn").nth(1).click(); // Reset, within its 700ms delay
  await page.waitForTimeout(1500);
  await expect(page.locator(".sim8-log li", { hasText: "Breakdown" })).toHaveCount(0);
});

test("two faults pressed within one tick both happen", async ({ page }) => {
  await page.goto("/simulator");
  await page.evaluate(() => {
    const [breakdown, , down] = Array.from(document.querySelectorAll<HTMLButtonElement>(".sim8-fault"));
    breakdown.click();
    down.click();
  });
  await expect(page.locator(".sim8-log li", { hasText: "Redis down" })).toHaveCount(1);
  await expect(page.locator(".sim8-log li", { hasText: "Breakdown" })).toHaveCount(1);
});
