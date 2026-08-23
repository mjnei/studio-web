#!/usr/bin/env node
/**
 * migrate-typography.mjs
 *
 * Replaces legacy Tailwind font-size utilities with @theme token utilities.
 * Safe for re-runs (idempotent once migrated). Skips allowlisted decorative files.
 *
 * Usage:
 *   node scripts/migrate-typography.mjs           # write changes
 *   node scripts/migrate-typography.mjs --dry-run # report only
 *
 * @see docs/TYPOGRAPHY.md
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const DRY_RUN = process.argv.includes("--dry-run");

/** Decorative / chart surfaces — do not rewrite. */
const ALLOWLIST = new Set([
  "src/components/onboarding/CompletionStep.tsx",
  "src/app/(shell)/profile/page.tsx",
  "src/components/queue/HealthIndicator.tsx",
  "src/components/ui/heading.tsx",
  "src/components/ui/typography.ts",
]);

/**
 * Order matters: longer / compound patterns first.
 * Responsive pairs collapse to the denser token (mobile-first scale).
 */
const REPLACEMENTS = [
  // Compound responsive → single token
  { re: /\btext-sm\s+sm:text-base\b/g, to: "text-body" },
  { re: /\btext-xs\s+sm:text-sm\b/g, to: "text-caption" },
  { re: /\btext-base\s+sm:text-lg\b/g, to: "text-body sm:text-metric" },
  { re: /\btext-\[10px\]\s+sm:text-caption\b/g, to: "text-micro sm:text-caption" },
  { re: /\btext-\[10px\]\s+sm:text-sm\b/g, to: "text-micro sm:text-caption" },
  // Lone responsive bumps (remove — stay at base token size)
  { re: /\s+sm:text-base\b/g, to: "" },
  // Arbitrary micro → token
  { re: /\btext-\[10px\]\b/g, to: "text-micro" },
  { re: /\btext-\[11px\]\b/g, to: "text-micro" },
  // Legacy steps → tokens
  { re: /\btext-xs\b/g, to: "text-caption" },
  { re: /\btext-sm\b/g, to: "text-body" },
  { re: /\btext-base\b/g, to: "text-body" },
  { re: /\btext-lg\b/g, to: "text-metric" },
  { re: /\btext-xl\b/g, to: "text-page" },
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      walk(full, out);
    } else if (/\.(tsx|ts|jsx|js|css)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function rel(file) {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

function migrateFile(file) {
  const relative = rel(file);
  if (ALLOWLIST.has(relative)) return null;

  const original = fs.readFileSync(file, "utf8");
  let next = original;
  const hits = [];

  for (const { re, to } of REPLACEMENTS) {
    re.lastIndex = 0;
    if (re.test(next)) {
      re.lastIndex = 0;
      const before = next;
      next = next.replace(re, to);
      if (next !== before) hits.push(re.source);
    }
  }

  // Collapse accidental double spaces in class strings from removals
  if (next !== original) {
    next = next.replace(/ {2,}/g, " ");
  }

  if (next === original) return null;

  if (!DRY_RUN) fs.writeFileSync(file, next, "utf8");
  return { file: relative, patterns: hits };
}

const files = walk(SRC);
const changed = [];
for (const file of files) {
  const result = migrateFile(file);
  if (result) changed.push(result);
}

if (changed.length === 0) {
  console.log(DRY_RUN ? "Dry run: no legacy typography matches." : "Nothing to migrate.");
  process.exit(0);
}

console.log(
  `${DRY_RUN ? "Would update" : "Updated"} ${changed.length} file(s)${DRY_RUN ? " (dry-run)" : ""}:`
);
for (const { file, patterns } of changed) {
  console.log(`  ${file}`);
  for (const p of patterns) console.log(`    ~ /${p}/`);
}

if (DRY_RUN) {
  console.log("\nRe-run without --dry-run to write changes.");
}
