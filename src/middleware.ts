import { defineMiddleware } from 'astro:middleware';

const IMMUTABLE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
const STATIC_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const HTML_MAX_AGE = 60 * 60; // 1 hour

/**
 * Sets Cache-Control and a few defensive security headers on every response.
 * Fingerprinted assets under /_astro/ are immutable; images/fonts get long
 * max-age; HTML is short-lived so deploys propagate quickly.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const headers = response.headers;
  const url = new URL(context.request.url);
  const path = url.pathname;

  // Security headers — baseline for any HTML-serving site.
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');

  // Cache-Control by asset type.
  if (path.startsWith('/_astro/')) {
    headers.set('Cache-Control', `public, max-age=${IMMUTABLE_MAX_AGE}, immutable`);
  } else if (/\.(avif|webp|jpg|jpeg|png|svg|gif|ico|woff2?|ttf|otf)$/i.test(path)) {
    headers.set('Cache-Control', `public, max-age=${STATIC_MAX_AGE}, stale-while-revalidate=${STATIC_MAX_AGE}`);
  } else if (path === '/robots.txt' || path.endsWith('.xml') || path === '/manifest.webmanifest') {
    headers.set('Cache-Control', `public, max-age=${HTML_MAX_AGE}, stale-while-revalidate=${HTML_MAX_AGE * 24}`);
  } else {
    const contentType = headers.get('content-type') ?? '';
    if (contentType.startsWith('text/html')) {
      headers.set('Cache-Control', `public, max-age=${HTML_MAX_AGE}, s-maxage=${HTML_MAX_AGE}, stale-while-revalidate=${HTML_MAX_AGE * 24}`);
    }
  }

  return response;
});
