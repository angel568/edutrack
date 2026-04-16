import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],

  use: {
    baseURL:       'http://localhost:5173',
    screenshot:    'only-on-failure',
    video:         'retain-on-failure',
    headless:      true,
    actionTimeout: 10000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  ],

  // Levanta frontend y backend automáticamente antes de los tests
  webServer: [
    {
      command: 'npm run dev',
      cwd:     '../backend',
      port:    5000,
      timeout: 30000,
      reuseExistingServer: true,
    },
    {
      command: 'npm run dev',
      port:    5173,
      timeout: 30000,
      reuseExistingServer: true,
    },
  ],
});
