import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./__tests__",
  testMatch: "roast-api.test.ts",
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "npm run build && npm run start",
    port: 3000,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
