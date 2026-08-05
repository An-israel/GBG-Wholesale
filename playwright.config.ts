import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the accessibility (axe) checks (Part 19). Builds and
 * starts the app, then runs axe against key pages, failing on serious/critical
 * violations. Uses the pre-installed Chromium via PLAYWRIGHT_BROWSERS_PATH.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "off",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // In CI, Playwright installs its own browsers. Locally, use the
        // pre-installed full Chromium when present (avoids a redundant download).
        launchOptions: process.env.PW_CHROME_PATH ? { executablePath: process.env.PW_CHROME_PATH } : {},
      },
    },
  ],
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
