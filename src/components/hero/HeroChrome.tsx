import type { SlideContent, Lang } from '../../lib/types';

interface HeroChromeProps {
  slides: ReadonlyArray<SlideContent>;
  cur: number;
  lang: Lang;
  onGoTo: (idx: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * The progress dots, `01 / 05` index counter, and prev/next arrow buttons
 * that live along the bottom of the hero. Stateless — owner passes cur + handlers.
 *
 * Accessibility note: we use plain `<button aria-label="Go to scene N">`
 * rather than `role="tab"` + `role="tablist"`. A strict tab pattern requires
 * matching `role="tabpanel"` + `aria-controls` wiring; here the slide is also
 * the scrollable landmark, which makes the full tab pattern awkward. Plain
 * buttons with clear labels are just as discoverable to assistive tech.
 */
export default function HeroChrome({
  slides,
  cur,
  lang,
  onGoTo,
  onPrev,
  onNext,
}: HeroChromeProps) {
  const pt = lang === 'pt';
  const tint = slides[cur].tint;
  return (
    <div class="hero-chrome">
      <div class="hero-dots" aria-label={pt ? 'Escolher cena' : 'Choose scene'}>
        {slides.map((_, i) => {
          const classes = ['hero-dot', i === cur ? 'active' : '', i < cur ? 'done' : '']
            .filter(Boolean)
            .join(' ');
          return (
            <button
              type="button"
              class={classes}
              key={i}
              aria-label={pt ? `Ir para cena ${i + 1}` : `Go to scene ${i + 1}`}
              aria-current={i === cur ? 'true' : undefined}
              onClick={() => onGoTo(i)}
            >
              <span class="dfill" style={{ background: tint.dot }}></span>
            </button>
          );
        })}
      </div>
      <div class="hero-idx" aria-hidden="true">
        <span class="big">
          <span class="num" style={{ color: tint.num }}>
            {String(cur + 1).padStart(2, '0')}
          </span>
        </span>
        <span>/ 0{slides.length}</span>
      </div>
      <div class="hero-arrows">
        <button
          type="button"
          class="hero-arrow"
          onClick={onPrev}
          aria-label={pt ? 'Cena anterior' : 'Previous scene'}
          style={{ borderColor: tint.arrow, color: tint.num }}
        >
          <span aria-hidden="true">←</span>
        </button>
        <button
          type="button"
          class="hero-arrow"
          onClick={onNext}
          aria-label={pt ? 'Cena seguinte' : 'Next scene'}
          style={{ borderColor: tint.arrow, color: tint.num }}
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
