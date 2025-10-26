import { defineConfig } from "vitest/config";
import path from "path";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    // Default to jsdom for React/Next component tests
    environment: "jsdom",
    globals: true,
    setupFiles: [path.resolve(__dirname, "vitest.setup.ts")],
    css: false,
    // Route Convex tests to Node; keep convex-test inlined
    environmentMatchGlobs: [["convex/**", "node"]],
    environmentOptions: {
      jsdom: { url: "http://localhost" },
    },
    server: { deps: { inline: ["convex-test"] } },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["lib/**/*.{ts,tsx}", "convex/**/*.ts", "app/**/*.{ts,tsx}"],
      exclude: [
        "**/*.test.{ts,tsx}",
        "convex/_generated/**",
        "node_modules/**",
        ".next/**",
        "coverage/**",
      ],
    },
  },
  resolve: {
    alias: {
      // Keep .convex alias; TS path aliases are resolved via vite-tsconfig-paths
      ".convex": new URL("./.convex", import.meta.url).pathname,
    },
  },
});
