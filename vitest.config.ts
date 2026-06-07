import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Vitest configuration for the router-migration test suite.
// Uses jsdom so router rendering assertions can run, and mirrors the Vite
// "@" alias so source imports resolve identically to the app build.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/setup.ts"],
  },
});
