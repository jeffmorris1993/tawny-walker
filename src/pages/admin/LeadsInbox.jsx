import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../theme/DirectionContext';
import Photo from '../../components/Photo';
import Eyebrow from '../../components/Eyebrow';
import StatusChip from '../../components/StatusChip';
import AdminShell from '../../components/AdminShell';
import { LEADS, LEAD_FILTERS } from '../../data/leads';

// Both directions share the same data + filtering logic. Visual surface is
// driven entirely by the theme primitives plus a few inline color reads.

export default function LeadsInbox() {
  const t = useTheme();
  const isB = t.key === 'B';
  const [filter, setFilter] = useState('All');
  const filtered = useMemo(
    () => filter === 'All' ? LEADS : LEADS.filter(l => l.type === filter),
    [filter],
  );

  return (
    <AdminShell>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        paddingBottom: 32, borderBottom: `1px solid ${t.line}`, flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <Eyebrow>The Studio Inbox · May 16, 2026</Eyebrow>
          <h1 style={{
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(36px, 3.9vw, 56px)', margin: '14px 0 0',
            letterSpacing: '-0.018em',
            color: isB ? t.palette.emerald : t.fgPage,
          }}>Leads</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: t.eyebrowFont,
            fontSize: isB ? 10.5 : 11, fontWeight: isB ? 600 : 400,
            letterSpacing: isB ? '0.28em' : '0.22em',
            textTransform: 'uppercase', color: t.fgFaint,
          }}>This week</span>
          <span style={{
            fontFamily: t.fonts.display, fontSize: 28,
            color: isB ? t.palette.emerald : t.fgPage,
          }}>12 <span style={{ fontStyle: 'italic', color: t.fgFaint, fontSize: 18 }}>arrived</span></span>
          <span style={{
            fontFamily: t.fonts.display, fontSize: 28, marginLeft: 16,
            color: isB ? t.palette.emerald : t.fgPage,
          }}>9 <span style={{ fontStyle: 'italic', color: t.fgFaint, fontSize: 18 }}>answered</span></span>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        padding: '24px 0', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', borderBottom: `1px solid ${t.line}`, flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {LEAD_FILTERS.map(f => {
            const active = filter === f.key;
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
                {f.l} <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 12, color: t.fgFaint }}>({f.n})</span>
              </span>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          {['By Status', 'By Type', 'By Date'].map((s, i) => (
            <span key={s} style={{
              fontFamily: t.eyebrowFont,
              fontSize: 11, fontWeight: isB ? (i === 0 ? 600 : 500) : 400,
              letterSpacing: isB ? '0.26em' : '0.22em',
              textTransform: 'uppercase',
              color: i === 0 ? (isB ? t.palette.emerald : t.fgPage) : t.fgFaint,
              borderBottom: i === 0 ? `1px solid ${isB ? t.palette.emerald : t.fgPage}` : '1px solid transparent',
              paddingBottom: 4,
            }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Lead table */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 720 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '80px 220px 120px 1fr 140px 110px',
            gap: 20, padding: '18px 0', borderBottom: `1px solid ${t.line}`,
            fontFamily: t.eyebrowFont,
            fontSize: isB ? 9 : 9.5, fontWeight: isB ? 600 : 400,
            letterSpacing: isB ? '0.28em' : '0.24em',
            textTransform: 'uppercase', color: t.fgFaint,
          }}>
            <span>No.</span><span>Name</span><span>Type</span><span>Summary</span>
            <span>Status</span><span style={{ textAlign: 'right' }}>Received</span>
          </div>

          {filtered.map((lead, i) => (
            <Link key={lead.id} to={`/admin/lead/${lead.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div
                style={{
                  display: 'grid', gridTemplateColumns: '80px 220px 120px 1fr 140px 110px',
                  gap: 20, padding: '20px 0', borderBottom: `1px solid ${t.lineSoft}`,
                  alignItems: 'center', cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.background = t.bgPanel}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 18, color: t.fgFaint }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3].map(s => (
                      <span key={s} style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: s <= lead.stars ? t.accent : t.line,
                      }} />
                    ))}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, flexShrink: 0 }}>
                    <Photo label="" tone={lead.tone} height="100%" />
                  </div>
                  <span style={{
                    fontFamily: t.fonts.display, fontSize: 17,
                    color: isB ? t.palette.emerald : t.fgPage,
                  }}>{lead.name}</span>
                </div>
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
        }}>Showing {filtered.length} of 12 · Active filter: This Week</span>
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
