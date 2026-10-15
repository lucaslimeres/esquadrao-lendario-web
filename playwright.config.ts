import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end against the real API. Before running:
 *   API: docker compose up -d mysql && yarn db:migrate && yarn base:import && yarn dev
 *   (the Libertadores needs at least 3 squads imported)
 * Then: yarn test:e2e  (starts the web dev server if it is not running)
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5173",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "celular", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "yarn dev --port 5173 --strictPort",
    url: "http://localhost:5173",
    reuseExistingServer: true,
  },
});
