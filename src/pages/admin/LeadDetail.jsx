import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TW } from '../../tokens';
import Eyebrow from '../../components/Eyebrow';
import StatusChip from '../../components/StatusChip';
import AdminShell from '../../components/AdminShell';

export default function LeadDetail() {
  const { id } = useParams();
  const [note, setNote] = useState('Worth a 30-min call this week. Mention the Marlowe penthouse comp — she does not see the basis on it yet. Bring Brookmark Holdings into the same conversation if 1031 timing aligns.');

  return (
    <AdminShell>
      {/* breadcrumb */}
      <div style={{ fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink3, marginBottom: 24 }}>
        <Link to="/admin" style={{ color: TW.ink3, textDecoration: 'none' }}>Leads</Link> / Investors / <span style={{ color: TW.ink }}>Marisol Vega</span>
      </div>

      {/* header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, paddingBottom: 32, borderBottom: `1px solid ${TW.line}`, flexWrap: 'wrap' }} className="tw-lead-header">
        <div>
          <Eyebrow>Lead № 01 · Investor Intake · received today 9:42 AM</Eyebrow>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 'clamp(36px, 3.9vw, 56px)', margin: '14px 0 0', letterSpacing: '-0.018em' }}>
            Marisol <em style={{ fontStyle: 'italic' }}>Vega</em>
          </h1>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 20, color: TW.ink2, marginTop: 6 }}>
            Vega Family Office, LLC · Coral Gables
          </div>
          <div style={{ marginTop: 18, display: 'flex', gap: 18, fontSize: 12, color: TW.ink2, flexWrap: 'wrap' }}>
            <span>m.vega@vegafo.com</span>
            <span style={{ color: TW.ink3 }}>·</span>
            <span>+1 305 555 0917</span>
            <span style={{ color: TW.ink3 }}>·</span>
            <span>Referred by — Patrick Lee</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
          <StatusChip status="New" size="lg" />
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ padding: '12px 18px', border: `1px solid ${TW.ink}`, fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', cursor: 'pointer' }}>Mark Contacted</span>
            <span style={{ padding: '12px 18px', background: TW.ink, color: TW.bone, fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', cursor: 'pointer' }}>Reply →</span>
          </div>
        </div>
      </div>

      {/* main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 56, marginTop: 40 }} className="tw-lead-body">
        {/* intake answers */}
        <div>
          <Eyebrow color={TW.bronze}>The intake</Eyebrow>
          <div style={{ marginTop: 20 }}>
            {[
              { q: 'Investor type', a: '1031 Exchange · identifying replacement property' },
              { q: 'Decision speed', a: 'Same-week with broker call' },
              { q: 'Asset class', a: 'Small multi-family (4–20 units) · Mixed-use' },
              { q: 'Target geography', a: 'Miami Beach · Coconut Grove' },
              { q: 'Deployable capital', a: '$16M (mid-range)' },
              { q: 'Target unlevered yield', a: '5.5 – 7.0%' },
              { q: 'Hold horizon', a: '7+ years' },
              { q: 'Off-market?', a: 'Preferred' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32, padding: '16px 0', borderBottom: `1px solid ${TW.lineSoft}` }}>
                <span style={{ fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink3 }}>{r.q}</span>
                <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 19, color: TW.ink, lineHeight: 1.4 }}>{r.a}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32 }}>
            <Eyebrow color={TW.bronze}>Mandate notes</Eyebrow>
            <p style={{
              marginTop: 16, padding: '20px 24px', background: TW.paper, border: `1px solid ${TW.line}`,
              fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 19, lineHeight: 1.55, color: TW.ink,
            }}>
              "Replacement property must close by Sep 14. Open to portfolios of 2–3 SFRs if combined basis fits. Will not consider new construction."
            </p>
          </div>
        </div>

        {/* sidebar */}
        <aside>
          <div style={{ padding: 24, background: TW.paper, border: `1px solid ${TW.line}` }}>
            <Eyebrow color={TW.bronze}>Studio note</Eyebrow>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              style={{
                width: '100%', marginTop: 14, padding: 0, background: 'transparent', border: 'none',
                fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 16, color: TW.ink,
                lineHeight: 1.5, minHeight: 110, resize: 'none', outline: 'none', boxSizing: 'border-box',
              }}
            />
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${TW.line}`, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: TW.ink3 }}>
              Saved · May 15, 10:08 AM
            </div>
          </div>

          <div style={{ marginTop: 32 }}>
            <Eyebrow>Activity</Eyebrow>
            <div style={{ marginTop: 18 }}>
              {[
                { t: 'Intake received', when: 'Today · 9:42 AM', color: TW.bronze },
                { t: 'Email opened from studio', when: 'Today · 9:46 AM', color: TW.ink3 },
                { t: 'Note added by TW', when: 'Today · 10:08 AM', color: TW.ink3 },
              ].map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: `1px solid ${TW.lineSoft}` }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: a.color, marginTop: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: TW.ink }}>{a.t}</div>
                    <div style={{ fontSize: 10.5, color: TW.ink3, letterSpacing: '0.06em', marginTop: 2 }}>{a.when}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 32, padding: 24, border: `1px solid ${TW.line}` }}>
            <Eyebrow>Suggested listings to surface</Eyebrow>
            <div style={{ marginTop: 16 }}>
              {[
                { t: 'Penthouse Three', sub: 'The Marlowe · Pending', price: '$12.4M' },
                { t: 'Atlantic Reach', sub: '7240 Collins · Active', price: '$6.8M' },
              ].map(s => (
                <div key={s.t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 0', borderBottom: `1px solid ${TW.lineSoft}` }}>
                  <div>
                    <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 17 }}>{s.t}</div>
                    <div style={{ fontSize: 10.5, color: TW.ink3, letterSpacing: '0.06em' }}>{s.sub}</div>
                  </div>
                  <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 16, color: TW.ink2 }}>{s.price}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .tw-lead-header { grid-template-columns: 1fr !important; }
          .tw-lead-body { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AdminShell>
  );
}
