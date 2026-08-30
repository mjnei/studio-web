# Pricing Alignment (Huavoi Landing + Studio)

Cross-repo checklist for keeping pricing pages and copy aligned between **official-landing** and **studio-web**.

Related:

- `docs/guides/SHARED_I18N_CHECKLIST.md` — locale codes, glossary, i18n engineering
- `docs/guides/TRANSLATION_GUIDE.md` — translation principles per repo

**Pages:**

| Repo | Path |
|------|------|
| official-landing | `src/app/pricing/page.tsx` |
| studio-web | `src/app/(shell)/pricing/page.tsx` |

**Translation files:** `public/locales/{locale}/pricing.json` (8 locales in both repos)

---

## Current state (as of last cross-check)

### What already matches

- Tier names on plan cards: **Free / Pro / Premium** (Landing also has **Enterprise**)
- Price points:
  - Free: $0
  - Pro: $49/mo monthly, $39/mo annual (~20% off)
  - Premium: $199/mo monthly, $159/mo annual (~20% off)
- Pro is the highlighted / “most popular” tier on both pages
- Voice limits are broadly consistent: Free 2, Pro 5, Premium 10 custom voices
- Video quality ladder: 720p → 1080p → 4K

### What does not match

| Area | official-landing | studio-web |
|------|------------------|------------|
| Billing unit | Videos per month (10 / 100 / unlimited) | Credits per month (5 / 25 / 100) + rollover |
| Tier count | 4 (includes Enterprise) | 3 (no Enterprise) |
| Price source | Hardcoded in `page.tsx` | `pricing.json` |
| Compare table | Yes (9 rows) | No |
| Marketing CTAs | Custom solution, free trial, signup URL | Subscribe placeholder alert |
| FAQ focus | Trial, formats, refunds | Credits, rollover, plan changes |
| i18n key schema | `features.f1`…`f10`, `faq.q1.q` | `features.credits`, `faq.creditQuestion` |
| Compare table headers | Uses `starter` / `professional` / `business` keys | N/A |

---

## Alignment to-do

### P0 — Fix correctness bugs (Landing)

- [ ] **Compare table column headers use missing i18n keys**  
  `page.tsx` references `pricing.starter.name`, `pricing.professional.name`, `pricing.business.name`, but `pricing.json` only defines `free`, `pro`, `premium`, `enterprise`.  
  **Fix:** Rename keys to `free` / `pro` / `premium` / `enterprise`, or add missing keys in all 8 locales.

- [ ] **Compare table tier names don’t match plan cards**  
  Cards: Free / Pro / Premium / Enterprise. Table: Starter / Professional / Business / Enterprise.  
  **Fix:** Use one naming scheme everywhere (per `SHARED_I18N_CHECKLIST`: Free / Pro / Premium / Enterprise).

- [ ] **Replace placeholder contact email**  
  Enterprise CTA uses `mailto:abc@example.com`.  
  **Fix:** Use real sales/support email or the same `/about#connect-with-us` flow as the custom-solution CTA.

---

### P1 — Single source of truth for pricing model

- [ ] **Unify billing unit: videos vs credits**  
  Landing says “10 / 100 / unlimited videos per month”; Studio says “5 / 25 / 100 credits per month” with rollover.  
  **Fix:** Pick one canonical model (credits is documented in Studio: `1 credit = 1 video`). Update Landing copy and compare-table rows to match Studio numbers and rollover rules.

- [ ] **Align feature lists per tier**  
  Same tier should describe the same limits (voices, quality, API, team, white-label, etc.).  
  **Fix:** Maintain a shared tier matrix (table below), then update both `public/locales/*/pricing.json` files from it.

- [ ] **Move hardcoded prices out of Landing `page.tsx`**  
  Pro/Premium prices are in TS; Studio keeps them in `pricing.json`.  
  **Fix:** Add `price.monthly` / `price.annual` to Landing `pricing.json` (same shape as Studio) and read via `t()`.

---

### P2 — Structural / product alignment

- [ ] **Enterprise tier**  
  Landing has Enterprise; Studio does not.  
  **Fix:** Either add Enterprise to Studio (even “Contact sales” only), or document Enterprise as marketing-only on Landing.

- [ ] **Annual billing UX**  
  Both offer ~20% annual savings; presentation differs (Landing shows per-month for both cycles; Studio shows strikethrough + “billed annually”).  
  **Fix:** Align so users see the same price semantics on both surfaces.

- [ ] **FAQ alignment**  
  Landing: 5 generic FAQs. Studio: 4 credit/rollover FAQs.  
  **Fix:** Merge into one canonical FAQ set. Landing can show all; Studio can show a subset, but answers must not contradict.

- [ ] **Sections only on Landing**  
  Compare table, custom-solution CTA, free-trial CTA exist only on Landing.  
  **Fix:** Decide intentionally — keep rich marketing on Landing only, or port compare table / trial CTA to Studio.

---

### P3 — i18n engineering alignment

- [ ] **Shared `pricing.json` key schema**  
  Landing and Studio use different key structures.  
  **Fix:** Define one schema (extend this doc or `SHARED_I18N_CHECKLIST.md`) and migrate both repos.

- [ ] **Glossary updates**  
  When tier names or “credits” copy changes, update both repos and both `TRANSLATION_GUIDE.md` files.  
  **Fix:** Add pricing glossary rows (credits, rollover, tier names) and note cross-repo impact on pricing PRs.

- [ ] **All 8 locales in sync**  
  Any key or value change must land in `en`, `zh-CN`, `zh-TW`, `ja`, `ko`, `de`, `fr`, `es` in **both** repos.

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

| | Free | Pro | Premium | Enterprise |
|---|------|-----|---------|------------|
| **Monthly price** | $0 | $49 | $199 | Custom |
| **Annual price** | $0 | $39/mo | $159/mo | Custom |
| **Credits / month** | 5 | 25 | 100 | TBD |
| **Rollover cap** | 10 | 50 | Unlimited | TBD |
| **Custom voices** | 2 | 5 | 10 | TBD |
| **Video quality** | 720p | 1080p | 4K | TBD |
| **API access** | — | ✓ | ✓ | ✓ |
| **Team collaboration** | — | — | ✓ | ✓ |
| **White-label** | — | — | ✓ | ✓ |
| **Voice cloning** | — | — | — | ✓ |

> Landing currently describes videos/month instead of credits. After alignment, Landing should express the same limits using the credits model (with optional plain-language “≈ N videos” if helpful for marketing).

---

## Suggested execution order

| Step | Work | Repo(s) |
|------|------|---------|
| 1 | Fix compare-table i18n keys + tier names | Landing |
| 2 | Agree canonical tier matrix (product sign-off) | Both |
| 3 | Update `pricing.json` (English first) | Both |
| 4 | Propagate to 7 non-English locales | Both |
| 5 | Move Landing prices into JSON; remove hardcoded numbers | Landing |
| 6 | Decide Enterprise + section parity | Both |
| 7 | Wire CTAs to signup / checkout | Both |
| 8 | Document final `pricing.json` schema in `SHARED_I18N_CHECKLIST.md` | Both |

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
