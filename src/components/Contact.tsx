import { useEffect, useRef, useState } from 'preact/hooks';
import { getLang, subscribeLang } from '../lib/lang-store';
import type { Lang } from '../lib/types';

type Status = 'idle' | 'sending' | 'sent' | 'error';
const RESET_AFTER_MS = 4000;

export default function Contact() {
  const [status, setStatus] = useState<Status>('idle');
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState<Lang>(getLang());
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => subscribeLang(setCurrentLang), []);

  // Reset to idle after success so the form doesn't stay permanently disabled
  useEffect(() => {
    if (status !== 'sent') return;
    const t = window.setTimeout(() => {
      setStatus('idle');
      formRef.current?.reset();
    }, RESET_AFTER_MS);
    return () => window.clearTimeout(t);
  }, [status]);

  const pt = currentLang === 'pt';

  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());

    setStatus('sending');
    setErrMsg(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setErrMsg(err instanceof Error ? err.message : 'network_error');
    }
  };

  const btnLabel = (() => {
    if (status === 'sending') return pt ? 'A enviar…' : 'Sending…';
    if (status === 'sent') return pt ? '✓ Enviado' : '✓ Sent';
    if (status === 'error') return pt ? 'Tentar outra vez' : 'Try again';
    return pt ? 'Enviar pedido' : 'Send request';
  })();

  return (
    <form
      ref={formRef}
      class="form"
      onSubmit={onSubmit}
      noValidate
      aria-label={pt ? 'Formulário de contacto' : 'Contact form'}
    >
      <div class="field">
        <label for="c-name" data-pt="Nome" data-en="Name">
          {pt ? 'Nome' : 'Name'}
        </label>
        <input id="c-name" type="text" name="name" placeholder="—" autocomplete="name" required />
      </div>
      <div class="field">
        <label for="c-company" data-pt="Empresa" data-en="Company">
          {pt ? 'Empresa' : 'Company'}
        </label>
        <input id="c-company" type="text" name="company" placeholder="—" autocomplete="organization" />
      </div>
      <div class="field">
        <label for="c-email">Email</label>
        <input id="c-email" type="email" name="email" placeholder="—" autocomplete="email" required />
      </div>
      <div class="field">
        <label for="c-phone" data-pt="Telefone" data-en="Phone">
          {pt ? 'Telefone' : 'Phone'}
        </label>
        <input id="c-phone" type="tel" name="tel" placeholder="+351" autocomplete="tel" />
      </div>
      <div class="field full">
        <label for="c-kind" data-pt="Tipo de cozinha" data-en="Kitchen type">
          {pt ? 'Tipo de cozinha' : 'Kitchen type'}
        </label>
        <select id="c-kind" name="kind">
          <option>Restaurante</option>
          <option>Hotel / Resort</option>
          <option>Cozinha industrial</option>
          <option>Cantina / Catering</option>
          <option>Outro</option>
        </select>
      </div>
      <div class="field full">
        <label for="c-msg" data-pt="Mensagem" data-en="Message">
          {pt ? 'Mensagem' : 'Message'}
        </label>
        <textarea id="c-msg" name="message" placeholder="—" rows={4}></textarea>
      </div>
      {status === 'error' && (
        <div class="field full form-status form-status--error" role="alert">
          {pt
            ? 'Não conseguimos enviar o pedido. Tente novamente ou escreva para '
            : 'We could not send the request. Try again or email '}
          <a href="mailto:ola@unilimpeza.pt">ola@unilimpeza.pt</a>
          {errMsg ? ` — ${errMsg}` : null}
        </div>
      )}
      <div class="field full">
        <button
          class="btn primary"
          type="submit"
          style={{ width: '100%', justifyContent: 'center' }}
          disabled={status === 'sending' || status === 'sent'}
          aria-live="polite"
        >
          <span>{btnLabel}</span>
          <span class="arrow" aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}
