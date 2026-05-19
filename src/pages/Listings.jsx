import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../theme/DirectionContext';
import Photo from '../components/Photo';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import Eyebrow from '../components/Eyebrow';
import StatusChip from '../components/StatusChip';
import Button from '../components/Button';
import Rule from '../components/Rule';
import { STUDIO } from '../data/listings';
import { useListings } from '../lib/queries';

// Each listing card links into its detail page.
const linkStyle = { textDecoration: 'none', color: 'inherit', display: 'block' };

// Both directions share the editorial mixed-scale grid (big + 2 stacked,
// 3 across, 2 stacked + big). The skin per listing card differs.

function useFiltered() {
  const { data: LISTINGS, loading } = useListings();
  const [filter, setFilter] = useState('All');
  const filtered = useMemo(
    () => filter === 'All' ? LISTINGS : LISTINGS.filter(l => l.status === filter),
    [filter, LISTINGS],
  );
  const counts = useMemo(() => ({
    All: LISTINGS.length,
    Active: LISTINGS.filter(l => l.status === 'Active').length,
    Pending: LISTINGS.filter(l => l.status === 'Pending').length,
    Sold: LISTINGS.filter(l => l.status === 'Sold').length,
  }), [LISTINGS]);
  return { filter, setFilter, filtered, counts, all: LISTINGS, loading };
}

// ─── DIRECTION A ────────────────────────────────────────────────────────────
function ListingsA() {
  const t = useTheme();
  const { filter, setFilter, filtered, counts, all: LISTINGS } = useFiltered();

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
            {LISTINGS.length} properties currently represented by the studio, a fraction of the Michigan luxury market, chosen with intent.
          </p>
        </div>

        <FilterBarA filter={filter} setFilter={setFilter} counts={counts} />
      </div>

      <div style={{ padding: '0 clamp(24px, 4.4vw, 64px) clamp(64px, 8.3vw, 120px)' }}>
        {filter === 'All' ? <FullEditorialA listings={LISTINGS} /> : (
          <div className="tw-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 40 }}>
            {filtered.map((l, i) => <ListingCardStdA key={l.id} listing={l} num={String(i + 1).padStart(2, '0')} />)}
          </div>
        )}
      </div>

      <div id="archive" style={{ padding: '96px clamp(24px, 4.4vw, 64px)', borderTop: `1px solid ${t.line}`, background: t.bgPanel, textAlign: 'center' }}>
        <Eyebrow>The Sold Archive</Eyebrow>
        <h2 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(40px, 4.4vw, 64px)', margin: '20px 0 28px', letterSpacing: '-0.018em' }}>
          {STUDIO.totalSold} <em style={{ fontStyle: 'italic' }}>previous</em> placements.
        </h2>
        <Button variant="secondary" onClick={() => { setFilter('Sold'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>View the Sold Archive</Button>
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
        {Object.entries(counts).map(([f, n]) => (
          <span key={f} onClick={() => setFilter(f)} style={{
            fontSize: 11.5, letterSpacing: '0.24em', textTransform: 'uppercase',
            color: filter === f ? t.palette.ink : t.fgFaint,
            borderBottom: filter === f ? `1px solid ${t.palette.ink}` : '1px solid transparent',
            paddingBottom: 6, cursor: 'pointer',
          }}>{t.statusLabels[f] || f} ({n})</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <span style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.fgFaint }}>Sort</span>
        <span style={{ fontSize: 11.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.palette.ink, borderBottom: `1px solid ${t.palette.ink}`, paddingBottom: 4 }}>By Price ↓</span>
      </div>
    </div>
  );
}

function FullEditorialA({ listings }) {
  if (listings.length === 0) return null;
  if (listings.length < 7) {
    // Compact fallback: simple 3-up grid until we have a full set.
    return (
      <div className="tw-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 40 }}>
        {listings.map((l, i) => <ListingCardStdA key={l.id} listing={l} num={String(i + 1).padStart(2, '0')} />)}
      </div>
    );
  }
  return (
    <>
      <div className="tw-big-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 40, marginBottom: 96 }}>
        <ListingCardBigA listing={listings[0]} num="01" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {listings[1] && <ListingCardStdA listing={listings[1]} num="02" />}
          {listings[2] && <ListingCardStdA listing={listings[2]} num="03" />}
        </div>
      </div>
      <div className="tw-three-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, marginBottom: 96 }}>
        {listings[3] && <ListingCardStdA listing={listings[3]} num="04" />}
        {listings[4] && <ListingCardStdA listing={listings[4]} num="05" />}
        {listings[5] && <ListingCardStdA listing={listings[5]} num="06" />}
      </div>
      {listings[6] && (
        <div className="tw-big-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)', gap: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {listings[7] && <ListingCardStdA listing={listings[7]} num="08" />}
            {listings[8] && <ListingCardStdA listing={listings[8]} num="09" />}
          </div>
          <ListingCardBigA listing={listings[6]} num="07" archive />
        </div>
      )}
    </>
  );
}

function ListingCardBigA({ listing, num, archive }) {
  const t = useTheme();
  return (
    <Link to={`/listings/${listing.id}`} style={linkStyle}>
      <div style={{ position: 'relative' }}>
        <Photo label={`${num} — ${listing.addr.toUpperCase()}`} tone={listing.tone} height={620} src={listing.img} />
        <div style={{ position: 'absolute', top: 20, left: 20, padding: '6px 12px', background: 'rgba(251,249,245,0.95)' }}>
          <StatusChip status={listing.status} />
        </div>
        <div style={{ position: 'absolute', bottom: 20, right: 20, fontFamily: t.fonts.accent, fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>{listing.tag}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 28, gap: 24, flexWrap: 'wrap' }}>
        <div>
          {archive && <div style={{ fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: t.accent }}>Archive</div>}
          <h3 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 48, letterSpacing: '-0.018em', margin: archive ? '10px 0 0' : 0 }}>{listing.addr}</h3>
          <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 20, color: t.fgMuted, marginTop: 4 }}>{listing.street}, {listing.loc}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 36 }}>{listing.price}</div>
          <div style={{ fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.fgFaint, marginTop: 6 }}>{listing.specs}</div>
        </div>
      </div>
    </Link>
  );
}

function ListingCardStdA({ listing, num }) {
  const t = useTheme();
  return (
    <Link to={`/listings/${listing.id}`} style={linkStyle}>
      <div style={{ position: 'relative' }}>
        <Photo label={`${num} — ${listing.addr.toUpperCase()}`} tone={listing.tone} height={280} src={listing.img} />
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
        <span style={{ fontFamily: t.fonts.display, fontSize: 22, color: listing.status === 'Sold' ? t.fgFaint : t.fgPage }}>{listing.price}</span>
        <span style={{ fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.fgFaint }}>{listing.specs}</span>
      </div>
    </Link>
  );
}

// ─── DIRECTION B ────────────────────────────────────────────────────────────
function ListingsB() {
  const t = useTheme();
  const { filter, setFilter, filtered, counts, all: LISTINGS } = useFiltered();

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
          {LISTINGS.length} properties currently represented by the studio, a small fraction of the Michigan market, chosen with intent.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
          <Rule />
        </div>
      </div>

      <div style={{ padding: '0 clamp(24px, 5vw, 72px) 56px', maxWidth: 1296, margin: '0 auto' }}>
        <FilterBarB filter={filter} setFilter={setFilter} counts={counts} />
      </div>

      <div style={{ padding: '0 clamp(24px, 5vw, 72px) 96px', maxWidth: 1296, margin: '0 auto' }}>
        {filter === 'All' ? <FullEditorialB listings={LISTINGS} /> : (
          <div className="tw-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 32 }}>
            {filtered.map((l, i) => <ListingCardStdB key={l.id} listing={l} num={String(i + 1).padStart(2, '0')} />)}
          </div>
        )}
      </div>

      <div id="archive" style={{ padding: '96px clamp(24px, 5vw, 72px)', borderTop: `1px solid ${t.line}`, background: t.bgPanel, textAlign: 'center' }}>
        <Eyebrow>The Sold Archive</Eyebrow>
        <h2 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(40px, 4.7vw, 64px)', margin: '20px 0 32px', letterSpacing: '-0.02em', color: t.palette.emerald, lineHeight: 1.05 }}>
          {STUDIO.totalSold} <em style={{ fontStyle: 'italic' }}>previous</em> placements.
        </h2>
        <Button variant="secondary" onClick={() => { setFilter('Sold'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>View the Sold Archive</Button>
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
        {Object.entries(counts).map(([f, n]) => (
          <span key={f} onClick={() => setFilter(f)} style={{
            fontFamily: t.eyebrowFont,
            fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase',
            color: filter === f ? t.palette.emerald : t.fgFaint,
            borderBottom: filter === f ? `1px solid ${t.palette.emerald}` : '1px solid transparent',
            paddingBottom: 6, cursor: 'pointer',
          }}>{t.statusLabels[f] || f} ({n})</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <span style={{ fontFamily: t.eyebrowFont, fontSize: 10.5, fontWeight: 500, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.fgFaint }}>Sort</span>
        <span style={{ fontFamily: t.eyebrowFont, fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.palette.emerald, borderBottom: `1px solid ${t.palette.emerald}`, paddingBottom: 4 }}>By Price ↓</span>
      </div>
    </div>
  );
}

function FullEditorialB({ listings }) {
  if (listings.length === 0) return null;
  if (listings.length < 7) {
    return (
      <div className="tw-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 32, marginTop: 56 }}>
        {listings.map((l, i) => <ListingCardStdB key={l.id} listing={l} num={String(i + 1).padStart(2, '0')} />)}
      </div>
    );
  }
  return (
    <>
      <div className="tw-big-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 40, marginBottom: 72, marginTop: 56 }}>
        <ListingCardBigB listing={listings[0]} num="01" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {listings[1] && <ListingCardStdB listing={listings[1]} num="02" />}
          {listings[2] && <ListingCardStdB listing={listings[2]} num="03" />}
        </div>
      </div>
      <div className="tw-three-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, marginBottom: 72 }}>
        {listings[3] && <ListingCardStdB listing={listings[3]} num="04" />}
        {listings[4] && <ListingCardStdB listing={listings[4]} num="05" />}
        {listings[5] && <ListingCardStdB listing={listings[5]} num="06" />}
      </div>
      {listings[6] && (
        <div className="tw-big-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)', gap: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {listings[7] && <ListingCardStdB listing={listings[7]} num="08" />}
            {listings[8] && <ListingCardStdB listing={listings[8]} num="09" />}
          </div>
          <ListingCardBigB listing={listings[6]} num="07" archive />
        </div>
      )}
    </>
  );
}

function ListingCardBigB({ listing, num, archive }) {
  const t = useTheme();
  return (
    <Link to={`/listings/${listing.id}`} style={{ ...linkStyle, background: '#fff', border: `1px solid ${t.line}` }}>
      <div style={{ position: 'relative' }}>
        <Photo label={`${num} — ${listing.addr.toUpperCase()}`} tone={listing.tone} height={620} src={listing.img} />
        <div style={{ position: 'absolute', top: 20, left: 20, padding: '6px 12px', background: '#fff' }}>
          <StatusChip status={listing.status} />
        </div>
        <div style={{ position: 'absolute', bottom: 20, right: 20, fontFamily: t.eyebrowFont, fontSize: 9.5, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)' }}>{listing.tag}</div>
      </div>
      <div style={{ padding: '32px 40px 36px' }}>
        {archive && (
          <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 15, color: t.accent }}>
            Archive
          </div>
        )}
        <h3 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(32px, 3.4vw, 48px)', letterSpacing: '-0.02em', color: t.palette.emerald, margin: archive ? '10px 0 0' : 0, lineHeight: 1 }}>{listing.addr}</h3>
        <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 19, color: t.fgMuted, marginTop: 6 }}>{listing.street}, {listing.loc}</div>
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 36, color: t.palette.emerald }}>{listing.price}</span>
          <span style={{ fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 600, letterSpacing: '0.26em', textTransform: 'uppercase', color: t.fgFaint }}>{listing.specs}</span>
        </div>
      </div>
    </Link>
  );
}

function ListingCardStdB({ listing, num }) {
  const t = useTheme();
  return (
    <Link to={`/listings/${listing.id}`} style={{ ...linkStyle, background: '#fff', border: `1px solid ${t.line}` }}>
      <div style={{ position: 'relative' }}>
        <Photo label={`${num} — ${listing.addr.toUpperCase()}`} tone={listing.tone} height={260} src={listing.img} />
        <div style={{ position: 'absolute', top: 14, left: 14, padding: '5px 10px', background: '#fff' }}>
          <StatusChip status={listing.status} />
        </div>
      </div>
      <div style={{ padding: '20px 24px 24px' }}>
        <h3 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 26, letterSpacing: '-0.012em', color: t.palette.emerald, margin: 0, lineHeight: 1.05 }}>{listing.addr}</h3>
        <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 15, color: t.fgMuted, marginTop: 4 }}>{listing.street}</div>
        <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 13.5, color: t.fgFaint }}>{listing.loc}</div>
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontFamily: t.fonts.display, fontSize: 22, color: listing.status === 'Sold' ? t.fgFaint : t.palette.emerald, fontWeight: 400 }}>{listing.price}</span>
          <span style={{ fontFamily: t.eyebrowFont, fontSize: 9, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.fgFaint }}>{listing.specs}</span>
        </div>
      </div>
    </Link>
  );
}

function ListingsGridStyles() {
  return (
    <style>{`
      @media (max-width: 900px) {
        .tw-big-grid   { grid-template-columns: 1fr !important; }
        .tw-three-grid { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 600px) {
        .tw-three-grid { grid-template-columns: 1fr !important; }
      }
    `}</style>
  );
}

export default function Listings() {
  const t = useTheme();
  return t.key === 'B' ? <ListingsB /> : <ListingsA />;
}
