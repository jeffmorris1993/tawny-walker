import { useDirection } from '../theme/DirectionContext';
import { THEMES, DIRECTION_KEYS } from '../theme/themes';

// Floating bottom-right A | B switch. Always rendered in Direction A's neutral
// chrome so it reads the same on both directions and never depends on the page
// background being light or dark.
export default function DirectionToggle() {
  const { direction, setDirection, theme } = useDirection();

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
      <style>{`
        @media (max-width: 480px) {
          .tw-direction-toggle { right: 12px; bottom: 12px; }
          .tw-toggle-label    { display: none !important; }
          .tw-toggle-sub      { display: none !important; }
        }
      `}</style>
    </div>
  );
}
