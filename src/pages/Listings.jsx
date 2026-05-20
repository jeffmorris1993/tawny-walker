import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../theme/DirectionContext';
import Photo from '../components/Photo';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import StatusChip from '../components/StatusChip';
import Button from '../components/Button';
import Rule from '../components/Rule';
import { useListings } from '../lib/queries';

// Each listing card links into its detail page.
const linkStyle = { textDecoration: 'none', color: 'inherit', display: 'block' };

const PUBLIC_FILTERS = ['All', 'Active', 'Pending'];

// Public listings excludes sold properties entirely — those live in the
// Sold Archive page. The filter bar only exposes All / Active / Pending.
function usePublicListings() {
  const { data: ALL, loading } = useListings();
  const [filter, setFilter] = useState('All');
  const LISTINGS = useMemo(() => ALL.filter(l => l.status !== 'Sold'), [ALL]);
  const soldCount = useMemo(() => ALL.filter(l => l.status === 'Sold').length, [ALL]);
  const filtered = useMemo(
    () => (filter === 'All' ? LISTINGS : LISTINGS.filter(l => l.status === filter)),
    [filter, LISTINGS],
  );
  const counts = useMemo(() => ({
    All: LISTINGS.length,
    Active: LISTINGS.filter(l => l.status === 'Active').length,
    Pending: LISTINGS.filter(l => l.status === 'Pending').length,
  }), [LISTINGS]);
  return { filter, setFilter, filtered, counts, all: LISTINGS, soldCount, loading };
}

// ─── DIRECTION A ────────────────────────────────────────────────────────────
function ListingsA() {
  const t = useTheme();
  const { filter, setFilter, filtered, counts, all: LISTINGS, soldCount } = usePublicListings();

  return (
    <div style={{ background: t.bgPage, fontFamily: t.fonts.body, color: t.fgPage }}>
      <TopNav active="Listings" />

      <div style={{ padding: 'clamp(48px, 6.1vw, 88px) clamp(24px, 4.4vw, 64px) clamp(32px, 3.9vw, 56px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <h1 style={{ fontFamily: t.fonts.display, fontWeight: 300, fontSize: 'clamp(52px, 6.7vw, 96px)', letterSpacing: '-0.022em', margin: 0, lineHeight: 0.95 }}>
              Current <em style={{ fontStyle: 'italic' }}>{t.listingNoun}</em>.
            </h1>
          </div>
          <p style={{ maxWidth: 380, textAlign: 'right', fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 19, color: t.fgMuted, lineHeight: 1.45, margin: 0 }}>
            {LISTINGS.length} properties currently represented by Tawny, a fraction of the Michigan luxury market, chosen with intent.
          </p>
        </div>

        <FilterBarA filter={filter} setFilter={setFilter} counts={counts} />
      </div>

      <div style={{ padding: '0 clamp(24px, 4.4vw, 64px) clamp(64px, 8.3vw, 120px)' }}>
        <UniformGrid>
          {filtered.map(l => <ListingCardStdA key={l.id} listing={l} />)}
        </UniformGrid>
      </div>

      <div id="archive" style={{ padding: '96px clamp(24px, 4.4vw, 64px)', borderTop: `1px solid ${t.line}`, background: t.bgPanel, textAlign: 'center' }}>
        <h2 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(40px, 4.4vw, 64px)', margin: '0 0 28px', letterSpacing: '-0.018em' }}>
          {soldCount} <em style={{ fontStyle: 'italic' }}>sold</em> listings.
        </h2>
        <Button to="/listings/sold" variant="secondary">View All</Button>
      </div>

      <SiteFooter />
      <ListingsGridStyles />
    </div>
  );
}

function FilterBarA({ filter, setFilter, counts }) {
  const t = useTheme();
  return (
    <div style={{ marginTop: 72, paddingTop: 28, paddingBottom: 12, borderTop: `1px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        {PUBLIC_FILTERS.map(f => (
          <span key={f} onClick={() => setFilter(f)} style={{
            fontSize: 11.5, letterSpacing: '0.24em', textTransform: 'uppercase',
            color: filter === f ? t.palette.ink : t.fgFaint,
            borderBottom: filter === f ? `1px solid ${t.palette.ink}` : '1px solid transparent',
            paddingBottom: 6, cursor: 'pointer',
          }}>{t.statusLabels[f] || f} ({counts[f] ?? 0})</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <span style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.fgFaint }}>Sort</span>
        <span style={{ fontSize: 11.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.palette.ink, borderBottom: `1px solid ${t.palette.ink}`, paddingBottom: 4 }}>By Price ↓</span>
      </div>
    </div>
  );
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

function ListingCardStdA({ listing }) {
  const t = useTheme();
  const muted = listing.status === 'Sold';
  return (
    <Link to={`/listings/${listing.id}`} style={linkStyle}>
      <div style={{ position: 'relative' }}>
        <Photo label="" tone={listing.tone} height={280} src={listing.img} />
        <div style={{ position: 'absolute', top: 14, left: 14, padding: '5px 10px', background: 'rgba(251,249,245,0.95)' }}>
          <StatusChip status={listing.status} />
        </div>
      </div>
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <h3 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 26, letterSpacing: '-0.012em', margin: 0 }}>{listing.addr}</h3>
          <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 16, color: t.fgMuted, marginTop: 2 }}>{listing.street}</div>
          <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 14, color: t.fgFaint }}>{listing.loc}</div>
        </div>
      </div>
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: t.fonts.display, fontSize: 22, color: muted ? t.fgFaint : t.fgPage }}>{listing.price}</span>
        <span style={{ fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.fgFaint }}>{listing.specs}</span>
      </div>
    </Link>
  );
}

// ─── DIRECTION B ────────────────────────────────────────────────────────────
function ListingsB() {
  const t = useTheme();
  const { filter, setFilter, filtered, counts, all: LISTINGS, soldCount } = usePublicListings();

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
          {LISTINGS.length} properties currently represented by Tawny, a small fraction of the Michigan market, chosen with intent.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
          <Rule />
        </div>
      </div>

      <div style={{ padding: '0 clamp(24px, 5vw, 72px) 56px', maxWidth: 1296, margin: '0 auto' }}>
        <FilterBarB filter={filter} setFilter={setFilter} counts={counts} />
      </div>

      <div style={{ padding: '0 clamp(24px, 5vw, 72px) 96px', maxWidth: 1296, margin: '0 auto' }}>
        <UniformGrid variant="b">
          {filtered.map(l => <ListingCardStdB key={l.id} listing={l} />)}
        </UniformGrid>
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

function FilterBarB({ filter, setFilter, counts }) {
  const t = useTheme();
  return (
    <div style={{
      paddingTop: 24, paddingBottom: 16,
      borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}`,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      flexWrap: 'wrap', gap: 16,
    }}>
      <div style={{ display: 'flex', gap: 36, flexWrap: 'wrap' }}>
        {PUBLIC_FILTERS.map(f => (
          <span key={f} onClick={() => setFilter(f)} style={{
            fontFamily: t.eyebrowFont,
            fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase',
            color: filter === f ? t.palette.emerald : t.fgFaint,
            borderBottom: filter === f ? `1px solid ${t.palette.emerald}` : '1px solid transparent',
            paddingBottom: 6, cursor: 'pointer',
          }}>{t.statusLabels[f] || f} ({counts[f] ?? 0})</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <span style={{ fontFamily: t.eyebrowFont, fontSize: 10.5, fontWeight: 500, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.fgFaint }}>Sort</span>
        <span style={{ fontFamily: t.eyebrowFont, fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.palette.emerald, borderBottom: `1px solid ${t.palette.emerald}`, paddingBottom: 4 }}>By Price ↓</span>
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
        <h3 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 26, letterSpacing: '-0.012em', color: t.palette.emerald, margin: 0, lineHeight: 1.05 }}>{listing.addr}</h3>
        <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 15, color: t.fgMuted, marginTop: 4 }}>{listing.street}</div>
        <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 13.5, color: t.fgFaint }}>{listing.loc}</div>
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontFamily: t.fonts.display, fontSize: 22, color: muted ? t.fgFaint : t.palette.emerald, fontWeight: 400 }}>{listing.price}</span>
          <span style={{ fontFamily: t.eyebrowFont, fontSize: 9, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.fgFaint }}>{listing.specs}</span>
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
      }
    `}</style>
  );
}

export default function Listings() {
  const t = useTheme();
  return t.key === 'B' ? <ListingsB /> : <ListingsA />;
}

// Exports the uniform grid + card components so the Sold Archive page can
// reuse the exact same surface.
export {
  ListingsGridStyles,
  UniformGrid,
  ListingCardStdA,
  ListingCardStdB,
};
