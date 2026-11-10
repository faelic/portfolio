import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e", timeout: 30_000, expect: { timeout: 10_000 },
  fullyParallel: true, forbidOnly: !!process.env.CI, retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 3,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } }, testIgnore: /map-smoke/ },
    { name: "mobile-chromium", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" }, testIgnore: /map-smoke/ },
    { name: "webkit", use: { ...devices["Desktop Safari"] }, testIgnore: /map-smoke/ },
    { name: "map-smoke", use: { ...devices["Desktop Chrome"], launchOptions: { args: ["--use-angle=swiftshader", "--enable-webgl"] } }, testMatch: /map-smoke/ },
  ],
  webServer: { command: "npm run preview -- --host 127.0.0.1 --port 4173", url: "http://127.0.0.1:4173", reuseExistingServer: !process.env.CI },
});
