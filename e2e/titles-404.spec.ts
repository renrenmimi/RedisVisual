import { test, expect } from "@playwright/test";

const STOPS = [
  ["/", "RedisVisual — See inside Redis"],
  ["/data", "Data structures · RedisVisual"],
  ["/scenarios", "Why we use it · RedisVisual"],
  ["/pitfalls", "Cache pitfalls · RedisVisual"],
  ["/internals", "Redis in production · RedisVisual"],
  ["/code", "Write it yourself · RedisVisual"],
  ["/interview", "Interview prep · RedisVisual"],
  ["/simulator", "Fault simulator · RedisVisual"],
] as const;

test("every stop has its own title and exactly one main landmark", async ({ page }) => {
  for (const [path, title] of STOPS) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator("main")).toHaveCount(1);
  }
});

test("an unknown address is a real 404 that marks no stop as current", async ({ page }) => {
  const response = await page.goto("/no-such-stop");
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("This page does not exist");
  await expect(page).toHaveTitle("Page not found · RedisVisual");
  await expect(page.locator(".crumb-stop")).toHaveText("Page not found");
  await expect(page.locator('[aria-current="page"]')).toHaveCount(0);
  await page.getByRole("link", { name: "Go to Stop 1: What is Redis →" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test.describe("phone toolbar", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the breadcrumb shows the stop's whole name", async ({ page }) => {
    await page.goto("/pitfalls");
    const stop = page.locator(".crumb-stop");
    await expect(stop).toHaveText("Cache pitfalls");
    await expect(page.locator(".crumb-chapter")).toBeHidden();
    expect(await stop.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  });
});
