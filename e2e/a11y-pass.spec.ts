import { test, expect, type Page } from "@playwright/test";

// Accessibility fixes that are easy to regress without noticing: hidden accordion
// content, the glossary popover, reduced motion, contrast and touch targets.

async function focusLandsIn(page: Page, selector: string, presses: number) {
  for (let i = 0; i < presses; i++) {
    await page.keyboard.press("Tab");
    if (await page.evaluate((s) => !!document.activeElement?.closest(s), selector)) return true;
  }
  return false;
}

test("collapsed answers are skipped by Tab until they are opened", async ({ page }) => {
  await page.goto("/interview");
  expect(await focusLandsIn(page, ".iv4-card:not(.open) .iv4-ans", 80)).toBe(false);

  await page.locator(".iv4-q").first().click();
  await expect(page.locator(".iv4-card").first()).toHaveClass(/open/);
  await page.locator(".iv4-q").first().focus();
  expect(await focusLandsIn(page, ".iv4-card.open .iv4-ans", 5)).toBe(true);
});

test("a glossary definition closes on Esc or an outside press, one at a time", async ({ page }) => {
  await page.goto("/");
  const terms = page.locator(".term");
  const pop = page.locator(".term-pop");

  await terms.first().click();
  await expect(pop).toHaveCount(1);
  await expect(terms.first()).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(pop).toHaveCount(0);
  await expect(terms.first()).toHaveAttribute("aria-expanded", "false");

  await terms.first().click();
  await page.locator(".stage-panel").click({ position: { x: 8, y: 8 } });
  await expect(pop).toHaveCount(0);

  // The first definition can cover the next term, so open the second one directly.
  await terms.nth(0).click();
  await terms.nth(1).dispatchEvent("click");
  await expect(pop).toHaveCount(1);
  await expect(terms.nth(0)).toHaveAttribute("aria-expanded", "false");
});

test("a long definition just below the 200px line still fits on screen", async ({ page }) => {
  await page.goto("/interview");
  await page.locator(".iv4-toggle-all").click();
  // The TTL definition is one of the tallest.
  const term = page.locator(".iv4-card.open .term", { hasText: "TTL" }).first();
  await term.evaluate((el) => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollBy(0, el.getBoundingClientRect().top - 205);
  });
  await term.click();
  const box = await page.locator(".term-pop").boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(0);
});

test("with reduced motion the Hash animation shows one value, not two on top of each other", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/data");
  await page.getByRole("tab", { name: "Hash" }).click();
  await expect(page.locator(".ds5-hv-a")).toHaveCSS("opacity", "0");
  await expect(page.locator(".ds5-hv-b")).toHaveCSS("opacity", "1");
});

test("secondary text meets 4.5:1 in the light theme, including on the dark code cards", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("redisvisual-theme", "light"));
  const ratio = (selector: string) =>
    page.evaluate((s) => {
      const parse = (c: string) => c.match(/[\d.]+/g)!.map(Number);
      const lum = ([r, g, b]: number[]) => {
        const f = (v: number) => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const el = document.querySelector(s)!;
      let bg = "rgb(255, 255, 255)";
      for (let e: Element | null = el; e; e = e.parentElement) {
        const c = getComputedStyle(e).backgroundColor;
        const p = parse(c);
        if (p.length < 4 || p[3] === 1) {
          if (!(p.length === 4 && p[3] === 0)) {
            bg = c;
            break;
          }
        }
      }
      const a = lum(parse(getComputedStyle(el).color));
      const b = lum(parse(bg));
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    }, selector);

  await page.goto("/");
  expect(await ratio(".subtitle")).toBeGreaterThanOrEqual(4.5);
  await page.goto("/code");
  expect(await ratio(".cl3-note")).toBeGreaterThanOrEqual(4.5);
});

test.describe("phone touch targets", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("step dots and simulator sliders are at least 24px to a finger", async ({ page }) => {
    await page.goto("/code");
    const dot = page.locator(".pdot").nth(3);
    const box = (await dot.boundingBox())!;
    // 10px right of the dot's centre is still the dot (its transparent hit area).
    const hit = await page.evaluate(
      ([x, y]) => document.elementFromPoint(x, y)?.classList.contains("pdot") ?? false,
      [box.x + box.width / 2 + 10, box.y + box.height / 2],
    );
    expect(hit).toBe(true);

    await page.goto("/simulator");
    // Layout height, unaffected by the panel's entrance animation.
    const height = await page.locator(".sim8-slider input").first().evaluate((el) => (el as HTMLElement).offsetHeight);
    expect(height).toBeGreaterThanOrEqual(24);
  });
});
