# Unilimpeza

Landing page for **Unilimpeza**, a commercial kitchen cleaning company in the Algarve, Portugal.
Built with **Astro 5** (SSR enabled via `@astrojs/node`) + **Preact** islands for interactivity.

## Stack

- **Astro 5** — server-rendered templates; zero JS by default
- **Preact** (via `@astrojs/preact`) — lightweight framework for interactive islands
- **@preact/signals** — shared bilingual state across islands
- **TypeScript** (strict)
- **Node adapter** — standalone server output

## Interactive islands

| Island | Hydration | Why |
|---|---|---|
| `Nav` | `client:load` | Above fold; lang toggle must be instant |
| `HeroCarousel` + `HeroSlide` | `client:load` | Auto-advancing 5-scene carousel |
| `ServiceCard` | `client:idle` | Mouse spotlight; non-critical |
| `Contact` | `client:visible` | Only hydrate when scrolled to |
| `FaqAccordion` | `client:visible` | Only hydrate when scrolled to |
| `TweaksPanel` | `client:only="preact"` | Gated by `?tweaks=1` query param |

Everything else (`Marquee`, `ClientsMarquee`, `Services` wrapper, `Process`, `Footer`, all section copy) is a server-rendered `.astro` component that ships **zero JS**.

## Dev

```bash
pnpm install
pnpm dev        # http://localhost:4321
```

## Build

```bash
pnpm build      # → dist/
pnpm preview    # preview production build
```

## Production

The build emits a standalone Node server:

```bash
node ./dist/server/entry.mjs
```

The `/` route is `prerender = true`, so the HTML is built at build time and served as static content — crawlers and first paint see the fully rendered page. CSS is fully inlined into the HTML (no render-blocking `<link rel="stylesheet">`), and the LCP hero image is preloaded with the correct `type="image/avif"` + `media` hint so the browser only fetches the responsive variant it can use.

### Cache-Control in production

The middleware at `src/middleware.ts` sets `public, max-age=31536000, immutable` on every `/_astro/*` fingerprinted asset — these are the heaviest downloads on repeat visits, so this is the biggest cache win.

Static files in `/public/` (hero images, sitemap, robots.txt, manifest, favicons) bypass Astro middleware in `standalone` mode. Serve them behind a reverse proxy or CDN with long `Cache-Control` for maximum Lighthouse scores on repeat visits. Example nginx snippet:

```nginx
location ~ ^/(hero|_astro)/ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
location ~ \.(webmanifest|xml|svg|png|jpg|avif|webp|woff2)$ {
  expires 30d;
}
```

Or on Vercel/Netlify/Cloudflare Pages, use their `headers` config file. On Fly.io/Render/Railway, use a sidecar Caddy/nginx container.

## Deploy

The default build uses `@astrojs/node` (standalone). Pick the host that fits:

### Fly.io / Render / Railway (Node SSR, recommended)

The standalone server at `dist/server/entry.mjs` is a plain Node HTTP server — set your platform start command to:

```bash
node ./dist/server/entry.mjs
```

and expose port `4321` (or set `HOST=0.0.0.0 PORT=$PORT` in env). No adapter swap needed.

### Vercel

Swap the adapter:

```bash
pnpm remove @astrojs/node
pnpm add @astrojs/vercel
```

Update `astro.config.mjs`:

```ts
import vercel from '@astrojs/vercel/serverless';
adapter: vercel()
```

Then import the GitHub repo at <https://vercel.com/new> — it auto-detects Astro.

### Netlify

```bash
pnpm remove @astrojs/node
pnpm add @astrojs/netlify
```

```ts
import netlify from '@astrojs/netlify';
adapter: netlify()
```

Link via <https://app.netlify.com/start> or `netlify deploy`.

### Cloudflare Pages

```bash
pnpm remove @astrojs/node
pnpm add @astrojs/cloudflare
```

```ts
import cloudflare from '@astrojs/cloudflare';
adapter: cloudflare()
```

### Static (GitHub Pages, any CDN)

`/` is already prerendered. If you can do without `/api/contact`, swap to static output:

```ts
// astro.config.mjs
output: 'static',      // remove output: 'server' and adapter
```

Then `pnpm build` writes a fully static `dist/` that any static host serves.

## CI

`.github/workflows/ci.yml` runs `astro check` + `pnpm build` on every push and PR to `main`, uploads the `dist/` artifact for 7 days, and exits red on any type or build error.

## Bilingual (PT/EN)

Portuguese is default (`<html lang="pt">`). Server-rendered `.astro` components include `data-pt` / `data-en` attributes on every translatable element. When the user toggles language via the nav, a Preact signal broadcasts the change, which:
1. updates `document.documentElement.lang`
2. swaps `innerHTML` on every `[data-pt]` element to its `data-en` (or vice-versa)

Islands render bilingual content reactively via the `lang` signal — no DOM mutation needed.

## Tweaks panel

Hidden by default. Activate via `http://localhost:4321/?tweaks=1` to tweak theme / accent color / display font / grain intensity / animation speed live.

## Project layout

```
src/
├── components/         # UI components (.astro = server, .tsx = Preact island)
├── layouts/Base.astro  # root <html> shell + fonts + grain
├── lib/
│   ├── content.ts      # SERVICES, PROCESS, CLIENTS, FAQ, MARQUEE_ITEMS, HERO_SLIDES
│   ├── types.ts        # Bilingual, Service, Slide, etc.
│   └── lang-signal.ts  # shared PT/EN signal
├── pages/index.astro   # composes everything
└── styles/global.css   # full CSS ported from the original prototype
```

## Credits

Hero photography by contributors on [Unsplash](https://unsplash.com/).
Typography: Fraunces, Inter Tight, JetBrains Mono, Bodoni Moda, Archivo Black, Cormorant Garamond, Instrument Serif, Space Grotesk.
