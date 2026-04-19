import type { ComponentType } from 'preact';
import type { Lang } from '../../lib/types';

type Props = { lang: Lang };

const SlideHuman: ComponentType<Props> = ({ lang: l }) => {
  const pt = l === 'pt';
  return (
    <div class="hero-copy">
      <div class="s-stack">
        <div class="s-attr fade-in">Chef Miguel · Casa do Mar, Lagos</div>
        <blockquote class="s-quote">
          <span class="hline">
            <span>{pt ? '“Entregam-me ' : '“They hand me '}</span>
          </span>
          <span class="hline">
            <span>{pt ? 'uma cozinha ' : 'a kitchen '}</span>
          </span>
          <span class="hline">
            <span>
              {pt ? 'que ' : 'that '}
              <strong>{pt ? 'canta.' : 'sings.'}</strong>”
            </span>
          </span>
        </blockquote>
      </div>
      <div class="s-rightcol fade-in">
        <p>
          {pt
            ? 'Sete anos a lado a lado com restaurantes do Algarve. Passamos de prestadores a parte da equipa.'
            : 'Seven years shoulder-to-shoulder with Algarve restaurants. From vendors to team members.'}
        </p>
        <a
          href="#contact"
          class="btn primary"
          style={{ background: '#f5e8d0', color: '#0b0f14' }}
        >
          <span>{pt ? 'Falar connosco' : "Let's talk"}</span>
          <span class="arrow" aria-hidden="true">
            →
          </span>
        </a>
      </div>
    </div>
  );
};

export default SlideHuman;
