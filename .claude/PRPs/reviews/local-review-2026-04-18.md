# Local Code Review — Unilimpeza Astro Migration

**Reviewed**: 2026-04-18
**Scope**: All source files in `Unilimpeza-Project/` (uncommitted, fresh Astro app)
**Decision**: **APPROVE with comments** — no CRITICAL issues, two HIGH issues to address before shipping to prod, remainder are MEDIUM/LOW polish.

## Summary

Well-structured Astro 5 app. Islands use Preact correctly, CSS is faithfully ported, SSR + structured data + accessibility are solid. Two HIGH issues need attention: (1) `HeroSlide.tsx` switch lacks an exhaustiveness guard and could return `undefined` if a variant is added, and (2) the `Contact` form pretends to submit but sends no data — a user-visible pitfall in production. Zero type errors, build is green, no `console.log` / `TODO` / `as any` / mutation patterns.

---

## Findings

### CRITICAL
None.

### HIGH

#### H1 — `HeroSlide.tsx` switch is not exhaustive
**File**: [src/components/HeroSlide.tsx:64-262](src/components/HeroSlide.tsx:64)
**Issue**: `switch (slide.variant)` covers exactly the 5 current variants, but has no `default:` branch. If a 6th variant is ever added to `SlideVariant` (`types.ts:10`), TypeScript widens the inferred return type to include `undefined`, and at runtime the component silently renders nothing. The bug would be invisible because hero chrome would still render.
**Fix**:
```tsx
switch (slide.variant) {
  case 'slide-01': return (/*...*/);
  // ...other cases
  default: {
    const _exhaustive: never = slide.variant;
    throw new Error(`Unknown slide variant: ${_exhaustive}`);
  }
}
```
This turns additions into compile-time errors.

#### H2 — Contact form discards user data
**File**: [src/components/Contact.tsx:13-16](src/components/Contact.tsx:13)
**Issue**: `onSubmit` calls `preventDefault()` then `setSent(true)` — the form fields are never transmitted anywhere. Users will believe their quote request was received when it wasn't. `aria-live="polite"` on the button even announces "✓ Enviado" to screen-reader users, reinforcing the false success state. The README documents this as intentional ("no form backend — visual confirmation only") but production deployment without wiring this up is a lead-loss bug.
**Fix**: Either:
- Wire to a real endpoint (e.g. an Astro API route that forwards to SendGrid / Formspree / Resend), OR
- Replace the button label with "Copiar email" and render the static address, OR
- Remove the form until the backend exists
**Do not ship this page publicly without resolving this.**

### MEDIUM

#### M1 — `setLang` uses `innerHTML` on server-rendered `data-*` attributes
**File**: [src/lib/lang-store.ts:26-29](src/lib/lang-store.ts:26)
**Issue**: `el.innerHTML = value` is safe today because `data-pt` / `data-en` values are authored in code (e.g. `Services.astro` hardcodes them), but if these attributes ever source from a CMS, form submission, or query string, this becomes a reflected XSS vector.
**Fix**: Document the constraint explicitly (comment already hints at it) and add a defense-in-depth sanitization. Minimally:
```ts
// Trusted authors only — see lang-store.ts header note.
// If you ever wire data-pt/data-en to user input, switch to textContent or sanitize.
el.innerHTML = value;
```
A stronger option: constrain allowed tags at assignment time:
```ts
const SAFE = /^(<\/?(strong|em|u|br)\s*\/?>|[^<>])*$/;
el.innerHTML = SAFE.test(value) ? value : document.createTextNode(value).textContent ?? '';
```

#### M2 — JSON-LD script not escaped against `</script>` injection
**File**: [src/layouts/Base.astro:156](src/layouts/Base.astro:156)
**Issue**: `set:html={JSON.stringify(localBusinessLd)}` does not escape `</script>`, `<!--`, or `<![CDATA[`. All values are static today so it is safe, but if `description` or `name` ever pulls from dynamic content, the `<script>` tag can be terminated early.
**Fix**: Escape at serialization time:
```ts
const ld = JSON.stringify(localBusinessLd).replace(/</g, '\\u003c');
```

#### M3 — Large single-file components
**Files**: [src/components/HeroCarousel.tsx](src/components/HeroCarousel.tsx) (225 lines), [src/components/HeroSlide.tsx](src/components/HeroSlide.tsx) (263 lines)
**Issue**: Both approach/exceed the 200-line target from global coding-style. `HeroCarousel` mixes 4 concerns (state, effects, pause logic, chrome JSX). `HeroSlide` has 5 large JSX cases that could each live in their own file.
**Fix**: Extract `HeroChrome` (dots + arrows + counter) from `HeroCarousel`, and split `HeroSlide` into `SlideEditorial`, `SlideBrutal`, `SlideVapor`, `SlideTechnical`, `SlideHuman` — each then easily <80 lines. Router stays in `HeroSlide` as a lookup table.

#### M4 — Hardcoded `siteUrl` instead of `Astro.site`
**File**: [src/layouts/Base.astro:15](src/layouts/Base.astro:15)
**Issue**: `const siteUrl = 'https://unilimpeza.pt';` duplicates the `site:` value already in `astro.config.mjs`. Two sources of truth diverge silently.
**Fix**:
```astro
const siteUrl = Astro.site?.href.replace(/\/$/, '') ?? 'https://unilimpeza.pt';
```

#### M5 — Unsafe casts in `TweaksPanel`
**File**: [src/components/TweaksPanel.tsx:39](src/components/TweaksPanel.tsx:39)
**Issue**: `(e.target as HTMLSelectElement).value as 'light' | 'dark'` — the second cast blindly trusts the select value. Works today because options are hardcoded, but the pattern is fragile.
**Fix**:
```ts
const v = (e.target as HTMLSelectElement).value;
if (v === 'light' || v === 'dark') setTheme(v);
```

#### M6 — `Event` instead of `SubmitEvent` in Contact submit handler
**File**: [src/components/Contact.tsx:13](src/components/Contact.tsx:13)
**Fix**: `const onSubmit = (e: SubmitEvent) => { ... }` — conveys intent and enables `e.submitter` if needed later.

#### M7 — Tablist role on hero dots without `aria-controls`
**File**: [src/components/HeroCarousel.tsx:165-187](src/components/HeroCarousel.tsx:165)
**Issue**: `role="tablist"` + `role="tab"` + `aria-selected` pattern expects each tab to `aria-controls` a `role="tabpanel"` element. The slides have `role="group"` instead.
**Fix**: Either (a) add `id` to each slide + `aria-controls` on each dot, and change slide role to `tabpanel`, OR (b) drop the tablist role and use plain `<button aria-label="Go to scene N">` — simpler and just as accessible for a carousel.

### LOW

#### L1 — `es2022` target with Node adapter
**File**: [astro.config.mjs:28](astro.config.mjs:28)
**Note**: Fine for modern deployment. Confirm that your production Node version is ≥18.

#### L2 — Unused `media` onload hint flagged by astro-check
**File**: [src/layouts/Base.astro:146](src/layouts/Base.astro:146)
**Warning**: `ts(6133): 'media' is declared but its value is never read.` — Astro-check parses `onload="this.media='all'"` as a JS expression and complains. Harmless, but silences cleanly with:
```html
<link ... media="print" onload={`this.media='all'`} />
```
or moving the async-font trick to a dedicated `<script is:inline>` that flips `rel="preload"` → `rel="stylesheet"`.

#### L3 — Repeated `(max-width: 720px)` breakpoint magic number
**Files**: [HeroSlide.tsx:44,47](src/components/HeroSlide.tsx:44), [Base.astro:127,135](src/layouts/Base.astro:127)
**Fix**: Export a constant:
```ts
// src/lib/breakpoints.ts
export const HERO_MOBILE_MAX = 720;
export const HERO_MOBILE_MEDIA = `(max-width: ${HERO_MOBILE_MAX}px)`;
```

#### L4 — `Contact.tsx` `disabled={sent}` after false success
See H2. If the fix is to keep the current visual-only flow, at minimum reset `sent` after ~3s so the form isn't permanently frozen: `setTimeout(() => setSent(false), 3000)`.

#### L5 — `HeroCarousel.tsx` `goTo` not in effect deps
**File**: [src/components/HeroCarousel.tsx:70,88,91](src/components/HeroCarousel.tsx:70)
**Note**: `goTo` closes over `curRef` (a ref, stable) and `HERO_SLIDES` (module-level, stable). Correct behavior, but ESLint `react-hooks/exhaustive-deps` would flag it. Wrap in `useCallback` and add to deps if you adopt that lint rule.

#### L6 — `lang-store.ts` `innerHTML` mutation coupled to implicit trust on every `data-pt` site
**File**: [src/lib/lang-store.ts:28](src/lib/lang-store.ts:28)
See M1 — if the constraint is documented properly, this drops from MEDIUM to LOW.

---

## Validation Results

| Check | Result |
|---|---|
| Type check (`astro check`) | **Pass** — 0 errors, 0 warnings, 1 hint (L2 above) |
| Lint | **Skipped** — no ESLint configured. Recommended: add `eslint-plugin-astro` + `@typescript-eslint/*`. |
| Tests | **Skipped** — no tests (design-port scope). Recommended: add Playwright smoke tests for the carousel state machine (we already proved it via preview_eval; codifying those assertions would prevent regressions). |
| Build (`pnpm build`) | **Pass** — server built in 1.39s, index prerendered |
| Manual a11y sanity | **Pass** — 1 h1, proper landmarks, skip-link, aria-live, focus styles (see prior audit report) |

---

## Files Reviewed (22)

| File | Change Type | Notes |
|---|---|---|
| `astro.config.mjs` | Added | Config clean after revert of signals workarounds |
| `.npmrc` | Added | Preact hoist pattern — correctly pins single instance |
| `package.json` | Added | Clean deps after `@preact/signals` removal |
| `tsconfig.json` | Added | Strict + Preact JSX runtime |
| `src/middleware.ts` | Added | Security headers + Cache-Control by path — good |
| `src/layouts/Base.astro` | Added | 204 lines; see M2, M4, L2, L3 |
| `src/pages/index.astro` | Added | Clean composition |
| `src/lib/content.ts` | Added | Read-only typed data, good |
| `src/lib/types.ts` | Added | Tight types, good |
| `src/lib/lang-store.ts` | Added | See M1 |
| `src/components/HeroCarousel.tsx` | Added | 225 lines; see H1's neighbor M3, L5, M7 |
| `src/components/HeroSlide.tsx` | Added | 263 lines; see H1, M3 |
| `src/components/Nav.tsx` | Added | Clean |
| `src/components/Contact.tsx` | Added | See H2, M6 |
| `src/components/FaqAccordion.tsx` | Added | Proper ARIA, good |
| `src/components/ServiceCard.tsx` | Added | Clean |
| `src/components/TweaksPanel.tsx` | Added | See M5 |
| `src/components/Services.astro` | Added | Clean |
| `src/components/Process.astro` | Added | Clean |
| `src/components/Marquee.astro` | Added | Pure SSR, good |
| `src/components/ClientsMarquee.astro` | Added | Pure SSR, good |
| `src/components/Footer.astro` | Added | Pure SSR, good |
| `src/styles/global.css` | Added | 630 lines, ported verbatim + a11y additions |
| `public/favicon.svg`, `public/manifest.webmanifest`, + 25 hero images | Added | PWA + optimized media |

---

## Blocking Checklist for Production

- [ ] **H1**: Add exhaustive `default` branch to `HeroSlide.tsx` switch
- [ ] **H2**: Wire Contact form to a real backend OR replace with a non-form contact path

The other findings (M1–M7, L1–L6) are non-blocking polish. Recommend addressing M3 (component size), M4 (single source of truth for siteUrl), and M2 (JSON-LD script escape) before first external audit. L1–L6 are optional.
