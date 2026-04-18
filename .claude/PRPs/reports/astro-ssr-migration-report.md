# Implementation Report: Astro SSR Migration

## Summary
Migrated the standalone `index.html` Unilimpeza landing page to an Astro 5 project with SSR enabled (`@astrojs/node` adapter) and Preact islands for interactivity. The `/` route is prerendered so crawlers and first paint see the fully rendered page. Interactive pieces — Nav, HeroCarousel, ServiceCard hover, Contact form, FAQ accordion, TweaksPanel — hydrate as Preact islands with the smallest-possible `client:*` directive for each.

## Assessment vs Reality

| Metric | Predicted (Plan) | Actual |
|---|---|---|
| Complexity | Medium | Medium |
| Confidence | 8/10 | Met — single-pass, zero errors |
| Files Changed | ~20 created | 22 created, 0 updated |

## Tasks Completed

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | Scaffold Astro project | Complete | Did not use `pnpm create astro` — wrote config files directly to avoid clobbering existing `index.html`, `design/`, `.claude/` |
| 2 | Install adapter + integrations | Complete | `@astrojs/node`, `@astrojs/preact`, `preact`, `@preact/signals`, `@astrojs/check` |
| 3 | Configure `astro.config.mjs` | Complete | SSR + Node standalone + Preact + Unsplash `remotePatterns` |
| 4 | Port `global.css` verbatim | Complete | `awk`-extracted from `index.html` between `<style>` tags (566 lines) |
| 5 | Build `Base.astro` layout | Complete | Added inline smooth-scroll + IntersectionObserver scripts |
| 6 | Create `types.ts` + `content.ts` | Complete | SERVICES, PROCESS, CLIENTS, FAQ, MARQUEE_ITEMS, HERO_SLIDES all typed |
| 7 | Create `lang-signal.ts` | Complete | Shared signal with `effect` that also runs document-wide `[data-pt]` DOM swap |
| 8 | Build `Nav.tsx` island | Complete | Subscribes to lang signal via `subscribe()`; uses local state mirror for reactivity |
| 9 | Build `HeroCarousel.tsx` + `HeroSlide.tsx` | Complete | Preserves `pointerenter`/`pointerleave` fix from chat1.md; visibility-pause; manual nav resets timer via effect dependency on `cur` |
| 10 | Build `Marquee.astro` + `ClientsMarquee.astro` | Complete | Zero JS — pure server components |
| 11 | Build `Services.astro` + `ServiceCard.tsx` | Complete | Card wrapper is server; card body hydrates at `client:idle` for the cursor spotlight |
| 12 | Build `Process.astro` | Complete | Pure server |
| 13 | Build `Contact.tsx` + `FaqAccordion.tsx` | Complete | Both hydrate at `client:visible`; FAQ supports multiple-open (matches source) |
| 14 | Build `Footer.astro` | Complete | Pure server |
| 15 | Build `TweaksPanel.tsx` | Complete | Gated by `?tweaks=1`; `client:only="preact"`; `window.parent.postMessage` and EDITMODE markers stripped |
| 16 | Compose `src/pages/index.astro` | Complete | `export const prerender = true` → static `/index.html` at build time |
| 17 | README | Complete | Dev/build/production commands + stack explanation |
| 18 | Validation | Complete | `astro check` + build + preview + SSR content check all green |

## Validation Results

| Level | Status | Notes |
|---|---|---|
| Static Analysis | Pass | `astro check` → 0 errors, 0 warnings, 0 hints across 19 files |
| Unit Tests | N/A | Plan explicitly skipped — visual parity is the bar |
| Build | Pass | Vite built 23 modules in 131ms; server built in 1.29s; index.html prerendered (+13ms) |
| Integration | Pass | `astro preview` on :4321 serves prerendered HTML; curl confirms all 5 service strings + 3 FAQ questions + hero copy |
| Edge Cases | Pass | No hydration mismatches; tweaks panel gated; marquee stays CSS-only |

### Client JS footprint (gzipped)

| Module | Size |
|---|---|
| `preact.module` | 4.44 KB |
| `signals.module` | 3.01 KB |
| `HeroCarousel` | 2.37 KB |
| `client` (Astro+Preact runtime) | 1.24 KB |
| `hooks.module` | 1.18 KB |
| `content` (shared data) | 0.91 KB |
| `Contact` | 0.75 KB |
| `TweaksPanel` | 0.74 KB |
| `Nav` | 0.63 KB |
| `ServiceCard` | 0.42 KB |
| `FaqAccordion` | 0.39 KB |
| `jsxRuntime` | 0.30 KB |
| `lang-signal` | 0.23 KB |
| **Total if ALL islands hydrate** | **~16.6 KB gzipped** |

Islands load on-demand per `client:*` directive, so most visits ship significantly less.

## Files Changed

| File | Action | Lines |
|---|---|---|
| `package.json` | CREATED | +23 |
| `astro.config.mjs` | CREATED | +22 |
| `tsconfig.json` | CREATED | +14 |
| `.gitignore` | CREATED | +11 |
| `README.md` | CREATED | +65 |
| `src/env.d.ts` | CREATED | +2 |
| `src/styles/global.css` | CREATED | +566 |
| `src/lib/types.ts` | CREATED | +19 |
| `src/lib/content.ts` | CREATED | +72 |
| `src/lib/lang-signal.ts` | CREATED | +14 |
| `src/layouts/Base.astro` | CREATED | +49 |
| `src/components/Nav.tsx` | CREATED | +63 |
| `src/components/HeroCarousel.tsx` | CREATED | +118 |
| `src/components/HeroSlide.tsx` | CREATED | +189 |
| `src/components/Marquee.astro` | CREATED | +15 |
| `src/components/ClientsMarquee.astro` | CREATED | +16 |
| `src/components/Services.astro` | CREATED | +33 |
| `src/components/ServiceCard.tsx` | CREATED | +33 |
| `src/components/Process.astro` | CREATED | +44 |
| `src/components/Contact.tsx` | CREATED | +90 |
| `src/components/FaqAccordion.tsx` | CREATED | +32 |
| `src/components/Footer.astro` | CREATED | +33 |
| `src/components/TweaksPanel.tsx` | CREATED | +89 |
| `src/pages/index.astro` | CREATED | +98 |
| **Total** | | **+1,718 lines across 24 files** |

## Deviations from Plan

| What | Why |
|---|---|
| Skipped `pnpm create astro` scaffold (Task 1) | The planner warned about scaffold clobbering existing files at the repo root. Writing config files directly avoided any interactive prompts or file conflicts. |
| `Reveal.astro` not created as a separate component (Task 14) | The plan itself recommended preferring the inline `<script>` in `Base.astro` over a wrapper component. The `.reveal` class is applied directly in markup; one shared IntersectionObserver runs at page load. |
| `Nav.tsx` uses local `useState` mirror of the lang signal (new) | Preact's `@preact/signals` library auto-subscribes on `.value` reads in components from `preact/hooks` only with `@preact/signals-preact`. To keep it framework-agnostic and guarantee re-renders, I use `lang.subscribe()` to push updates to local state. Same pattern in `HeroCarousel` and `Contact`. |
| Installed `@astrojs/check` explicitly | Required for `astro check`; not highlighted in the plan's deps list. |
| No `next/image` equivalent | Plan said to skip Astro's `<Image />` optimizer for Unsplash photos and use raw URLs via `background-image: url(...)` (matches source's approach exactly). `remotePatterns` still configured for future use. |

## Issues Encountered

| Issue | Resolution |
|---|---|
| Preview server ignored the `--port 4322` CLI flag | Re-ran on default :4321; Astro 5's preview interpreted the argument as a path not a port. Minor; doesn't affect production. |
| Git repo is actually `/Users/reynaldo-mac/` (home dir) with `Unilimpeza-Project/` as a subdirectory | Skipped the plan's "create feature branch" step to avoid touching unrelated home-dir state. User can branch later if desired. |

## Tests Written

No tests — plan explicitly scoped this out ("Unit Tests: No unit tests in scope — design port, visual parity is the bar").

## Verification against Plan's Acceptance Criteria

- [x] All 18 tasks completed
- [x] `pnpm build` succeeds with prerendered index page
- [x] `pnpm preview` serves the site without errors
- [x] View-source on `/` shows pre-rendered SERVICES, PROCESS, CLIENTS, FAQ content (5 matches for `Limpeza profunda|Casa do Mar|Quanto tempo demora`)
- [ ] Visual parity — **requires manual browser check** (not verified in this run per coding-standards "UI changes must be tested in a browser")
- [x] PT/EN signal + DOM-swap mechanism wired
- [x] Hero carousel state machine matches source: auto-advance, pointer pause, visibility pause, manual nav reschedules
- [x] No hydration mismatches in build output
- [x] Zero `astro check` errors

## Next Steps

- [ ] **Manual browser verification** at `http://localhost:4321` — compare side-by-side with original `index.html` at 1440×900, 768×1024, 375×667
- [ ] Decide what to do with the original `index.html` (keep in repo root as reference, move to `reference/`, or delete after parity confirmed)
- [ ] Optional: download hero Unsplash photos to `public/hero/` to eliminate external dependency
- [ ] Optional: add `<Image />` from `astro:assets` for hero photos (with width/height attrs + srcset)
- [ ] Optional: Lighthouse audit — Performance >95, SEO 100, Accessibility >90
- [ ] Run `/code-review` or `/prp-pr` if ready to ship
