import { test, expect, type Page } from "@playwright/test";

// End-to-end coverage for the Stop 8 fault simulator. These drive the real
// component and read the numbers the engine actually renders, rather than any
// injected test state. The simulation is deterministic (seeded), and the jitter
// test drives the tick interval from a fake clock, so its spike sizes are
// reproducible.

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
  // The engine is seeded, but the page advances it from a 100 ms setInterval on
  // wall-clock time. How many ticks ran between two clicks used to vary from run
  // to run, so the two peaks could tie (CI once read p99 168ms for both). The
  // interval now runs on Playwright's fake clock, and every run replays exactly
  // the same ticks.
  await page.clock.install();
  await page.goto("/simulator");
  // Wait until the engine is producing metrics (the hit-rate tile shows a %).
  await expect(page.locator(".sim8-tile").first()).toContainText("%");
  await page.clock.pauseAt(Date.now() + 60_000);

  /** Start from the seeded state, run one avalanche, and read its event-log p99. */
  async function avalancheP99(logText: string): Promise<number> {
    // A 6 s TTL keeps ordinary expiries low enough that the window measures the
    // cohort rather than background churn (at 2 s the peaks were 20 ms apart).
    await setRange(page, 1, 6);
    await page.locator(".sim8-runbar button", { hasText: "Reset" }).click();
    await page.clock.runFor(3_000); // 30 ticks of ordinary traffic first
    await page.locator(".sim8-fault", { hasText: "Cache avalanche" }).click();
    // A jittered cohort drains within 0.85 × TTL (5.1 s) plus one tick.
    await page.clock.runFor(6_000);
    const line = page.locator(".sim8-log li", { hasText: logText });
    await expect(line.first()).toBeVisible();
    return parseP99(await line.first().innerText());
  }

  // --- Unprotected run: jitter is off by default. ---
  const unprotectedPeak = await avalancheP99("Synchronized expiry");
  expect(unprotectedPeak).toBeGreaterThan(0);

  // --- The same ticks with TTL jitter on. ---
  await page.locator(".sim8-toggle", { hasText: "TTL jitter" }).click();
  const protectedPeak = await avalancheP99("TTL jitter spread");
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
