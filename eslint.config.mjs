import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // Typography roles: prefer Heading / PageHeader over ad-hoc large sizes on headings.
      // See docs/TYPOGRAPHY.md — Phase 4 enforcement.
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "JSXOpeningElement[name.name=/^h[1-6]$/] > JSXAttribute[name.name='className'][value.value=/(?:^|\\s)text-(xl|2xl|3xl|4xl|5xl)(?:\\s|$)/]",
          message:
            "Use <Heading> / <PageHeader> / typography roles instead of text-xl+ on heading tags. See docs/TYPOGRAPHY.md.",
        },
      ],
    },
  },
]);

export default eslintConfig;
