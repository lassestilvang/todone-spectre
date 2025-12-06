import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettierConfig from "eslint-plugin-prettier";
import prettierRecommended from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";

export default [
  js.configs.recommended,
  prettierRecommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "config/**",
      "scripts/**",
      "validate-*.js",
      "vite.config.*",
      "eslint.config.js",
      "dist/**",
      "node_modules/**",
      "src/__tests__/**",
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "**/Test*.ts",
      "**/Test*.tsx",
      "**/*TestUtils.ts",
      "**/*TestUtils.tsx",
      "**/*Mocks.ts",
      "**/*Mocks.tsx",
      "**/test-*.ts",
      "**/test-*.tsx",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      prettier: prettierConfig,
      "@stylistic": stylistic,
    },
    rules: {
      "react-refresh/only-export-components": "off",
      "react-hooks/rules-of-hooks": "off",
      "prettier/prettier": "error",
      "no-debugger": "warn",
      "no-duplicate-imports": "off",
      "no-empty-pattern": "off",
      "no-case-declarations": "off",
      "no-irregular-whitespace": "error",
      "no-var": "warn",
      "prefer-const": "off",
      "no-unused-expressions": "off",
      "no-constant-binary-expression": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@stylistic/array-bracket-spacing": ["error", "never"],
      "@stylistic/comma-dangle": ["error", "always-multiline"],
      "@stylistic/no-extra-semi": "error",
      "@stylistic/no-multiple-empty-lines": ["error", { max: 1 }],
      "@stylistic/no-trailing-spaces": "error",
      "@stylistic/object-curly-spacing": ["error", "always"],
      "@stylistic/semi": ["error", "always"],
    },
  },
];
