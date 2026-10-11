import { defineConfig, devices } from '@playwright/test';

const port = 5181;

export default defineConfig({
  testDir: 'package/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: `http://localhost:${port}/` },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    ...(process.env.CI || process.env.WEBKIT
      ? [{ name: 'webkit', use: { ...devices['Desktop Safari'] } }]
      : []),
  ],
  webServer: {
    command: `npx vite package/e2e/app --port ${port} --strictPort`,
    port,
    reuseExistingServer: !process.env.CI,
  },
});
