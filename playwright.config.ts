import { defineConfig, devices } from "@playwright/test";

// Browser tests for Stop 8. They drive the real UI and read the engine's
// measured numbers from the on-screen event log, so they verify what a visitor
// actually sees. A dev server is started on demand; nothing is stubbed.
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // CI builds first, so serve the production build there; use dev locally.
    command: process.env.CI ? "npm run start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
