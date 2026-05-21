import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../theme/DirectionContext';
import Eyebrow from '../../components/Eyebrow';
import StatusChip from '../../components/StatusChip';
import AdminShell from '../../components/AdminShell';
import { useLeads } from '../../lib/queries';

const FILTER_TABS = [
  { l: 'All',              key: 'All' },
  { l: 'Buyers',           key: 'Buyer' },
  { l: 'Sellers',          key: 'Seller' },
  { l: 'Investors',        key: 'Investor' },
  { l: 'Agents / Renters', key: 'Agent' },
];

const SORT_TABS = [
  { l: 'By Date',   key: 'date' },
  { l: 'By Status', key: 'status' },
  { l: 'By Type',   key: 'type' },
];

const STATUS_RANK = { New: 0, Contacted: 1, Qualified: 2, Cold: 3 };

function sortLeads(list, key) {
  const out = [...list];
  if (key === 'status') {
    out.sort((a, b) => (STATUS_RANK[a.status] ?? 99) - (STATUS_RANK[b.status] ?? 99));
  } else if (key === 'type') {
    out.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
  } else {
    // date: newest first
    out.sort((a, b) => {
      const aT = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bT = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bT - aT;
    });
  }
  return out;
}

// Both directions share the same data + filtering logic. Visual surface is
// driven entirely by the theme primitives plus a few inline color reads.

export default function LeadsInbox() {
  const t = useTheme();
  const isB = t.key === 'B';
  const { data: LEADS, loading } = useLeads();
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('date');
  const filtered = useMemo(() => {
    const base = filter === 'All' ? LEADS : LEADS.filter(l => l.type === filter);
    return sortLeads(base, sort);
  }, [filter, sort, LEADS]);
  const counts = useMemo(() => {
    const out = { All: LEADS.length };
    for (const tab of FILTER_TABS) {
      if (tab.key === 'All') continue;
      out[tab.key] = LEADS.filter(l => l.type === tab.key).length;
    }
    return out;
  }, [LEADS]);

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <AdminShell>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        paddingBottom: 32, borderBottom: `1px solid ${t.line}`, flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <Eyebrow>The Studio Inbox · {today}</Eyebrow>
          <h1 style={{
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(36px, 3.9vw, 56px)', margin: '14px 0 0',
            letterSpacing: '-0.018em',
            color: isB ? t.palette.emerald : t.fgPage,
          }}>Leads</h1>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        padding: '24px 0', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', borderBottom: `1px solid ${t.line}`, flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {FILTER_TABS.map(f => {
            const active = filter === f.key;
            const n = counts[f.key] ?? 0;
            return (
              <span key={f.key} onClick={() => setFilter(f.key)} style={{
                fontFamily: t.eyebrowFont,
                fontSize: 11, fontWeight: isB ? 600 : 400,
                letterSpacing: isB ? '0.26em' : '0.22em',
                textTransform: 'uppercase',
                color: active ? (isB ? t.palette.emerald : t.fgPage) : t.fgFaint,
                borderBottom: active ? `1px solid ${isB ? t.palette.emerald : t.fgPage}` : '1px solid transparent',
                paddingBottom: 4, cursor: 'pointer',
                display: 'flex', alignItems: 'baseline', gap: 6,
              }}>
                {f.l} <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 12, color: t.fgFaint }}>({n})</span>
              </span>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          {SORT_TABS.map(s => {
            const active = sort === s.key;
            return (
              <span
                key={s.key}
                onClick={() => setSort(s.key)}
                style={{
                  fontFamily: t.eyebrowFont,
                  fontSize: 11, fontWeight: isB ? 600 : 400,
                  letterSpacing: isB ? '0.26em' : '0.22em',
                  textTransform: 'uppercase',
                  color: active ? (isB ? t.palette.emerald : t.fgPage) : t.fgFaint,
                  borderBottom: active ? `1px solid ${isB ? t.palette.emerald : t.fgPage}` : '1px solid transparent',
                  paddingBottom: 4, cursor: 'pointer',
                }}>{s.l}</span>
            );
          })}
        </div>
      </div>

      {/* Lead table */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 680 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '220px 120px 1fr 140px 110px',
            gap: 20, padding: '18px 0', borderBottom: `1px solid ${t.line}`,
            fontFamily: t.eyebrowFont,
            fontSize: isB ? 9 : 9.5, fontWeight: isB ? 600 : 400,
            letterSpacing: isB ? '0.28em' : '0.24em',
            textTransform: 'uppercase', color: t.fgFaint,
          }}>
            <span>Name</span><span>Type</span><span>Summary</span>
            <span>Status</span><span style={{ textAlign: 'right' }}>Received</span>
          </div>

          {filtered.map((lead) => (
            <Link key={lead.id} to={`/admin/lead/${lead.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div
                style={{
                  display: 'grid', gridTemplateColumns: '220px 120px 1fr 140px 110px',
                  gap: 20, padding: '20px 0', borderBottom: `1px solid ${t.lineSoft}`,
                  alignItems: 'center', cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.background = t.bgPanel}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{
                  fontFamily: t.fonts.display, fontSize: 17,
                  color: isB ? t.palette.emerald : t.fgPage,
                }}>{lead.name}</span>
                <span style={{
                  fontFamily: t.eyebrowFont,
                  fontSize: 10.5, fontWeight: isB ? 600 : 400,
                  letterSpacing: isB ? '0.26em' : '0.22em',
                  textTransform: 'uppercase', color: t.fgMuted,
                }}>{lead.type}</span>
                <span style={{ fontSize: 13, color: t.fgMuted, lineHeight: 1.5 }}>{lead.summary}</span>
                <StatusChip status={lead.status} />
                <span style={{ fontSize: 11, color: t.fgFaint, textAlign: 'right', letterSpacing: '0.04em' }}>
                  {lead.when}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{
        marginTop: 32, display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <span style={{
          fontFamily: t.eyebrowFont,
          fontSize: 11, fontWeight: isB ? 500 : 400,
          color: t.fgFaint,
          letterSpacing: isB ? '0.24em' : '0.18em',
          textTransform: 'uppercase',
        }}>
          {loading ? 'Loading…' : `Showing ${filtered.length} of ${LEADS.length}`}
        </span>
        <span style={{
          fontFamily: t.eyebrowFont,
          fontSize: 11, fontWeight: isB ? 600 : 400,
          color: isB ? t.palette.emerald : t.fgPage,
          letterSpacing: isB ? '0.28em' : '0.22em',
          textTransform: 'uppercase',
          borderBottom: `1px solid ${isB ? t.palette.emerald : t.fgPage}`,
          paddingBottom: 4, cursor: 'pointer',
        }}>View older leads →</span>
      </div>
    </AdminShell>
  );
}
