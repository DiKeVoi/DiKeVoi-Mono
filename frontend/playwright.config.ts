import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  use: {
    baseURL: "http://localhost:8081",
    channel: "chrome",
    headless: false,
    viewport: { width: 390, height: 844 },
    locale: "vi-VN",
  },
  workers: 1,
});
