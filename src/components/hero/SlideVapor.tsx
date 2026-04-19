import type { ComponentType } from 'preact';
import type { Lang } from '../../lib/types';

type Props = { lang: Lang; TitleTag: 'h1' | 'p' };

const SlideVapor: ComponentType<Props> = ({ lang: l, TitleTag }) => {
  const pt = l === 'pt';
  return (
    <div class="hero-copy">
      <div class="s-mark fade-in">
        <span>{pt ? 'um pequeno elogio' : 'a small praise'}</span>
      </div>
      <TitleTag class="s-title">
        <span class="hline">
          <span>{pt ? 'o vapor, a pausa, ' : 'the steam, the pause, '}</span>
        </span>
        <span class="hline">
          <span>{pt ? 'o silêncio, ' : 'the silence, '}</span>
        </span>
        <span class="hline">
          <span>{pt ? 'a cozinha pronta.' : 'the kitchen ready.'}</span>
        </span>
      </TitleTag>
      <div class="s-foot fade-in">
        {pt
          ? 'Acordamos antes do chef. Saímos antes da primeira mesa.'
          : 'We wake before the chef. We leave before the first table.'}
      </div>
    </div>
  );
};

export default SlideVapor;
