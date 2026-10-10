import { test, expect } from "@playwright/test";

// Keyboard use of the shell: the phone drawer and the command palette.

test.describe("phone drawer", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("closed, its links are out of the tab order; open, it holds focus until Esc", async ({ page }) => {
    await page.goto("/data");
    const menu = page.locator(".menu-btn");
    await expect(menu).toHaveAttribute("aria-expanded", "false");

    // The first Tab stop is the menu button, not a link of the hidden drawer.
    await page.keyboard.press("Tab");
    await expect(menu).toBeFocused();

    // Opening moves focus to the current stop inside the drawer.
    await page.keyboard.press("Enter");
    const current = page.locator('.sidebar a[aria-current="page"]');
    await expect(current).toBeFocused();

    // Tab stays inside the drawer.
    for (let i = 0; i < 12; i++) await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest(".sidebar"))).toBe(true);

    // Esc closes it and gives focus back to the menu button.
    await page.keyboard.press("Escape");
    await expect(page.locator(".sidebar")).not.toHaveClass(/open/);
    await expect(menu).toBeFocused();
  });
});

test("the command palette keeps focus while open and returns it when closed", async ({ page }) => {
  await page.goto("/pitfalls");
  const trigger = page.locator(".cmdk-trigger");
  await trigger.focus();
  await page.keyboard.press("Enter");

  const input = page.getByRole("combobox");
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-activedescendant", "cmdk-opt-0");

  await page.keyboard.press("Tab");
  await expect(input).toBeFocused();

  await page.keyboard.press("ArrowDown");
  await expect(input).toHaveAttribute("aria-activedescendant", "cmdk-opt-1");
  await expect(page.locator("#cmdk-opt-1")).toHaveAttribute("aria-selected", "true");

  await page.keyboard.press("Escape");
  await expect(page.locator(".cmdk")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
