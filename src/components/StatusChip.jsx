import { TW } from '../tokens';

const statusMap = {
  Active:    { dot: TW.green,  label: 'Active' },
  Pending:   { dot: TW.amber,  label: 'Pending' },
  Sold:      { dot: TW.ink2,   label: 'Sold' },
  New:       { dot: TW.bronze, label: 'New Lead' },
  Contacted: { dot: TW.ink3,   label: 'Contacted' },
  Qualified: { dot: TW.green,  label: 'Qualified' },
  Cold:      { dot: TW.ink4,   label: 'Cold' },
};

export default function StatusChip({ status, size = 'sm' }) {
  const m = statusMap[status] || { dot: TW.ink3, label: status };
  const f = size === 'lg' ? 12 : 10.5;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      fontSize: f, letterSpacing: '0.18em', textTransform: 'uppercase',
      color: TW.ink, padding: size === 'lg' ? '4px 10px' : '0',
    }}>
      <span style={{ width: f * 0.55, height: f * 0.55, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  );
}
