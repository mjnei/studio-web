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

## Current state

Alignment pass **P0–P4 completed (Aug 2026)**. Both repos share tier limits, FAQ set, semantic `pricing.json` feature keys, and funnel wiring. Use the canonical tables below when changing pricing copy.

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
- **Feature keys**: semantic schema shared for free/pro/premium (`features.credits`, `features.rollover`, …) — documented in `SHARED_I18N_CHECKLIST.md`

### Intentional differences

| Area              | official-landing                           | studio-web                               |
| ----------------- | ------------------------------------------ | ---------------------------------------- |
| Tier count        | 4 (Enterprise marketing-only)              | 3                                        |
| Compare table     | Yes                                        | No                                       |
| Marketing CTAs    | All tiers → `NEXT_PUBLIC_SIGNUP_URL` (Enterprise → contact) | Upgrade → checkout API (or coming-soon toast) |
| Free tier CTA     | “Get Started” → signup URL                 | “Get Started” (logged out) / “Current Plan” (on Free) |
| Extra sections    | Compare table, custom-solution CTA, Enterprise tier | —                                |
| Surface-only keys | `subtitle`, `cta`, `monthly`/`annual`      | `description`, `button`, `billingToggle` |

### Checkout wiring

- **Landing** tier CTAs (Free / Pro / Premium) → `NEXT_PUBLIC_SIGNUP_URL`; Enterprise → `/about#connect-with-us`
- **Studio** upgrade buttons call `POST /billing/checkout-session` when `NEXT_PUBLIC_BILLING_ENABLED=true`; otherwise shows an info toast
- **Studio** unauthenticated users → `/signup`

### Still blocked on backend

- Stripe / `POST /billing/checkout-session` must return `{ checkout_url }` before setting `NEXT_PUBLIC_BILLING_ENABLED=true`

### Completed alignment work (P0–P4, Aug 2026)

| Phase | Summary |
| ----- | ------- |
| P0 | Landing compare-table i18n keys, tier names, Enterprise contact CTA |
| P1 | Credits model, tier feature lists, prices moved into `pricing.json` |
| P2 | Enterprise Landing-only; annual billing UX; 6-question FAQ set |
| P3 | Shared `pricing.json` schema + glossary; all 8 locales in both repos |
| P4 | Landing → signup URL; Studio → checkout API (gated) |

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
- [ ] Feature keys match `SHARED_I18N_CHECKLIST.md` schema
- [ ] Cross-repo PR linked (if only one repo touched)
```
