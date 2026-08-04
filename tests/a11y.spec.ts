import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility gate (Part 19 / acceptance #30): axe reports no serious or
 * critical violations on the key pages. Runs in CI against a production build.
 */
const pages = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },
  { name: "Product", path: "/products/pearl-claw-hair-clips" },
  { name: "Start Here", path: "/start-here" },
  { name: "FAQ", path: "/faq" },
  { name: "Contact", path: "/contact" },
];

for (const p of pages) {
  test(`${p.name} has no serious/critical a11y violations`, async ({ page }) => {
    await page.goto(p.path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious, JSON.stringify(serious.map((v) => ({ id: v.id, nodes: v.nodes.length })), null, 2)).toEqual([]);
  });
}
