import { useTheme } from '../../theme/DirectionContext';

// Single sort-aware column header used by every admin table. Renders the
// label + ↕ → ↓ → ↑ chevron, goes emerald + gold-arrow when active.
//
// Props:
//   label           plain text shown in the header
//   k               the sort key passed back to onClick
//   sort            { key, dir }
//   onClick         (key) => void
//   align           'left' | 'right' (right-aligns price/listed columns)
//   gold            override the active-arrow color (defaults to '#B59568')
//   headlineColor   the active text color (defaults to theme.fgPage or B's emerald)
export default function SortHeader({ label, k, sort, onClick, align, gold = '#B59568', headlineColor }) {
  const t = useTheme();
  const active = sort.key === k;
  const arrow = active ? (sort.dir === 'asc' ? '↓' : '↑') : '↕';
  const justify = align === 'right' ? 'flex-end' : 'flex-start';
  const activeColor = headlineColor || t.palette.emerald;
  return (
    <span style={{ textAlign: align || 'left' }}>
      <button
        type="button"
        onClick={() => onClick(k)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'none', border: 0, padding: 0,
          fontFamily: t.eyebrowFont,
          fontSize: 9, fontWeight: 600,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: active ? activeColor : t.fgFaint,
          cursor: 'pointer',
          justifyContent: justify,
          width: align === 'right' ? '100%' : 'auto',
        }}
      >
        <span>{label}</span>
        <span style={{
          opacity: active ? 1 : 0.35,
          color: active ? gold : 'inherit',
          fontSize: 10, lineHeight: 1,
        }}>{arrow}</span>
      </button>
    </span>
  );
}
