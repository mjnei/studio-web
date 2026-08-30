# Shared i18n Checklist (Huavoi Landing + Studio)

Use this when adding a locale, changing glossary terms, or touching i18n in **either** repo. Keep both products aligned on locale codes and core product vocabulary.

Repos:

- **official-landing** — marketing site + TTS playground (`public/locales/`, `content/legal/`)
- **studio-web** — authenticated creator app (`public/locales/`)

Guides: `docs/guides/TRANSLATION_GUIDE.md` in each repo.

---

## Locale codes (must match)

- [ ] `src/i18n/config.ts` → `locales` is exactly: `en`, `zh-CN`, `zh-TW`, `ja`, `ko`, `de`, `fr`, `es`
- [ ] `defaultLocale` is `en` in both repos
- [ ] `localeNames` uses the same `name` per code (flags: `简` / `繁` for Chinese; emoji flags for others)
- [ ] `localStorage` key is `"locale"` with BCP-47 values
- [ ] Language switcher shows all 8 locales

---

## Glossary alignment (core product terms)

When changing any of these in one repo, check the other:

| Concept | Align across repos |
|---|---|
| Voices (TTS profiles) | e.g. zh-CN: **音色** |
| TTS / speech synthesis | e.g. zh-CN: **语音合成** |
| Playground | Landing nav: **体验**; Studio nav: **试用场** (intentionally different surface labels, same product) |
| Credits | e.g. zh-CN: **额度**; zh-TW: **點數** — one term per locale across pricing, jobs, settings |
| Credit rollover | e.g. zh-CN: **结转**; zh-TW: **結轉** — cap limits must match tier matrix (10 / 50 / unlimited) |
| Plan tiers | Free / Pro / Premium / Enterprise — tier **names** stay in English in JSON; descriptions localized |

- [ ] Glossary row added or updated in both `TRANSLATION_GUIDE.md` files when introducing a new shared term
- [ ] zh-TW translated from English in each repo (not converted from zh-CN)

---

## `pricing.json` schema (shared feature + FAQ keys)

Canonical schema for tier features and FAQs. **Feature keys and FAQ keys must match across both repos.** Surface-specific keys may differ (see table below).

Related: `docs/guides/PRICING_ALIGNMENT.md` — tier matrix, FAQ topics, alignment checklist.

### Shared tier feature keys

| Tier | Keys (display order) |
| ---- | -------------------- |
| **free** | `credits`, `rollover`, `voices`, `video`, `quality`, `storage` |
| **pro** | `credits`, `rollover`, `voices`, `video`, `priority`, `analytics`, `export`, `api` |
| **premium** | `credits`, `rollover`, `voices`, `quality`, `support`, `ai`, `team`, `whiteLabel`, `api` |
| **enterprise** (Landing only) | `unlimited`, `unlimitedVoices`, `customModels`, `voiceCloning`, `whiteLabel`, `accountManager`, `onPremise`, `customIntegrations`, `volumeDiscounts`, `customSla` |

Path: `pricing.{tier}.features.{key}`

### Shared FAQ keys

`pricing.faq.q1`–`pricing.faq.q6` — each `{ q, a }`. Topics documented in `PRICING_ALIGNMENT.md`.

### Intentional surface-specific keys

| Key area | official-landing | studio-web |
| -------- | ---------------- | ---------- |
| Page subtitle | `pricing.subtitle` | `pricing.description` |
| Billing toggle | `pricing.monthly` / `annual` / `save20` | `pricing.billingToggle.*` |
| Tier CTA | `pricing.{tier}.cta` | `pricing.{tier}.button` |
| Credits on card | — | `rolloverAmount`, `creditsPerMonth`, `rolloverLabel` |
| Landing-only | `compare`, `customSolution`, `enterprise` tier | — |
| Studio-only | — | `subscribeComingSoon` |

### Pricing PR checklist

- [ ] Feature keys identical across repos for shared tiers (free / pro / premium)
- [ ] FAQ `q1`–`q6` identical across repos (all 8 locales)
- [ ] Tier matrix limits unchanged or updated in `PRICING_ALIGNMENT.md`
- [ ] Cross-repo PR linked when only one repo touched

---

### official-landing

- [ ] All 10 namespaces in `translationFiles` (`context.tsx`) have JSON for the new/changed locale
- [ ] `content/legal/privacy/{locale}.md` and `content/legal/terms/{locale}.md` exist (or `en` fallback is acceptable temporarily)
- [ ] `sample-texts.json` culturally adapted (not literal joke translation)
- [ ] Playground placeholders preserved: `{id}`, `{time}`, `{n}`, `{count}`, `{text}`, `{duration}`

### studio-web

- [ ] All 17 namespaces in `translationFiles` have JSON for the new/changed locale
- [ ] `voiceLanguageLabelKey` and `localeToDateLocale` updated in `config.ts` for new locales
- [ ] Interpolation uses `t(key, { ... })` — no manual `.replace()` for new strings
- [ ] `voices.languages.*` keys exist if voice language labels are shown

---

## Engineering

- [ ] New namespace added to `translationFiles` in `context.tsx` **and** `en/*.json` created for all locales
- [ ] Keys identical across locales; only values differ
- [ ] Missing keys fall back to `en` (verify in UI)
- [ ] No hardcoded user-visible English when a key exists
- [ ] `pnpm test` passes (`locale-codes.test.ts`; Studio also has `t-interpolation.test.ts`)

---

## QA (both repos)

- [ ] Switch locale in UI — nav, primary CTAs, errors, empty states
- [ ] Chinese switcher shows **简** / **繁** (not country flags)
- [ ] No visible raw `{placeholder}` in UI
- [ ] Mobile: language control not truncated
- [ ] Dark mode: labels readable

---

## PR description template

```markdown
### Locales touched
en, zh-CN, …

### Glossary decisions (this PR)
| English | zh-CN | zh-TW | Notes |
|---|---|---|---|
| … | … | … | … |

### Cross-repo impact
- [ ] None
- [ ] Studio glossary should match (link PR)
- [ ] Landing glossary should match (link PR)
```
