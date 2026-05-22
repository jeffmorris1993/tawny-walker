import { useEffect, useState } from 'react';
import { useDirection } from '../theme/DirectionContext';
import { THEMES, DIRECTION_KEYS } from '../theme/themes';

const HIDDEN_KEY = 'tw.toggle.hidden';

const HERO_MEDIA_OPTIONS = [
  { key: 'image', label: 'Image' },
  { key: 'video', label: 'Video' },
];

const HERO_VIDEO_BG_OPTIONS = [
  { key: 'emerald', label: 'Green' },
  { key: 'cream', label: 'Cream' },
];

function ToggleBtn({ active, onClick, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={title}
      className="tw-toggle-btn"
      style={{
        padding: '10px 14px',
        border: 0,
        background: active ? '#1B1B1A' : 'transparent',
        color: active ? '#FBF9F5' : '#1B1B1A',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase',
        cursor: active ? 'default' : 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}

function ToggleGroup({ label, children }) {
  return (
    <div className="tw-toggle-group" style={{ display: 'inline-flex', alignItems: 'stretch' }}>
      <div className="tw-toggle-label" style={{
        padding: '10px 14px',
        fontSize: 9, letterSpacing: '0.26em', textTransform: 'uppercase',
        color: '#9A968D',
        display: 'flex', alignItems: 'center',
      }}>{label}</div>
      {children}
    </div>
  );
}

// Floating bottom-right control panel. Always rendered in Direction A's neutral
// chrome so it reads the same on both directions and never depends on the page
// background being light or dark.
export default function DirectionToggle() {
  const { direction, setDirection, heroMedia, setHeroMedia, heroVideoBg, setHeroVideoBg } = useDirection();

  const [hidden, setHidden] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(HIDDEN_KEY) === '1';
  });

  useEffect(() => {
    try {
      if (hidden) localStorage.setItem(HIDDEN_KEY, '1');
      else localStorage.removeItem(HIDDEN_KEY);
    } catch { /* quota / private mode */ }
  }, [hidden]);

  if (hidden) {
    return (
      <button
        type="button"
        onClick={() => setHidden(false)}
        aria-label="Show direction controls"
        title="Show direction controls"
        style={{
          position: 'fixed', right: 20, bottom: 20, zIndex: 100,
          padding: '8px 12px',
          background: '#1B1B1A', color: '#FBF9F5',
          border: '1px solid #1B1B1A', cursor: 'pointer',
          boxShadow: '0 14px 30px -16px rgba(0,0,0,0.32)',
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: 10.5, letterSpacing: '0.26em', textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        Direction · {direction}
      </button>
    );
  }

  return (
    <div className="tw-direction-toggle" style={{
      position: 'fixed', right: 20, bottom: 20, zIndex: 100,
      display: 'flex', alignItems: 'stretch',
      background: '#FBF9F5',
      border: '1px solid #1B1B1A',
      boxShadow: '0 14px 30px -16px rgba(0,0,0,0.32)',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      userSelect: 'none', maxWidth: 'calc(100vw - 40px)',
    }} role="group" aria-label="Design direction">
      <ToggleGroup label="Direction">
        {DIRECTION_KEYS.map((k) => {
          const active = direction === k;
          const t = THEMES[k];
          return (
            <ToggleBtn key={k} active={active} onClick={() => setDirection(k)} title={`${k} — ${t.name}`}>
              <span style={{ fontWeight: 600 }}>{k}</span>
              <span className="tw-toggle-sub" style={{ opacity: active ? 0.75 : 0.5, fontSize: 9, letterSpacing: '0.22em' }}>
                {k === 'A' ? 'Warm' : 'Emerald'}
              </span>
            </ToggleBtn>
          );
        })}
      </ToggleGroup>
      <ToggleGroup label="Hero">
        {HERO_MEDIA_OPTIONS.map(({ key, label }) => (
          <ToggleBtn
            key={key}
            active={heroMedia === key}
            onClick={() => setHeroMedia(key)}
            title={`Hero ${label}`}
          >
            {label}
          </ToggleBtn>
        ))}
      </ToggleGroup>
      {heroMedia === 'video' && (
        <ToggleGroup label="Frame">
          {HERO_VIDEO_BG_OPTIONS.map(({ key, label }) => (
            <ToggleBtn
              key={key}
              active={heroVideoBg === key}
              onClick={() => setHeroVideoBg(key)}
              title={`Frame ${label}`}
            >
              {label}
            </ToggleBtn>
          ))}
        </ToggleGroup>
      )}
      <button
        type="button"
        onClick={() => setHidden(true)}
        aria-label="Hide direction controls"
        title="Hide"
        className="tw-toggle-hide"
        style={{
          padding: '0 12px', border: 0, background: 'transparent',
          color: '#9A968D', cursor: 'pointer',
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: 16, lineHeight: 1, fontWeight: 400,
        }}
      >×</button>
      <style>{`
        .tw-toggle-group + .tw-toggle-group { border-left: 1px solid #E3DDD0; }
        .tw-toggle-hide { border-left: 1px solid #E3DDD0; }
        @media (max-width: 600px) {
          .tw-direction-toggle {
            right: 12px; bottom: 12px;
            flex-direction: column !important; align-items: stretch !important;
            min-width: 200px;
          }
          .tw-toggle-group { width: 100%; }
          .tw-toggle-group + .tw-toggle-group { border-left: 0; border-top: 1px solid #E3DDD0; }
          .tw-toggle-hide { border-left: 0; border-top: 1px solid #E3DDD0; padding: 6px 12px !important; }
          .tw-toggle-label { display: none !important; }
          .tw-toggle-sub   { display: none !important; }
          .tw-toggle-btn   { flex: 1 1 0; padding: 9px 8px !important; font-size: 10.5px !important; letter-spacing: 0.22em !important; }
        }
      `}</style>
    </div>
  );
}
