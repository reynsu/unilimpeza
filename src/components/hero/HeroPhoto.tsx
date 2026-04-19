import type { SlideContent, Lang } from '../../lib/types';
import { HERO_MOBILE_MEDIA } from '../../lib/breakpoints';

const PHOTO_ALT: Record<string, { pt: string; en: string }> = {
  'slide-01': {
    pt: 'Cozinha profissional iluminada com brasas acesas, equipa de limpeza em ação.',
    en: 'Professional kitchen lit by glowing embers, cleaning team in action.',
  },
  'slide-02': {
    pt: 'Chamas intensas num fogão industrial antes da limpeza profunda.',
    en: 'Intense flames on an industrial stove before deep cleaning.',
  },
  'slide-03': {
    pt: 'Vapor suave a subir de uma cozinha profissional no final do serviço.',
    en: 'Soft steam rising from a professional kitchen at end of service.',
  },
  'slide-04': {
    pt: 'Superfície de aço inoxidável escovada — cozinha industrial após higienização.',
    en: 'Brushed stainless steel surface — industrial kitchen after sanitisation.',
  },
  'slide-05': {
    pt: 'Chef em ambiente caloroso de cozinha profissional no Algarve.',
    en: 'Chef in a warm professional kitchen setting in the Algarve.',
  },
};

interface HeroPhotoProps {
  slide: SlideContent;
  lang: Lang;
  eager: boolean;
  isActive: boolean;
}

export default function HeroPhoto({ slide, lang, eager, isActive }: HeroPhotoProps) {
  const alt = PHOTO_ALT[slide.variant][lang];
  const base = slide.photoBase;
  return (
    <div class="hero-photo">
      <picture>
        <source type="image/avif" media={HERO_MOBILE_MEDIA} srcset={`${base}-sm.avif`} />
        <source type="image/avif" srcset={`${base}.avif`} />
        <source type="image/webp" media={HERO_MOBILE_MEDIA} srcset={`${base}-sm.webp`} />
        <source type="image/webp" srcset={`${base}.webp`} />
        {/*
          - Slide 1 (eager): high priority, sync decode, eager load — optimizes LCP.
          - Slides 2-5: lazy load with auto priority so the browser fetches them
            during idle time after LCP; async decode keeps them off the main thread
            when clip-path transitions reveal them.
        */}
        <img
          src={`${base}.jpg`}
          alt={alt}
          width={slide.width}
          height={slide.height}
          loading={eager ? 'eager' : 'lazy'}
          fetchpriority={eager ? 'high' : 'auto'}
          decoding={eager ? 'sync' : 'async'}
          aria-hidden={!isActive}
        />
      </picture>
    </div>
  );
}
