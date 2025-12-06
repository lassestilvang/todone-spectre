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
        project: true,
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
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "prettier/prettier": "error",
      "no-debugger": "warn",
      "no-duplicate-imports": "error",
      "no-empty-pattern": "error",
      "no-irregular-whitespace": "error",
      "no-var": "error",
      "prefer-const": "error",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-explicit-any": "warn",
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
