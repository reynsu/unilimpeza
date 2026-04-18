import type { Lang } from './types';
import { assignBilingualHtml } from './sanitize';

/**
 * Minimal pub/sub store for the PT/EN language toggle.
 *
 * Replaces @preact/signals which caused hydration failures with pnpm + Vite
 * (two Preact instances because signals monkey-patches Preact internals).
 * A plain subscription API is framework-agnostic and has no runtime coupling
 * to Preact itself, so it survives any bundler edge case.
 */

let currentLang: Lang = 'pt';
const subscribers = new Set<(l: Lang) => void>();

export const getLang = (): Lang => currentLang;

export const setLang = (next: Lang): void => {
  if (next === currentLang) return;
  currentLang = next;

  // Side effect: update <html lang> + any server-rendered bilingual element
  // tagged with data-pt / data-en. This is how content outside islands
  // (services cards, process steps, footer, FAQ text) switches language.
  // The sanitizer restricts allowed HTML to <strong>/<em>/<u>/<br> so a
  // malicious data-* value can never inject script or other tags.
  if (typeof document !== 'undefined') {
    document.documentElement.lang = next;
    document.querySelectorAll<HTMLElement>('[data-pt]').forEach((el) => {
      const value = el.getAttribute('data-' + next);
      if (value !== null) assignBilingualHtml(el, value);
    });
  }

  subscribers.forEach((fn) => fn(next));
};

export const subscribeLang = (fn: (l: Lang) => void): (() => void) => {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
};
