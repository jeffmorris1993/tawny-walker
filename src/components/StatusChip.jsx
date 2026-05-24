import { useTheme } from '../theme/DirectionContext';

// Uses theme.statusLabels for listing statuses (Active/Pending/Sold). When
// rendering a lead's status, pass kind="lead" so the chip looks up
// theme.leadStatusLabels instead — the two enums share key names (e.g.
// "Active") but mean different things, so the maps stay separate.
export default function StatusChip({ status, size = 'sm', kind = 'listing' }) {
  const t = useTheme();
  const labels = kind === 'lead' ? t.leadStatusLabels : t.statusLabels;
  const dots = kind === 'lead' ? t.leadStatusDots : t.statusDots;
  const label = labels[status] || status;
  const dot = dots[status] || t.fgFaint;
  const f = size === 'lg' ? 12 : 10.5;
  return (
    <span className="tw-status-chip" style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      fontFamily: t.eyebrowFont,
      fontWeight: 600,
      fontSize: f,
      letterSpacing: '0.24em',
      textTransform: 'uppercase',
      color: t.palette.emerald,
      padding: size === 'lg' ? '4px 10px' : '0',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: f * 0.55, height: f * 0.55, borderRadius: '50%', background: dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}
