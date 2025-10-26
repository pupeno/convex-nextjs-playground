import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    server: { deps: { inline: ["convex-test"] } },
    setupFiles: [path.resolve(__dirname, "vitest.setup.ts")],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["lib/**/*.{ts,tsx}", "convex/**/*.ts", "app/**/*.{ts,tsx}"],
      exclude: [
        "**/*.test.ts",
        "convex/_generated/**",
        "node_modules/**",
      ],
    },
  },
  resolve: {
    alias: {
      ".convex": new URL("./.convex", import.meta.url).pathname,
      "@": new URL("./", import.meta.url).pathname,
    },
  },
});
