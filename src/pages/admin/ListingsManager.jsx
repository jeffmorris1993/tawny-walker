import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../theme/DirectionContext';
import Photo from '../../components/Photo';
import Eyebrow from '../../components/Eyebrow';
import StatusChip from '../../components/StatusChip';
import AdminShell from '../../components/AdminShell';
import PaginationBar from '../../components/PaginationBar';
import { SkeletonStyles } from '../../components/SkeletonCard';
import { LISTING_FILTERS, DRAFT_LISTING } from '../../data/leads';
import { usePagedListings, useListingCounts } from '../../lib/queries';

const PAGE_SIZE = 12;

export default function ListingsManager() {
  const t = useTheme();
  const isB = t.key === 'B';
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const filterRef = useRef(null);

  function goToPage(p) {
    setPage(p);
    if (filterRef.current) {
      filterRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Per-status counts come from a tiny one-shot `select status` query so the
  // filter labels stay accurate without loading every full listing row.
  const { counts: rawCounts } = useListingCounts();
  const counts = {
    All:     (rawCounts.All     || 0),
    Active:  (rawCounts.Active  || 0),
    Pending: (rawCounts.Pending || 0),
    Sold:    (rawCounts.Sold    || 0),
    Draft:   (rawCounts.Draft   || 0),
  };

  const { data: paged, total, pageCount, loading } = usePagedListings({
    statusEquals: filter === 'All' ? null : filter,
    page,
    pageSize: PAGE_SIZE,
    sort: { column: 'sort_order', ascending: true },
  });

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1); }, [filter]);

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

      <div ref={filterRef} style={{
        padding: '20px 0', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', borderBottom: `1px solid ${t.line}`, flexWrap: 'wrap', gap: 12,
        scrollMarginTop: 24,
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
        <div style={{ minWidth: 820 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '60px 80px 1.4fr 1fr 110px 110px 110px 60px',
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
            <span style={{ textAlign: 'right' }}> </span>
          </div>

          {loading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <ListingSkeletonRow key={`s-${i}`} />
              ))
            : paged.map((l, i) => (
                <Link
                  key={l.id}
                  to={`/admin/listings/${l.id}/edit`}
                  className="tw-listing-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 80px 1.4fr 1fr 110px 110px 110px 60px',
                    gap: 18, padding: '16px 0', borderBottom: `1px solid ${t.lineSoft}`,
                    alignItems: 'center',
                    textDecoration: 'none', color: 'inherit',
                  }}
                >
                  <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 18, color: t.fgFaint }}>
                    {String((page - 1) * PAGE_SIZE + i + 1).padStart(2, '0')}
                  </span>
                  <div style={{ width: 64, height: 48 }}>
                    <Photo label="" tone={l.tone} height="100%" src={l.img} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontFamily: t.fonts.display, fontSize: 19,
                      color: isB ? t.palette.emerald : t.fgPage,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{l.addr}</div>
                    <div style={{ fontSize: 11, color: t.fgFaint }}>{l.street}{l.street && l.loc ? ', ' : ''}{l.loc}</div>
                  </div>
                  <span style={{ fontSize: 11, color: t.fgMuted, letterSpacing: '0.04em' }}>{l.specs}</span>
                  <span style={{
                    fontFamily: t.fonts.display, fontSize: 18, textAlign: 'right',
                    color: isB ? t.palette.emerald : t.fgPage,
                  }}>{l.price}</span>
                  <StatusChip status={l.status} />
                  <span style={{ fontSize: 11, color: t.fgFaint, textAlign: 'right' }}>{l.listedAt || '—'}</span>
                  <span style={{
                    textAlign: 'right',
                    fontFamily: t.eyebrowFont,
                    fontSize: 10, fontWeight: isB ? 600 : 400,
                    letterSpacing: isB ? '0.24em' : '0.2em',
                    textTransform: 'uppercase',
                    color: isB ? t.palette.emerald : t.palette.ink,
                  }}>Edit →</span>
                </Link>
              ))}

          {!loading && total === 0 && (
            <div style={{
              padding: '40px 0', textAlign: 'center',
              fontFamily: t.fonts.display, fontStyle: 'italic',
              fontSize: 16, color: t.fgFaint,
            }}>No listings in this view.</div>
          )}

          {/* Draft hint row — only on the first page of the "All" view */}
          {filter === 'All' && page === 1 && !loading && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '60px 80px 1.4fr 1fr 110px 110px 110px 60px',
              gap: 18, padding: '16px 0', borderBottom: `1px solid ${t.lineSoft}`,
              alignItems: 'center', opacity: 0.65,
            }}>
              <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 18, color: t.fgFaint }}>{String(total + 1).padStart(2, '0')}</span>
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
              <span> </span>
            </div>
          )}
        </div>
      </div>

      <PaginationBar page={page} pageCount={pageCount} onChange={goToPage} />

      <div style={{
        marginTop: 18, textAlign: 'center',
        fontFamily: t.eyebrowFont,
        fontSize: 10.5, fontWeight: isB ? 500 : 400,
        color: t.fgFaint,
        letterSpacing: isB ? '0.24em' : '0.18em',
        textTransform: 'uppercase',
      }}>
        {loading
          ? 'Loading…'
          : total === 0
            ? 'No results'
            : `Showing ${(page - 1) * PAGE_SIZE + 1}–${(page - 1) * PAGE_SIZE + paged.length} of ${total}`}
      </div>

      <style>{`
        .tw-listing-row { transition: background 0.12s ease; }
        .tw-listing-row:hover { background: ${t.bgPanel}; }
      `}</style>
      <SkeletonStyles />
    </AdminShell>
  );
}

const SHIMMER = 'linear-gradient(90deg, #ECE6D8 0%, #F4EFE2 50%, #ECE6D8 100%)';

function ShimmerBar({ width, height }) {
  return (
    <span className="tw-skel-bar" style={{
      display: 'inline-block',
      width, height,
      background: SHIMMER, backgroundSize: '200% 100%',
    }} />
  );
}

// Mimics the listing table row layout so the page doesn't jump when data
// arrives.
function ListingSkeletonRow() {
  const t = useTheme();
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '60px 80px 1.4fr 1fr 110px 110px 110px 60px',
      gap: 18, padding: '16px 0', borderBottom: `1px solid ${t.lineSoft}`,
      alignItems: 'center',
    }}>
      <ShimmerBar width={28} height={14} />
      <ShimmerBar width={64} height={48} />
      <ShimmerBar width="80%" height={18} />
      <ShimmerBar width="70%" height={11} />
      <ShimmerBar width={86} height={16} />
      <ShimmerBar width={70} height={11} />
      <ShimmerBar width={64} height={10} />
      <ShimmerBar width={32} height={10} />
    </div>
  );
}
