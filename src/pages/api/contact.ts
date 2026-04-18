import type { APIRoute } from 'astro';

export const prerender = false;

interface ContactPayload {
  name: string;
  company?: string;
  email: string;
  tel?: string;
  kind?: string;
  message?: string;
}

const MAX_FIELD_LEN = 500;
const MAX_MESSAGE_LEN = 4000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(raw: unknown): { ok: true; data: ContactPayload } | { ok: false; error: string } {
  if (typeof raw !== 'object' || raw === null) return { ok: false, error: 'invalid_body' };
  const r = raw as Record<string, unknown>;
  const getStr = (k: string, max: number, required: boolean): string | null => {
    const v = r[k];
    if (v === undefined || v === null || v === '') {
      return required ? null : '';
    }
    if (typeof v !== 'string') return null;
    const trimmed = v.trim();
    if (trimmed.length === 0) return required ? null : '';
    if (trimmed.length > max) return null;
    return trimmed;
  };

  const name = getStr('name', MAX_FIELD_LEN, true);
  const email = getStr('email', MAX_FIELD_LEN, true);
  const company = getStr('company', MAX_FIELD_LEN, false);
  const tel = getStr('tel', MAX_FIELD_LEN, false);
  const kind = getStr('kind', MAX_FIELD_LEN, false);
  const message = getStr('message', MAX_MESSAGE_LEN, false);

  if (name === null) return { ok: false, error: 'invalid_name' };
  if (email === null) return { ok: false, error: 'invalid_email' };
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'invalid_email' };

  return {
    ok: true,
    data: {
      name,
      email,
      company: company || undefined,
      tel: tel || undefined,
      kind: kind || undefined,
      message: message || undefined,
    },
  };
}

/**
 * Contact intake endpoint.
 *
 * Currently logs to stderr. Wire to Resend / SendGrid / a DB / CRM by
 * replacing the `deliver()` implementation.
 *
 * Accepts JSON or form-encoded bodies (the frontend sends JSON).
 */
export const POST: APIRoute = async ({ request }) => {
  let raw: unknown;
  try {
    const ct = request.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
      raw = await request.json();
    } else {
      const fd = await request.formData();
      raw = Object.fromEntries(fd.entries());
    }
  } catch {
    return json({ ok: false, error: 'unreadable_body' }, 400);
  }

  const result = validate(raw);
  if (!result.ok) return json(result, 400);

  try {
    await deliver(result.data);
  } catch (err) {
    console.error('[contact] delivery failed', err);
    return json({ ok: false, error: 'delivery_failed' }, 502);
  }

  return json({ ok: true }, 200);
};

export const GET: APIRoute = () => json({ ok: false, error: 'method_not_allowed' }, 405);

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

/**
 * Hook point for real delivery (email, CRM, DB). Swap this body to integrate.
 * Keeping it structured + awaited so errors surface to the caller.
 */
async function deliver(payload: ContactPayload): Promise<void> {
  const line = [
    `[contact] ${new Date().toISOString()}`,
    `name="${payload.name}"`,
    `email="${payload.email}"`,
    payload.company ? `company="${payload.company}"` : '',
    payload.tel ? `tel="${payload.tel}"` : '',
    payload.kind ? `kind="${payload.kind}"` : '',
    payload.message ? `message_len=${payload.message.length}` : '',
  ]
    .filter(Boolean)
    .join(' ');
  // Stderr so prod logs capture it without polluting stdout (clean for tools that parse stdout).
  process.stderr.write(line + '\n');
}
