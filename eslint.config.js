// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      // TODO(scg-eslint-baseline): downgraded because the codebase predates this schematic and
      // fixing these in bulk means either a large, separate refactor or a cross-file public-API
      // rename. Tracked as follow-up work, not part of the initial CI/lint baseline.
      // - no-explicit-any / prefer-inject / prefer-standalone: covered by the planned
      //   standalone-components + strict-mode migrations (out of scope here).
      // - component-selector / no-input-rename: renaming would ripple into every template that
      //   references these selectors/inputs.
      "@typescript-eslint/no-explicit-any": "warn",
      "@angular-eslint/prefer-inject": "warn",
      "@angular-eslint/prefer-standalone": "warn",
      "@angular-eslint/no-input-rename": "warn",
      "@typescript-eslint/no-empty-function": ["error", { allow: ["constructors", "methods"] }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
      "@angular-eslint/component-selector": [
        "warn",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {
      // Same rationale as above: pre-existing accessibility debt across many templates,
      // tracked as follow-up rather than blocking the initial CI/lint baseline.
      "@angular-eslint/template/interactive-supports-focus": "warn",
      "@angular-eslint/template/click-events-have-key-events": "warn",
      "@angular-eslint/template/label-has-associated-control": "warn",
    },
  }
]);
