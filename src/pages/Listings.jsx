import { useState } from 'react';
import { TW } from '../tokens';
import Photo from '../components/Photo';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import Eyebrow from '../components/Eyebrow';
import StatusChip from '../components/StatusChip';

const ALL_LISTINGS = [
  { addr: 'Meridian House', street: '411 Mashta Drive', loc: 'Key Biscayne, FL', price: '$14,750,000', specs: '6 BD · 7.5 BA · 8,200 SF · 1.1 AC', status: 'Active', tone: 'dusk', tag: 'Waterfront' },
  { addr: 'The Olive Pavilion', street: '3201 Sunset Drive', loc: 'Coral Gables, FL', price: '$8,250,000', specs: '5 BD · 6 BA · 6,420 SF · 0.74 AC', status: 'Active', tone: 'warm', tag: 'Walled Garden' },
  { addr: 'Penthouse Three', street: 'The Marlowe', loc: 'Miami Beach, FL', price: '$12,400,000', specs: '4 BD · 5 BA · 4,180 SF', status: 'Pending', tone: 'cool', tag: 'New Construction' },
  { addr: 'Hibiscus Cottage', street: '88 Hibiscus Lane', loc: 'Coconut Grove, FL', price: '$3,950,000', specs: '3 BD · 3 BA · 2,840 SF · 0.42 AC', status: 'Active', tone: 'sage', tag: 'Restored 1928' },
  { addr: 'Atlantic Reach', street: '7240 Collins Avenue', loc: 'Surfside, FL', price: '$6,800,000', specs: '4 BD · 4.5 BA · 3,620 SF', status: 'Active', tone: 'cool', tag: 'Oceanfront' },
  { addr: 'Casa Veintidós', street: '22 Star Island Drive', loc: 'Miami Beach, FL', price: '$28,500,000', specs: '8 BD · 11 BA · 14,200 SF · 1.4 AC', status: 'Active', tone: 'dusk', tag: 'Trophy' },
  { addr: 'The North Shore', street: '1411 N Ocean Blvd', loc: 'Palm Beach, FL', price: '$22,000,000', specs: '7 BD · 9 BA · 11,400 SF', status: 'Sold', tone: 'night', tag: 'Sold 2026' },
  { addr: 'Bayside Studio', street: '4 Lincoln Lane', loc: 'Miami Beach, FL', price: '$1,850,000', specs: '2 BD · 2 BA · 1,620 SF', status: 'Active', tone: 'bone', tag: 'Pied-à-terre' },
  { addr: 'Coral Stone House', street: '660 Granada Blvd', loc: 'Coral Gables, FL', price: '$5,400,000', specs: '5 BD · 5 BA · 5,100 SF · 0.5 AC', status: 'Sold', tone: 'warm', tag: 'Sold 2025' },
];

function ListingCardBig({ listing, num, archive }) {
  return (
    <div>
      <div style={{ position: 'relative' }}>
        <Photo label={`${num} — ${listing.addr.toUpperCase()}`} tone={listing.tone} height={620} />
        <div style={{ position: 'absolute', top: 20, left: 20, padding: '6px 12px', background: 'rgba(251,249,245,0.95)' }}>
          <StatusChip status={listing.status} />
        </div>
        <div style={{ position: 'absolute', bottom: 20, right: 20, fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>
          {listing.tag}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 28, gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: TW.bronze }}>№ {num} {archive ? '· Archive' : '· Spring Index'}</div>
          <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 48, letterSpacing: '-0.018em', margin: '10px 0 0' }}>{listing.addr}</h3>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 20, color: TW.ink2, marginTop: 4 }}>
            {listing.street}, {listing.loc}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 36 }}>{listing.price}</div>
          <div style={{ fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink3, marginTop: 6 }}>{listing.specs}</div>
        </div>
      </div>
    </div>
  );
}

function ListingCardStandard({ listing, num }) {
  return (
    <div>
      <div style={{ position: 'relative' }}>
        <Photo label={`${num} — ${listing.addr.toUpperCase()}`} tone={listing.tone} height={280} />
        <div style={{ position: 'absolute', top: 14, left: 14, padding: '5px 10px', background: 'rgba(251,249,245,0.95)' }}>
          <StatusChip status={listing.status} />
        </div>
      </div>
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: TW.bronze }}>№ {num}</div>
          <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 26, letterSpacing: '-0.012em', margin: '6px 0 0' }}>{listing.addr}</h3>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 16, color: TW.ink2, marginTop: 2 }}>{listing.street}</div>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 14, color: TW.ink3 }}>{listing.loc}</div>
        </div>
      </div>
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${TW.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, color: listing.status === 'Sold' ? TW.ink3 : TW.ink }}>{listing.price}</span>
        <span style={{ fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: TW.ink3 }}>{listing.specs}</span>
      </div>
    </div>
  );
}

export default function Listings() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All' ? ALL_LISTINGS
    : ALL_LISTINGS.filter(l => l.status === activeFilter);

  const counts = {
    All: ALL_LISTINGS.length,
    Active: ALL_LISTINGS.filter(l => l.status === 'Active').length,
    Pending: ALL_LISTINGS.filter(l => l.status === 'Pending').length,
    Sold: ALL_LISTINGS.filter(l => l.status === 'Sold').length,
  };

  return (
    <div style={{ background: TW.bone, fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', color: TW.ink }}>
      <TopNav active="Listings" />

      {/* Page header */}
      <div style={{ padding: 'clamp(48px, 6.1vw, 88px) clamp(24px, 4.4vw, 64px) clamp(32px, 3.9vw, 56px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <Eyebrow>The Index · Spring 2026 · Vol. xii</Eyebrow>
            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 300, fontSize: 'clamp(52px, 6.7vw, 96px)', letterSpacing: '-0.022em', margin: '24px 0 0', lineHeight: 0.95 }}>
              Current <em style={{ fontStyle: 'italic' }}>listings</em>.
            </h1>
          </div>
          <p style={{ maxWidth: 380, textAlign: 'right', fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 19, color: TW.ink2, lineHeight: 1.45, margin: 0 }}>
            Nine properties currently represented by the studio — a fraction of the South Florida market, chosen with intent.
          </p>
        </div>

        {/* Filter bar */}
        <div style={{ marginTop: 72, paddingTop: 28, paddingBottom: 12, borderTop: `1px solid ${TW.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {Object.entries(counts).map(([f, n]) => (
              <span key={f} onClick={() => setActiveFilter(f)} style={{
                fontSize: 11.5, letterSpacing: '0.24em', textTransform: 'uppercase',
                color: activeFilter === f ? TW.ink : TW.ink3,
                borderBottom: activeFilter === f ? `1px solid ${TW.ink}` : '1px solid transparent',
                paddingBottom: 6, cursor: 'pointer',
              }}>{f} ({n})</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <span style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink3 }}>Sort —</span>
            <span style={{ fontSize: 11.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink, borderBottom: `1px solid ${TW.ink}`, paddingBottom: 4 }}>By Price ↓</span>
          </div>
        </div>
      </div>

      {/* Listings grid */}
      <div style={{ padding: '0 clamp(24px, 4.4vw, 64px) clamp(64px, 8.3vw, 120px)' }}>
        {activeFilter === 'All' ? (
          <>
            {/* row 1: big + 2 stacked */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 40, marginBottom: 96 }} className="tw-big-grid">
              <ListingCardBig listing={ALL_LISTINGS[0]} num="01" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                <ListingCardStandard listing={ALL_LISTINGS[1]} num="02" />
                <ListingCardStandard listing={ALL_LISTINGS[2]} num="03" />
              </div>
            </div>
            {/* row 2: 3 across */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, marginBottom: 96 }} className="tw-three-grid">
              <ListingCardStandard listing={ALL_LISTINGS[3]} num="04" />
              <ListingCardStandard listing={ALL_LISTINGS[4]} num="05" />
              <ListingCardStandard listing={ALL_LISTINGS[5]} num="06" />
            </div>
            {/* row 3: 2 stacked + big sold */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)', gap: 40 }} className="tw-big-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                <ListingCardStandard listing={ALL_LISTINGS[7]} num="08" />
                <ListingCardStandard listing={ALL_LISTINGS[8]} num="09" />
              </div>
              <ListingCardBig listing={ALL_LISTINGS[6]} num="07" archive />
            </div>
          </>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 40 }}>
            {filtered.map((l, i) => <ListingCardStandard key={l.addr} listing={l} num={String(i + 1).padStart(2, '0')} />)}
          </div>
        )}
      </div>

      {/* Archive footer */}
      <div style={{ padding: '96px clamp(24px, 4.4vw, 64px)', borderTop: `1px solid ${TW.line}`, background: TW.paper, textAlign: 'center' }}>
        <Eyebrow>The Sold Archive</Eyebrow>
        <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 'clamp(40px, 4.4vw, 64px)', margin: '20px 0 28px', letterSpacing: '-0.018em' }}>
          184 <em style={{ fontStyle: 'italic' }}>previous</em> placements.
        </h2>
        <span style={{ display: 'inline-block', padding: '18px 32px', border: `1px solid ${TW.ink}`, fontSize: 11.5, letterSpacing: '0.24em', textTransform: 'uppercase', cursor: 'pointer' }}>
          View the Sold Archive →
        </span>
      </div>

      <SiteFooter />

      <style>{`
        @media (max-width: 900px) {
          .tw-big-grid { grid-template-columns: 1fr !important; }
          .tw-three-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .tw-three-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
