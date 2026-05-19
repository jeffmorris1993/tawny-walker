import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/DirectionContext';
import Photo from '../../components/Photo';
import Eyebrow from '../../components/Eyebrow';
import StatusChip from '../../components/StatusChip';
import AdminShell from '../../components/AdminShell';
import { DRAFT_LISTING } from '../../data/leads';
import { createListing } from '../../lib/queries';
import { required } from '../../lib/validation';

function FormInput({ label, value, onChange, placeholder, dropdown, error }) {
  const t = useTheme();
  const isB = t.key === 'B';
  const errorColor = '#B5341F';
  return (
    <div>
      <div style={{
        fontFamily: t.eyebrowFont,
        fontSize: 10, fontWeight: isB ? 600 : 400,
        letterSpacing: isB ? '0.28em' : '0.22em',
        textTransform: 'uppercase',
        color: error ? errorColor : t.fgFaint, marginBottom: 8,
      }}>{label}</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: `1px solid ${error ? errorColor : t.fgMuted}`,
        paddingBottom: 6,
        transition: 'border-color 0.15s',
      }}>
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1, minWidth: 0,
            background: 'transparent', border: 'none', outline: 'none', padding: 0,
            fontFamily: t.fonts.display, fontSize: 18,
            color: isB ? t.palette.emerald : t.fgPage, lineHeight: 1.3,
          }}
        />
        {dropdown && <span style={{ color: isB ? t.palette.emerald : t.fgFaint, fontSize: 13 }}>▾</span>}
      </div>
      {error && (
        <div style={{ marginTop: 6, fontSize: 11, color: errorColor, fontFamily: t.fonts.body }}>{error}</div>
      )}
    </div>
  );
}

const STATUS_CYCLE = ['Draft', 'Active', 'Pending', 'Sold'];

export default function AddListing() {
  const t = useTheme();
  const isB = t.key === 'B';
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...DRAFT_LISTING });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));
  const cycleStatus = () => {
    setForm(f => {
      const idx = STATUS_CYCLE.indexOf(f.status);
      return { ...f, status: STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length] };
    });
  };

  function validate() {
    const next = {};
    const nameErr = required(form.name, 'Listing name');
    if (nameErr) next.name = nameErr;
    const addrErr = required(form.address, 'Address');
    if (addrErr) next.address = addrErr;
    const cityErr = required(form.city, 'City');
    if (cityErr) next.city = cityErr;
    const priceErr = required(form.price, 'Price');
    if (priceErr) next.price = priceErr;
    return next;
  }

  async function handleSave(targetStatus) {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSubmitError('Please complete the required fields.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const { error } = await createListing({
      addr: form.name,
      street: form.address,
      loc: form.city,
      price: form.price,
      beds: form.beds,
      baths: form.baths,
      sqft: form.sqft,
      lot: form.lot,
      status: targetStatus || form.status,
      tone: form.tone,
      blurb: form.description,
    });
    setSubmitting(false);
    if (error) {
      setSubmitError(error.message || 'Could not save. Try again.');
      return;
    }
    navigate('/admin/listings');
  }

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
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {submitError && (
            <span style={{ color: '#B5341F', fontSize: 11, fontFamily: t.fonts.body }}>{submitError}</span>
          )}
          <button
            type="button"
            onClick={() => handleSave('Draft')}
            disabled={submitting}
            style={{
              padding: '14px 22px', border: `1px solid ${t.line}`,
              background: 'transparent',
              fontFamily: t.eyebrowFont,
              fontSize: isB ? 10.5 : 11, fontWeight: isB ? 600 : 400,
              letterSpacing: isB ? '0.26em' : '0.24em',
              textTransform: 'uppercase', color: t.fgMuted, cursor: submitting ? 'wait' : 'pointer',
            }}>Save Draft</button>
          <button
            type="button"
            onClick={() => alert('Preview opens once the listing is saved.')}
            style={{
              padding: '14px 22px', border: `1px solid ${secondaryBorder}`,
              background: 'transparent',
              color: secondaryFg,
              fontFamily: t.eyebrowFont,
              fontSize: isB ? 10.5 : 11, fontWeight: isB ? 600 : 400,
              letterSpacing: isB ? '0.26em' : '0.24em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}>Preview</button>
          <button
            type="button"
            onClick={() => handleSave('Active')}
            disabled={submitting}
            style={{
              padding: '14px 22px', background: primaryBg, color: primaryFg, border: 'none',
              fontFamily: t.eyebrowFont,
              fontSize: isB ? 10.5 : 11, fontWeight: isB ? 600 : 400,
              letterSpacing: isB ? '0.26em' : '0.24em',
              textTransform: 'uppercase', cursor: submitting ? 'wait' : 'pointer',
              opacity: submitting ? 0.6 : 1,
            }}>{submitting ? 'Saving…' : 'Publish to Index →'}</button>
        </div>
      </div>

      <div className="tw-add-grid" style={{
        display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 56, marginTop: 40,
      }}>
        {/* Form */}
        <div>
          {/* Photography */}
          <Eyebrow color={t.accent}>Photography</Eyebrow>
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
            <Eyebrow color={t.accent}>Property details</Eyebrow>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <FormInput label="Listing name (editorial)" value={form.name} onChange={set('name')} error={errors.name} />
              <div className="tw-add-pair-2-1" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                <FormInput label="Address" value={form.address} onChange={set('address')} error={errors.address} />
                <FormInput label="City, State" value={form.city} onChange={set('city')} error={errors.city} />
              </div>
              <div className="tw-add-pair-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                <FormInput label="Beds" value={form.beds} onChange={set('beds')} />
                <FormInput label="Baths" value={form.baths} onChange={set('baths')} />
                <FormInput label="Sq Ft" value={form.sqft} onChange={set('sqft')} />
                <FormInput label="Lot" value={form.lot} onChange={set('lot')} />
              </div>
              <div className="tw-add-pair-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <FormInput label="Asking price" value={form.price} onChange={set('price')} error={errors.price} />
                <div>
                  <div style={{
                    fontFamily: t.eyebrowFont,
                    fontSize: 10, fontWeight: isB ? 600 : 400,
                    letterSpacing: isB ? '0.28em' : '0.22em',
                    textTransform: 'uppercase',
                    color: t.fgFaint, marginBottom: 8,
                  }}>Status</div>
                  <button
                    type="button"
                    onClick={cycleStatus}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: 8, background: 'transparent',
                      border: 'none', borderBottom: `1px solid ${t.fgMuted}`,
                      padding: '0 0 6px', cursor: 'pointer', textAlign: 'left',
                      fontFamily: t.fonts.display, fontSize: 18,
                      color: isB ? t.palette.emerald : t.fgPage, lineHeight: 1.3,
                    }}>
                    <span>{t.statusLabels[form.status] || form.status}</span>
                    <span style={{ color: isB ? t.palette.emerald : t.fgFaint, fontSize: 13 }}>▾</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginTop: 40 }}>
            <Eyebrow color={t.accent}>Short description</Eyebrow>
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
