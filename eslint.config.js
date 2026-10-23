// @ts-check
// ESLint configuration: recommended JavaScript rules plus the strict, type-aware
// TypeScript rules. Formatting is left to Prettier (see .prettierrc.json).
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores(["dist/", "node_modules/"]),
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ["eslint.config.js"] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Exhaustive switches on `kind` are the backbone of the DSL: every case must be handled.
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      // Template literals with numbers are fine (`${index + 1}`).
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      // Content type aliases read better than interfaces and match the rest of the code.
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/consistent-type-imports": "error",
      eqeqeq: "error",
    },
  },
  {
    // node:test's `describe` and `it` return promises that the runner tracks itself.
    files: ["tests/**/*.ts"],
    rules: { "@typescript-eslint/no-floating-promises": "off" },
  },
  {
    files: ["**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
