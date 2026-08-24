import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/** Decorative / chart surfaces intentionally outside the role scale. */
const typographyAllowlist = [
  "src/components/onboarding/CompletionStep.tsx",
  "src/app/(shell)/profile/page.tsx",
  "src/components/queue/HealthIndicator.tsx",
];

const typographyRestrictedSyntax = [
  {
    selector:
      "JSXOpeningElement[name.name=/^h[1-6]$/] > JSXAttribute[name.name='className'][value.value=/(?:^|\\s)text-(xl|2xl|3xl|4xl|5xl)(?:\\s|$)/]",
    message:
      "Use <Heading> / <PageHeader> / typography roles instead of text-xl+ on heading tags. See docs/TYPOGRAPHY.md.",
  },
  {
    selector:
      "JSXAttribute[name.name='className'][value.value=/(?:^|\\s)text-(xs|sm|base|lg|xl)(?:\\s|$)/]",
    message:
      "Use @theme typography tokens (text-body, text-caption, text-page, …) instead of legacy Tailwind text-xs–text-xl. See docs/TYPOGRAPHY.md.",
  },
  {
    selector:
      "JSXAttribute[name.name='className'][value.value=/(?:^|\\s)text-(2xl|3xl|4xl|5xl)(?:\\s|$)/]",
    message:
      'Use <Heading variant="page|display|metric"> instead of text-2xl+. Decorative glyphs belong on the typography allowlist. See docs/TYPOGRAPHY.md.',
  },
  {
    selector: "JSXAttribute[name.name='className'][value.value=/text-\\[\\d+px\\]/]",
    message:
      "Avoid arbitrary text-[Npx] sizes. Use text-caption, text-micro, or an allowlisted chart/decorative exception. See docs/TYPOGRAPHY.md.",
  },
];

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
    ignores: typographyAllowlist,
    rules: {
      // Typography roles: prefer Heading / PageHeader / tokens over ad-hoc sizes.
      // See docs/TYPOGRAPHY.md.
      "no-restricted-syntax": ["error", ...typographyRestrictedSyntax],
    },
  },
  // Allowlisted decorative glyphs / SVG chart labels keep arbitrary or large sizes.
  {
    files: typographyAllowlist,
    rules: {
      "no-restricted-syntax": [
        "error",
        // Still ban legacy sizes on real heading tags in allowlisted files.
        typographyRestrictedSyntax[0],
      ],
    },
  },
]);

export default eslintConfig;
