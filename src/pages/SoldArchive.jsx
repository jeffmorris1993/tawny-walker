import { useRef, useState } from 'react';
import { useTheme } from '../theme/DirectionContext';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import Rule from '../components/Rule';
import PaginationBar from '../components/PaginationBar';
import { SkeletonCardB, SkeletonStyles } from '../components/SkeletonCard';
import { usePagedListings } from '../lib/queries';
import useImagesPreloaded from '../lib/useImagesPreloaded';
import { thumbUrl } from '../lib/photo';
import SEO from '../components/SEO';
import {
  ListingsGridStyles,
  UniformGrid,
  ListingCardStdB,
  SortButton,
  PAGE_SIZE,
} from './Listings';

function useSoldPage() {
  const [page, setPage] = useState(1);
  // Default sort: by sold date, newest first. Price toggles independently
  // so switching back to Price after Date keeps the prior direction.
  const [sortKey, setSortKey] = useState('date');
  const [dateAsc, setDateAsc] = useState(false);
  const [priceAsc, setPriceAsc] = useState(false);
  const sortColumn = sortKey === 'price' ? 'price_value' : 'sold_at';
  const ascending = sortKey === 'price' ? priceAsc : dateAsc;
  const { data, total, pageCount, loading } = usePagedListings({
    statusEquals: 'Sold',
    page,
    pageSize: PAGE_SIZE,
    sort: { column: sortColumn, ascending },
  });

  function chooseSort(nextKey) {
    if (nextKey === sortKey) {
      if (nextKey === 'price') setPriceAsc(v => !v);
      else                     setDateAsc(v => !v);
    } else {
      setSortKey(nextKey);
    }
    setPage(1);
  }

  return {
    page, setPage,
    listings: data, total, pageCount, loading,
    sortKey, dateAsc, priceAsc, chooseSort,
  };
}

function ArchiveB() {
  const t = useTheme();
  const { page, setPage, listings, total, pageCount, loading, sortKey, dateAsc, priceAsc, chooseSort } = useSoldPage();
  const gridRef = useRef(null);
  // Mirror the width used by ListingCardStdB so the preloader and the
  // <img> request the same transformed URL.
  const imagesReady = useImagesPreloaded(
    listings.map(l => thumbUrl(l.img, 900)),
  );
  const showSkeleton = loading || !imagesReady;

  function goToPage(p) {
    setPage(p);
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <div style={{ background: t.bgPage, fontFamily: t.fonts.body, color: t.fgPage }}>
      <SEO
        title="Sold"
        description="Recent sold placements by Tawny Walker across Birmingham, Bloomfield Hills, and the wider Metro Detroit area."
        path="/listings/sold"
      />
      <TopNav active="Listings" />

      <div style={{ padding: 'clamp(56px, 7vw, 96px) clamp(24px, 5vw, 72px) clamp(32px, 4vw, 56px)', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: t.fonts.display, fontWeight: 300,
          fontSize: 'clamp(52px, 7vw, 96px)', letterSpacing: '-0.024em',
          margin: 0, lineHeight: 0.95, color: t.palette.emerald,
        }}>
          <em style={{ fontStyle: 'italic' }}>Sold.</em>
        </h1>
        <p style={{
          fontFamily: t.fonts.display, fontStyle: 'italic',
          fontSize: 20, color: t.fgMuted, maxWidth: 640, margin: '24px auto 0', lineHeight: 1.5,
        }}>
          A selection of recent placements, {total} in total.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
          <Rule />
        </div>
      </div>

      <div ref={gridRef} style={{ padding: '0 clamp(24px, 5vw, 72px) 120px', maxWidth: 1296, margin: '0 auto', scrollMarginTop: 24 }}>
        <SortBar sortKey={sortKey} dateAsc={dateAsc} priceAsc={priceAsc} chooseSort={chooseSort} />
        <UniformGrid variant="b">
          {showSkeleton
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCardB key={`s-${i}`} />)
            : listings.map(l => <ListingCardStdB key={l.id} listing={l} />)}
        </UniformGrid>
        {!showSkeleton && listings.length === 0 && (
          <p style={{
            textAlign: 'center', padding: '64px 0',
            fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 18, color: t.fgMuted,
          }}>No closed placements yet.</p>
        )}
        <PaginationBar page={page} pageCount={pageCount} onChange={goToPage} />
        <SkeletonStyles />
      </div>

      <SiteFooter />
      <ListingsGridStyles />
    </div>
  );
}

// Sold-only sort bar — same SortButton chrome as the public Listings page,
// pared down because the page has no status filter to share row space with.
function SortBar({ sortKey, dateAsc, priceAsc, chooseSort }) {
  const t = useTheme();
  return (
    <div className="tw-filter-bar" style={{
      paddingTop: 24, paddingBottom: 16, marginBottom: 32,
      borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}`,
      display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
      flexWrap: 'wrap', gap: 16,
    }}>
      <div className="tw-filter-sort" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <span className="tw-sort-label" style={{ fontFamily: t.eyebrowFont, fontSize: 10.5, fontWeight: 500, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.fgFaint }}>Sort</span>
        <SortButton
          label="Date" active={sortKey === 'date'} ascending={dateAsc}
          onClick={() => chooseSort('date')}
        />
        <SortButton
          label="Price" active={sortKey === 'price'} ascending={priceAsc}
          onClick={() => chooseSort('price')}
        />
      </div>
    </div>
  );
}

export default function SoldArchive() {
  return <ArchiveB />;
}
