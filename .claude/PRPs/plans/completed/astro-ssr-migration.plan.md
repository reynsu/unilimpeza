# Plan: Migrate Unilimpeza landing page to Astro with SSR

## Summary
Port the standalone `index.html` landing page (single-file prototype with embedded CSS + vanilla JS carousel, bilingual PT/EN, responsive design) to an **Astro 5** project with server-side rendering enabled. Astro renders the entire page server-side with zero JS by default; only the **interactive islands** (hero carousel, language toggle, FAQ accordion, tweaks panel, service-card hover) ship JS, and each uses the `client:*` directive that fits its needs (`client:load`, `client:idle`, `client:visible`).

## User Story
As a visitor in the Algarve searching for commercial kitchen cleaning,
I want the Unilimpeza landing page to load near-instantly with real content visible on first paint,
So that I can trust the brand and contact them without waiting for a framework to hydrate.

## Problem → Solution
Single static HTML file with all content injected by client-side JS (SERVICES, PROCESS, CLIENTS, FAQ arrays rendered via `document.createElement` after load) → **Astro** project where those arrays render inside `.astro` server components (zero JS shipped), and only the hero carousel / lang toggle / FAQ accordion / tweaks panel hydrate as client islands. Crawlers and slow clients get full HTML immediately.

## Metadata
- **Complexity**: Medium
- **Source PRD**: N/A (free-form request, user pivoted from Next.js to Astro)
- **PRD Phase**: N/A
- **Estimated Files**: ~20 files created, 0 existing files updated (fresh Astro scaffold)

### Why Astro instead of Next.js
| Concern | Next.js | Astro | Winner |
|---|---|---|---|
| JS shipped for static content | Full React runtime (~90KB) | Zero KB for `.astro` components | **Astro** |
| Server-side rendering | App Router RSC | Native SSR + static hybrid | Tie |
| Interactive islands | Client components hydrate parent tree | `client:*` directives hydrate just the island | **Astro** |
| Content-driven landing page | Good, but framework overhead | Designed for this exact use case | **Astro** |
| Bilingual content | Client context OR route-based | Same options, cleaner in `.astro` scoped | **Astro** |
| CSS pixel-port | Works | Works, scoped styles per component | Tie |

For a content-heavy marketing landing page with ~5 interactive islands, Astro is the canonical choice.

---

## UX Design

### Before
```
┌───────────────────────────────────────────────────┐
│ index.html loads                                  │
│ → Blank shell + grain overlay                     │
│ → Fonts download                                  │
│ → JS parses, loops arrays, injects:               │
│   - service cards                                 │
│   - process steps                                 │
│   - client marquee                                 │
│   - FAQ list                                      │
│   - marquee ticker                                 │
│ → Carousel dots/tint wired up                     │
│ Crawler sees empty <div id="servicesGrid"></div>  │
└───────────────────────────────────────────────────┘
```

### After
```
┌───────────────────────────────────────────────────┐
│ GET / → Astro server renders full HTML with:      │
│   - All 5 hero slides (DOM + Unsplash photos)     │
│   - Services cards, process steps, FAQ            │
│   - Client + top marquees                         │
│ Crawler + first paint = full content              │
│ → Selective hydration (per island):               │
│   HeroCarousel       client:load     (~4KB)       │
│   LangToggle+Context client:load     (~2KB)       │
│   FaqAccordion       client:visible  (~1KB)       │
│   ServiceCard hover  client:idle     (~0.5KB)     │
│   TweaksPanel        client:only gated by ?tweaks │
│ Rest of the page ships ZERO JS                     │
└───────────────────────────────────────────────────┘
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| First paint | Empty grid containers | Full pre-rendered HTML | Better SEO + perceived perf |
| JS weight | ~5KB vanilla embedded | ~7-10KB split across islands | Tiny; shipped per-island, lazy |
| Lang toggle | `innerHTML` mutation on `[data-pt]` | Small Preact/Solid island swaps strings via signal/store | Framework-agnostic |
| Hero carousel | Inline JS state machine | Client island with identical state machine | Same visuals |
| FAQ | `classList.toggle` | Island only hydrates when scrolled into view | `client:visible` saves work |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `index.html` | 1-577 | All CSS — port verbatim to `src/styles/global.css` |
| P0 | `index.html` | 583-833 | HTML structure — template for `.astro` components |
| P0 | `index.html` | 849-1111 | JS logic — carousel, lang, FAQ, tweaks, reveal, service hover |
| P0 | `index.html` | 858-891 | Data arrays (SERVICES, PROCESS, CLIENTS, FAQ) — port to typed data module |
| P0 | `index.html` | 596-720 | Hero slide markup — 5 distinct scenes with unique typography/tint |
| P0 | `index.html` | 956-1044 | Carousel state machine — timer, pause-on-hover, visibility pause, chrome tints |
| P1 | `design/unilimpeza-project/README.md` | all | Design brief — "recreate pixel-perfectly; match visual output; don't copy internal structure" |
| P1 | `design/unilimpeza-project/chats/chat1.md` | all | User intent history — responsive, 5-scene hero, elegant not brutalist, auto-advance bug fix lesson |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| Astro 5 basics | https://docs.astro.build/en/getting-started/ | `.astro` files are server-only templates; Markdown-like frontmatter + JSX-like template |
| Astro islands | https://docs.astro.build/en/concepts/islands/ | `client:load` (hydrate immediately), `client:idle`, `client:visible`, `client:only` — pick smallest that works |
| SSR adapter | https://docs.astro.build/en/guides/on-demand-rendering/ | Use `@astrojs/node` for self-host or `@astrojs/vercel` for Vercel; `output: 'server'` enables SSR |
| Preact integration | https://docs.astro.build/en/guides/integrations-guide/preact/ | `@astrojs/preact` adds Preact for tiny islands (~3KB vs React 44KB) |
| next-style image | https://docs.astro.build/en/guides/images/ | `<Image src=… />` from `astro:assets` supports remote with `image.remotePatterns` |
| Fonts | https://docs.astro.build/en/guides/fonts/ | Astro 5.7+ has built-in `astro:fonts` — or use `<link>` in `<head>` (simpler, matches current setup) |
| i18n | https://docs.astro.build/en/guides/internationalization/ | Built-in `i18n` routing. **Skip for now** — match current client-toggle UX |

**KEY_INSIGHT**: For the lightest possible JS footprint, use **Preact** via `@astrojs/preact` for the interactive islands (3KB runtime vs 44KB for React). The hero carousel and FAQ accordion are small enough that Preact is plenty.
**APPLIES_TO**: All client islands
**GOTCHA**: If you later need heavy React-only libs, swap the integration; island API is identical.

**KEY_INSIGHT**: Astro supports static (`output: 'static'`) and server (`output: 'server'`) modes. For SSR (user's explicit ask), use `output: 'server'` with `@astrojs/node` (or Vercel) adapter. For this page — which has no dynamic data per-request — `output: 'static'` would be equivalent and faster. **Use `output: 'server'` per the user's ask, but `prerender = true` on the route** so the page is still built to static HTML at build time. Best of both.
**APPLIES_TO**: `astro.config.mjs`, `src/pages/index.astro`
**GOTCHA**: Without `prerender`, every request re-renders server-side. With `prerender`, build output is static HTML (same as `output: 'static'` but the rest of the infrastructure supports future dynamic routes).

**GOTCHA**: `window.parent.postMessage` and `EDITMODE-BEGIN/END` markers in `index.html:850-856, 1089, 1097-1102` are Claude Design iframe hooks — strip entirely for production.

**GOTCHA**: CSS uses `clamp()`, `color-mix(in oklab, …)`, `@media (max-height:…)` — all supported modern CSS; Astro passes them through untouched.

**GOTCHA**: Astro's default scoped styles add hashed class names. For pixel-perfect port, put all the source CSS in **one global stylesheet** imported once in the root layout (`src/layouts/Base.astro`). This keeps selectors untouched.

---

## Patterns to Mirror

Target project is empty, so "patterns" come from **Astro 5 conventions** and **the source HTML itself**.

### NAMING_CONVENTION
// SOURCE: Astro docs conventions
// - Pages: `src/pages/index.astro`, `src/pages/about.astro`
// - Layouts: `src/layouts/Base.astro` (PascalCase)
// - Components: `src/components/HeroCarousel.astro`, `src/components/HeroCarousel.tsx` (island)
// - Data/utils: `src/lib/content.ts`, `src/lib/types.ts`
// - Styles: `src/styles/global.css`

### ASTRO_COMPONENT_PATTERN
// SOURCE: Astro docs — `.astro` is server-only
---
// src/components/Services.astro
import { SERVICES } from '../lib/content';
import ServiceCard from './ServiceCard.tsx';
---
<section id="services">
  <div class="wrap">
    <div class="sec-head reveal">
      <div class="sec-num">01 / 03</div>
      <div>
        <div class="sec-kicker">O que fazemos</div>
        <h2 class="sec-title">Serviços <em>afinados</em>…</h2>
      </div>
    </div>
    <div class="services-grid">
      {SERVICES.map((s, i) => <ServiceCard client:idle i={i} data={s} />)}
    </div>
  </div>
</section>

### CLIENT_ISLAND_PATTERN (Preact)
// SOURCE: Astro + Preact — tiny hydration boundary
// src/components/FaqAccordion.tsx
/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import type { FaqItem } from '../lib/types';
export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div class="faq-list">
      {items.map((f, i) => (
        <div class={`faq-item ${open === i ? 'open' : ''}`} key={i}>
          <div class="faq-q" onClick={() => setOpen(open === i ? null : i)}>
            <span>{f.pt[0]}</span><span class="faq-toggle">+</span>
          </div>
          <div class="faq-a">{f.pt[1]}</div>
        </div>
      ))}
    </div>
  );
}

### DATA_STRUCTURE
// SOURCE: `index.html:858-891` (port verbatim, add types)
// src/lib/content.ts
export type Bilingual = { pt: readonly [string, string]; en: readonly [string, string] };
export const SERVICES: ReadonlyArray<Bilingual & { tags: readonly string[] }> = [
  { pt: ['Limpeza profunda', 'Desengorduramento completo…'], en: ['Deep cleaning', 'Full degreasing…'], tags: ['Desengordurante', 'Fornos', 'Fritadeiras', 'Pavimentos'] },
  // …4 more
];
export const HERO_SLIDES: ReadonlyArray<{ id: number; variant: string; photo: string; /*…*/ }> = [/* 5 slides */];

### LAYOUT_PATTERN
// SOURCE: Astro docs
---
// src/layouts/Base.astro
import '../styles/global.css';
interface Props { title?: string; }
const { title = 'Unilimpeza — Eficiência em movimento' } = Astro.props;
---
<!doctype html>
<html lang="pt" data-theme="light">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>{title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400;1,9..144,500&family=Inter+Tight:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,700;1,6..96,400;1,6..96,700&family=Archivo+Black&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Instrument+Serif:ital@0;1&display=swap" />
  </head>
  <body>
    <div class="grain" aria-hidden></div>
    <slot />
  </body>
</html>

### SSR_CONFIG_PATTERN
// SOURCE: Astro docs
// astro.config.mjs
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import node from '@astrojs/node';
export default defineConfig({
  output: 'server',            // SSR enabled
  adapter: node({ mode: 'standalone' }),
  integrations: [preact()],
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
  },
});

### PRERENDER_PATTERN
// SOURCE: Astro docs
---
// src/pages/index.astro
export const prerender = true;   // static HTML at build time; SSR infrastructure still available for future dynamic routes
import Base from '../layouts/Base.astro';
import Nav from '../components/Nav.tsx';
// …
---
<Base>
  <Nav client:load />
  <HeroCarousel client:load slides={HERO_SLIDES} />
  <Marquee items={MARQUEE_ITEMS} />
  <Services />
  <Process />
  <ClientsMarquee clients={CLIENTS} />
  <Contact client:visible />
  <FaqAccordion client:visible items={FAQ} />
  <Footer />
</Base>

### LANG_ISLAND_PATTERN (shared signal across islands)
// SOURCE: Preact Signals
// src/lib/lang-signal.ts
import { signal } from '@preact/signals';
export const lang = signal<'pt' | 'en'>('pt');
// Any island reads `lang.value`, reactively re-renders on change
// Nav toggle does `lang.value = 'en'` → all subscribed islands update
// Server-rendered `.astro` components render PT by default (matches `<html lang="pt">`)

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `package.json` | CREATE | Astro 5, Preact, Node adapter, TS |
| `astro.config.mjs` | CREATE | SSR output, Node adapter, Preact, Unsplash remote images |
| `tsconfig.json` | CREATE | Extends `astro/tsconfigs/strict`, path alias `@/*` |
| `.gitignore` | CREATE | `node_modules/`, `dist/`, `.astro/`, `.env*.local` |
| `src/styles/global.css` | CREATE | Port every CSS rule from `index.html:10-577` verbatim |
| `src/layouts/Base.astro` | CREATE | `<html>` shell, fonts link, grain overlay, `<slot />` |
| `src/pages/index.astro` | CREATE | Compose all sections in order; `export const prerender = true` |
| `src/lib/types.ts` | CREATE | `Slide`, `Lang`, `Bilingual`, `FaqItem`, `ProcessStep`, `Service` |
| `src/lib/content.ts` | CREATE | Typed SERVICES, PROCESS, CLIENTS, FAQ, MARQUEE_ITEMS, HERO_SLIDES |
| `src/lib/lang-signal.ts` | CREATE | Shared Preact signal for bilingual state |
| `src/lib/bilingual.ts` | CREATE | `t(pt, en, lang)` helper for static rendering |
| `src/components/Nav.tsx` | CREATE | Preact island — scroll listener + lang toggle; uses `lang` signal |
| `src/components/HeroCarousel.tsx` | CREATE | Preact island — state machine ported from `index.html:956-1044` |
| `src/components/HeroSlide.tsx` | CREATE | Renders single slide; consumed by HeroCarousel |
| `src/components/Marquee.astro` | CREATE | Server — top marquee ticker |
| `src/components/Services.astro` | CREATE | Server — maps SERVICES to ServiceCard islands |
| `src/components/ServiceCard.tsx` | CREATE | Preact island — mouse spotlight; `client:idle` |
| `src/components/Process.astro` | CREATE | Server — 4 steps + connector |
| `src/components/ClientsMarquee.astro` | CREATE | Server — duplicated client list |
| `src/components/Contact.tsx` | CREATE | Preact island — form submit swaps button text |
| `src/components/FaqAccordion.tsx` | CREATE | Preact island — open/close; `client:visible` |
| `src/components/Footer.astro` | CREATE | Server — static footer with animated gradient text |
| `src/components/Reveal.astro` | CREATE | Server wraps children; includes a tiny `<script>` with IntersectionObserver (no framework needed) |
| `src/components/TweaksPanel.tsx` | CREATE | Preact island — `client:only="preact"`; gated by `?tweaks=1` |
| `README.md` | CREATE | Run instructions: `pnpm dev`, `pnpm build`, `pnpm preview` |

## NOT Building

- **Route-based i18n** (`/pt`, `/en`) — current UX is client toggle via shared signal; keep it
- **CMS / Content Collections** — data in `src/lib/content.ts` is fine
- **Form backend** — `onSubmit` keeps visual "Enviado" feedback only (no API route)
- **Analytics / error tracking / image optimizer for Unsplash** — out of scope
- **Tailwind / CSS Modules** — keep single `global.css` to match design pixel-for-pixel
- **Unit tests** — design port; visual parity validated in browser (see Validation)
- **`<Image />` from `astro:assets` for Unsplash photos** — use raw `<img>` with `loading="eager"` on slide 01, `loading="lazy"` on others. Astro's optimizer for remote images is nice-to-have but adds build time; revisit later.
- **Dark/light persistence** — TweaksPanel state in-memory only (matches current behavior)
- **`EDITMODE-BEGIN/END` markers and `window.parent.postMessage`** — strip entirely
- **Migration of `.claude/`, `design/`, `design.tar.gz`** — these stay as-is at repo root
- **Service Worker / PWA** — out of scope

---

## Step-by-Step Tasks

### Task 1: Scaffold Astro project preserving existing files
- **ACTION**: Initialize Astro 5 with TypeScript in the repo root WITHOUT clobbering `index.html`, `design/`, `design.tar.gz`, `.claude/`
- **IMPLEMENT**: Scaffold in a temp dir and copy over:
  ```bash
  cd /tmp && pnpm create astro@latest unilimpeza-astro -- --template minimal --typescript strict --no-install --no-git
  cp -r /tmp/unilimpeza-astro/{src,public,astro.config.mjs,tsconfig.json,package.json} /Users/reynaldo-mac/Unilimpeza-Project/
  cd /Users/reynaldo-mac/Unilimpeza-Project && pnpm install
  ```
- **MIRROR**: Astro docs scaffolding
- **IMPORTS**: N/A
- **GOTCHA**: Do NOT scaffold directly into the repo root — `create astro` will complain about non-empty dir. Copy manually.
- **VALIDATE**: `pnpm dev` starts on :4321 with Astro default page

### Task 2: Install adapter + integrations
- **ACTION**: Add SSR adapter (Node), Preact, and Preact Signals
- **IMPLEMENT**:
  ```bash
  pnpm add @astrojs/node @astrojs/preact preact @preact/signals
  pnpm astro add preact node   # wires astro.config.mjs
  ```
- **MIRROR**: SSR_CONFIG_PATTERN
- **GOTCHA**: `pnpm astro add` will rewrite `astro.config.mjs` — commit intermediate state before running if needed
- **VALIDATE**: `astro.config.mjs` has `output: 'server'`, `adapter: node({ mode: 'standalone' })`, `integrations: [preact()]`

### Task 3: Configure `astro.config.mjs` for Unsplash remote images
- **ACTION**: Allowlist `images.unsplash.com` and `plus.unsplash.com`
- **IMPLEMENT**: See SSR_CONFIG_PATTERN — add `image.remotePatterns`
- **GOTCHA**: Only needed if you later swap to `<Image />` from `astro:assets`. For now `<img>` works without config, but add allowlist anyway for future-proofing.
- **VALIDATE**: `pnpm build` succeeds without warnings

### Task 4: Port `src/styles/global.css` verbatim
- **ACTION**: Copy every CSS rule from `index.html:10-577` into `src/styles/global.css`
- **IMPLEMENT**: One-to-one copy. Leave font-family strings unchanged since fonts load via `<link>` in `<head>` (same as source).
- **MIRROR**: `index.html` styles
- **GOTCHA**:
  - `@media (max-height: 700px) and (min-width: 901px)` must be preserved exactly
  - Don't let the editor auto-format and re-order rules; the cascade depends on ordering
  - `:root` custom properties at top stay as-is
- **VALIDATE**: Visual parity with `index.html` when page is blank

### Task 5: Build `src/layouts/Base.astro`
- **ACTION**: Root layout with font `<link>`, grain overlay, global CSS import, `<slot />`
- **IMPLEMENT**: See LAYOUT_PATTERN
- **MIRROR**: `index.html:1-11, 581`
- **GOTCHA**:
  - `data-theme="light"` matches TWEAK_DEFAULTS from `index.html:850-856`
  - Import `../styles/global.css` inside the frontmatter; Astro hoists it to `<head>` automatically
  - `<div class="grain">` goes BEFORE `<slot />` so it's behind everything (CSS already handles z-index)
- **VALIDATE**: View source shows fonts preconnected + stylesheet link; grain overlay present

### Task 6: Create `src/lib/types.ts` and `src/lib/content.ts`
- **ACTION**: Port data arrays from `index.html:858-891` and hero slides from `index.html:596-720` into typed modules
- **IMPLEMENT**:
  ```ts
  // src/lib/types.ts
  export type Lang = 'pt' | 'en';
  export type Bilingual = { pt: readonly [string, string]; en: readonly [string, string] };
  export type Service = Bilingual & { tags: readonly string[] };
  export type ProcessStep = Bilingual;
  export type FaqItem = Bilingual;
  export type Slide = {
    id: number;
    variant: 'slide-01' | 'slide-02' | 'slide-03' | 'slide-04' | 'slide-05';
    photo: string;
    // copy structured to avoid raw HTML strings: see gotcha below
    eyebrow?: { pt: string; en: string };
    title: ReadonlyArray<{ pt: string; en: string; className?: string }>;
    foot?: { pt: string; en: string };
  };
  ```
- **MIRROR**: DATA_STRUCTURE
- **GOTCHA**:
  - Source hero slides have inline HTML tags inside `data-pt` attributes (`<strong>chama</strong>`). **Restructure** to JSX-friendly tuples of `{ text: string, strong?: boolean, italic?: boolean }` per line. In `HeroSlide.tsx`, render these parts as real JSX elements, not `dangerouslySetInnerHTML`.
  - Alternatively keep the HTML strings and use `dangerouslySetInnerHTML` — simpler but less typesafe. **Recommend the structured approach**.
- **VALIDATE**: `pnpm tsc --noEmit` — zero errors

### Task 7: Create `src/lib/lang-signal.ts` + `src/lib/bilingual.ts`
- **ACTION**: Shared Preact signal + a helper for rendering bilingual text in server components
- **IMPLEMENT**:
  ```ts
  // src/lib/lang-signal.ts
  import { signal, effect } from '@preact/signals';
  export const lang = signal<Lang>('pt');
  if (typeof document !== 'undefined') {
    effect(() => { document.documentElement.lang = lang.value; });
  }
  ```
  ```ts
  // src/lib/bilingual.ts (used in .astro server components — default PT)
  export const t = (pt: string, en: string, l: Lang = 'pt') => l === 'pt' ? pt : en;
  ```
- **MIRROR**: LANG_ISLAND_PATTERN
- **GOTCHA**:
  - Server-rendered `.astro` components render PT only (initial state) — they do NOT react to later lang changes.
  - For elements that must flip on lang toggle (e.g., nav links, service names), they must be INSIDE an island that subscribes to the signal — OR the island re-swaps text content in the DOM by query-selecting `[data-pt][data-en]` elements on change.
  - **Chosen approach**: keep the source's `data-pt`/`data-en` attributes on all bilingual server-rendered elements. The `Nav.tsx` island, on lang change, runs the SAME DOM swap as `index.html:1049-1059`. This preserves all the bilingual content without forcing every section into an island.
- **VALIDATE**: In browser console, `document.querySelectorAll('[data-pt]').length` > 50

### Task 8: Build `src/components/Nav.tsx` (island)
- **ACTION**: Preact island with scroll listener + lang toggle that does full-document `[data-pt]` swap
- **IMPLEMENT**:
  ```tsx
  /** @jsxImportSource preact */
  import { useEffect } from 'preact/hooks';
  import { lang } from '../lib/lang-signal';
  export default function Nav() {
    useEffect(() => {
      const onScroll = () => document.getElementById('nav')!.classList.toggle('scrolled', window.scrollY > 80);
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }, []);
    useEffect(() => {
      // Mirror index.html:1049-1059
      document.querySelectorAll<HTMLElement>('[data-pt]').forEach((el) => {
        const val = el.getAttribute('data-' + lang.value);
        if (val !== null) el.innerHTML = val;
      });
    }, [lang.value]);
    return (
      <nav class="nav" id="nav">
        <div class="brand"><span class="brand-dot"></span>Unilimpeza · Algarve</div>
        <div class="nav-links">
          <a href="#services" data-pt="Serviços" data-en="Services">Serviços</a>
          <a href="#process" data-pt="Processo" data-en="Process">Processo</a>
          <a href="#contact" data-pt="Contacto" data-en="Contact">Contacto</a>
        </div>
        <div class="lang-toggle">
          <button class={lang.value === 'pt' ? 'active' : ''} onClick={() => lang.value = 'pt'}><span>PT</span></button>
          <button class={lang.value === 'en' ? 'active' : ''} onClick={() => lang.value = 'en'}><span>EN</span></button>
        </div>
      </nav>
    );
  }
  ```
- **MIRROR**: `index.html:583-594, 1046, 1049-1059`
- **IMPORTS**: Preact hooks, signal
- **GOTCHA**:
  - Use `client:load` on `<Nav />` in `index.astro` so it's hydrated immediately (nav is above the fold and the toggle must work instantly).
  - Smooth scroll behavior from `index.html:1104-1110` lives in a separate tiny inline `<script>` in `Base.astro` — no need to hydrate a component for it.
- **VALIDATE**: Scroll >80px adds `.scrolled`; clicking EN swaps all bilingual text

### Task 9: Build `src/components/HeroCarousel.tsx` + `HeroSlide.tsx` (island)
- **ACTION**: Preact island owning the 5-slide carousel state machine
- **IMPLEMENT**: Port `index.html:956-1044` directly to Preact hooks:
  - `const [cur, setCur] = useState(0)`
  - `const [paused, setPaused] = useState(false)`
  - `useEffect(() => { if (paused) return; const id = setTimeout(() => setCur(c => (c + 1) % 5), 5000); return () => clearTimeout(id); }, [cur, paused])`
  - `useEffect(() => { const onVis = () => setPaused(document.hidden); document.addEventListener('visibilitychange', onVis); return () => document.removeEventListener('visibilitychange', onVis); }, [])`
  - Render stack: each slide has class `hero-slide slide-0X` + `active` on current + `leaving` on previous (use a second state `prev` or a ref-tracked value to derive)
  - Chrome tints: map `chromeTints[cur]` to inline styles on dots/arrows/counter
- **MIRROR**: `index.html:956-1044`, `chromeTints` from `index.html:970-976`
- **IMPORTS**: `useState`, `useEffect`, `useRef` from `preact/hooks`; `HERO_SLIDES` from `../lib/content`; `lang` from `../lib/lang-signal`
- **GOTCHA**:
  - `.hero-photo` Ken Burns animation re-runs on `.active` because CSS keyframes restart when class is added. Don't fight it — just toggle the class.
  - `dfill` progress bar animation: same — CSS re-runs on `.active` class toggle.
  - Use `onPointerEnter`/`onPointerLeave` on the `<section class="hero">` — NOT `mouseenter`/`mouseleave`. The original fix in chat1.md explains why.
  - Slide copy may contain structured parts (strong/italic); render via JSX, not innerHTML.
  - `client:load` directive is required (carousel must hydrate immediately; it's above the fold).
- **VALIDATE**:
  - Auto-advances every 5s
  - Hover pauses; unhover resumes
  - Tab switch pauses; return resumes
  - Arrows and dots navigate manually; timer resets
  - Chrome tint swaps per slide
  - No hydration mismatch (initial render = slide 01 active, matches SSR)

### Task 10: Build `src/components/Marquee.astro` and `ClientsMarquee.astro`
- **ACTION**: Pure server components — no JS
- **IMPLEMENT**:
  ```astro
  ---
  // Marquee.astro
  const items = ["Algarve / PT", "Eficiência em movimento", "Cert. HACCP", /* … */];
  const tripled = [...items, ...items, ...items];
  ---
  <div class="marquee">
    <div class="marquee-track">
      {tripled.map((t, i) => (
        <span class={i % 3 === 0 ? 'dot' : ''} set:html={(i % 3 === 0 ? '✦ ' : '') + t} />
      ))}
    </div>
  </div>
  ```
- **MIRROR**: `index.html:722-724, 756-758, 924-939`
- **GOTCHA**: Animation runs in CSS (`animation: marquee calc(40s / var(--speed)) linear infinite`); no JS needed
- **VALIDATE**: Both marquees scroll smoothly left-to-right

### Task 11: Build `src/components/Services.astro` + `ServiceCard.tsx`
- **ACTION**: Server wrapper renders 5 cards; each card is a Preact island for mouse spotlight
- **IMPLEMENT**:
  - `Services.astro` (server): maps `SERVICES` → `<ServiceCard client:idle i={i} data={s} />`
  - `ServiceCard.tsx` (island): `onMouseMove` computes `clientX - rect.left` and sets `--mx`/`--my` via `e.currentTarget.style.setProperty`
- **MIRROR**: `index.html:895-910`, CSS `.service::before`
- **GOTCHA**:
  - Grid span classes `.s-1 … .s-5` (spans 7/5/4/4/4) must match exactly
  - `client:idle` — spotlight isn't critical; hydrate when browser is idle
  - Include `data-pt`/`data-en` attributes on name/desc for the Nav swap mechanism
- **VALIDATE**: Hovering a card → radial gradient follows cursor

### Task 12: Build `src/components/Process.astro`, `Footer.astro`, `ClientsMarquee.astro`
- **ACTION**: Pure server components
- **IMPLEMENT**: Direct port of HTML structure
- **MIRROR**: `index.html:741-758, 806-833, 912-930`
- **GOTCHA**: Include `data-pt`/`data-en` on all bilingual strings so Nav's swap mechanism reaches them
- **VALIDATE**: All three sections render with correct layout

### Task 13: Build `src/components/Contact.tsx` + `FaqAccordion.tsx` (islands)
- **ACTION**: Two islands for the contact section
- **IMPLEMENT**:
  - `Contact.tsx`: `useState<'idle' | 'sent'>('idle')`; `onSubmit` → `setSent('sent')`; button label swaps based on state
  - `FaqAccordion.tsx`: see CLIENT_ISLAND_PATTERN; include `data-pt`/`data-en` attrs on question and answer spans
- **MIRROR**: `index.html:773-804, 942-954`
- **GOTCHA**:
  - Use `client:visible` — these islands don't need to hydrate until scrolled to
  - FAQ max-height transition relies on `.faq-item.open .faq-a { max-height: 320px }` — don't measure content, just toggle class
  - Multiple FAQ items can be open simultaneously (matches source behavior)
- **VALIDATE**: FAQ expand/collapse smoothly; contact form swaps to "Enviado" on submit

### Task 14: Build `src/components/Reveal.astro`
- **ACTION**: Server component that wraps children with a `.reveal` class AND injects a tiny inline IntersectionObserver script
- **IMPLEMENT**:
  ```astro
  ---
  // Reveal.astro — usage: <Reveal>…</Reveal>
  ---
  <div class="reveal"><slot /></div>
  <script>
    // Run once per page; idempotent
    if (!window.__revealBound) {
      window.__revealBound = true;
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
      }, { threshold: 0.12 });
      document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    }
  </script>
  ```
- **MIRROR**: `index.html:1062-1063`
- **GOTCHA**:
  - Astro hoists `<script>` tags and bundles them. The IntersectionObserver script fires once on page load.
  - Alternative: add the same script to `Base.astro` once, and just apply `class="reveal"` in markup. Simpler. **Prefer this** — skip the `<Reveal>` wrapper.
- **VALIDATE**: Sections fade-up as they enter viewport

### Task 15: Build `src/components/TweaksPanel.tsx` (optional, gated)
- **ACTION**: Preact island — hidden by default, activate via `?tweaks=1` URL param
- **IMPLEMENT**:
  ```tsx
  /** @jsxImportSource preact */
  import { useEffect, useState } from 'preact/hooks';
  export default function TweaksPanel() {
    const [show, setShow] = useState(false);
    useEffect(() => { setShow(new URLSearchParams(location.search).has('tweaks')); }, []);
    const [theme, setTheme] = useState<'dark' | 'light'>('light');
    // …other state matching TWEAK_DEFAULTS
    useEffect(() => {
      document.documentElement.setAttribute('data-theme', theme);
      // …setProperty for accent, grain, speed, display
    }, [theme /*, …*/]);
    if (!show) return null;
    return (/* panel markup from index.html:835-847 */);
  }
  ```
- **MIRROR**: `index.html:835-847, 1065-1095`
- **GOTCHA**:
  - **Strip all `window.parent.postMessage` calls and `EDITMODE-BEGIN/END` markers** — irrelevant in production
  - `client:only="preact"` — no SSR (the component reads `location.search` which is client-only)
- **VALIDATE**: `http://localhost:4321/?tweaks=1` shows panel; changes apply live; `http://localhost:4321/` shows no panel

### Task 16: Add smooth-scroll inline script in `Base.astro`
- **ACTION**: Port `index.html:1104-1110` so `<a href="#id">` links scroll smoothly
- **IMPLEMENT**:
  ```astro
  <script>
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        const t = id && document.querySelector(id);
        if (t) { e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' }); }
      });
    });
  </script>
  ```
- **MIRROR**: `index.html:1104-1110`
- **GOTCHA**: Alternative: use CSS `scroll-behavior: smooth` on `html`. But original JS handles it explicitly to avoid double-triggering with carousel. Keep explicit JS.
- **VALIDATE**: Clicking "Serviços" nav link smoothly scrolls to `#services`

### Task 17: Compose `src/pages/index.astro`
- **ACTION**: Final page — pull all components together
- **IMPLEMENT**: See PRERENDER_PATTERN. Order:
  1. `<Nav client:load />`
  2. `<section class="hero" id="top"><HeroCarousel client:load slides={HERO_SLIDES} /></section>` (or HeroCarousel owns the section)
  3. `<Marquee />`
  4. `<Services />`
  5. `<Process />`
  6. `<ClientsMarquee />`
  7. `<section id="contact">` with `<Contact client:visible />` + `<FaqAccordion client:visible items={FAQ} />`
  8. `<Footer />`
  9. `<TweaksPanel client:only="preact" />`
- **MIRROR**: `index.html:583-833`
- **GOTCHA**: Set `export const prerender = true;` at top so this page is built as static HTML
- **VALIDATE**: `pnpm build` emits `dist/server/pages/index.html` (prerendered); `curl` shows full HTML

### Task 18: README + cleanup
- **ACTION**: Write `README.md`; update `.gitignore`
- **IMPLEMENT**:
  ```md
  # Unilimpeza
  Landing page for Unilimpeza (commercial kitchen cleaning, Algarve).

  ## Dev
  pnpm install
  pnpm dev    # http://localhost:4321

  ## Build
  pnpm build
  pnpm preview
  # Production: `node dist/server/entry.mjs`
  ```
  `.gitignore`: `node_modules/`, `dist/`, `.astro/`, `.env*.local`
- **VALIDATE**: `git status` does not show `dist/` or `node_modules/`

---

## Testing Strategy

### Unit Tests
No unit tests in scope (design port, not logic-heavy). Visual parity is the bar.

### Edge Cases Checklist
- [ ] First paint renders all sections with content (view-source, disable JS)
- [ ] PT → EN toggle swaps every bilingual string (scan for untranslated leftovers)
- [ ] Carousel: auto-advance works on first load (regression from chat1.md bug)
- [ ] Carousel: hover pauses; unhover resumes
- [ ] Carousel: switching tabs pauses; switching back resumes
- [ ] Carousel: manual nav via arrows and dots both reschedule the timer
- [ ] FAQ: multiple items can be open simultaneously (matches source)
- [ ] Form: submit shows "Enviado"
- [ ] Reveal: sections animate once and don't re-hide on scroll up
- [ ] Responsive: 375px (iPhone SE), 768px (tablet), 1440px (laptop), 2560px (4K)
- [ ] Height < 700px: hero still usable
- [ ] Light theme (default) and dark theme swap cleanly
- [ ] No hydration errors in browser console
- [ ] No 404s in Network tab

---

## Validation Commands

### Static Analysis
```bash
pnpm astro check
```
EXPECT: Zero type errors and zero diagnostics

### Production Build
```bash
pnpm build
```
EXPECT: Build succeeds; `dist/server/entry.mjs` exists; `dist/client/` has assets; index page is prerendered

### Preview
```bash
pnpm preview
```
EXPECT: `http://localhost:4321` renders identically to `index.html`

### View-Source SSR Check
```bash
curl -s http://localhost:4321/ | grep -c "Limpeza profunda"
```
EXPECT: >= 1 (proves SSR — service cards pre-rendered)

### Disable-JS SSR Check
- DevTools → Network → disable JS → reload
EXPECT: Page still shows all 5 hero slides (stacked — no carousel), all services, all FAQs, footer. Content survives without JS.

### Manual Validation Checklist
- [ ] Open `http://localhost:4321` — visually compare to `index.html` open in another tab; pixel parity at 1440×900
- [ ] Toggle PT/EN — all content swaps across all sections
- [ ] Let carousel auto-advance through all 5 slides
- [ ] Hover over hero — pauses; move away — resumes
- [ ] Click a service card and watch spotlight follow cursor
- [ ] Open a FAQ item — expands smoothly
- [ ] Submit contact form — button shows "✓ Enviado"
- [ ] Resize browser to 375px — mobile layout matches `@media (max-width: 900px)` rules
- [ ] Disable JavaScript → reload — page still renders all content (proves SSR)
- [ ] Lighthouse: Performance >95, SEO 100, Accessibility >90
- [ ] Check total JS shipped (DevTools → Coverage): should be <15KB for all islands combined

---

## Acceptance Criteria
- [ ] All 18 tasks completed
- [ ] `pnpm build` succeeds with prerendered index page
- [ ] `pnpm preview` serves the site without errors
- [ ] View-source on `/` shows pre-rendered SERVICES, PROCESS, CLIENTS, FAQ content
- [ ] Visual parity with `index.html` at 1440×900, 768×1024, 375×667 viewports
- [ ] PT/EN toggle works on every bilingual element (across sections, not just nav)
- [ ] Hero carousel auto-advances, pauses on hover/tab-hidden, resumes correctly
- [ ] No hydration mismatches in console
- [ ] Zero `astro check` errors

## Completion Checklist
- [ ] Code follows Astro 5 conventions (`.astro` for server, `.tsx` for islands)
- [ ] All islands marked with smallest-possible `client:*` directive
- [ ] Data lives in typed `src/lib/content.ts`
- [ ] CSS ported verbatim to `src/styles/global.css`
- [ ] No `window.parent.postMessage` or EDITMODE markers remain
- [ ] Hero images use `<img loading="eager" />` for slide 01, `lazy` otherwise
- [ ] Unsplash `image.remotePatterns` configured in `astro.config.mjs`
- [ ] README documents dev/build commands
- [ ] `.gitignore` excludes `dist/`, `node_modules/`, `.astro/`

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Nav lang swap touches bilingual elements INSIDE Preact islands and clobbers their state | Medium | High | Inside islands, render bilingual via `lang` signal, NOT via `data-pt`/`data-en` attributes. Only `.astro` server-rendered elements use the attribute + DOM swap mechanism. |
| Hydration mismatch on `<html lang>` attribute | Low | Medium | Set lang inside `useEffect`, never during render; initial state = `'pt'` matches SSR |
| Bilingual strings with embedded HTML (`<strong>`, `<em>`) don't round-trip through the DOM swap cleanly | Medium | Medium | Keep source's `innerHTML` swap (matches original behavior exactly); for islands, use structured JSX tuples |
| Kenn Burns / dot-fill CSS animations don't restart on class toggle | Low | Low | Use `key={cur}` on affected elements if needed |
| Existing `index.html` at root conflicts with Astro route | Medium | Low | Astro serves `src/pages/index.astro` for `/`; `index.html` at root is not served. Move to `/reference/index.html` for clarity or delete after parity confirmed. |
| Unsplash hotlink rate limits / outage | Low | Medium | Download hero photos to `public/hero/` and reference locally — revisit as follow-up |
| `@preact/signals` bundle size creep | Low | Low | Signals are ~1KB; acceptable |
| Scope creep (route-based i18n, CMS, form backend, image optimizer) | Medium | High | Enforce "NOT Building" list |

## Notes
- The source design is already excellent and responsive — the port is mostly **moving code into the right Astro primitives** (server `.astro` vs client islands) and **typing the data**, not redesigning.
- Keep the `index.html` at repo root during migration for side-by-side visual QA. Remove only after parity is confirmed.
- All content (PT/EN) is Portuguese-first, matching the brand's Algarve market.
- Expected JS footprint after port: **~10-15KB total** across all islands (Preact runtime 3KB + Signals 1KB + custom code). Compare to ~5KB of inline vanilla JS in `index.html` — Astro adds ~5-10KB for the framework but gains real SSR, typed data, component isolation, and selective hydration.
- If the user later wants SEO-optimal per-locale URLs (`/pt`, `/en`), Astro's built-in i18n makes this a clean follow-up: add `src/pages/pt/index.astro` and `src/pages/en/index.astro`, move language to route param. Out of scope for this plan.
