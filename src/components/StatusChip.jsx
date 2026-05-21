import { useTheme } from '../theme/DirectionContext';

// Uses theme.statusLabels so Direction A reads "Active / Pending / Sold"
// and Direction B reads "Available / In Contract / Closed".
export default function StatusChip({ status, size = 'sm' }) {
  const t = useTheme();
  const label = t.statusLabels[status] || status;
  const dot = t.statusDots[status] || t.fgFaint;
  const f = size === 'lg' ? 12 : 10.5;
  const isB = t.key === 'B';
  return (
    <span className="tw-status-chip" style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      fontFamily: t.eyebrowFont,
      fontWeight: isB ? 600 : 400,
      fontSize: f,
      letterSpacing: isB ? '0.24em' : '0.18em',
      textTransform: 'uppercase',
      color: isB ? t.palette.emerald : t.palette.ink,
      padding: size === 'lg' ? '4px 10px' : '0',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: f * 0.55, height: f * 0.55, borderRadius: '50%', background: dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}
