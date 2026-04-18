import { useEffect, useRef, useState } from 'preact/hooks';
import { HERO_SLIDES } from '../lib/content';
import { getLang, subscribeLang } from '../lib/lang-store';
import type { Lang } from '../lib/types';
import HeroSlide from './HeroSlide';
import HeroChrome from './hero/HeroChrome';

const SLIDE_MS = 5000;
const LEAVE_CLEAR_MS = 1500;

/**
 * Pause into three independent gates:
 *   - hover: pointer inside the hero (mouse users)
 *   - kbFocus: keyboard focus inside the hero (keyboard users)
 *   - hidden: tab hidden in the background
 * `paused = hover || kbFocus || hidden`
 *
 * A single `paused` bool produced cross-talk bugs (e.g. clicking an arrow
 * focused the button, pause stuck on, timer never resumed).
 *
 * kbFocus is gated on :focus-visible so a mouse click on a nav button
 * does NOT leave the carousel stuck — only true keyboard focus retains pause.
 */

const isFocusVisible = (el: Element | null): boolean => {
  if (!el || !(el instanceof HTMLElement)) return false;
  try {
    return el.matches(':focus-visible');
  } catch {
    return false;
  }
};

export default function HeroCarousel() {
  const [cur, setCur] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [hover, setHover] = useState(false);
  const [kbFocus, setKbFocus] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [currentLang, setCurrentLang] = useState<Lang>(getLang());
  const [reduce, setReduce] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const curRef = useRef(cur);
  curRef.current = cur;

  const paused = hover || kbFocus || hidden;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduce(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => subscribeLang(setCurrentLang), []);

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    onVis();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    if (paused || reduce) return;
    const id = window.setTimeout(() => {
      goTo((curRef.current + 1) % HERO_SLIDES.length);
    }, SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [cur, paused, reduce]);

  useEffect(() => {
    if (prev === null) return;
    const t = window.setTimeout(() => setPrev(null), LEAVE_CLEAR_MS);
    return () => window.clearTimeout(t);
  }, [prev]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!heroRef.current?.contains(document.activeElement)) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(curRef.current - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(curRef.current + 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const goTo = (idx: number) => {
    const n = HERO_SLIDES.length;
    const nextIdx = ((idx % n) + n) % n;
    if (nextIdx === curRef.current) return;
    setPrev(curRef.current);
    setCur(nextIdx);
  };

  const handleFocusIn = (e: FocusEvent) => {
    if (isFocusVisible(e.target as Element)) setKbFocus(true);
  };
  const handleFocusOut = (_e: FocusEvent) => {
    queueMicrotask(() => {
      const next = document.activeElement;
      if (next && heroRef.current?.contains(next) && isFocusVisible(next)) return;
      setKbFocus(false);
    });
  };

  const pt = currentLang === 'pt';

  return (
    <section
      class="hero"
      id="top"
      ref={heroRef}
      aria-roledescription="carousel"
      aria-label={pt ? 'Galeria Unilimpeza — cinco cenas' : 'Unilimpeza gallery — five scenes'}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocusIn={handleFocusIn}
      onFocusOut={handleFocusOut}
    >
      <div class="hero-stack">
        {HERO_SLIDES.map((slide, i) => {
          const isActive = i === cur;
          const isLeaving = i === prev;
          const cls = `hero-slide ${slide.variant}${isActive ? ' active' : ''}${isLeaving ? ' leaving' : ''}`;
          return (
            <div
              class={cls}
              data-i={i}
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${HERO_SLIDES.length}`}
              aria-hidden={!isActive}
            >
              <HeroSlide index={i} lang={currentLang} isActive={isActive} />
            </div>
          );
        })}
      </div>

      {/* Screen-reader-only live region announces slide changes */}
      <div class="sr-only" aria-live="polite" aria-atomic="true">
        {pt ? `Cena ${cur + 1} de ${HERO_SLIDES.length}` : `Scene ${cur + 1} of ${HERO_SLIDES.length}`}
      </div>

      <HeroChrome
        slides={HERO_SLIDES}
        cur={cur}
        lang={currentLang}
        onGoTo={goTo}
        onPrev={() => goTo(curRef.current - 1)}
        onNext={() => goTo(curRef.current + 1)}
      />

      <div class="scroll-hint" aria-hidden="true">
        <span>{pt ? 'Descer' : 'Scroll'}</span>
        <div class="bar"></div>
      </div>
    </section>
  );
}
