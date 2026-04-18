/**
 * Only allow a small whitelist of text-formatting tags when assigning
 * user-sourced strings via innerHTML. Anything else falls back to textContent.
 *
 * Used by `lang-store.ts` so the `[data-pt]` / `[data-en]` swap mechanism
 * can render `<strong>`, `<em>`, `<u>`, `<br>` (the tags actually used in the
 * design) while being safe if any of those attributes ever sources from a
 * CMS, URL param, or other untrusted origin.
 */
const SAFE_HTML = /^(?:<\/?(?:strong|em|u|br)\s*\/?>|[^<>])*$/i;

export const assignBilingualHtml = (el: HTMLElement, value: string): void => {
  if (SAFE_HTML.test(value)) {
    el.innerHTML = value;
  } else {
    el.textContent = value;
  }
};

/**
 * Escape a JSON string so it is safe to embed in a `<script>` block.
 * Prevents `</script>`, `<!--`, and `<![CDATA[` from breaking out.
 */
export const escapeJsonForScript = (json: string): string =>
  json
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
