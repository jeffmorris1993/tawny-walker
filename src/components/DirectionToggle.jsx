import { useDirection } from '../theme/DirectionContext';
import { THEMES, DIRECTION_KEYS } from '../theme/themes';

const HERO_MEDIA_OPTIONS = [
  { key: 'image', label: 'Image' },
  { key: 'video', label: 'Video' },
];

const HERO_VIDEO_BG_OPTIONS = [
  { key: 'emerald', label: 'Green' },
  { key: 'cream', label: 'Cream' },
];

// Floating bottom-right control panel. Always rendered in Direction A's neutral
// chrome so it reads the same on both directions and never depends on the page
// background being light or dark.
export default function DirectionToggle() {
  const { direction, setDirection, heroMedia, setHeroMedia, heroVideoBg, setHeroVideoBg } = useDirection();

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
      <div className="tw-toggle-label" style={{
        padding: '10px 14px',
        fontSize: 9, letterSpacing: '0.26em', textTransform: 'uppercase',
        color: '#9A968D', borderRight: '1px solid #E3DDD0',
        display: 'flex', alignItems: 'center',
      }}>Direction</div>
      {DIRECTION_KEYS.map((k) => {
        const active = direction === k;
        const t = THEMES[k];
        return (
          <button
            key={k}
            onClick={() => setDirection(k)}
            aria-pressed={active}
            title={`${k} — ${t.name}`}
            style={{
              padding: '10px 16px',
              border: 0,
              background: active ? '#1B1B1A' : 'transparent',
              color: active ? '#FBF9F5' : '#1B1B1A',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase',
              cursor: active ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <span style={{ fontWeight: 600 }}>{k}</span>
            <span className="tw-toggle-sub" style={{ opacity: active ? 0.75 : 0.5, fontSize: 9, letterSpacing: '0.22em' }}>
              {k === 'A' ? 'Warm' : 'Emerald'}
            </span>
          </button>
        );
      })}
      <div className="tw-toggle-label" style={{
        padding: '10px 14px',
        fontSize: 9, letterSpacing: '0.26em', textTransform: 'uppercase',
        color: '#9A968D',
        borderLeft: '1px solid #E3DDD0',
        borderRight: '1px solid #E3DDD0',
        display: 'flex', alignItems: 'center',
      }}>Hero</div>
      {HERO_MEDIA_OPTIONS.map(({ key, label }) => {
        const active = heroMedia === key;
        return (
          <button
            key={key}
            onClick={() => setHeroMedia(key)}
            aria-pressed={active}
            title={`Hero ${label}`}
            style={{
              padding: '10px 16px',
              border: 0,
              background: active ? '#1B1B1A' : 'transparent',
              color: active ? '#FBF9F5' : '#1B1B1A',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase',
              cursor: active ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center',
              fontWeight: 600,
            }}
          >
            {label}
          </button>
        );
      })}
      {heroMedia === 'video' && (
        <>
          <div className="tw-toggle-label" style={{
            padding: '10px 14px',
            fontSize: 9, letterSpacing: '0.26em', textTransform: 'uppercase',
            color: '#9A968D',
            borderLeft: '1px solid #E3DDD0',
            borderRight: '1px solid #E3DDD0',
            display: 'flex', alignItems: 'center',
          }}>Frame</div>
          {HERO_VIDEO_BG_OPTIONS.map(({ key, label }) => {
            const active = heroVideoBg === key;
            return (
              <button
                key={key}
                onClick={() => setHeroVideoBg(key)}
                aria-pressed={active}
                title={`Frame ${label}`}
                style={{
                  padding: '10px 16px',
                  border: 0,
                  background: active ? '#1B1B1A' : 'transparent',
                  color: active ? '#FBF9F5' : '#1B1B1A',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase',
                  cursor: active ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center',
                  fontWeight: 600,
                }}
              >
                {label}
              </button>
            );
          })}
        </>
      )}
      <style>{`
        @media (max-width: 600px) {
          .tw-direction-toggle { right: 12px; bottom: 12px; }
          .tw-toggle-label    { display: none !important; }
          .tw-toggle-sub      { display: none !important; }
        }
      `}</style>
    </div>
  );
}
