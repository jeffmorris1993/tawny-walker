import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { THEMES, DIRECTION_KEYS } from './themes';

const STORAGE_KEY = 'tw.direction';

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

export function DirectionProvider({ children }) {
  const [direction, setDirectionState] = useState(readStored);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, direction); } catch { /* noop */ }
  }, [direction]);

  const value = useMemo(() => ({
    direction,
    theme: THEMES[direction],
    setDirection: (k) => DIRECTION_KEYS.includes(k) && setDirectionState(k),
    toggleDirection: () => setDirectionState(d => (d === 'A' ? 'B' : 'A')),
  }), [direction]);

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
