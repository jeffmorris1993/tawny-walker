import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/DirectionContext';
import Photo from '../../components/Photo';
import Eyebrow from '../../components/Eyebrow';
import StatusChip from '../../components/StatusChip';
import AdminShell from '../../components/AdminShell';
import { DRAFT_LISTING } from '../../data/leads';

function FormInput({ label, value, onChange, placeholder, dropdown }) {
  const t = useTheme();
  const isB = t.key === 'B';
  return (
    <div>
      <div style={{
        fontFamily: t.eyebrowFont,
        fontSize: 10, fontWeight: isB ? 600 : 400,
        letterSpacing: isB ? '0.28em' : '0.22em',
        textTransform: 'uppercase',
        color: t.fgFaint, marginBottom: 8,
      }}>{label}</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: `1px solid ${t.fgMuted}`,
        paddingBottom: 6,
        transition: 'border-color 0.15s',
      }}>
        <input
          type="text"
          value={value}
          onChange={e => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: 0,
            fontFamily: t.fonts.display, fontSize: 18,
            color: isB ? t.palette.emerald : t.fgPage, lineHeight: 1.3,
          }}
        />
        {dropdown && <span style={{ color: isB ? t.palette.emerald : t.fgFaint, fontSize: 13 }}>▾</span>}
      </div>
    </div>
  );
}

function Toggle({ label, on, onToggle }) {
  const t = useTheme();
  const isB = t.key === 'B';
  return (
    <div onClick={onToggle} style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: `1px solid ${t.lineSoft}`, cursor: 'pointer',
    }}>
      <span style={{ fontSize: 12.5, color: isB ? t.palette.emerald : t.fgPage }}>{label}</span>
      <span style={{
        width: 30, height: 16,
        background: on ? (isB ? t.palette.emerald : t.palette.ink) : t.line,
        borderRadius: 8, position: 'relative', flexShrink: 0, transition: 'background 0.15s',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: on ? 16 : 2,
          width: 12, height: 12, background: '#fff', borderRadius: '50%',
          transition: 'left 0.15s',
        }} />
      </span>
    </div>
  );
}

export default function AddListing() {
  const t = useTheme();
  const isB = t.key === 'B';
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...DRAFT_LISTING });
  const [dist, setDist] = useState({ index: true, buyers: true, cobroke: false, offmarket: false });

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const headlineColor = isB ? t.palette.emerald : t.fgPage;
  const primaryBg = isB ? t.palette.emerald : t.palette.ink;
  const primaryFg = isB ? '#fff' : t.palette.bone;
  const secondaryBorder = isB ? t.palette.emerald : t.palette.ink;
  const secondaryFg = isB ? t.palette.emerald : t.fgPage;

  return (
    <AdminShell>
      {/* Breadcrumb */}
      <div style={{
        fontFamily: t.eyebrowFont,
        fontSize: isB ? 10 : 10.5,
        fontWeight: isB ? 600 : 400,
        letterSpacing: isB ? '0.28em' : '0.22em',
        textTransform: 'uppercase', color: t.fgFaint, marginBottom: 24,
      }}>
        <Link to="/admin/listings" style={{ color: t.fgFaint, textDecoration: 'none' }}>
          {t.admin.indexHeadline}
        </Link>
        {' / '}
        <span style={{ color: headlineColor }}>Add a {t.admin.composeHeadline.charAt(0).toUpperCase() + t.admin.composeHeadline.slice(1)}</span>
      </div>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        paddingBottom: 28, borderBottom: `1px solid ${t.line}`, flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <Eyebrow>New Property · Draft № {form.number}</Eyebrow>
          <h1 style={{
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(32px, 3.3vw, 48px)', margin: '14px 0 0',
            letterSpacing: '-0.018em', color: headlineColor,
          }}>
            Compose a <em style={{ fontStyle: 'italic' }}>{t.admin.composeHeadline}.</em>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span style={{
            padding: '14px 22px', border: `1px solid ${t.line}`,
            fontFamily: t.eyebrowFont,
            fontSize: isB ? 10.5 : 11, fontWeight: isB ? 600 : 400,
            letterSpacing: isB ? '0.26em' : '0.24em',
            textTransform: 'uppercase', color: t.fgMuted, cursor: 'pointer',
          }}>Save Draft</span>
          <span style={{
            padding: '14px 22px', border: `1px solid ${secondaryBorder}`,
            color: secondaryFg,
            fontFamily: t.eyebrowFont,
            fontSize: isB ? 10.5 : 11, fontWeight: isB ? 600 : 400,
            letterSpacing: isB ? '0.26em' : '0.24em',
            textTransform: 'uppercase', cursor: 'pointer',
          }}>Preview</span>
          <span onClick={() => navigate('/admin/listings')} style={{
            padding: '14px 22px', background: primaryBg, color: primaryFg,
            fontFamily: t.eyebrowFont,
            fontSize: isB ? 10.5 : 11, fontWeight: isB ? 600 : 400,
            letterSpacing: isB ? '0.26em' : '0.24em',
            textTransform: 'uppercase', cursor: 'pointer',
          }}>Publish to Index →</span>
        </div>
      </div>

      <div className="tw-add-grid" style={{
        display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 56, marginTop: 40,
      }}>
        {/* Form */}
        <div>
          {/* Photography */}
          <Eyebrow color={t.accent}>— Photography</Eyebrow>
          <div style={{ marginTop: 18 }}>
            <div style={{ position: 'relative' }}>
              <Photo label="HERO PHOTOGRAPHY · DRAG TO REPLACE" tone={form.tone} height={280} />
              <div style={{
                position: 'absolute', top: 14, right: 14, padding: '6px 12px',
                background: isB ? '#fff' : 'rgba(251,249,245,0.95)',
                fontFamily: t.eyebrowFont,
                fontSize: isB ? 9.5 : 10, fontWeight: isB ? 600 : 400,
                letterSpacing: isB ? '0.26em' : '0.22em',
                textTransform: 'uppercase',
                color: isB ? t.palette.emerald : t.fgPage,
              }}>Hero · 4267 × 2845</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8 }}>
              <Photo label="02" tone="warm" height={90} />
              <Photo label="03" tone="bone" height={90} />
              <Photo label="04" tone="cool" height={90} />
              <div style={{
                height: 90, background: t.bgPanel, border: `1px dashed ${t.line}`,
                display: 'grid', placeItems: 'center',
                fontFamily: t.eyebrowFont,
                fontSize: isB ? 10.5 : 11, fontWeight: isB ? 600 : 400,
                letterSpacing: isB ? '0.26em' : '0.22em',
                textTransform: 'uppercase', color: t.fgFaint, cursor: 'pointer',
              }}>+ Add</div>
            </div>
          </div>

          {/* Property details */}
          <div style={{ marginTop: 40 }}>
            <Eyebrow color={t.accent}>— Property details</Eyebrow>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <FormInput label="Listing name (editorial)" value={form.name} onChange={set('name')} />
              <div className="tw-add-pair-2-1" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                <FormInput label="Address" value={form.address} onChange={set('address')} />
                <FormInput label="City, State" value={form.city} onChange={set('city')} />
              </div>
              <div className="tw-add-pair-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                <FormInput label="Beds" value={form.beds} onChange={set('beds')} />
                <FormInput label="Baths" value={form.baths} onChange={set('baths')} />
                <FormInput label="Sq Ft" value={form.sqft} onChange={set('sqft')} />
                <FormInput label="Lot" value={form.lot} onChange={set('lot')} />
              </div>
              <div className="tw-add-pair-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <FormInput label="Asking price" value={form.price} onChange={set('price')} />
                <FormInput label="Status" value={t.statusLabels[form.status] || form.status} onChange={set('status')} dropdown />
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginTop: 40 }}>
            <Eyebrow color={t.accent}>— Short description</Eyebrow>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{
                marginTop: 18, width: '100%', background: 'transparent', border: 'none',
                borderBottom: `1px solid ${t.fgMuted}`, outline: 'none', padding: '8px 0',
                fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 20,
                color: isB ? t.palette.emerald : t.fgPage,
                lineHeight: 1.5, resize: 'none', minHeight: 100, boxSizing: 'border-box',
              }}
            />
            <div style={{
              marginTop: 8, fontSize: 10.5, color: t.fgFaint, letterSpacing: '0.06em',
              display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
            }}>
              <span>Will be used as the Index card subtitle.</span>
              <span>{form.description.length} / 280 characters</span>
            </div>
          </div>
        </div>

        {/* Live preview */}
        <aside>
          <Eyebrow>Index card · live preview</Eyebrow>
          <div style={{
            marginTop: 18, padding: 18, background: t.bgPanel, border: `1px solid ${t.line}`,
          }}>
            <div style={{ position: 'relative' }}>
              <Photo label={form.name.toUpperCase()} tone={form.tone} height={180} />
              <div style={{
                position: 'absolute', top: 10, left: 10, padding: '4px 9px',
                background: isB ? '#fff' : 'rgba(251,249,245,0.95)',
              }}>
                <StatusChip status={form.status} />
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{
                fontFamily: t.eyebrowFont,
                fontSize: isB ? 9 : 9.5, fontWeight: isB ? 600 : 400,
                letterSpacing: isB ? '0.26em' : '0.22em',
                textTransform: 'uppercase', color: t.accent,
              }}>№ {form.number}</div>
              <h3 style={{
                fontFamily: t.fonts.display, fontWeight: 400,
                fontSize: 20, margin: '4px 0 0',
                color: isB ? t.palette.emerald : t.fgPage, lineHeight: 1.1,
              }}>{form.name}</h3>
              <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 13, color: t.fgMuted }}>
                {form.address}, {form.city}
              </div>
              <div style={{
                marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.line}`,
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span style={{
                  fontFamily: t.fonts.display, fontSize: 16,
                  color: isB ? t.palette.emerald : t.fgPage,
                }}>{form.price}</span>
                <span style={{
                  fontFamily: t.eyebrowFont,
                  fontSize: isB ? 9 : 9, fontWeight: isB ? 600 : 400,
                  letterSpacing: isB ? '0.22em' : '0.18em',
                  textTransform: 'uppercase', color: t.fgFaint,
                }}>{form.beds} BD · {form.baths} BA</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 28, padding: 18, border: `1px solid ${t.line}` }}>
            <Eyebrow>Distribution</Eyebrow>
            <div style={{ marginTop: 14 }}>
              <Toggle label="Studio Index (public)"          on={dist.index}     onToggle={() => setDist(d => ({ ...d, index: !d.index }))} />
              <Toggle label="Send to active buyer list (38)" on={dist.buyers}    onToggle={() => setDist(d => ({ ...d, buyers: !d.buyers }))} />
              <Toggle label="Co-broke network"               on={dist.cobroke}   onToggle={() => setDist(d => ({ ...d, cobroke: !d.cobroke }))} />
              <Toggle label="Off-market only"                on={dist.offmarket} onToggle={() => setDist(d => ({ ...d, offmarket: !d.offmarket }))} />
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .tw-add-grid     { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .tw-add-pair-2-1 { grid-template-columns: 1fr !important; }
          .tw-add-pair-4   { grid-template-columns: 1fr 1fr !important; }
          .tw-add-pair-2   { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AdminShell>
  );
}
