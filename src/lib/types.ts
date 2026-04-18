export type Lang = 'pt' | 'en';

export type Bilingual = {
  pt: readonly [string, string];
  en: readonly [string, string];
};

export type Service = Bilingual & { tags: readonly string[] };
export type ProcessStep = Bilingual;
export type FaqItem = Bilingual;

export type SlideVariant = 'slide-01' | 'slide-02' | 'slide-03' | 'slide-04' | 'slide-05';

export type SlideContent = {
  variant: SlideVariant;
  /** Name of the image base used in /public/hero/. Sources are derived: slide-N.{avif,webp,jpg} + slide-N-sm.{avif,webp} */
  photoBase: string;
  width: number;
  height: number;
  eyebrow?: { pt: string; en: string };
  tint: { dot: string; arrow: string; num: string };
};
