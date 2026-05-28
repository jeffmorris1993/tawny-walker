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
import { parseMoney, formatMoney, clampMoney, clampMoneyString } from '../../lib/money';

// Single text input. Setting `money` switches on auto-format-on-blur:
// the user can type a raw number (10400) and the field commits "$10.4K"
// once focus leaves. Setting `onBlur` is how the parent runs per-field
// validation as soon as the user leaves the input.
function FormInput({ label, value, onChange, placeholder, dropdown, error, money, onBlur }) {
  const t = useTheme();
  const errorColor = '#B5341F';
  // Local input string so the user can type freely (digits, commas, "$1.5M")
  // before we re-format. Synced from `value` whenever the field isn't
  // actively being edited.
  const [draft, setDraft] = useState(value || '');
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    if (!editing) setDraft(value || '');
  }, [value, editing]);
  return (
    <div>
      <div style={{
        fontFamily: t.eyebrowFont,
        fontSize: 10, fontWeight: 600,
        letterSpacing: '0.28em',
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
          inputMode={money ? 'numeric' : undefined}
          value={draft}
          onChange={e => {
            // For money fields: strip minus signs and refuse keystrokes
            // that would push the parsed value past the $999M cap, so the
            // user can't even type a value the clamp would reject.
            const raw = money ? clampMoneyString(e.target.value, draft) : e.target.value;
            setDraft(raw);
            // Push raw text up for non-money fields; money fields commit
            // their formatted value on blur instead.
            if (!money && onChange) onChange(raw);
          }}
          onFocus={() => {
            setEditing(true);
            // Money fields swap to the raw numeric while editing — easier to
            // type "1200000" than to position a cursor inside "$1.2M".
            if (money) {
              const parsed = parseMoney(draft);
              setDraft(parsed.value > 0 ? String(Math.round(parsed.value)) : '');
            }
          }}
          onBlur={(e) => {
            setEditing(false);
            let next = e.target.value;
            if (money) {
              const parsed = parseMoney(next);
              // Clamp negatives to 0 and amounts above $999M down to $999M.
              const clamped = clampMoney(parsed.value);
              next = clamped > 0 ? formatMoney(clamped, parsed.suffix) : '';
              setDraft(next);
              onChange?.(next);
            }
            onBlur?.(next);
          }}
          placeholder={placeholder}
          style={{
            flex: 1, minWidth: 0,
            background: 'transparent', border: 'none', outline: 'none', padding: 0,
            fontFamily: t.fonts.display, fontSize: 18,
            color: t.palette.emerald, lineHeight: 1.3,
          }}
        />
        {dropdown && <span style={{ color: t.palette.emerald, fontSize: 13 }}>▾</span>}
      </div>
      {error && (
        <div style={{ marginTop: 6, fontSize: 11, color: errorColor, fontFamily: t.fonts.body }}>{error}</div>
      )}
    </div>
  );
}

const STATUS_CYCLE = ['Draft', 'Coming Soon', 'Active', 'Pending', 'Sold'];
const REPRESENTING_OPTIONS = ['Buyer', 'Seller', 'Both'];

// Each non-Draft status maps to a single date column. Used to auto-fill
// today's date when the studio bumps a listing into a new status, and to
// pick which date is required at publish time.
const STATUS_DATE_KEY = {
  'Coming Soon': 'comingSoonAt',
  Active:        'activeAt',
  Pending:       'pendingAt',
  Sold:          'soldAt',
};

// ISO date (YYYY-MM-DD) in local time — the shape <input type="date">
// uses and the shape Supabase accepts for a `date` column.
function todayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

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
    representedBy: L.representedBy || '',
    description: L.blurb || L.description || '',
    tone: L.tone || 'warm',
    photos: Array.isArray(L.photos) ? L.photos : [],
    comingSoonAt: L.comingSoonAt || '',
    activeAt:     L.activeAt     || '',
    pendingAt:    L.pendingAt    || '',
    soldAt:       L.soldAt       || '',
  };
}

// Tiny date input that mirrors the FormInput styling — same eyebrow
// label, same underlined input row, same error treatment. Kept inline
// because <input type="date"> can't share FormInput's draft/blur cycle.
function DateInput({ label, value, onChange, error }) {
  const t = useTheme();
  const errorColor = '#B5341F';
  return (
    <div>
      <div style={{
        fontFamily: t.eyebrowFont,
        fontSize: 10, fontWeight: 600,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: error ? errorColor : t.fgFaint, marginBottom: 8,
      }}>{label}</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: `1px solid ${error ? errorColor : t.fgMuted}`,
        paddingBottom: 6,
      }}>
        <input
          type="date"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          style={{
            flex: 1, minWidth: 0,
            background: 'transparent', border: 'none', outline: 'none', padding: 0,
            fontFamily: t.fonts.display, fontSize: 18,
            color: t.palette.emerald, lineHeight: 1.3,
          }}
        />
      </div>
      {error && (
        <div style={{ marginTop: 6, fontSize: 11, color: errorColor, fontFamily: t.fonts.body }}>{error}</div>
      )}
    </div>
  );
}

export default function AddListing() {
  const t = useTheme();
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
  const [representingOpen, setRepresentingOpen] = useState(false);

  useEffect(() => {
    // Seed the form once the existing listing has been fetched. Safe to setState
    // here because `existing` is an external async result, not a derived value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (editing && existing && !form) setForm(listingToForm(existing));
  }, [editing, existing, form]);

  // Mirror in-progress edits to localStorage so the /studio/preview/<id> tab
  // can render them live. Debounced so we don't fire a write + storage event
  // on every keystroke. Cleared on unmount so the preview tab falls back to
  // the saved DB row once the editor closes.
  useEffect(() => {
    if (!editing || !routeId || !form) return undefined;
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
      representedBy: form.representedBy || null,
      tone: form.tone,
      blurb: form.description,
      photos,
      // Keep `img` in sync so the public detail hero (which reads L.img)
      // updates live as the user uploads or reorders photos.
      img: photos[0]?.url || null,
      _stamp: Date.now(),
    };
    const id = setTimeout(() => {
      try { localStorage.setItem(key, JSON.stringify(blob)); } catch { /* quota */ }
    }, 250);
    return () => clearTimeout(id);
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

  // Status changes auto-fill the matching date column with today (only
  // when it's blank, so revisiting Active doesn't overwrite a date the
  // studio set deliberately). Draft has no date.
  function setStatus(next) {
    setForm(f => {
      const dateKey = STATUS_DATE_KEY[next];
      if (!dateKey || f?.[dateKey]) return { ...f, status: next };
      return { ...f, status: next, [dateKey]: todayIso() };
    });
    setStatusOpen(false);
  }

  // Per-field validation runs on blur as soon as the user leaves a field
  // they've touched — so they don't have to hit "Publish" before learning
  // a required field was missed.
  function fieldError(field, value) {
    switch (field) {
      case 'name':    return required(value, 'Listing name');
      case 'address': return required(value, 'Address');
      case 'city':    return required(value, 'City');
      case 'price':   return required(value, 'Price');
      default:        return null;
    }
  }
  function validateOnBlur(field) {
    return (nextValue) => {
      // Use the value the input committed (post-format for money fields).
      const valueForCheck = nextValue !== undefined ? nextValue : form?.[field];
      const err = fieldError(field, valueForCheck);
      setErrors(prev => {
        const next = { ...prev };
        if (err) next[field] = err; else delete next[field];
        // Drop the form-level "Please complete the required fields"
        // banner once every field error has cleared.
        if (Object.keys(next).length === 0) setSubmitError(null);
        return next;
      });
    };
  }

  function validate(targetStatus) {
    const next = {};
    const nameErr = required(form.name, 'Listing name');
    if (nameErr) next.name = nameErr;
    const addrErr = required(form.address, 'Address');
    if (addrErr) next.address = addrErr;
    const cityErr = required(form.city, 'City');
    if (cityErr) next.city = cityErr;
    const priceErr = required(form.price, 'Price');
    if (priceErr) next.price = priceErr;
    // Whichever status the studio is publishing into, the matching date
    // is required. Draft has no date, so it's exempt.
    const dateKey = STATUS_DATE_KEY[targetStatus];
    if (dateKey && !form?.[dateKey]) {
      next[dateKey] = `${targetStatus} date is required.`;
    }
    return next;
  }

  async function handleSave(targetStatus) {
    const resolvedStatus = targetStatus || form.status;
    const nextErrors = validate(resolvedStatus);
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
      status: resolvedStatus,
      representedBy: form.representedBy || null,
      tone: form.tone,
      blurb: form.description,
      photos: form.photos || [],
      comingSoonAt: form.comingSoonAt || null,
      activeAt:     form.activeAt     || null,
      pendingAt:    form.pendingAt    || null,
      soldAt:       form.soldAt       || null,
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

  const headlineColor = t.palette.emerald;
  const primaryBg = t.palette.emerald;
  const primaryFg = '#fff';

  const publishLabel = editing
    ? (submitting ? 'Saving…' : 'Save Changes →')
    : (submitting ? 'Saving…' : 'Publish to Index →');

  return (
    <AdminShell>
      {/* Breadcrumb */}
      <div style={{
        fontFamily: t.eyebrowFont,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.28em',
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
                fontSize: 10.5, fontWeight: 600,
                letterSpacing: '0.26em',
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
                fontSize: 10.5, fontWeight: 600,
                letterSpacing: '0.26em',
                textTransform: 'uppercase', color: t.fgMuted,
                cursor: submitting ? 'wait' : 'pointer',
              }}>Save Draft</button>
          )}
          {editing && (
            <button
              type="button"
              onClick={() => window.open(`/studio/preview/${routeId}`, '_blank', 'noopener')}
              style={{
                padding: '14px 22px', border: `1px solid ${t.palette.emerald}`,
                background: 'transparent',
                color: t.palette.emerald,
                fontFamily: t.eyebrowFont,
                fontSize: 10.5, fontWeight: 600,
                letterSpacing: '0.26em',
                textTransform: 'uppercase', cursor: 'pointer',
              }}>Preview</button>
          )}
          <button
            type="button"
            onClick={() => {
              // Respect the studio's chosen status. New listings default
              // to Active if the user hasn't picked anything else (a fresh
              // draft starts at 'Draft' — bumping it to Active feels like
              // the right outcome when they hit "Publish to Index").
              const target = editing
                ? form.status
                : (form.status && form.status !== 'Draft' ? form.status : 'Active');
              handleSave(target);
            }}
            disabled={submitting}
            style={{
              padding: '14px 22px', background: primaryBg, color: primaryFg, border: 'none',
              fontFamily: t.eyebrowFont,
              fontSize: 10.5, fontWeight: 600,
              letterSpacing: '0.26em',
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
              <FormInput label="Listing name (editorial)" value={form.name} onChange={set('name')} error={errors.name} onBlur={validateOnBlur('name')} />
              <div className="tw-add-pair-2-1" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                <FormInput label="Address" value={form.address} onChange={set('address')} error={errors.address} onBlur={validateOnBlur('address')} />
                <FormInput label="City, State" value={form.city} onChange={set('city')} error={errors.city} onBlur={validateOnBlur('city')} />
              </div>
              <div className="tw-add-pair-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                <FormInput label="Beds" value={form.beds} onChange={set('beds')} />
                <FormInput label="Baths" value={form.baths} onChange={set('baths')} />
                <FormInput label="Sq Ft" value={form.sqft} onChange={set('sqft')} />
                <FormInput label="Lot" value={form.lot} onChange={set('lot')} />
              </div>
              <div className="tw-add-pair-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                <FormInput
                  label="Asking price"
                  value={form.price}
                  onChange={set('price')}
                  error={errors.price}
                  onBlur={validateOnBlur('price')}
                  money
                  placeholder="e.g. 1200000"
                />
                <div style={{ position: 'relative' }}>
                  <div style={{
                    fontFamily: t.eyebrowFont,
                    fontSize: 10, fontWeight: 600,
                    letterSpacing: '0.28em',
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
                      color: t.palette.emerald, lineHeight: 1.3,
                    }}>
                    <span>{t.statusLabels[form.status] || form.status}</span>
                    <span style={{
                      color: t.palette.emerald, fontSize: 13,
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
                              onClick={() => setStatus(s)}
                              style={{
                                padding: '10px 12px', cursor: 'pointer',
                                fontFamily: t.fonts.body, fontSize: 13,
                                color: selected ? t.palette.emerald : t.fgMuted,
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

                {/* Representing — which side of the deal Tawny is on. The
                    table column reflects this; the public site doesn't
                    surface it. */}
                <div style={{ position: 'relative' }}>
                  <div style={{
                    fontFamily: t.eyebrowFont,
                    fontSize: 10, fontWeight: 600,
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    color: t.fgFaint, marginBottom: 8,
                  }}>Represented By</div>
                  <button
                    type="button"
                    onClick={() => setRepresentingOpen(o => !o)}
                    aria-haspopup="listbox"
                    aria-expanded={representingOpen}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: 8, background: 'transparent',
                      border: 'none', borderBottom: `1px solid ${t.fgMuted}`,
                      padding: '0 0 6px', cursor: 'pointer', textAlign: 'left',
                      fontFamily: t.fonts.display, fontSize: 18,
                      color: form.representedBy ? t.palette.emerald : t.fgFaint, lineHeight: 1.3,
                    }}>
                    <span>{form.representedBy || '—'}</span>
                    <span style={{
                      color: t.palette.emerald, fontSize: 13,
                      transform: representingOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.15s',
                    }}>▾</span>
                  </button>
                  {representingOpen && (
                    <>
                      <div
                        onClick={() => setRepresentingOpen(false)}
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
                        {REPRESENTING_OPTIONS.map(s => {
                          const selected = s === form.representedBy;
                          return (
                            <li
                              key={s}
                              role="option"
                              aria-selected={selected}
                              onClick={() => {
                                setForm(f => ({ ...f, representedBy: s }));
                                setRepresentingOpen(false);
                              }}
                              style={{
                                padding: '10px 12px', cursor: 'pointer',
                                fontFamily: t.fonts.body, fontSize: 13,
                                color: selected ? t.palette.emerald : t.fgMuted,
                                background: selected ? t.bgPanel : 'transparent',
                              }}
                              onMouseEnter={e => { if (!selected) e.currentTarget.style.background = t.bgPanel; }}
                              onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
                            >{s}</li>
                          );
                        })}
                      </ul>
                    </>
                  )}
                </div>
              </div>

              {/* Per-status dates. The studio fills in whichever ones
                  apply; the public detail page renders the one matching
                  the current status. Status changes auto-fill today's
                  date for the new status if blank. */}
              <div className="tw-add-pair-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                <DateInput
                  label="Coming Soon date"
                  value={form.comingSoonAt}
                  onChange={set('comingSoonAt')}
                  error={errors.comingSoonAt}
                />
                <DateInput
                  label="Listed date"
                  value={form.activeAt}
                  onChange={set('activeAt')}
                  error={errors.activeAt}
                />
                <DateInput
                  label="Pending date"
                  value={form.pendingAt}
                  onChange={set('pendingAt')}
                  error={errors.pendingAt}
                />
                <DateInput
                  label="Sold date"
                  value={form.soldAt}
                  onChange={set('soldAt')}
                  error={errors.soldAt}
                />
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
                color: t.palette.emerald,
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
                background: '#fff',
              }}>
                <StatusChip status={form.status} />
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <h3 style={{
                fontFamily: t.fonts.display, fontWeight: 400,
                fontSize: 20, margin: 0,
                color: t.palette.emerald, lineHeight: 1.1,
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
                  color: t.palette.emerald,
                }}>{form.price || '$—'}</span>
                <span style={{
                  fontFamily: t.eyebrowFont,
                  fontSize: 9, fontWeight: 600,
                  letterSpacing: '0.22em',
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
        @media (max-width: 900px) {
          .tw-add-pair-3   { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .tw-add-pair-2-1 { grid-template-columns: 1fr !important; }
          .tw-add-pair-4   { grid-template-columns: 1fr 1fr !important; }
          .tw-add-pair-2   { grid-template-columns: 1fr !important; }
          .tw-add-pair-3   { grid-template-columns: 1fr !important; }
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
