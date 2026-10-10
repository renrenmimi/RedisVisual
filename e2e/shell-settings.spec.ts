import { test, expect } from "@playwright/test";

// Settings (theme, language, rail) must survive two situations the shell used to
// mishandle: storage that throws on access, and a client re-render that drops the
// attributes the pre-paint scripts wrote onto <html>.

test("the site keeps working when storage access throws", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  // What Chrome and Safari do when site data is blocked: reading the property throws.
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("The operation is insecure.", "SecurityError");
      },
    });
  });

  await page.goto("/");
  const html = page.locator("html");
  await expect(page.locator("h1")).toContainText("What is Redis");
  await expect(html).toHaveAttribute("data-theme", "dark");

  // A working toggle proves the page hydrated instead of falling over.
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(html).toHaveAttribute("data-theme", "light");
  expect(errors).toEqual([]);
});

test("saved settings come back even when the pre-paint attributes are lost", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("redisvisual-theme", "light");
    localStorage.setItem("redisvisual-lang", "zh");
    localStorage.setItem("redisvisual-sidebar", "collapsed");
  });
  // Remove the two pre-paint scripts from the HTML. <html> then starts without the
  // attributes they set, which is the state a client re-render leaves behind.
  await page.route("**/data", async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(
      /<script>\(function\(\)\{var d=document\.documentElement;[\s\S]*?<\/script>/g,
      "",
    );
    await route.fulfill({ response, body });
  });

  await page.goto("/data");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(html).toHaveAttribute("data-sidebar", "collapsed");
  await expect(html).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator("h1")).toContainText("数据结构");
});
