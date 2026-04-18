import { useEffect, useState } from 'preact/hooks';
import { getLang, setLang, subscribeLang } from '../lib/lang-store';
import type { Lang } from '../lib/types';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLocal] = useState<Lang>(getLang());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => subscribeLang(setLocal), []);

  return (
    <nav class={`nav${scrolled ? ' scrolled' : ''}`} id="nav">
      <div class="brand">
        <span class="brand-dot"></span>Unilimpeza · Algarve
      </div>
      <div class="nav-links">
        <a href="#services" data-pt="Serviços" data-en="Services">
          {lang === 'pt' ? 'Serviços' : 'Services'}
        </a>
        <a href="#process" data-pt="Processo" data-en="Process">
          {lang === 'pt' ? 'Processo' : 'Process'}
        </a>
        <a href="#contact" data-pt="Contacto" data-en="Contact">
          {lang === 'pt' ? 'Contacto' : 'Contact'}
        </a>
      </div>
      <div class="lang-toggle">
        <button
          type="button"
          class={lang === 'pt' ? 'active' : ''}
          onClick={() => setLang('pt')}
          aria-label="Português"
        >
          <span>PT</span>
        </button>
        <button
          type="button"
          class={lang === 'en' ? 'active' : ''}
          onClick={() => setLang('en')}
          aria-label="English"
        >
          <span>EN</span>
        </button>
      </div>
    </nav>
  );
}
