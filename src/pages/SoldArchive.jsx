import { useRef, useState } from 'react';
import { useTheme } from '../theme/DirectionContext';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import Rule from '../components/Rule';
import PaginationBar from '../components/PaginationBar';
import { SkeletonCardB, SkeletonStyles } from '../components/SkeletonCard';
import { usePagedListings } from '../lib/queries';
import {
  ListingsGridStyles,
  UniformGrid,
  ListingCardStdB,
  PAGE_SIZE,
} from './Listings';

function useSoldPage() {
  const [page, setPage] = useState(1);
  const { data, total, pageCount, loading } = usePagedListings({
    statusEquals: 'Sold',
    page,
    pageSize: PAGE_SIZE,
  });
  return { page, setPage, listings: data, total, pageCount, loading };
}

function ArchiveB() {
  const t = useTheme();
  const { page, setPage, listings, total, pageCount, loading } = useSoldPage();
  const gridRef = useRef(null);

  function goToPage(p) {
    setPage(p);
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        <UniformGrid variant="b">
          {loading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCardB key={`s-${i}`} />)
            : listings.map(l => <ListingCardStdB key={l.id} listing={l} />)}
        </UniformGrid>
        {!loading && listings.length === 0 && (
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

export default function SoldArchive() {
  return <ArchiveB />;
}
