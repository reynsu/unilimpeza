import type { ComponentType } from 'preact';
import type { Lang } from '../../lib/types';

type Props = { lang: Lang; TitleTag: 'h1' | 'p' };

const SlideEditorial: ComponentType<Props> = ({ lang: l, TitleTag }) => {
  const pt = l === 'pt';
  return (
    <div class="hero-copy">
      <div class="s-eyebrow fade-in">
        <span>{pt ? 'Capítulo I · A brasa' : 'Chapter I · The ember'}</span>
      </div>
      <TitleTag class="s-title">
        <span class="hline">
          <span>{pt ? 'Onde a ' : 'Where the '}</span>
        </span>
        <span class="hline">
          <span>
            <strong>{pt ? 'chama' : 'flame'}</strong>
            {pt ? ' vive, ' : ' lives, '}
          </span>
        </span>
        <span class="hline">
          <span>{pt ? 'entra a equipa.' : 'we step in.'}</span>
        </span>
      </TitleTag>
      <div class="s-foot fade-in">
        <div>
          <div class="biglabel">
            {pt
              ? 'Serviço noturno, cozinha viva ao amanhecer.'
              : 'Overnight work. Kitchen alive by sunrise.'}
          </div>
        </div>
        <div>UNI · 001 / 005</div>
      </div>
    </div>
  );
};

export default SlideEditorial;
