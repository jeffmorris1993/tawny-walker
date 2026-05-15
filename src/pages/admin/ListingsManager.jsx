import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TW } from '../../tokens';
import Photo from '../../components/Photo';
import Eyebrow from '../../components/Eyebrow';
import StatusChip from '../../components/StatusChip';
import AdminShell from '../../components/AdminShell';

const LISTINGS = [
  { addr: 'Meridian House', street: '411 Mashta Drive', loc: 'Key Biscayne, FL', price: '$14,750,000', specs: '6 BD · 7.5 BA · 8,200 SF · 1.1 AC', status: 'Active', tone: 'dusk' },
  { addr: 'The Olive Pavilion', street: '3201 Sunset Drive', loc: 'Coral Gables, FL', price: '$8,250,000', specs: '5 BD · 6 BA · 6,420 SF · 0.74 AC', status: 'Active', tone: 'warm' },
  { addr: 'Penthouse Three', street: 'The Marlowe', loc: 'Miami Beach, FL', price: '$12,400,000', specs: '4 BD · 5 BA · 4,180 SF', status: 'Pending', tone: 'cool' },
  { addr: 'Hibiscus Cottage', street: '88 Hibiscus Lane', loc: 'Coconut Grove, FL', price: '$3,950,000', specs: '3 BD · 3 BA · 2,840 SF · 0.42 AC', status: 'Active', tone: 'sage' },
  { addr: 'Atlantic Reach', street: '7240 Collins Avenue', loc: 'Surfside, FL', price: '$6,800,000', specs: '4 BD · 4.5 BA · 3,620 SF', status: 'Active', tone: 'cool' },
  { addr: 'Casa Veintidós', street: '22 Star Island Drive', loc: 'Miami Beach, FL', price: '$28,500,000', specs: '8 BD · 11 BA · 14,200 SF · 1.4 AC', status: 'Active', tone: 'dusk' },
];

export default function ListingsManager() {
  const [activeFilter, setActiveFilter] = useState('All');
  return (
    <AdminShell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 32, borderBottom: `1px solid ${TW.line}`, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Eyebrow>The Index · 9 active · 2 sold YTD</Eyebrow>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 'clamp(36px, 3.9vw, 56px)', margin: '14px 0 0', letterSpacing: '-0.018em' }}>
            Listings
          </h1>
        </div>
        <Link to="/admin/listings/add" style={{ textDecoration: 'none' }}>
          <span style={{ display: 'inline-block', padding: '14px 22px', background: TW.ink, color: TW.bone, fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', cursor: 'pointer' }}>+ Add a Listing</span>
        </Link>
      </div>

      <div style={{ padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${TW.line}`, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {['All (9)', 'Active (6)', 'Pending (1)', 'Sold (2)', 'Draft (1)'].map((f, i) => (
            <span key={f} onClick={() => setActiveFilter(f)} style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: activeFilter === f ? TW.ink : TW.ink3, borderBottom: activeFilter === f ? `1px solid ${TW.ink}` : '1px solid transparent', paddingBottom: 4, cursor: 'pointer' }}>{f}</span>
          ))}
        </div>
        <span style={{ fontSize: 11, color: TW.ink3, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Sort — By Date Listed ↓</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 700 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '60px 80px 1.4fr 1fr 110px 90px 110px', gap: 18, padding: '16px 0', borderBottom: `1px solid ${TW.line}`, fontSize: 9.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: TW.ink3 }}>
            <span>No.</span><span>Image</span><span>Property</span><span>Specs</span><span style={{ textAlign: 'right' }}>Price</span><span>Status</span><span style={{ textAlign: 'right' }}>Listed</span>
          </div>
          {LISTINGS.map((l, i) => (
            <div key={l.addr} style={{ display: 'grid', gridTemplateColumns: '60px 80px 1.4fr 1fr 110px 90px 110px', gap: 18, padding: '16px 0', borderBottom: `1px solid ${TW.lineSoft}`, alignItems: 'center' }}>
              <span style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 18, color: TW.ink3 }}>{String(i + 1).padStart(2, '0')}</span>
              <div style={{ width: 64, height: 48 }}><Photo label="" tone={l.tone} height="100%" /></div>
              <div>
                <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 19 }}>{l.addr}</div>
                <div style={{ fontSize: 11, color: TW.ink3 }}>{l.street}, {l.loc}</div>
              </div>
              <span style={{ fontSize: 11, color: TW.ink2, letterSpacing: '0.04em' }}>{l.specs}</span>
              <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 18, textAlign: 'right' }}>{l.price}</span>
              <StatusChip status={l.status} />
              <span style={{ fontSize: 11, color: TW.ink3, textAlign: 'right' }}>Mar 22</span>
            </div>
          ))}
          {/* draft row */}
          <div style={{ display: 'grid', gridTemplateColumns: '60px 80px 1.4fr 1fr 110px 90px 110px', gap: 18, padding: '16px 0', borderBottom: `1px solid ${TW.lineSoft}`, alignItems: 'center', opacity: 0.65 }}>
            <span style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 18, color: TW.ink3 }}>07</span>
            <div style={{ width: 64, height: 48, background: TW.lineSoft, border: `1px dashed ${TW.line}`, display: 'grid', placeItems: 'center', fontSize: 11, color: TW.ink3 }}>+</div>
            <div>
              <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 19, fontStyle: 'italic' }}>The Bayfront Mid-rise</div>
              <div style={{ fontSize: 11, color: TW.ink3 }}>Address pending</div>
            </div>
            <span style={{ fontSize: 11, color: TW.ink3 }}>— —</span>
            <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 18, textAlign: 'right', color: TW.ink3 }}>$—</span>
            <span style={{ fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: TW.ink3 }}>● Draft</span>
            <span style={{ fontSize: 11, color: TW.ink3, textAlign: 'right' }}>May 12</span>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
