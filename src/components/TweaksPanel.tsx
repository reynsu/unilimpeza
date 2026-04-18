import { useEffect, useState } from 'preact/hooks';

type Theme = 'light' | 'dark';
const THEMES = ['light', 'dark'] as const;
const DISPLAY_FONTS = [
  "'Fraunces', serif",
  "'Inter Tight', sans-serif",
  "'Space Grotesk', sans-serif",
  "'JetBrains Mono', monospace",
] as const;
type DisplayFont = (typeof DISPLAY_FONTS)[number];

const DEFAULTS = {
  theme: 'light' satisfies Theme as Theme,
  accent: '#291dd3',
  display: "'Space Grotesk', sans-serif" satisfies DisplayFont as DisplayFont,
  grain: 0,
  speed: 2.5,
};

const isTheme = (v: string): v is Theme => (THEMES as readonly string[]).includes(v);
const isDisplayFont = (v: string): v is DisplayFont =>
  (DISPLAY_FONTS as readonly string[]).includes(v);

export default function TweaksPanel() {
  const [show, setShow] = useState(false);
  const [theme, setTheme] = useState<Theme>(DEFAULTS.theme);
  const [accent, setAccent] = useState<string>(DEFAULTS.accent);
  const [display, setDisplay] = useState<DisplayFont>(DEFAULTS.display);
  const [grain, setGrain] = useState<number>(DEFAULTS.grain);
  const [speed, setSpeed] = useState<number>(DEFAULTS.speed);

  useEffect(() => {
    setShow(new URLSearchParams(location.search).has('tweaks'));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--display', display);
    root.style.setProperty('--grain', String(grain));
    root.style.setProperty('--speed', String(speed));
  }, [theme, accent, display, grain, speed]);

  if (!show) return null;

  return (
    <div class="tweaks-panel show">
      <h3>Tweaks</h3>
      <div class="tweak">
        <label>Theme</label>
        <select
          value={theme}
          onChange={(e) => {
            const v = (e.target as HTMLSelectElement).value;
            if (isTheme(v)) setTheme(v);
          }}
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>
      <div class="tweak">
        <label>Accent</label>
        <input
          type="color"
          value={accent}
          onInput={(e) => setAccent((e.target as HTMLInputElement).value)}
        />
      </div>
      <div class="tweak">
        <label>Display</label>
        <select
          value={display}
          onChange={(e) => {
            const v = (e.target as HTMLSelectElement).value;
            if (isDisplayFont(v)) setDisplay(v);
          }}
        >
          <option value="'Fraunces', serif">Fraunces</option>
          <option value="'Inter Tight', sans-serif">Inter Tight</option>
          <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
          <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
        </select>
      </div>
      <div class="tweak">
        <label>Grain</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={grain}
          onInput={(e) => setGrain(+(e.target as HTMLInputElement).value)}
        />
      </div>
      <div class="tweak">
        <label>Speed</label>
        <input
          type="range"
          min="0.3"
          max="2.5"
          step="0.1"
          value={speed}
          onInput={(e) => setSpeed(+(e.target as HTMLInputElement).value)}
        />
      </div>
    </div>
  );
}
