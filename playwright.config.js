// @ts-check
import { defineConfig, devices } from '@playwright/test';
import path from "path";
import { fileURLToPath } from "url";
require("dotenv").config();

const STORAGE_STATE_PATH =
 process.env.STORAGE_STATE_PATH ||
 path.join(process.cwd(), "artifacts/storage-states/admin.json");

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: fileURLToPath(new URL("./specs", "file:" + __filename).href),
  globalSetup: fileURLToPath(
   new URL("./config/global-setup.js", "file:" + __filename).href
  ),

  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: process.env.WP_BASE_URL ?? '',
    headless: true,
    viewport: {
        width: 1280,
        height: 720,
    },
    ignoreHTTPSErrors: true,
    locale: 'en-US',
    contextOptions: {
        reducedMotion: 'reduce',
        strictSelectors: true,
    },
    storageState: STORAGE_STATE_PATH,
    actionTimeout: 10_000, // 10 seconds.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    /*{
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },*/

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

