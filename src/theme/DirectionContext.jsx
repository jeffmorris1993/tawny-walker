import { createContext, useContext, useEffect, useMemo } from 'react';
import { THEMES } from './themes';

// The site shipped with two design directions and a hero-media toggle. The
// studio picked Direction B + video hero + cream frame as the production
// look, so the context is now pinned to that combination. The provider
// keeps the same shape so existing call sites (`useDirection`, `useTheme`)
// don't need to change.

const DIRECTION = 'B';
const HERO_MEDIA = 'video';
const HERO_VIDEO_BG = 'cream';

const DirectionContext = createContext(null);

const FAVICON_HREF = '/favicon-b.svg';
const APPLE_ICON_HREF = '/logo-white-on-green.png';

export function DirectionProvider({ children }) {
  useEffect(() => {
    const fav = document.getElementById('tw-favicon');
    if (fav) fav.setAttribute('href', FAVICON_HREF);
    const apple = document.getElementById('tw-apple-icon');
    if (apple) apple.setAttribute('href', APPLE_ICON_HREF);
  }, []);

  const value = useMemo(() => ({
    direction: DIRECTION,
    theme: THEMES[DIRECTION],
    // Setters are no-ops — kept on the object so older call sites don't
    // throw if they happen to invoke them.
    setDirection:    () => {},
    toggleDirection: () => {},
    heroMedia: HERO_MEDIA,
    setHeroMedia:    () => {},
    heroVideoBg: HERO_VIDEO_BG,
    setHeroVideoBg:  () => {},
  }), []);

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
