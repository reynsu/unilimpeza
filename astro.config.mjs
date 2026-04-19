import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://unilimpeza.pt',
  output: 'server',
  adapter: vercel({
    // Serve images through Vercel's built-in CDN transformer.
    imageService: true,
  }),
  integrations: [
    preact({ compat: false }),
    sitemap({
      changefreq: 'monthly',
      priority: 0.8,
      lastmod: new Date(),
    }),
  ],
  // Hover-only prefetch: keeps initial payload tight but makes nav feel instant.
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  compressHTML: true,
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
  },
  server: { port: 4321, host: true },
  build: {
    // Inline all CSS to eliminate the render-blocking <link rel="stylesheet">.
    // At ~26 KB raw (~6 KB gzipped) the tradeoff favors LCP over HTML size.
    inlineStylesheets: 'always',
    assets: '_astro',
  },
  vite: {
    build: {
      target: 'es2022',
      cssMinify: 'lightningcss',
      cssCodeSplit: true,
      reportCompressedSize: false,
    },
    resolve: {
      dedupe: ['preact', 'preact/hooks', 'preact/jsx-runtime'],
    },
    // Strip legal comments in production for smaller bundles.
    esbuild: {
      legalComments: 'none',
      treeShaking: true,
    },
  },
});
