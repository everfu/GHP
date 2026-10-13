import { defineConfig, devices } from '@playwright/test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const baseURL = process.env.GHP_E2E_URL || 'http://127.0.0.1:3000';
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['list'], ['html', { outputFolder: join(tmpdir(), 'ghpinfo-e2e-report'), open: 'never' }]]
    : 'list',
  outputDir: join(tmpdir(), 'ghpinfo-e2e-results'),
  use: { baseURL, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1024 } },
    },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
  webServer: process.env.GHP_E2E_URL
    ? undefined
    : {
        command: process.env.CI ? 'npm run start -- --port 3000' : 'npm run dev -- --port 3000',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
