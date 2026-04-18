import type { ComponentType } from 'preact';
import type { Lang } from '../../lib/types';

type Props = { lang: Lang; TitleTag: 'h1' | 'p' };

const SlideBrutal: ComponentType<Props> = ({ lang: l, TitleTag }) => {
  const pt = l === 'pt';
  return (
    <div class="hero-copy">
      <div class="s-topbar fade-in">
        <span>★ Unilimpeza Algarve</span>
        <span>{pt ? 'Contra gordura, com ciência' : 'Against grease, with science'}</span>
      </div>
      <div class="s-center">
        <TitleTag class="s-title">
          <span class="hline">
            <span>{pt ? 'Queimamos' : 'We burn'}</span>
          </span>
          <span class="hline">
            <span>
              <em>{pt ? 'a gordura' : 'the grease'}</em>
            </span>
          </span>
          <span class="hline">
            <span>{pt ? 'antes do fogo.' : 'before fire does.'}</span>
          </span>
        </TitleTag>
      </div>
      <div class="s-foot fade-in">
        <div>
          <span class="s-tag">
            {pt ? 'Desengorduramento · Grau militar' : 'Degreasing · Military grade'}
          </span>
        </div>
        <div class="s-sub">
          {pt
            ? 'Produtos certificados. Equipamento desmontado, lavado e testado — peça por peça.'
            : 'Certified products. Equipment disassembled, washed and tested — piece by piece.'}
        </div>
      </div>
    </div>
  );
};

export default SlideBrutal;
