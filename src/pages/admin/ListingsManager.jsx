import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../theme/DirectionContext';
import Photo from '../../components/Photo';
import Eyebrow from '../../components/Eyebrow';
import StatusChip from '../../components/StatusChip';
import AdminShell from '../../components/AdminShell';
import { LISTING_FILTERS, DRAFT_LISTING } from '../../data/leads';
import { useListings } from '../../lib/queries';

export default function ListingsManager() {
  const t = useTheme();
  const isB = t.key === 'B';
  const [filter, setFilter] = useState('All');
  const { data: LISTINGS } = useListings();

  const counts = useMemo(() => {
    const out = { All: LISTINGS.length, Draft: 0 };
    for (const status of ['Active', 'Pending', 'Sold', 'Draft']) {
      out[status] = LISTINGS.filter(l => l.status === status).length;
    }
    return out;
  }, [LISTINGS]);

  const filtered = useMemo(() => {
    if (filter === 'All') return LISTINGS;
    if (filter === 'Draft') return LISTINGS.filter(l => l.status === 'Draft');
    return LISTINGS.filter(l => l.status === filter);
  }, [filter, LISTINGS]);

  const activeYTD = counts.Active || 0;
  const closedYTD = counts.Sold || 0;
  const headlineColor = isB ? t.palette.emerald : t.fgPage;
  const primaryBg = isB ? t.palette.emerald : t.palette.ink;
  const primaryFg = isB ? '#fff' : t.palette.bone;

  return (
    <AdminShell>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        paddingBottom: 32, borderBottom: `1px solid ${t.line}`, flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <Eyebrow>The Index · {activeYTD} active · {closedYTD} {isB ? 'closed' : 'sold'} YTD</Eyebrow>
          <h1 style={{
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(36px, 3.9vw, 56px)', margin: '14px 0 0',
            letterSpacing: '-0.018em', color: headlineColor,
          }}>{t.admin.indexHeadline}</h1>
        </div>
        <Link to="/admin/listings/add" style={{ textDecoration: 'none' }}>
          <span style={{
            display: 'inline-block', padding: '14px 22px',
            background: primaryBg, color: primaryFg,
            fontFamily: t.eyebrowFont,
            fontSize: 11, fontWeight: isB ? 600 : 400,
            letterSpacing: isB ? '0.28em' : '0.24em',
            textTransform: 'uppercase', cursor: 'pointer',
          }}>{t.admin.addCta}</span>
        </Link>
      </div>

      <div style={{
        padding: '20px 0', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', borderBottom: `1px solid ${t.line}`, flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {LISTING_FILTERS.map(key => {
            const active = filter === key;
            const label = t.statusLabels[key] || key;
            const count = counts[key] ?? 0;
            return (
              <span key={key} onClick={() => setFilter(key)} style={{
                fontFamily: t.eyebrowFont,
                fontSize: 11, fontWeight: isB ? 600 : 400,
                letterSpacing: isB ? '0.26em' : '0.22em',
                textTransform: 'uppercase',
                color: active ? headlineColor : t.fgFaint,
                borderBottom: active ? `1px solid ${headlineColor}` : '1px solid transparent',
                paddingBottom: 4, cursor: 'pointer',
              }}>{label} ({count})</span>
            );
          })}
        </div>
        <span style={{
          fontFamily: t.eyebrowFont,
          fontSize: 11, fontWeight: isB ? 500 : 400,
          color: t.fgFaint,
          letterSpacing: isB ? '0.24em' : '0.18em',
          textTransform: 'uppercase',
        }}>Sort · By Date Listed ↓</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 760 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '60px 80px 1.4fr 1fr 110px 110px 110px',
            gap: 18, padding: '16px 0', borderBottom: `1px solid ${t.line}`,
            fontFamily: t.eyebrowFont,
            fontSize: isB ? 9 : 9.5, fontWeight: isB ? 600 : 400,
            letterSpacing: isB ? '0.28em' : '0.24em',
            textTransform: 'uppercase', color: t.fgFaint,
          }}>
            <span>No.</span><span>Image</span><span>Property</span><span>Specs</span>
            <span style={{ textAlign: 'right' }}>Price</span>
            <span>Status</span>
            <span style={{ textAlign: 'right' }}>Listed</span>
          </div>

          {filtered.map((l, i) => (
            <div key={l.id} style={{
              display: 'grid', gridTemplateColumns: '60px 80px 1.4fr 1fr 110px 110px 110px',
              gap: 18, padding: '16px 0', borderBottom: `1px solid ${t.lineSoft}`, alignItems: 'center',
            }}>
              <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 18, color: t.fgFaint }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div style={{ width: 64, height: 48 }}>
                <Photo label="" tone={l.tone} height="100%" />
              </div>
              <div>
                <div style={{ fontFamily: t.fonts.display, fontSize: 19, color: isB ? t.palette.emerald : t.fgPage }}>{l.addr}</div>
                <div style={{ fontSize: 11, color: t.fgFaint }}>{l.street}, {l.loc}</div>
              </div>
              <span style={{ fontSize: 11, color: t.fgMuted, letterSpacing: '0.04em' }}>{l.specs}</span>
              <span style={{
                fontFamily: t.fonts.display, fontSize: 18, textAlign: 'right',
                color: isB ? t.palette.emerald : t.fgPage,
              }}>{l.price}</span>
              <StatusChip status={l.status} />
              <span style={{ fontSize: 11, color: t.fgFaint, textAlign: 'right' }}>Mar 22</span>
            </div>
          ))}

          {/* Draft row — always rendered last as a composer hint */}
          <div style={{
            display: 'grid', gridTemplateColumns: '60px 80px 1.4fr 1fr 110px 110px 110px',
            gap: 18, padding: '16px 0', borderBottom: `1px solid ${t.lineSoft}`,
            alignItems: 'center', opacity: 0.65,
          }}>
            <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 18, color: t.fgFaint }}>07</span>
            <div style={{
              width: 64, height: 48, background: t.lineSoft, border: `1px dashed ${t.line}`,
              display: 'grid', placeItems: 'center', fontSize: 11, color: t.fgFaint,
            }}>+</div>
            <div>
              <div style={{
                fontFamily: t.fonts.display, fontSize: 19, fontStyle: 'italic',
                color: isB ? t.palette.emerald : t.fgPage,
              }}>{DRAFT_LISTING.name}</div>
              <div style={{ fontSize: 11, color: t.fgFaint }}>Address pending</div>
            </div>
            <span style={{ fontSize: 11, color: t.fgFaint }}>— —</span>
            <span style={{
              fontFamily: t.fonts.display, fontSize: 18, textAlign: 'right', color: t.fgFaint,
            }}>$—</span>
            <span style={{
              fontFamily: t.eyebrowFont,
              fontSize: isB ? 10 : 10.5, fontWeight: isB ? 600 : 400,
              letterSpacing: isB ? '0.22em' : '0.18em',
              textTransform: 'uppercase', color: t.fgFaint,
            }}>● Draft</span>
            <span style={{ fontSize: 11, color: t.fgFaint, textAlign: 'right' }}>May 12</span>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
