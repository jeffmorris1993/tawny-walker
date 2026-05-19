import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { THEMES, DIRECTION_KEYS } from './themes';

const STORAGE_KEY = 'tw.direction';
const HERO_MEDIA_KEY = 'tw.heroMedia';
const HERO_VIDEO_BG_KEY = 'tw.heroVideoBg';

const HERO_MEDIA_KEYS = ['image', 'video'];
const HERO_VIDEO_BG_KEYS = ['emerald', 'cream'];

const DirectionContext = createContext(null);

function readStored() {
  if (typeof window === 'undefined') return 'A';
  // URL query (?dir=A|B) wins on initial load so the choice is shareable.
  try {
    const q = new URLSearchParams(window.location.search).get('dir');
    if (q) {
      const u = q.toUpperCase();
      if (DIRECTION_KEYS.includes(u)) return u;
    }
  } catch { /* noop */ }
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return DIRECTION_KEYS.includes(v) ? v : 'A';
  } catch {
    return 'A';
  }
}

function readStoredHeroMedia() {
  if (typeof window === 'undefined') return 'image';
  try {
    const q = new URLSearchParams(window.location.search).get('hero');
    if (q && HERO_MEDIA_KEYS.includes(q)) return q;
  } catch { /* noop */ }
  try {
    const v = window.localStorage.getItem(HERO_MEDIA_KEY);
    return HERO_MEDIA_KEYS.includes(v) ? v : 'image';
  } catch {
    return 'image';
  }
}

function readStoredHeroVideoBg() {
  if (typeof window === 'undefined') return 'emerald';
  try {
    const v = window.localStorage.getItem(HERO_VIDEO_BG_KEY);
    return HERO_VIDEO_BG_KEYS.includes(v) ? v : 'emerald';
  } catch {
    return 'emerald';
  }
}

const FAVICON_HREF = { A: '/favicon-a.svg', B: '/favicon-b.svg' };
const APPLE_ICON_HREF = { A: '/logo-black.png', B: '/logo-white-on-green.png' };

export function DirectionProvider({ children }) {
  const [direction, setDirectionState] = useState(readStored);
  const [heroMedia, setHeroMediaState] = useState(readStoredHeroMedia);
  const [heroVideoBg, setHeroVideoBgState] = useState(readStoredHeroVideoBg);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, direction); } catch { /* noop */ }
    // Swap the favicon + apple-touch-icon so the browser tab + iOS bookmark
    // reflect the active design direction.
    const fav = document.getElementById('tw-favicon');
    if (fav) fav.setAttribute('href', FAVICON_HREF[direction] || FAVICON_HREF.A);
    const apple = document.getElementById('tw-apple-icon');
    if (apple) apple.setAttribute('href', APPLE_ICON_HREF[direction] || APPLE_ICON_HREF.A);
  }, [direction]);

  useEffect(() => {
    try { window.localStorage.setItem(HERO_MEDIA_KEY, heroMedia); } catch { /* noop */ }
  }, [heroMedia]);

  useEffect(() => {
    try { window.localStorage.setItem(HERO_VIDEO_BG_KEY, heroVideoBg); } catch { /* noop */ }
  }, [heroVideoBg]);

  const value = useMemo(() => ({
    direction,
    theme: THEMES[direction],
    setDirection: (k) => DIRECTION_KEYS.includes(k) && setDirectionState(k),
    toggleDirection: () => setDirectionState(d => (d === 'A' ? 'B' : 'A')),
    heroMedia,
    setHeroMedia: (k) => HERO_MEDIA_KEYS.includes(k) && setHeroMediaState(k),
    heroVideoBg,
    setHeroVideoBg: (k) => HERO_VIDEO_BG_KEYS.includes(k) && setHeroVideoBgState(k),
  }), [direction, heroMedia, heroVideoBg]);

  return (
    <DirectionContext.Provider value={value}>{children}</DirectionContext.Provider>
  );
}

export function useDirection() {
  const ctx = useContext(DirectionContext);
  if (!ctx) throw new Error('useDirection must be used inside <DirectionProvider>');
  return ctx;
}

export function useTheme() {
  return useDirection().theme;
}
