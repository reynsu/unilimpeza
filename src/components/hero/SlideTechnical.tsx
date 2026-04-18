import type { ComponentType } from 'preact';
import type { Lang } from '../../lib/types';

type Props = { lang: Lang; TitleTag: 'h1' | 'p' };

const SlideTechnical: ComponentType<Props> = ({ lang: l, TitleTag }) => {
  const pt = l === 'pt';
  return (
    <div class="hero-copy">
      <div class="s-head fade-in">
        <div>
          <span class="idx">SITE_042</span> ·{' '}
          <span>{pt ? 'Protocolo Unilimpeza v7.2' : 'Unilimpeza Protocol v7.2'}</span>
        </div>
        <div class="crosshair" aria-hidden="true"></div>
      </div>
      <TitleTag class="s-title">
        <span class="hline">
          <span>{pt ? 'Precisão' : 'Precision'}</span>
        </span>
        <span class="hline">
          <span>
            {pt ? 'em ' : 'in '}
            <u>{pt ? 'aço inox' : 'stainless'}</u>
            {pt ? ',' : ','}
          </span>
        </span>
        <span class="hline">
          <span>{pt ? 'medida e entregue.' : 'measured & delivered.'}</span>
        </span>
      </TitleTag>
      <dl class="s-data fade-in">
        <div class="d">
          <dt>
            <strong>99.7%</strong>
          </dt>
          <dd>{pt ? 'Remoção de gordura' : 'Grease removal'}</dd>
        </div>
        <div class="d">
          <dt>
            <strong>&lt; 6h</strong>
          </dt>
          <dd>{pt ? 'Tempo médio' : 'Avg. time'}</dd>
        </div>
        <div class="d">
          <dt>
            <strong>EN 16282</strong>
          </dt>
          <dd>{pt ? 'Norma europeia' : 'EU standard'}</dd>
        </div>
        <div class="d">
          <dt>
            <strong>24 / 7</strong>
          </dt>
          <dd>{pt ? 'Emergência' : 'Emergency'}</dd>
        </div>
      </dl>
    </div>
  );
};

export default SlideTechnical;
