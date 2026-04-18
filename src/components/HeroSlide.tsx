import { HERO_SLIDES } from '../lib/content';
import type { Lang } from '../lib/types';
import HeroPhoto from './hero/HeroPhoto';
import SlideEditorial from './hero/SlideEditorial';
import SlideBrutal from './hero/SlideBrutal';
import SlideVapor from './hero/SlideVapor';
import SlideTechnical from './hero/SlideTechnical';
import SlideHuman from './hero/SlideHuman';

type Props = { index: number; lang: Lang; isActive: boolean };

export default function HeroSlide({ index, lang: l, isActive }: Props) {
  const slide = HERO_SLIDES[index];
  const eager = index === 0;

  // Only slide 01 carries the page-level h1; other slides use a plain <p>
  // so there's only one h1 on the page even while all 5 slides are mounted
  // for the clip-path transition.
  const TitleTag = index === 0 ? 'h1' : 'p';

  const photo = <HeroPhoto slide={slide} lang={l} eager={eager} isActive={isActive} />;

  switch (slide.variant) {
    case 'slide-01':
      return (
        <>
          {photo}
          <SlideEditorial lang={l} TitleTag={TitleTag} />
        </>
      );
    case 'slide-02':
      return (
        <>
          {photo}
          <SlideBrutal lang={l} TitleTag={TitleTag} />
        </>
      );
    case 'slide-03':
      return (
        <>
          {photo}
          <SlideVapor lang={l} TitleTag={TitleTag} />
        </>
      );
    case 'slide-04':
      return (
        <>
          {photo}
          <SlideTechnical lang={l} TitleTag={TitleTag} />
        </>
      );
    case 'slide-05':
      return (
        <>
          {photo}
          <SlideHuman lang={l} />
        </>
      );
    default: {
      // Exhaustiveness guard: adding a new variant to SlideContent without a
      // case clause here becomes a TypeScript error instead of rendering nothing.
      const _exhaustive: never = slide.variant;
      throw new Error(`Unknown hero slide variant: ${String(_exhaustive)}`);
    }
  }
}
