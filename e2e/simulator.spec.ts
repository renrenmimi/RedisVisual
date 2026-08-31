import { test, expect, type Page } from "@playwright/test";

// End-to-end coverage for the Stop 8 fault simulator. These drive the real
// component and read the numbers the engine actually renders, rather than any
// injected test state. The simulation is deterministic (seeded), so the spike
// sizes are reproducible.

/** Set a React-controlled range input and fire the change the app listens for. */
async function setRange(page: Page, index: number, value: number) {
  const input = page.locator(".sim8-slider input[type=range]").nth(index);
  await input.evaluate((el, v) => {
    const node = el as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )!.set!;
    setter.call(node, String(v));
    node.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
}

/** Read the last "p99 <n>ms" figure out of an event-log line. */
function parseP99(text: string): number {
  const matches = [...text.matchAll(/p99 (\d+)ms/g)];
  return matches.length ? Number(matches[matches.length - 1][1]) : NaN;
}

test("TTL jitter measurably shrinks the avalanche spike", async ({ page }) => {
  await page.goto("/simulator");
  // Wait until the engine is producing metrics (the hit-rate tile shows a %).
  await expect(page.locator(".sim8-tile").first()).toContainText("%");

  // Shorten the TTL so a jittered cohort drains quickly during the test.
  await setRange(page, 1, 2);

  // --- Unprotected run: jitter is off by default. ---
  await page.locator(".sim8-fault", { hasText: "Cache avalanche" }).click();
  const syncLine = page.locator(".sim8-log li", { hasText: "Synchronized expiry" });
  await expect(syncLine.first()).toBeVisible({ timeout: 15_000 });
  const unprotectedPeak = parseP99(await syncLine.first().innerText());
  expect(unprotectedPeak).toBeGreaterThan(0);

  // --- Reset, enable TTL jitter, rerun the same fault. ---
  await page.locator(".sim8-runbar button", { hasText: "Reset" }).click();
  await page.locator(".sim8-toggle", { hasText: "TTL jitter" }).click();
  await setRange(page, 1, 2);
  await page.locator(".sim8-fault", { hasText: "Cache avalanche" }).click();

  const spreadLine = page.locator(".sim8-log li", { hasText: "TTL jitter spread" });
  await expect(spreadLine.first()).toBeVisible({ timeout: 25_000 });
  const protectedPeak = parseP99(await spreadLine.first().innerText());
  expect(protectedPeak).toBeGreaterThan(0);

  // The protected spike is materially smaller — measured, not messaged.
  expect(protectedPeak).toBeLessThan(unprotectedPeak);
});

test("no horizontal overflow at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/simulator");
  await expect(page.locator(".sim8-tile").first()).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1); // 1px tolerance for sub-pixel rounding
});
