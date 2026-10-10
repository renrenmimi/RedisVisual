import { test, expect } from "@playwright/test";

// Stop 6 on a phone, and the copy button's feedback.

for (const width of [360, 390]) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test("no step widens the page past the screen", async ({ page }) => {
      test.setTimeout(120_000);
      await page.goto("/code");
      for (let step = 1; step <= 12; step++) {
        // Wait for a terminal step's replay to finish: its widest lines come last.
        await expect(page.locator(".run-cursor")).toHaveCount(0, { timeout: 20_000 });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        expect(overflow, `step ${step}`).toBeLessThanOrEqual(1);
        if (step < 12) await page.locator(".controls .btn-primary").evaluate((b) => (b as HTMLElement).click());
      }
    });
  });
}

test("the copy button says so when copying fails", async ({ page }) => {
  await page.goto("/code");
  await page.evaluate(() => {
    navigator.clipboard.writeText = () => Promise.reject(new DOMException("denied", "NotAllowedError"));
  });
  const copy = page.locator(".cl3-copy").first();
  await copy.click();
  await expect(copy).toHaveText("Copy failed: select it by hand");
  await expect(copy).not.toHaveText(/Copied/);
});

test("the step label is in the reader's language", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("redisvisual-lang", "zh"));
  await page.goto("/code");
  await expect(page.locator(".n-step")).toHaveText("第 1 步/12");
});
