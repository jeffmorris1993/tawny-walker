import { useTheme } from '../../theme/DirectionContext';
import { LEAD_STATUS_SEQUENCE } from '../../data/leads';

// Segmented status changer used on the LeadDetail header. Each segment shows
// the status label + the matching colored dot from the active theme.
export default function StatusChanger({ value, onChange }) {
  const t = useTheme();
  const isB = t.key === 'B';
  const a = t.admin;
  return (
    <div style={{
      display: 'flex', border: `1px solid ${a.statusChangerBorder}`,
      background: a.statusChangerBg, flexWrap: 'wrap',
    }}>
      {LEAD_STATUS_SEQUENCE.map((status, i) => {
        const active = value === status;
        const dot = t.statusDots[status];
        return (
          <button
            key={status}
            type="button"
            onClick={() => onChange && onChange(status)}
            aria-pressed={active}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '12px 16px', border: 'none',
              background: active ? a.statusChangerActiveBg : 'transparent',
              color: active ? a.statusChangerActiveFg : a.statusChangerIdleFg,
              fontFamily: t.eyebrowFont,
              fontSize: isB ? 10 : 10.5,
              fontWeight: isB ? 600 : 400,
              letterSpacing: isB ? '0.22em' : '0.22em',
              textTransform: 'uppercase',
              borderRight: i < LEAD_STATUS_SEQUENCE.length - 1 ? `1px solid ${a.statusChangerBorder}` : 'none',
              cursor: active ? 'default' : 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />
            {status}
          </button>
        );
      })}
    </div>
  );
}
