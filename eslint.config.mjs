import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import convexPlugin from "@convex-dev/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Ignore generated and build artifacts
  { ignores: ["**/.next/**", "**/coverage/**", "convex/_generated/**", "node_modules/**", "next-env.d.ts"] },

  // Base configs
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...convexPlugin.configs.recommended,
  
  {
    files: ["**/*.test.{js,jsx,ts,tsx}", ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;
