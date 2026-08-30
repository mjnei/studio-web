# Translation Guide (Huavoi Studio)

Guide for translators and engineers adding or updating UI copy in **Huavoi Studio** (the authenticated creator app). Source locale is **English (`en`)**. All other locales must follow these principles so product language stays consistent across ~8 languages.

For file layout, `useI18n` usage, and namespace inventory, see also [`public/locales/README.md`](../../public/locales/README.md). For the marketing site and TTS playground, see the companion guide in the **official-landing** repo (`docs/guides/TRANSLATION_GUIDE.md`) — shared terms (voices, credits, playground) should align across both products.

Translation files live in `public/locales/{locale}/{namespace}.json`. Namespaces are registered in `src/i18n/context.tsx` (`translationFiles`).

---

## 1. Core principle: product UI, not dictionary

**Translate for how people use internet products in that language — not word-for-word from English.**

Ask for every string:

1. Would a native user of popular apps (Douyin / WeChat / LINE / Kakao / YouTube / Notion / CapCut equivalents) expect this wording on a **button, nav item, or form label**?
2. Does it match **this product’s domain** (AI video + TTS / voice cloning), or a different industry’s jargon?

If a literal translation fails either test, rewrite it.

| Bad (literal / wrong domain) | Why it fails | Better approach |
|---|---|---|
| Onboarding → 入职 | HR “employee onboarding” | Product setup: 新手引导 |
| Dashboard → 仪表板 | Sounds like analytics widgets | App home: 工作台 |
| Voices (TTS clones) → 语音 | Often means “speech / ASR” | Industry term: 音色 |
| Credits → 信用 / 信用点 | Sounds like credit score | Product currency: 额度 (or agreed local term) |

**English is the meaning source, not the syntax template.** Reorder clauses, drop filler, and choose shorter verbs when the target UI culture prefers brevity.

---

## 2. Voice & tone

Huavoi Studio is a **creator tool**: clear, friendly, confident. Not corporate HR, not legalistic, not meme-casual.

| Context | Tone |
|---|---|
| Buttons / nav / tabs | Short, action-first |
| Empty states / success | Warm, one idea per sentence |
| Errors | Calm, specific, actionable (“…请重试” / “Try again”) |
| Settings / billing | Precise; avoid slang |

Prefer second person where the locale normally does for apps (`you` / `你` / `あなた`). Prefer polite forms where that market expects them (`您`, formal Japanese, etc.) — **pick one register per locale and stick to it**.

---

## 3. Terminology glossary (must stay consistent)

Agree terms **once per locale**, then reuse everywhere (shell, billing, project flow, toasts). Do not invent synonyms for the same concept.

Canonical English → meaning → current Simplified Chinese (`zh-CN`) reference:

| English key concept | Meaning in product | `zh-CN` (reference) | Notes for other locales |
|---|---|---|---|
| **Onboarding** | First-run product setup wizard | 新手引导 | Not HR onboarding |
| **Dashboard** | Main authenticated home | 工作台 | Not “instrument panel” |
| **Profile** (nav) | Account area | 个人中心 | Settings page title can be shorter (资料 / 账户) |
| **Voices** | TTS / clone voice profiles | 音色 | Align with CapCut / TTS vendor wording in that market |
| **Voice** (workflow step) | Narration / voiceover step | 配音 or 音色 | Step name may differ from library name; keep intentional |
| **TTS / speech synthesis** | Generating spoken audio | 语音合成 | “Speech synthesis” as a process is OK even if clones are 音色 |
| **Credits** | Consumable generation balance | 额度 | One word only — never mix 积分 / 信用 / credits transliteration in the same locale |
| **Jobs** | Async generation tasks | 任务 | “Jobs” as employment is wrong |
| **Playground** | Experimental / admin sandbox | 试用场 | Or keep “Playground” if loanwords are normal in that market |
| **Filter** | UI filter control | 筛选 | Not “过滤器” unless technical docs |
| **Active** (job status) | In progress | 进行中 | Prefer status language over “lively/active” |
| **Redirecting** | Client navigation wait | 跳转中 | Prefer app navigation verbs |
| **Sign out** | End session | 退出登录 | One phrase; don’t mix 退出 / 登出 |
| **Full name** | Display / legal name field | 姓名 | Form-label length over literal “full name” |
| **Required** (validation) | Missing field | 请填写… | Imperative UX copy, not “X is required” calques |

When introducing a **new** English product term, add a row here **before** translating into 8 locales.

### Cross-product alignment (Huavoi landing site)

The public **official-landing** repo shares locale codes and several concepts. Keep these aligned where both surfaces appear:

| Concept | Studio (`zh-CN`) | Landing (`zh-CN`) |
|---|---|---|
| Playground (nav) | 试用场 | 体验 |
| Voices / voice library | 音色 | 音色 (playground) |
| TTS / synthesis | 语音合成 | 语音合成 |
| Pricing | 定价 / 方案 | 价格 / 定价 |

Landing uses more marketing copy; Studio uses more workflow copy — but **core product nouns should not contradict**.

### Domain nuance: Voices vs speech

- **Voice library / my voices / select voice** → treat as **voice identity / timbre** (cloneable profile).
- **Generate speech / TTS / speech rate** → treat as **spoken audio process**.
- **Workflow “Voice” step** may use **voiceover / dubbing** language if that reads more naturally than “timbre”.

Do not force one word to cover all three if the language distinguishes them.

---

## 4. UI-string rules

### Buttons and labels

- Prefer **verb + object** or a single clear noun: `保存`, `创建项目`, `立即升级`.
- Avoid long English calques on buttons (`Go to Dashboard` → prefer local “enter home / workspace” phrasing).
- Loading states: short (`保存中…`, `跳转中…`), same verb family as the idle button.

### Titles vs descriptions

- **Title**: concept only.
- **Description**: one supporting sentence; no restating the title.

### Placeholders

- Show format or example, not instructions duplicated from the label.
- Keep examples culturally local when they are names (`张三`, not `John Doe` in `zh-CN`).

### Plurals and grammar

- English may use `{plural}` / ICU-style fragments. **Many languages do not need English plural suffixes.**
- Prefer a complete local sentence with `{count}` / `{seconds}` rather than bolting English `{plural}` onto a translation.
- If the app still passes `{plural}`, make the local string ignore it or use an empty substitution — never leave raw `{plural}` visible.

### Interpolation

Studio’s `t()` accepts a second argument for placeholder substitution:

```tsx
t("auth.signup.invitedBy", { name: "Alex" })
// en: "Invited by Alex"
```

Rules:

- Preserve placeholder **names** exactly: `{name}`, `{count}`, `{tier}`, `{credits}`, `{email}`.
- You may reorder where placeholders appear in the sentence for grammar.
- Do not translate placeholder keys.
- Missing option values leave the raw `{key}` in output — ensure components pass all required values.

See `src/i18n/__tests__/t-interpolation.test.ts` for expected behavior.

### Brand and proper nouns

- Keep **Huavoi Studio**, **Google**, **Apple**, **IMDb**, plan names **Pro / Premium** unless marketing provides official local names.
- Product feature names that are also English UI nouns (Script, Compose) should follow the glossary once chosen.

### Length and layout

- Expect ~30–50% length swing vs English. Prefer concise local UI words so nav and buttons still fit.
- Do not shorten by inventing ambiguous abbreviations unless that locale’s apps commonly use them.

---

## 5. What not to do

1. **Machine-translate the whole tree and ship** without a native pass on buttons, nav, empty states, and errors.
2. **Reuse one synonym randomly** (e.g. mixing 积分 / 额度 / 信用 for credits).
3. **Import workplace jargon** (入职, 述职, 看板-as-HR) into consumer product setup.
4. **Translate technical identifiers** (`delete my account` confirmation strings that must match exactly — check the English source and code).
5. **Change JSON keys** — only values. Keys must match `en`.
6. **Drop keys** or leave English leftovers in a “finished” locale file.
7. **Invent features** in marketing fluff that English does not claim.

---

## 6. File & workflow conventions

### Layout

```text
public/locales/
  en/          # source of truth for keys + English meaning
  zh-CN/       # Simplified Chinese (reference localization)
  {locale}/    # one folder per locale code
    common.json
    auth.json
    shell.json
    ...
```

### Locale codes

- Use the codes registered in `src/i18n/config.ts` (`locales`, `localeNames`).
- Current: `en`, `zh-CN`, `zh-TW`, `ja`, `ko`, `de`, `fr`, `es` (BCP-47 throughout — UI folders, API, TMDB, voices).

### Adding a new locale (checklist)

1. Copy `public/locales/en/*.json` → `public/locales/{locale}/`.
2. Translate values only; keep key trees identical to `en`.
3. Apply the **glossary** for that locale (document choices in the PR description).
4. Native review pass focused on: **shell nav**, **auth**, **onboarding**, **common buttons**, **credits**, **voices**.
5. Register the locale in `src/i18n/config.ts` (`locales`, `localeNames`, `voiceLanguageLabelKey`, `localeToDateLocale`).
6. Spot-check in the UI (language switcher) — especially truncation in the sidebar and modals.
7. Do not leave incomplete namespaces: missing files fall back empty; treat parity with `en` as required.

### Updating copy

- Change `en` first when meaning changes.
- Propagate to all locales in the same PR when possible; if not, open a follow-up and never leave known wrong domain terms (like HR “onboarding”) unfixed in shipping locales.

### Namespaces (where strings live)

| Namespace | Typical content |
|---|---|
| `common` | Shared actions: save, cancel, pagination |
| `shell` | Sidebar / nav labels |
| `auth` | Login, signup, invite |
| `onboarding` | First-run wizard |
| `dashboard` | Home |
| `projects` / `project` | List + multi-step creator flow |
| `voices` | Voice library & recording |
| `jobs` | Generation task list |
| `movies` | Catalog |
| `settings` / `notifications` / `profile` | Account prefs |
| `pricing` / `billing` / `referral` | Plans & growth |
| `help` | Help center blurbs |

---

## 7. Review rubric (PR / LQA)

For each locale PR, reviewers should confirm:

- [ ] No dictionary fails on **onboarding / dashboard / voices / credits / jobs**
- [ ] Glossary terms used consistently across namespaces
- [ ] Buttons read as local UI, not translated English sentences
- [ ] Placeholders intact; `t(key, options)` substitutions work in UI
- [ ] No visible raw `{name}` / `{count}` bugs
- [ ] Register (你/您, formal/informal) consistent within the locale
- [ ] JSON valid; key tree matches `en`
- [ ] Confirmation / type-to-confirm strings still match code expectations

---

## 8. Locale-specific notes

### English (`en`)

- Source of truth for **keys and product meaning**.
- Prefer clear product English; avoid idioms that will not travel (`hit the ground running`).

### Simplified Chinese (`zh-CN`)

- Reference localization for tone and glossary (see table above).
- Prefer internet-product phrasing over print/literary Chinese.
- TTS clones: **音色**; process: **语音合成**; workflow step: **配音** is acceptable.
- Credits: **额度** only.

### Traditional Chinese (`zh-TW`)

- Translate **from English**, not by converting `zh-CN`. Taiwan product wording differs (e.g. 登入 / 影片 / 設定 / 專案 / 點數).
- Credits: **點數** (not Mainland 额度).
- Voices library: **音色**; workflow step: **配音**; TTS process: **語音合成**.

### Japanese (`ja`) / Korean (`ko`) / German (`de`) / French (`fr`) / Spanish (`es`)

- Lock glossary terms in the PR (see tables in prior locale PRs / `config.ts` display names).
- Research how major **short-video / TTS / creator** apps in that market name: home/workspace, voice/timbre/voiceover, credits, first-run setup.

---

## 9. Engineering notes (for implementers)

- Runtime loads every namespace in `translationFiles` (`src/i18n/context.tsx`). New namespace JSON must be added there.
- Fallback: failed loads for a non-default locale fall back to `en`; missing keys within a loaded locale also fall back to `en`.
- Use `t(key, options)` for dynamic values — do not concatenate translated fragments around English words.
- Do not hardcode user-visible English in components when a key already exists — or add a key to `en` + all locales.
- Admin-only surfaces may stay English longer; still avoid shipping wrong-domain terms in shared `shell` keys.
- Voice language labels use `voices.languages.*` keys mapped via `voiceLanguageLabelKey` in `config.ts`.

---

## 10. Quick examples

**Onboarding aria / completion**

- en: `Completing onboarding`
- zh-CN: `正在完成新手引导` (not `入职流程`)

**Nav**

- en: `Dashboard` / `Voices` / `Profile` / `Credits`
- zh-CN: `工作台` / `音色` / `个人中心` / `额度`

**Interpolation**

- en: `Invited by {name}` → `t("auth.signup.invitedBy", { name })`
- zh-CN: `由 {name} 邀请` (placeholder name unchanged)

**Validation**

- en: `Name is required`
- zh-CN: `请填写姓名` (not `名称是必需的`)

**Credits in pricing**

- Keep one local noun for “credit” across pricing, referral, jobs, export confirmations, and settings notifications.

---

When in doubt: **sound like a native app in that market, stay faithful to English meaning, and never break glossary consistency.**
