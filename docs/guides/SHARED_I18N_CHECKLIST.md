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
| Credits (if surfaced) | e.g. zh-CN: **额度** (Studio); landing may add later |
| Plan tiers | Free / Pro / Premium / Enterprise — consistent tier naming in `pricing.json` |

- [ ] Glossary row added or updated in both `TRANSLATION_GUIDE.md` files when introducing a new shared term
- [ ] zh-TW translated from English in each repo (not converted from zh-CN)

---

## Per-repo file parity

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
