import { useEffect, useRef, useState } from 'preact/hooks';
import { FAQ } from '../lib/content';

export default function FaqAccordion() {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    // Own the reveal-on-scroll state internally so Preact re-renders don't
    // strip the `in` class added by the shared observer in Base.astro.
    const io = new IntersectionObserver(
      (entries) => {
        setRevealed((prev) => {
          let changed = false;
          const next = new Set(prev);
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const idxAttr = (entry.target as HTMLElement).dataset.faqIndex;
            if (idxAttr == null) return;
            const idx = Number(idxAttr);
            if (!next.has(idx)) {
              next.add(idx);
              changed = true;
            }
            io.unobserve(entry.target);
          });
          return changed ? next : prev;
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
    );
    itemRefs.current.forEach((el) => {
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const toggle = (i: number) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div class="faq-list" role="list">
      {FAQ.map((f, i) => {
        const isOpen = open.has(i);
        const isIn = revealed.has(i);
        const aId = `faq-a-${i}`;
        const qId = `faq-q-${i}`;
        const classes = ['faq-item', 'reveal'];
        if (isIn) classes.push('in');
        if (isOpen) classes.push('open');
        return (
          <div
            class={classes.join(' ')}
            role="listitem"
            key={i}
            data-faq-index={i}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
          >
            <button
              type="button"
              id={qId}
              class="faq-q"
              onClick={() => toggle(i)}
              aria-expanded={isOpen}
              aria-controls={aId}
            >
              <span data-pt={f.pt[0]} data-en={f.en[0]}>
                {f.pt[0]}
              </span>
              <span class="faq-toggle" aria-hidden="true">+</span>
            </button>
            <div
              id={aId}
              class="faq-a"
              role="region"
              aria-labelledby={qId}
              data-pt={f.pt[1]}
              data-en={f.en[1]}
            >
              {f.pt[1]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
