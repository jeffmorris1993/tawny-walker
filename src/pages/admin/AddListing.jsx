import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TW } from '../../tokens';
import Photo from '../../components/Photo';
import Eyebrow from '../../components/Eyebrow';
import StatusChip from '../../components/StatusChip';
import AdminShell from '../../components/AdminShell';

function FormInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink3, marginBottom: 8 }}>{label}</div>
      <input
        type="text"
        value={value}
        onChange={e => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${TW.ink2}`,
          outline: 'none', padding: '6px 0', fontFamily: '"Cormorant Garamond", serif', fontSize: 18,
          color: TW.ink, lineHeight: 1.3, boxSizing: 'border-box',
        }}
        onFocus={e => e.target.style.borderBottomColor = TW.ink}
        onBlur={e => e.target.style.borderBottomColor = TW.ink2}
      />
    </div>
  );
}

function Toggle({ label, on, onToggle }) {
  return (
    <div onClick={onToggle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${TW.lineSoft}`, cursor: 'pointer' }}>
      <span style={{ fontSize: 12.5, color: TW.ink }}>{label}</span>
      <span style={{ width: 30, height: 16, background: on ? TW.ink : TW.line, borderRadius: 8, position: 'relative', flexShrink: 0 }}>
        <span style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 12, height: 12, background: TW.bone, borderRadius: '50%', transition: 'left 0.15s' }} />
      </span>
    </div>
  );
}

export default function AddListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: 'The Bayfront Mid-rise',
    address: '1888 Bay Drive',
    city: 'Miami Beach, FL',
    beds: '4', baths: '4.5', sqft: '3,840', lot: '—',
    price: '$7,400,000', status: 'Active',
    description: 'A four-story bayfront residence by Studio Renata — three living levels above a private moorage, with western-facing terraces and a small rooftop pool that overlooks Biscayne Bay.',
  });
  const [dist, setDist] = useState({ index: true, buyers: true, cobroke: false, offmarket: false });

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <AdminShell>
      <div style={{ fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink3, marginBottom: 24 }}>
        <Link to="/admin/listings" style={{ color: TW.ink3, textDecoration: 'none' }}>Listings</Link> / <span style={{ color: TW.ink }}>Add a Listing</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 28, borderBottom: `1px solid ${TW.line}`, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Eyebrow>New Property · Draft № 07</Eyebrow>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 'clamp(32px, 3.3vw, 48px)', margin: '14px 0 0', letterSpacing: '-0.018em' }}>
            Compose a <em style={{ fontStyle: 'italic' }}>listing.</em>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ padding: '14px 22px', border: `1px solid ${TW.line}`, fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: TW.ink2, cursor: 'pointer' }}>Save Draft</span>
          <span style={{ padding: '14px 22px', border: `1px solid ${TW.ink}`, fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', cursor: 'pointer' }}>Preview</span>
          <span onClick={() => navigate('/admin/listings')} style={{ padding: '14px 22px', background: TW.ink, color: TW.bone, fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', cursor: 'pointer' }}>Publish to Index →</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 56, marginTop: 40 }} className="tw-add-grid">
        {/* form */}
        <div>
          <Eyebrow color={TW.bronze}>— Photography</Eyebrow>
          <div style={{ marginTop: 18 }}>
            <div style={{ position: 'relative' }}>
              <Photo label="HERO PHOTOGRAPHY · DRAG TO REPLACE" tone="dusk" height={280} />
              <div style={{ position: 'absolute', top: 14, right: 14, padding: '6px 12px', background: 'rgba(251,249,245,0.95)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
                Hero · 4267 × 2845
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8 }}>
              <Photo label="02" tone="warm" height={90} />
              <Photo label="03" tone="bone" height={90} />
              <Photo label="04" tone="cool" height={90} />
              <div style={{ height: 90, background: TW.paper, border: `1px dashed ${TW.line}`, display: 'grid', placeItems: 'center', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink3, cursor: 'pointer' }}>+ Add</div>
            </div>
          </div>

          <div style={{ marginTop: 40 }}>
            <Eyebrow color={TW.bronze}>— Property details</Eyebrow>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <FormInput label="Listing name (editorial)" value={form.name} onChange={set('name')} />
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                <FormInput label="Address" value={form.address} onChange={set('address')} />
                <FormInput label="City, State" value={form.city} onChange={set('city')} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                <FormInput label="Beds" value={form.beds} onChange={set('beds')} />
                <FormInput label="Baths" value={form.baths} onChange={set('baths')} />
                <FormInput label="Sq Ft" value={form.sqft} onChange={set('sqft')} />
                <FormInput label="Lot" value={form.lot} onChange={set('lot')} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <FormInput label="Asking price" value={form.price} onChange={set('price')} />
                <FormInput label="Status" value={form.status} onChange={set('status')} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: 40 }}>
            <Eyebrow color={TW.bronze}>— Short description</Eyebrow>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{
                marginTop: 18, width: '100%', background: 'transparent', border: 'none',
                borderBottom: `1px solid ${TW.ink2}`, outline: 'none', padding: '8px 0',
                fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 20, color: TW.ink,
                lineHeight: 1.5, resize: 'none', minHeight: 100, boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderBottomColor = TW.ink}
              onBlur={e => e.target.style.borderBottomColor = TW.ink2}
            />
            <div style={{ marginTop: 8, fontSize: 10.5, color: TW.ink3, letterSpacing: '0.06em', display: 'flex', justifyContent: 'space-between' }}>
              <span>Will be used as the Index card subtitle.</span>
              <span>{form.description.length} / 280 characters</span>
            </div>
          </div>
        </div>

        {/* sidebar preview */}
        <aside>
          <Eyebrow>Index card · live preview</Eyebrow>
          <div style={{ marginTop: 18, padding: 18, background: TW.paper, border: `1px solid ${TW.line}` }}>
            <div style={{ position: 'relative' }}>
              <Photo label={form.name.toUpperCase()} tone="dusk" height={180} />
              <div style={{ position: 'absolute', top: 10, left: 10, padding: '4px 9px', background: 'rgba(251,249,245,0.95)' }}>
                <StatusChip status={form.status} />
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 9.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.bronze }}>№ 07</div>
              <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 20, margin: '4px 0 0' }}>{form.name}</h3>
              <div style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 13, color: TW.ink2 }}>{form.address}, {form.city}</div>
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${TW.line}`, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 16 }}>{form.price}</span>
                <span style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: TW.ink3 }}>{form.beds} BD · {form.baths} BA</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 28, padding: 18, border: `1px solid ${TW.line}` }}>
            <Eyebrow>Distribution</Eyebrow>
            <div style={{ marginTop: 14 }}>
              <Toggle label="Studio Index (public)" on={dist.index} onToggle={() => setDist(d => ({ ...d, index: !d.index }))} />
              <Toggle label="Send to active buyer list (38)" on={dist.buyers} onToggle={() => setDist(d => ({ ...d, buyers: !d.buyers }))} />
              <Toggle label="Co-broke network" on={dist.cobroke} onToggle={() => setDist(d => ({ ...d, cobroke: !d.cobroke }))} />
              <Toggle label="Off-market only" on={dist.offmarket} onToggle={() => setDist(d => ({ ...d, offmarket: !d.offmarket }))} />
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .tw-add-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AdminShell>
  );
}
