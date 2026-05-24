import { useTheme } from '../../theme/DirectionContext';

// Single facet row — label on the left, pill cluster on the right. Each
// pill is a toggleable button (multi-select via Sets). Counts can be
// omitted by leaving `facets[].count` undefined; if a count is exactly 0
// the pill renders disabled at reduced opacity.
//
// Props:
//   label          'Role', 'Status', 'Neighborhood', ...
//   facets         [{ key, label, count?, dot? }]
//   selected       Set<key>
//   onToggle       (key) => void
//   showCounts     (bool) default false — render the italic n badge per pill
export default function FacetRow({ label, facets, selected, onToggle, showCounts = false }) {
  const t = useTheme();
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '96px 1fr', gap: 18, alignItems: 'center',
    }}>
      <span style={{
        fontFamily: t.eyebrowFont,
        fontSize: 10, fontWeight: 600,
        letterSpacing: '0.32em',
        textTransform: 'uppercase', color: t.fgFaint,
      }}>{label}</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {facets.map(f => {
          const isVacant = f.count === 0;
          const isActive = selected.has(f.key);
          return (
            <FacetPill
              key={f.key}
              label={f.label}
              dot={f.dot}
              count={showCounts ? f.count : undefined}
              active={isActive}
              vacant={isVacant}
              onClick={() => !isVacant && onToggle(f.key)}
            />
          );
        })}
      </div>
    </div>
  );
}

function FacetPill({ label, dot, count, active, vacant, onClick }) {
  const t = useTheme();
  const inkActive = '#FFFFFF';
  const activeBg = t.palette.emerald;
  const activeDot = t.palette.gold;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={vacant}
      aria-pressed={active}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 9,
        height: 32, padding: '0 14px',
        background: active ? activeBg : t.bgPage,
        border: `1px solid ${active ? activeBg : t.line}`,
        fontFamily: t.eyebrowFont,
        fontSize: 11, fontWeight: active ? 600 : 500,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color: active ? inkActive : t.fgMuted,
        cursor: vacant ? 'default' : 'pointer',
        opacity: vacant ? 0.45 : 1,
        transition: 'background 0.15s, border-color 0.15s, color 0.15s',
        userSelect: 'none',
      }}
    >
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: active ? activeDot : (vacant ? t.line : (dot || t.fgFaint)),
        transition: 'background 0.15s',
      }} />
      <span>{label}</span>
      {count !== undefined && (
        <span style={{
          fontFamily: t.fonts.display, fontStyle: 'italic',
          fontSize: 13, color: active ? t.palette.goldSoft : t.fgFaint,
          letterSpacing: 0, marginLeft: 2,
        }}>{count}</span>
      )}
    </button>
  );
}
