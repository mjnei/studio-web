# Pricing Alignment (Huavoi Landing + Studio)

Cross-repo checklist for keeping pricing pages and copy aligned between **official-landing** and **studio-web**.

Related:

- `docs/guides/SHARED_I18N_CHECKLIST.md` — locale codes, glossary, i18n engineering
- `docs/guides/TRANSLATION_GUIDE.md` — translation principles per repo

**Pages:**

| Repo             | Path                               |
| ---------------- | ---------------------------------- |
| official-landing | `src/app/pricing/page.tsx`         |
| studio-web       | `src/app/(shell)/pricing/page.tsx` |

**Translation files:** `public/locales/{locale}/pricing.json` (8 locales in both repos)

---

## Current state (updated after P0 + P1 pass)

### What matches (both repos)

- Tier names on plan cards: **Free / Pro / Premium** (Landing also has **Enterprise** — marketing-only)
- Price points: Free $0; Pro $49/$39; Premium $199/$159 (monthly/annual)
- **Credits model**: 5 / 25 / 100 per month with rollover caps 10 / 50 / unlimited
- Voice limits: Free 2, Pro 5, Premium 10 custom voices
- Video quality ladder: 720p → 1080p → 4K
- Pro is the highlighted / “most popular” tier
- Landing prices live in `pricing.json` (no hardcoded numbers in `page.tsx`)
- Landing compare table uses correct tier keys (`free` / `pro` / `premium` / `enterprise`)

### Intentional differences

| Area | official-landing | studio-web |
|------|------------------|------------|
| Tier count | 4 (Enterprise marketing-only) | 3 |
| Compare table | Yes | No |
| Marketing CTAs | Custom solution, free trial, signup URL | Subscribe placeholder alert |
| FAQ focus | 5 marketing FAQs (trial, formats, refunds) | 4 in-app FAQs (credits, rollover) |
| i18n key schema | `features.f1`…`f10`, `faq.q1.q` | `features.credits`, `faq.creditQuestion` |
| Annual billing UX | Per-month price for both cycles | Strikethrough + “billed annually” |
| Free tier CTA | “Get Started” → signup URL | “Current Plan” (disabled) |

### Still open

- FAQ content not fully merged (no contradictions, but different questions)
- Shared `pricing.json` key schema not unified
- Studio checkout not wired (`subscribeComingSoon` placeholder)

---

## Alignment to-do

### P0 — Fix correctness bugs (Landing)

- [x] **Compare table column headers use missing i18n keys**
- [x] **Compare table tier names match plan cards**
- [x] **Replace placeholder contact email** — Enterprise CTA → `/about#connect-with-us`

### P1 — Single source of truth for pricing model

- [x] **Unify billing unit: credits** — Landing copy & compare table updated to Studio credits model
- [x] **Align feature lists per tier** — Free/Pro/Premium features match tier matrix
- [x] **Move hardcoded prices out of Landing `page.tsx`** — prices in `pricing.json`

---

### P2 — Structural / product alignment

- [x] **Enterprise tier** — Landing-only (marketing). Studio stays 3 tiers. Documented here.
- [ ] **Annual billing UX** — presentation still differs between surfaces
- [ ] **FAQ alignment** — merge into one canonical set without contradictions
- [x] **Sections only on Landing** — compare table, custom-solution CTA, free-trial CTA stay Landing-only (decided)

---

### P3 — i18n engineering alignment

- [ ] **Shared `pricing.json` key schema**  
      Landing and Studio use different key structures.  
      **Fix:** Define one schema (extend this doc or `SHARED_I18N_CHECKLIST.md`) and migrate both repos.

- [ ] **Glossary updates**  
      When tier names or “credits” copy changes, update both repos and both `TRANSLATION_GUIDE.md` files.  
      **Fix:** Add pricing glossary rows (credits, rollover, tier names) and note cross-repo impact on pricing PRs.

- [x] **All 8 locales in sync (Landing)** — `pricing.json` updated for en, zh-CN, zh-TW, ja, ko, de, fr, es
- [ ] **All 8 locales in sync (both repos)** — verify Studio stays aligned when Landing copy changes

---

### P4 — CTA / funnel alignment

- [ ] **Signup vs upgrade flow**  
      Landing CTAs → `NEXT_PUBLIC_SIGNUP_URL`. Studio CTAs → `subscribeComingSoon` alert.  
      **Fix:** When billing ships, Landing “Start trial” should land in Studio on the correct tier; Studio buttons should call real checkout.

- [ ] **Free tier CTA**  
      Landing: “Get Started” (external link). Studio: “Current Plan” (disabled).  
      **Fix:** Expected surface difference, but tone should stay consistent.

---

## Canonical tier matrix (target — Studio as baseline)

Use this table when updating copy. Adjust only with explicit product decision.

|                        | Free | Pro    | Premium   | Enterprise |
| ---------------------- | ---- | ------ | --------- | ---------- |
| **Monthly price**      | $0   | $49    | $199      | Custom     |
| **Annual price**       | $0   | $39/mo | $159/mo   | Custom     |
| **Credits / month**    | 5    | 25     | 100       | TBD        |
| **Rollover cap**       | 10   | 50     | Unlimited | TBD        |
| **Custom voices**      | 2    | 5      | 10        | TBD        |
| **Video quality**      | 720p | 1080p  | 4K        | TBD        |
| **API access**         | —    | ✓      | ✓         | ✓          |
| **Team collaboration** | —    | —      | ✓         | ✓          |
| **White-label**        | —    | —      | ✓         | ✓          |
| **Voice cloning**      | —    | —      | —         | ✓          |

> Landing now uses the credits model aligned with Studio. Optional marketing copy may add plain-language “≈ N videos” later.

---

## Suggested execution order

| Step | Work                                                               | Repo(s) | Status |
| ---- | ------------------------------------------------------------------ | ------- | ------ |
| 1    | Fix compare-table i18n keys + tier names                           | Landing | Done   |
| 2    | Agree canonical tier matrix (product sign-off)                     | Both    | Done   |
| 3    | Update `pricing.json` (English first)                              | Landing | Done   |
| 4    | Propagate to 7 non-English locales                                 | Landing | Done   |
| 5    | Move Landing prices into JSON; remove hardcoded numbers            | Landing | Done   |
| 6    | Decide Enterprise + section parity                                 | Both    | Done   |
| 7    | Wire CTAs to signup / checkout                                     | Both    | Open   |
| 8    | Document final `pricing.json` schema in `SHARED_I18N_CHECKLIST.md` | Both    | Open   |

---

## Definition of “aligned”

Pricing is aligned when:

1. Same tier names: **Free / Pro / Premium / (Enterprise)**
2. Same prices and annual discount
3. Same limits per tier (credits, voices, quality, features)
4. FAQ facts do not contradict across repos
5. Shared i18n key structure for `pricing.json`
6. Clear funnel: Landing → signup → Studio upgrade/checkout

---

## PR checklist (pricing changes)

```markdown
### Pricing alignment

- [ ] Tier matrix updated (if limits changed)
- [ ] `pricing.json` updated in both repos (all 8 locales)
- [ ] Landing `page.tsx` — no hardcoded prices
- [ ] Compare table keys match tier names (Landing)
- [ ] FAQ answers consistent (Landing + Studio)
- [ ] Cross-repo PR linked (if only one repo touched)
```
