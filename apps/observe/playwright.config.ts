import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  webServer: {
    command: "pnpm exec next dev --hostname 127.0.0.1 --port 3010",
    url: "http://127.0.0.1:3010",
    reuseExistingServer: !process.env.CI,
    env: {
      OBSERVE_TEST_MODE: "1",
    },
  },
  use: {
    baseURL: "http://127.0.0.1:3010",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
