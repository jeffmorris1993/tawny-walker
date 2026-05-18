import { useTheme } from '../../theme/DirectionContext';
import Eyebrow from '../Eyebrow';

// "Studio log" feed — events that happened inside the studio (not external
// signals like email opens). Each item gets a small colored dot, with the
// first/highlighted event using the theme accent and the rest going faint.
export default function StudioLog({ items }) {
  const t = useTheme();
  const isB = t.key === 'B';
  return (
    <div>
      <Eyebrow>Studio log</Eyebrow>
      <div style={{
        fontFamily: t.fonts.display, fontStyle: 'italic',
        fontSize: 14, color: t.fgFaint, marginTop: 6, lineHeight: 1.5,
      }}>Only what's happened inside the studio.</div>
      <div style={{ marginTop: 14 }}>
        {items.map((a, i) => (
          <div key={i} style={{
            display: 'flex', gap: 14, padding: '12px 0',
            borderBottom: `1px solid ${t.lineSoft}`,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: a.highlight ? t.accent : t.fgFaint,
              marginTop: 6, flexShrink: 0,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: isB ? t.palette.emerald : t.fgPage }}>{a.t}</div>
              <div style={{
                fontSize: 10.5, color: t.fgFaint,
                letterSpacing: '0.06em', marginTop: 2,
              }}>{a.when}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
