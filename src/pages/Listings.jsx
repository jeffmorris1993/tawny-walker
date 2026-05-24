import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../theme/DirectionContext';
import Photo from '../components/Photo';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import StatusChip from '../components/StatusChip';
import Button from '../components/Button';
import Rule from '../components/Rule';
import PaginationBar from '../components/PaginationBar';
import { SkeletonCardB, SkeletonStyles } from '../components/SkeletonCard';
import { usePagedListings, useListingCounts } from '../lib/queries';
import { dashIfBlank } from '../lib/format';

// Each listing card links into its detail page.
const linkStyle = { textDecoration: 'none', color: 'inherit', display: 'block' };

const PUBLIC_FILTERS = ['All', 'Coming Soon', 'Active', 'Pending'];
const PAGE_SIZE = 12;

// Stage-aware empty state — speaks to the filter the visitor is on rather
// than the generic "no results".
const EMPTY_COPY = {
  All:           'No listings to show at the moment.',
  'Coming Soon': 'No previews to share just yet.',
  Active:        'No active listings to show at the moment.',
  Pending:       'No listings under contract right now.',
};

// Public listings excludes sold properties entirely — those live in the
// Sold Archive page. The filter bar only exposes All / Active / Pending.
function usePublicListings() {
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  // Default: highest-price first (matches the "By Price ↓" label that
  // shipped before the toggle was interactive).
  const [priceAsc, setPriceAsc] = useState(false);
  const { counts: rawCounts } = useListingCounts();
  const statusEquals = filter === 'All' ? null : filter;
  const { data, total, pageCount, loading } = usePagedListings({
    statusEquals,
    statusNotIn: ['Sold', 'Draft'],
    page,
    pageSize: PAGE_SIZE,
    sort: { column: 'price_value', ascending: priceAsc },
  });

  // Active inventory counts (sold excluded) so the filter bar labels stay
  // accurate even though the page itself only loads PAGE_SIZE rows.
  const active = rawCounts.Active || 0;
  const pending = rawCounts.Pending || 0;
  const coming = rawCounts['Coming Soon'] || 0;
  const counts = {
    All: coming + active + pending,
    'Coming Soon': coming,
    Active: active,
    Pending: pending,
  };

  function changeFilter(nextFilter) {
    if (nextFilter === filter) return;
    setFilter(nextFilter);
    setPage(1);
  }

  function togglePriceSort() {
    setPriceAsc(v => !v);
    setPage(1);
  }

  return {
    filter, setFilter: changeFilter,
    page, setPage,
    listings: data, total, pageCount,
    counts, soldCount: rawCounts.Sold || 0,
    loading,
    priceAsc, togglePriceSort,
  };
}

// Card-line specs render as Beds · Baths · Sq Ft on every viewport. Lot
// acreage is dropped to keep the card tidy. Falls back to building the
// string from individual columns when `listing.specs` isn't set.
function cardSpecs(listing) {
  if (listing.specs) {
    return listing.specs.split(' · ').slice(0, 3).join(' · ');
  }
  const parts = [];
  if (listing.beds)  parts.push(`${listing.beds} BD`);
  if (listing.baths) parts.push(`${listing.baths} BA`);
  if (listing.sqft)  parts.push(`${listing.sqft} SF`);
  return parts.join(' · ');
}

// Uniform 3-up grid used by both Listings and the Sold Archive. Each card
// renders at the same scale regardless of how many listings are in the row.
function UniformGrid({ children, variant = 'a' }) {
  const gap = variant === 'b' ? 32 : 40;
  return (
    <div className="tw-grid-3" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap,
    }}>{children}</div>
  );
}

function ListingsB() {
  const t = useTheme();
  const { filter, setFilter, page, setPage, listings, pageCount, counts, soldCount, loading, priceAsc, togglePriceSort } = usePublicListings();
  const filterRef = useRef(null);

  function goToPage(p) {
    setPage(p);
    if (filterRef.current) {
      filterRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <div style={{ background: t.bgPage, fontFamily: t.fonts.body, color: t.fgPage }}>
      <TopNav active="Listings" />

      <div style={{ padding: 'clamp(56px, 7vw, 96px) clamp(24px, 5vw, 72px) clamp(32px, 4vw, 56px)', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: t.fonts.display, fontWeight: 300,
          fontSize: 'clamp(52px, 7vw, 96px)', letterSpacing: '-0.024em',
          margin: 0, lineHeight: 0.95, color: t.palette.emerald,
        }}>
          Current <em style={{ fontStyle: 'italic' }}>{t.listingNoun}.</em>
        </h1>
        <p style={{
          fontFamily: t.fonts.display, fontStyle: 'italic',
          fontSize: 20, color: t.fgMuted, maxWidth: 640, margin: '24px auto 0', lineHeight: 1.5,
        }}>
          {counts.All} properties currently represented by Tawny, a small fraction of the Michigan market, chosen with intent.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
          <Rule />
        </div>
      </div>

      <div ref={filterRef} style={{ padding: '0 clamp(24px, 5vw, 72px) 56px', maxWidth: 1296, margin: '0 auto', scrollMarginTop: 24 }}>
        <FilterBarB filter={filter} setFilter={setFilter} counts={counts} priceAsc={priceAsc} togglePriceSort={togglePriceSort} />
      </div>

      <div style={{ padding: '0 clamp(24px, 5vw, 72px) 96px', maxWidth: 1296, margin: '0 auto' }}>
        <UniformGrid variant="b">
          {loading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCardB key={`s-${i}`} />)
            : listings.map(l => <ListingCardStdB key={l.id} listing={l} />)}
        </UniformGrid>
        {!loading && listings.length === 0 && (
          <p style={{
            textAlign: 'center', padding: '64px 0',
            fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 18, color: t.fgMuted,
          }}>{EMPTY_COPY[filter] || EMPTY_COPY.All}</p>
        )}
        <PaginationBar page={page} pageCount={pageCount} onChange={goToPage} />
        <SkeletonStyles />
      </div>

      <div id="archive" style={{ padding: '96px clamp(24px, 5vw, 72px)', borderTop: `1px solid ${t.line}`, background: t.bgPanel, textAlign: 'center' }}>
        <h2 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(40px, 4.7vw, 64px)', margin: '0 0 32px', letterSpacing: '-0.02em', color: t.palette.emerald, lineHeight: 1.05 }}>
          {soldCount} <em style={{ fontStyle: 'italic' }}>sold</em> listings.
        </h2>
        <Button to="/listings/sold" variant="secondary">View All</Button>
      </div>

      <SiteFooter />
      <ListingsGridStyles />
    </div>
  );
}

function FilterBarB({ filter, setFilter, counts, priceAsc, togglePriceSort }) {
  const t = useTheme();
  return (
    <div className="tw-filter-bar" style={{
      paddingTop: 24, paddingBottom: 16,
      borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}`,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      flexWrap: 'wrap', gap: 16,
    }}>
      <div className="tw-filter-tabs" style={{ display: 'flex', gap: 36, flexWrap: 'wrap' }}>
        {PUBLIC_FILTERS.map(f => (
          <span key={f} onClick={() => setFilter(f)} className="tw-filter-chip" style={{
            fontFamily: t.eyebrowFont,
            fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase',
            color: filter === f ? t.palette.emerald : t.fgFaint,
            borderBottom: filter === f ? `1px solid ${t.palette.emerald}` : '1px solid transparent',
            paddingBottom: 6, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>{t.statusLabels[f] || f} ({counts[f] ?? 0})</span>
        ))}
      </div>
      <div className="tw-filter-sort" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <span className="tw-sort-label" style={{ fontFamily: t.eyebrowFont, fontSize: 10.5, fontWeight: 500, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.fgFaint }}>Sort</span>
        <button
          type="button"
          onClick={togglePriceSort}
          aria-label={`Sort by price ${priceAsc ? 'ascending' : 'descending'}`}
          className="tw-filter-chip tw-sort-btn"
          style={{
            background: 'transparent', border: 'none', padding: '0 0 4px',
            fontFamily: t.eyebrowFont, fontSize: 11, fontWeight: 600,
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: t.palette.emerald, borderBottom: `1px solid ${t.palette.emerald}`,
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >By Price {priceAsc ? '↑' : '↓'}</button>
      </div>
    </div>
  );
}

function ListingCardStdB({ listing }) {
  const t = useTheme();
  const muted = listing.status === 'Sold';
  return (
    <Link to={`/listings/${listing.id}`} style={{ ...linkStyle, background: '#fff', border: `1px solid ${t.line}` }}>
      <div style={{ position: 'relative' }}>
        <Photo label="" tone={listing.tone} height={260} src={listing.img} />
        <div style={{ position: 'absolute', top: 14, left: 14, padding: '5px 10px', background: '#fff' }}>
          <StatusChip status={listing.status} />
        </div>
      </div>
      <div style={{ padding: '20px 24px 24px' }}>
        <h3 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 26, letterSpacing: '-0.012em', color: t.palette.emerald, margin: 0, lineHeight: 1.05 }}>{dashIfBlank(listing.addr)}</h3>
        <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 15, color: t.fgMuted, marginTop: 4 }}>{dashIfBlank(listing.street)}</div>
        <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 13.5, color: t.fgFaint }}>{dashIfBlank(listing.loc)}</div>
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontFamily: t.fonts.display, fontSize: 22, color: muted ? t.fgFaint : t.palette.emerald, fontWeight: 400 }}>{dashIfBlank(listing.price)}</span>
          <span style={{ fontFamily: t.eyebrowFont, fontSize: 9, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.fgFaint }}>{dashIfBlank(cardSpecs(listing))}</span>
        </div>
      </div>
    </Link>
  );
}

function ListingsGridStyles() {
  return (
    <style>{`
      @media (max-width: 1000px) {
        .tw-grid-3 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
      }
      @media (max-width: 600px) {
        .tw-grid-3 { grid-template-columns: 1fr !important; }
        /* Filter bar on phones: stack tabs on top, sort underneath,
           tighter type so all three filters fit on a single line. */
        .tw-filter-bar {
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 14px !important;
        }
        .tw-filter-tabs {
          gap: 18px !important;
          justify-content: space-between !important;
        }
        .tw-filter-sort {
          justify-content: flex-end !important;
          gap: 14px !important;
        }
        .tw-filter-chip {
          font-size: 10px !important;
          letter-spacing: 0.16em !important;
          padding-bottom: 4px !important;
        }
        .tw-sort-label {
          font-size: 9.5px !important;
          letter-spacing: 0.16em !important;
        }
      }
    `}</style>
  );
}

export default function Listings() {
  return <ListingsB />;
}

// Exports the uniform grid + card components so the Sold Listings page can
// reuse the exact same surface.
export {
  ListingsGridStyles,
  UniformGrid,
  ListingCardStdB,
  PAGE_SIZE,
};
