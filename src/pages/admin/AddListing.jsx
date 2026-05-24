import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../theme/DirectionContext';
import Photo from '../../components/Photo';
import Eyebrow from '../../components/Eyebrow';
import StatusChip from '../../components/StatusChip';
import AdminShell from '../../components/AdminShell';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import PhotoUploader from '../../components/admin/PhotoUploader';
import { DRAFT_LISTING } from '../../data/leads';
import { createListing, updateListing, deleteListing, useListing } from '../../lib/queries';
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

const STATUS_CYCLE = ['Draft', 'Coming Soon', 'Active', 'Pending', 'Sold'];

// Map a fetched listing (DB or mock shape) into the local form shape used
// by the composer.
function listingToForm(L) {
  return {
    number: L.number || '—',
    name: L.addr || L.name || '',
    address: L.street || L.address || '',
    city: L.loc || L.city || '',
    beds: L.beds || '',
    baths: L.baths || '',
    sqft: L.sqft || '',
    lot: L.lot || '',
    price: L.price || '',
    status: L.status || 'Draft',
    description: L.blurb || L.description || '',
    tone: L.tone || 'warm',
    photos: Array.isArray(L.photos) ? L.photos : [],
  };
}

export default function AddListing() {
  const t = useTheme();
  const isB = t.key === 'B';
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const editing = !!routeId;

  // When editing, load the existing listing and seed the form once it arrives.
  const { data: existing, loading: loadingExisting } = useListing(editing ? routeId : null);

  const [form, setForm] = useState(() => (editing ? null : { ...DRAFT_LISTING }));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  useEffect(() => {
    // Seed the form once the existing listing has been fetched. Safe to setState
    // here because `existing` is an external async result, not a derived value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (editing && existing && !form) setForm(listingToForm(existing));
  }, [editing, existing, form]);

  // Mirror in-progress edits to localStorage so the /studio/preview/<id> tab
  // can render them live. Cleared on unmount so the preview tab falls back to
  // the saved DB row once the editor closes.
  useEffect(() => {
    if (!editing || !routeId || !form) return;
    const key = `tw.preview.${routeId}`;
    const photos = form.photos || [];
    const blob = {
      addr: form.name,
      street: form.address,
      loc: form.city,
      price: form.price,
      beds: form.beds,
      baths: form.baths,
      sqft: form.sqft,
      lot: form.lot,
      status: form.status,
      tone: form.tone,
      blurb: form.description,
      photos,
      // Keep `img` in sync so the public detail hero (which reads L.img)
      // updates live as the user uploads or reorders photos.
      img: photos[0]?.url || null,
      _stamp: Date.now(),
    };
    try { localStorage.setItem(key, JSON.stringify(blob)); } catch { /* quota */ }
  }, [editing, routeId, form]);

  useEffect(() => {
    if (!editing || !routeId) return;
    const key = `tw.preview.${routeId}`;
    return () => { try { localStorage.removeItem(key); } catch { /* noop */ } };
  }, [editing, routeId]);

  if (editing && (!form || (loadingExisting && !existing))) {
    return (
      <AdminShell>
        <div style={{
          padding: '64px 0', textAlign: 'center',
          color: t.fgFaint, fontFamily: t.fonts.body, fontSize: 13,
          letterSpacing: '0.2em', textTransform: 'uppercase',
        }}>Loading listing…</div>
      </AdminShell>
    );
  }

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

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

    const payload = {
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
      photos: form.photos || [],
    };

    const { error } = editing
      ? await updateListing(routeId, payload)
      : await createListing(payload);

    setSubmitting(false);
    if (error) {
      setSubmitError(error.message || 'Could not save. Try again.');
      return;
    }
    navigate('/admin/listings');
  }

  async function performDelete() {
    if (!editing) return;
    setSubmitting(true);
    setSubmitError(null);
    const { error } = await deleteListing(routeId);
    setSubmitting(false);
    setConfirmDelete(false);
    if (error) {
      setSubmitError(error.message || 'Could not delete. Try again.');
      return;
    }
    navigate('/admin/listings');
  }

  const headlineColor = isB ? t.palette.emerald : t.fgPage;
  const primaryBg = isB ? t.palette.emerald : t.palette.ink;
  const primaryFg = isB ? '#fff' : t.palette.bone;

  const publishLabel = editing
    ? (submitting ? 'Saving…' : 'Save Changes →')
    : (submitting ? 'Saving…' : 'Publish to Index →');

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
        <span style={{ color: headlineColor }}>
          {editing ? `Edit ${form.name || 'Listing'}` : `Add a ${t.admin.composeHeadline.charAt(0).toUpperCase() + t.admin.composeHeadline.slice(1)}`}
        </span>
      </div>

      {/* Header */}
      <div className="tw-add-header" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        paddingBottom: 28, borderBottom: `1px solid ${t.line}`, flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <Eyebrow>
            {editing
              ? `Edit Property · ${form.status}`
              : `New Property · Draft № ${form.number}`}
          </Eyebrow>
          <h1 style={{
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(32px, 3.3vw, 48px)', margin: '14px 0 0',
            letterSpacing: '-0.018em', color: headlineColor,
          }}>
            {editing
              ? <>Edit <em style={{ fontStyle: 'italic' }}>{t.admin.composeHeadline}.</em></>
              : <>Compose a <em style={{ fontStyle: 'italic' }}>{t.admin.composeHeadline}.</em></>}
          </h1>
        </div>
        <div className="tw-add-actions" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {submitError && (
            <span style={{ color: '#B5341F', fontSize: 11, fontFamily: t.fonts.body }}>{submitError}</span>
          )}
          {editing ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              disabled={submitting}
              style={{
                padding: '14px 22px', border: `1px solid #B5341F`,
                background: 'transparent',
                fontFamily: t.eyebrowFont,
                fontSize: isB ? 10.5 : 11, fontWeight: isB ? 600 : 400,
                letterSpacing: isB ? '0.26em' : '0.24em',
                textTransform: 'uppercase', color: '#B5341F',
                cursor: submitting ? 'wait' : 'pointer',
              }}>Delete</button>
          ) : (
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
                textTransform: 'uppercase', color: t.fgMuted,
                cursor: submitting ? 'wait' : 'pointer',
              }}>Save Draft</button>
          )}
          {editing && (
            <button
              type="button"
              onClick={() => window.open(`/studio/preview/${routeId}`, '_blank', 'noopener')}
              style={{
                padding: '14px 22px', border: `1px solid ${isB ? t.palette.emerald : t.palette.ink}`,
                background: 'transparent',
                color: isB ? t.palette.emerald : t.fgPage,
                fontFamily: t.eyebrowFont,
                fontSize: isB ? 10.5 : 11, fontWeight: isB ? 600 : 400,
                letterSpacing: isB ? '0.26em' : '0.24em',
                textTransform: 'uppercase', cursor: 'pointer',
              }}>Preview</button>
          )}
          <button
            type="button"
            onClick={() => handleSave(editing ? form.status : 'Active')}
            disabled={submitting}
            style={{
              padding: '14px 22px', background: primaryBg, color: primaryFg, border: 'none',
              fontFamily: t.eyebrowFont,
              fontSize: isB ? 10.5 : 11, fontWeight: isB ? 600 : 400,
              letterSpacing: isB ? '0.26em' : '0.24em',
              textTransform: 'uppercase', cursor: submitting ? 'wait' : 'pointer',
              opacity: submitting ? 0.6 : 1,
            }}>{publishLabel}</button>
        </div>
      </div>

      <div className="tw-add-grid" style={{
        display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)',
        gap: 56, marginTop: 40,
      }}>
        {/* Form */}
        <div>
          {/* Photography */}
          <Eyebrow color={t.accent}>Photography</Eyebrow>
          <div style={{ marginTop: 18 }}>
            <PhotoUploader
              value={form.photos || []}
              onChange={(next) => setForm(f => ({ ...f, photos: next }))}
              listingId={editing ? routeId : null}
            />
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
                <div style={{ position: 'relative' }}>
                  <div style={{
                    fontFamily: t.eyebrowFont,
                    fontSize: 10, fontWeight: isB ? 600 : 400,
                    letterSpacing: isB ? '0.28em' : '0.22em',
                    textTransform: 'uppercase',
                    color: t.fgFaint, marginBottom: 8,
                  }}>Status</div>
                  <button
                    type="button"
                    onClick={() => setStatusOpen(o => !o)}
                    aria-haspopup="listbox"
                    aria-expanded={statusOpen}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: 8, background: 'transparent',
                      border: 'none', borderBottom: `1px solid ${t.fgMuted}`,
                      padding: '0 0 6px', cursor: 'pointer', textAlign: 'left',
                      fontFamily: t.fonts.display, fontSize: 18,
                      color: isB ? t.palette.emerald : t.fgPage, lineHeight: 1.3,
                    }}>
                    <span>{t.statusLabels[form.status] || form.status}</span>
                    <span style={{
                      color: isB ? t.palette.emerald : t.fgFaint, fontSize: 13,
                      transform: statusOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.15s',
                    }}>▾</span>
                  </button>
                  {statusOpen && (
                    <>
                      <div
                        onClick={() => setStatusOpen(false)}
                        style={{ position: 'fixed', inset: 0, zIndex: 60 }}
                        aria-hidden
                      />
                      <ul
                        role="listbox"
                        style={{
                          position: 'absolute', zIndex: 61,
                          top: 'calc(100% + 6px)', left: 0, right: 0,
                          margin: 0, padding: 6, listStyle: 'none',
                          background: t.bgPage, border: `1px solid ${t.line}`,
                          boxShadow: '0 14px 30px -16px rgba(0,0,0,0.3)',
                        }}
                      >
                        {STATUS_CYCLE.map(s => {
                          const selected = s === form.status;
                          return (
                            <li
                              key={s}
                              role="option"
                              aria-selected={selected}
                              onClick={() => { set('status')(s); setStatusOpen(false); }}
                              style={{
                                padding: '10px 12px', cursor: 'pointer',
                                fontFamily: t.fonts.body, fontSize: 13,
                                color: selected ? (isB ? t.palette.emerald : t.fgPage) : t.fgMuted,
                                background: selected ? t.bgPanel : 'transparent',
                                display: 'flex', alignItems: 'center', gap: 10,
                              }}
                              onMouseEnter={e => { if (!selected) e.currentTarget.style.background = t.bgPanel; }}
                              onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
                            >
                              <StatusChip status={s} />
                              <span>{t.statusLabels[s] || s}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}
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
              <span>Shown as the tagline on the listing detail page · also the Index card subtitle.</span>
              <span>{(form.description || '').length} / 280 characters</span>
            </div>
          </div>
        </div>

        {/* Live preview */}
        <aside style={{ minWidth: 0 }}>
          <Eyebrow>Index card · live preview</Eyebrow>
          <div style={{
            marginTop: 18, padding: 18, background: t.bgPanel, border: `1px solid ${t.line}`,
            maxWidth: 360,
          }}>
            <div style={{ position: 'relative' }}>
              <Photo
                label={(form.name || '').toUpperCase()}
                tone={form.tone}
                height={180}
                src={form.photos?.[0]?.url}
              />
              <div style={{
                position: 'absolute', top: 10, left: 10, padding: '4px 9px',
                background: isB ? '#fff' : 'rgba(251,249,245,0.95)',
              }}>
                <StatusChip status={form.status} />
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <h3 style={{
                fontFamily: t.fonts.display, fontWeight: 400,
                fontSize: 20, margin: 0,
                color: isB ? t.palette.emerald : t.fgPage, lineHeight: 1.1,
              }}>{form.name || '—'}</h3>
              <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 13, color: t.fgMuted }}>
                {form.address}{form.city ? `, ${form.city}` : ''}
              </div>
              <div style={{
                marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.line}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                flexWrap: 'wrap', gap: 8,
              }}>
                <span style={{
                  fontFamily: t.fonts.display, fontSize: 16,
                  color: isB ? t.palette.emerald : t.fgPage,
                }}>{form.price || '$—'}</span>
                <span style={{
                  fontFamily: t.eyebrowFont,
                  fontSize: isB ? 9 : 9, fontWeight: isB ? 600 : 400,
                  letterSpacing: isB ? '0.22em' : '0.18em',
                  textTransform: 'uppercase', color: t.fgFaint,
                  whiteSpace: 'nowrap',
                }}>{form.beds || '—'} BD · {form.baths || '—'} BA</span>
              </div>
            </div>
          </div>

        </aside>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .tw-add-grid     { grid-template-columns: 1fr !important; gap: 32px !important; }
          .tw-add-header   { align-items: flex-start !important; }
          .tw-add-actions  { width: 100% !important; }
        }
        @media (max-width: 600px) {
          .tw-add-pair-2-1 { grid-template-columns: 1fr !important; }
          .tw-add-pair-4   { grid-template-columns: 1fr 1fr !important; }
          .tw-add-pair-2   { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete "${form?.name || 'this listing'}"?`}
        message="This removes the listing from the public site and from the studio. It cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep"
        danger
        busy={submitting}
        onConfirm={performDelete}
        onCancel={() => !submitting && setConfirmDelete(false)}
      />
    </AdminShell>
  );
}
