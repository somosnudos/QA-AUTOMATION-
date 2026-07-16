// Plantilla de playwright.config.ts para un frontend de Bord sin E2E.
// Calcada de mono-crm. Ajustá lo marcado con AJUSTAR.
import { existsSync } from 'fs';
import { resolve } from 'path';

import { defineConfig, devices } from '@playwright/test';

const envFile = resolve(__dirname, '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);

const isDev = !!process.env.PW_DEV;

export default defineConfig({
  testDir: './e2e/tests',
  globalSetup: './e2e/fixtures/global.setup.ts',
  outputDir: './e2e/artifacts/test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 3 : undefined,
  reporter: process.env.CI
    ? [['blob', { outputDir: './e2e/artifacts/blob-report' }], ['list']]
    : [['html', { outputFolder: './e2e/artifacts/playwright-report' }]],
  expect: { timeout: 10_000 },
  use: {
    // AJUSTAR: puerto del preview del repo.
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    storageState: 'e2e/.auth/user.json',
    actionTimeout: 10_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // AJUSTAR: comandos del repo. mono-crm usa yarn; wms-frontend usa npm.
    command: isDev ? 'BROWSER=none yarn start' : 'yarn preview --port 3001',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: isDev ? 60_000 : 30_000,
  },
});
