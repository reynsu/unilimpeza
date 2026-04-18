import { useState } from 'preact/hooks';
import { FAQ } from '../lib/content';

export default function FaqAccordion() {
  const [open, setOpen] = useState<Set<number>>(new Set());

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
        const aId = `faq-a-${i}`;
        const qId = `faq-q-${i}`;
        return (
          <div class={`faq-item reveal${isOpen ? ' open' : ''}`} role="listitem" key={i}>
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
