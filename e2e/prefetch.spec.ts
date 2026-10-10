import { test, expect } from "@playwright/test";

// The rail lists all eight stops. If its links prefetched, every visit would download
// the whole course; only the page's own links (Stop 1 and the next stop) may prefetch.
test("a page prefetches at most two other routes", async ({ page }) => {
  const prefetched = new Set<string>();
  page.on("request", (r) => {
    if (r.url().includes("_rsc=")) prefetched.add(new URL(r.url()).pathname);
  });
  await page.goto("/data");
  await page.waitForTimeout(3000);
  expect([...prefetched].length).toBeLessThanOrEqual(2);
});
