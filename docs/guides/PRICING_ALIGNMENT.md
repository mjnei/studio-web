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

## Current state (updated after P0 + P1 + P2 pass)

### What matches (both repos)

- Tier names on plan cards: **Free / Pro / Premium** (Landing also has **Enterprise** — marketing-only)
- Price points: Free $0; Pro $49/$39; Premium $199/$159 (monthly/annual)
- **Annual billing UX**: `$39/mo` + “billed annually” + strikethrough `$49/mo when billed monthly` (paid tiers)
- **Credits model**: 5 / 25 / 100 per month with rollover caps 10 / 50 / unlimited
- Voice limits: Free 2, Pro 5, Premium 10 custom voices
- Video quality ladder: 720p → 1080p → 4K
- Pro is the highlighted / “most popular” tier
- Premium description: maximum capacity (100 credits/month — not unlimited)
- Landing prices live in `pricing.json` (no hardcoded numbers in `page.tsx`)
- Landing compare table uses correct tier keys (`free` / `pro` / `premium` / `enterprise`)
- **FAQ**: identical 6-question set (`faq.q1`–`faq.q6`) in all 8 locales — credits, rollover, plan changes, team plans, video formats, own scripts/voices. No free-trial or refund copy.

### Intentional differences

| Area              | official-landing                           | studio-web                               |
| ----------------- | ------------------------------------------ | ---------------------------------------- |
| Tier count        | 4 (Enterprise marketing-only)              | 3                                        |
| Compare table     | Yes                                        | No                                       |
| Marketing CTAs    | Custom solution, signup URL                | Subscribe placeholder alert              |
| i18n key schema   | `features.f1`…`f10`                        | `features.credits`, `features.rollover`  |
| Free tier CTA     | “Get Started” → signup URL                 | “Current Plan” (disabled)                |
| Extra sections    | Compare table, custom-solution CTA         | —                                        |

### Still open

- Shared `pricing.json` key schema not unified (feature keys differ; FAQ keys now aligned)
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
- [x] **Annual billing UX** — Landing now matches Studio (strikethrough + “billed annually”)
- [x] **FAQ alignment** — 6 canonical FAQs merged on both surfaces; free-trial and refund copy removed
- [x] **Sections only on Landing** — compare table, custom-solution CTA stay Landing-only (free-trial CTA removed)

---

### P3 — i18n engineering alignment

- [ ] **Shared `pricing.json` key schema**  
      Feature keys still differ (`f1`…`f10` vs `features.credits`). FAQ keys now unified (`faq.q1`–`faq.q6`).  
      **Fix:** Define one schema (extend this doc or `SHARED_I18N_CHECKLIST.md`) and migrate both repos.

- [ ] **Glossary updates**  
      When tier names or “credits” copy changes, update both repos and both `TRANSLATION_GUIDE.md` files.  
      **Fix:** Add pricing glossary rows (credits, rollover, tier names) and note cross-repo impact on pricing PRs.

- [x] **All 8 locales in sync (Landing)** — `pricing.json` updated for en, zh-CN, zh-TW, ja, ko, de, fr, es
- [x] **All 8 locales in sync (both repos)** — FAQ and pricing copy aligned across all locales

---

### P4 — CTA / funnel alignment

- [ ] **Signup vs upgrade flow**  
      Landing CTAs → `NEXT_PUBLIC_SIGNUP_URL`. Studio CTAs → `subscribeComingSoon` alert.  
      **Fix:** When billing ships, Landing “Get Started” should land in Studio on the correct tier; Studio buttons should call real checkout.

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

## Canonical FAQ set (both repos)

| Key | Topic |
| --- | ----- |
| `faq.q1` | What is a credit and how is it used? |
| `faq.q2` | How does credit rollover work? |
| `faq.q3` | Can I change or cancel my plan? |
| `faq.q4` | Do you offer team plans? |
| `faq.q5` | What video formats and quality do you support? |
| `faq.q6` | Can I use my own scripts or voices? |

**Excluded (by product decision):** free-trial FAQs, refund/money-back FAQs.

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
| 7    | Align annual billing UX + merge FAQs                               | Both    | Done   |
| 8    | Document final `pricing.json` schema in `SHARED_I18N_CHECKLIST.md` | Both    | Open   |
| 9    | Wire CTAs to signup / checkout                                     | Both    | Open   |

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
