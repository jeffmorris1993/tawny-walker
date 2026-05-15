import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TW } from '../../tokens';
import Photo from '../../components/Photo';
import Eyebrow from '../../components/Eyebrow';
import StatusChip from '../../components/StatusChip';
import AdminShell from '../../components/AdminShell';

const LEADS = [
  { id: 1, name: 'Marisol Vega', type: 'Investor', tone: 'dusk', status: 'New', when: 'Today · 9:42 AM', summary: 'Family office · $25M deployable · 1031 ID period ends Sep 14.', stars: 3 },
  { id: 2, name: 'Lena & Idris Okafor', type: 'Buyer', tone: 'warm', status: 'New', when: 'Today · 8:11 AM', summary: 'Couple + two kids · $5–7M · Coral Gables, Coconut Grove · interested in Hibiscus Cottage.', stars: 2 },
  { id: 3, name: 'David Hsu', type: 'Seller', tone: 'bone', status: 'New', when: 'Yesterday · 6:24 PM', summary: '3201 Sunset Dr, Coral Gables · est. $6–10M · relocating Q3.', stars: 2 },
  { id: 4, name: 'Quentin Marsh', type: 'Agent', tone: 'sage', status: 'Contacted', when: 'May 11 · 2:08 PM', summary: 'Coastal & Magnolia NYC · seasonal renter Nov–Apr · Miami Beach.', stars: 1 },
  { id: 5, name: 'Rashida Whitlow', type: 'Buyer', tone: 'warm', status: 'Contacted', when: 'May 10 · 11:00 AM', summary: 'Primary residence · $3–5M · Pinecrest preferred · pre-approved.', stars: 1 },
  { id: 6, name: 'Brookmark Holdings', type: 'Investor', tone: 'dusk', status: 'Qualified', when: 'May 9', summary: 'Boutique hotel + mixed-use · $8M ready · prefers off-market.', stars: 3 },
  { id: 7, name: 'Catherine Pell', type: 'Seller', tone: 'bone', status: 'Cold', when: 'May 3', summary: '4 Lincoln Lane studio · undecided on timing · price-curious.', stars: 0 },
];

export default function LeadsInbox() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = [
    { l: 'All', n: 12, key: 'All' },
    { l: 'Buyers', n: 5, key: 'Buyer' },
    { l: 'Sellers', n: 3, key: 'Seller' },
    { l: 'Investors', n: 2, key: 'Investor' },
    { l: 'Agents / Renters', n: 2, key: 'Agent' },
  ];

  const filtered = activeFilter === 'All' ? LEADS : LEADS.filter(l => l.type === activeFilter);

  return (
    <AdminShell>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 32, borderBottom: `1px solid ${TW.line}`, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Eyebrow>The Studio Inbox · May 15, 2026</Eyebrow>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 'clamp(36px, 3.9vw, 56px)', margin: '14px 0 0', letterSpacing: '-0.018em' }}>
            Leads
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink3 }}>This week —</span>
          <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28 }}>12 <span style={{ fontStyle: 'italic', color: TW.ink3, fontSize: 18 }}>arrived</span></span>
          <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, marginLeft: 16 }}>9 <span style={{ fontStyle: 'italic', color: TW.ink3, fontSize: 18 }}>answered</span></span>
        </div>
      </div>

      {/* filters */}
      <div style={{ padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${TW.line}`, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <span key={f.key} onClick={() => setActiveFilter(f.key)} style={{
              fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: activeFilter === f.key ? TW.ink : TW.ink3,
              borderBottom: activeFilter === f.key ? `1px solid ${TW.ink}` : '1px solid transparent',
              paddingBottom: 4, cursor: 'pointer',
              display: 'flex', alignItems: 'baseline', gap: 6,
            }}>
              {f.l} <span style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 12, color: TW.ink3 }}>({f.n})</span>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <span style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink, borderBottom: `1px solid ${TW.ink}`, paddingBottom: 4 }}>By Status</span>
          <span style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink3 }}>By Type</span>
          <span style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink3 }}>By Date</span>
        </div>
      </div>

      {/* lead table */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 700 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '80px 220px 120px 1fr 120px 110px',
            gap: 20, padding: '18px 0', borderBottom: `1px solid ${TW.line}`,
            fontSize: 9.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: TW.ink3,
          }}>
            <span>No.</span><span>Name</span><span>Type</span><span>Summary</span><span>Status</span><span style={{ textAlign: 'right' }}>Received</span>
          </div>

          {filtered.map((lead, i) => (
            <Link key={lead.id} to={`/admin/lead/${lead.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '80px 220px 120px 1fr 120px 110px',
                gap: 20, padding: '20px 0', borderBottom: `1px solid ${TW.lineSoft}`,
                alignItems: 'center', cursor: 'pointer',
              }}
                onMouseEnter={e => e.currentTarget.style.background = TW.paper}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 18, color: TW.ink3 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3].map(s => (
                      <span key={s} style={{ width: 5, height: 5, borderRadius: '50%', background: s <= lead.stars ? TW.bronze : TW.line }} />
                    ))}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, flexShrink: 0 }}>
                    <Photo label="" tone={lead.tone} height="100%" />
                  </div>
                  <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 17, color: TW.ink }}>{lead.name}</span>
                </div>
                <span style={{ fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink2 }}>{lead.type}</span>
                <span style={{ fontSize: 13, color: TW.ink2, lineHeight: 1.5 }}>{lead.summary}</span>
                <StatusChip status={lead.status} />
                <span style={{ fontSize: 11, color: TW.ink3, textAlign: 'right', letterSpacing: '0.04em' }}>{lead.when}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: TW.ink3, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Showing {filtered.length} of 12 · Active filter: This Week</span>
        <span style={{ fontSize: 11, color: TW.ink, letterSpacing: '0.22em', textTransform: 'uppercase', borderBottom: `1px solid ${TW.ink}`, paddingBottom: 4, cursor: 'pointer' }}>View older leads →</span>
      </div>
    </AdminShell>
  );
}
