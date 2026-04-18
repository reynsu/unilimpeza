import { useRef } from 'preact/hooks';
import type { Service } from '../lib/types';

type Props = { i: number; data: Service };

export default function ServiceCard({ i, data }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <div class={`service s-${i + 1} reveal`} ref={ref} onMouseMove={onMove}>
      <div class="s-num">0{i + 1} / 05</div>
      <div class="s-name" data-pt={data.pt[0]} data-en={data.en[0]}>
        {data.pt[0]}
      </div>
      <div class="s-desc" data-pt={data.pt[1]} data-en={data.en[1]}>
        {data.pt[1]}
      </div>
      <div class="s-tags">
        {data.tags.map((t) => (
          <span class="s-tag">{t}</span>
        ))}
      </div>
    </div>
  );
}
