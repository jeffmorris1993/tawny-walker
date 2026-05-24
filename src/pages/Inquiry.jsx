import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../theme/DirectionContext';
import { ROLES, ROLE_KEYS } from '../data/inquiryRoles';
import { submitInquiry } from '../lib/queries';
import { required, isEmail, isPhone } from '../lib/validation';
import Photo from '../components/Photo';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import Eyebrow from '../components/Eyebrow';

// The unified inquiry: one dropdown reveals one of four role-specific forms.
// Same schema, same state machine across directions A and B.
//
// state: 'initial' | 'open' | 'buyer' | 'seller' | 'investor' | 'agent'

export function useInquiryState({ syncUrl = false } = {}) {
  // Always call useSearchParams — React requires unconditional hook calls.
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = syncUrl && ROLE_KEYS.includes(searchParams.get('as'))
    ? searchParams.get('as')
    : 'initial';
  const [state, setState] = useState(initial);

  useEffect(() => {
    if (!syncUrl) return;
    if (ROLE_KEYS.includes(state)) {
      if (searchParams.get('as') !== state) {
        const next = new URLSearchParams(searchParams);
        next.set('as', state);
        setSearchParams(next, { replace: true });
      }
    } else if (searchParams.get('as')) {
      const next = new URLSearchParams(searchParams);
      next.delete('as');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const selectedKey = ROLE_KEYS.includes(state) ? state : null;
  const selected = selectedKey ? ROLES[selectedKey] : null;
  const open = state === 'open';

  return {
    state, setState, selectedKey, selected, open,
    toggleOpen: () => setState(s => (s === 'open' ? (selectedKey || 'initial') : 'open')),
    pick: (k) => setState(k),
    reset: () => setState('initial'),
  };
}

function useInquirySkin() {
  const t = useTheme();
  return {
    leftBg: t.palette.emerald,
    leftFg: '#fff',
    leftMuted: 'rgba(255,255,255,0.78)',
    leftLine: 'rgba(255,255,255,0.18)',
    leftAccent: t.accentSoft,
    rightBg: '#fff',
    accentLine: t.palette.emerald,
    headlineColor: '#fff',
    selectionColor: t.palette.emerald,
    selectionFaint: t.palette.ink4,
    arrowColor: t.palette.emerald,
    arrowOpenColor: t.accent,
    cursorColor: t.accent,
    submitBg: t.palette.emerald,
    submitFg: '#fff',
    chipBg: t.palette.emerald,
    chipFg: '#fff',
    sliderTrack: t.line,
    sliderEnd: t.palette.emerald,
    sliderMid: t.accent,
    valueColor: t.palette.emerald,
    error: '#B5341F',
    t,
  };
}

// ─── Form state helpers ─────────────────────────────────────────────────────
// Identify the universal contact fields by label.
const NAME_LABELS    = new Set(['Name']);
const EMAIL_LABELS   = new Set(['Email']);
const PHONE_LABELS   = new Set(['Phone']);
const CONTACT_LABELS = new Set([...EMAIL_LABELS, ...PHONE_LABELS]);

function buildInitial(role) {
  // Every field starts empty; the schema's placeholder strings provide hints.
  const fields = {};
  const chips = {};
  const notes = {};
  const budget = {};
  for (const s of role.sections) {
    if (s.cols) {
      for (const c of s.cols) fields[c.label] = '';
    }
    if (s.type === 'chips') chips[s.label] = [];
    if (s.type === 'dropdown') {
      if (s.multi) chips[s.label] = [];
      else fields[s.label] = '';
    }
    if (s.type === 'note') notes[s.label] = '';
    if (s.type === 'budget') {
      // Seed with the middle 60% of the range, in absolute dollars (so the
      // user can later type values outside the slider's min/max without us
      // losing the actual number).
      const minVal = parseMoney(s.min).value;
      const maxVal = parseMoney(s.max).value;
      const span = Math.max(0, maxVal - minVal);
      budget[s.label] = {
        low:  minVal + span * 0.2,
        high: minVal + span * 0.8,
      };
    }
  }
  return { fields, chips, notes, budget };
}

// ─── Money parsing / formatting for the budget slider ───────────────────────
// Accepts shapes like '$50K', '$1.42M', '$8K/mo'. Returns { value, suffix }.
function parseMoney(s) {
  const str = String(s).trim();
  const suffixMatch = str.match(/\/[a-z]+$/i);
  const suffix = suffixMatch ? suffixMatch[0] : '';
  const body = (suffix ? str.slice(0, -suffix.length) : str)
    .replace(/[$,\s]/g, '')
    .trim();
  let multiplier = 1;
  let numeric = body;
  if (/M$/i.test(body)) { multiplier = 1_000_000; numeric = body.slice(0, -1); }
  else if (/K$/i.test(body)) { multiplier = 1_000; numeric = body.slice(0, -1); }
  const value = parseFloat(numeric) * multiplier;
  return { value: isFinite(value) ? value : 0, suffix };
}

function formatMoney(value, suffix = '') {
  if (!isFinite(value)) return '—';
  let display;
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    display = `$${m >= 10 ? Math.round(m) : m.toFixed(2).replace(/\.?0+$/, '')}M`;
  } else if (value >= 1_000) {
    display = `$${Math.round(value / 1_000)}K`;
  } else {
    display = `$${Math.round(value)}`;
  }
  return suffix ? display + suffix : display;
}

function validate(role, form) {
  const errors = {};
  // Find the actual contact fields the form is rendering, then enforce
  // "at least one of Email or Phone" plus format checks on whichever is
  // present.
  let hasName = false;
  let hasEmail = false;
  let hasPhone = false;
  let nameLabel = null;
  let emailLabel = null;
  let phoneLabel = null;
  for (const s of role.sections) {
    if (!s.cols) continue;
    for (const c of s.cols) {
      if (NAME_LABELS.has(c.label))   { hasName = true;  nameLabel = c.label; }
      if (EMAIL_LABELS.has(c.label))  { hasEmail = true; emailLabel = c.label; }
      if (PHONE_LABELS.has(c.label))  { hasPhone = true; phoneLabel = c.label; }
    }
  }

  if (hasName) {
    const err = required(form.fields[nameLabel], 'Name');
    if (err) errors[nameLabel] = err;
  }

  const emailVal = emailLabel ? form.fields[emailLabel] : '';
  const phoneVal = phoneLabel ? form.fields[phoneLabel] : '';
  const hasAnyContact = (emailVal && emailVal.trim()) || (phoneVal && phoneVal.trim());

  if (hasEmail || hasPhone) {
    if (!hasAnyContact) {
      // Surface the rule on both fields so the user sees it next to either.
      if (emailLabel) errors[emailLabel] = 'Enter an email or phone (one is required).';
      if (phoneLabel) errors[phoneLabel] = 'Enter an email or phone (one is required).';
    } else {
      if (emailVal && emailVal.trim()) {
        const err = isEmail(emailVal);
        if (err) errors[emailLabel] = err;
      }
      if (phoneVal && phoneVal.trim()) {
        const err = isPhone(phoneVal);
        if (err) errors[phoneLabel] = err;
      }
    }
  }
  return errors;
}

// ─── Form pieces ────────────────────────────────────────────────────────────
function FormLabel({ children, error }) {
  const skin = useInquirySkin();
  const t = skin.t;
  return (
    <div style={{
      fontFamily: t.eyebrowFont,
      fontSize: 10, fontWeight: 600,
      letterSpacing: '0.28em',
      textTransform: 'uppercase',
      color: error ? skin.error : t.fgFaint,
    }}>{children}</div>
  );
}

function InputField({ label, value, onChange, placeholder, dropdown, options, error, required: req }) {
  const skin = useInquirySkin();
  const t = skin.t;
  const isSelect = Array.isArray(options) && options.length > 0;
  return (
    <div>
      <FormLabel error={error}>
        {label}{req ? ' *' : ''}
      </FormLabel>
      {isSelect ? (
        <EditorialSelect
          value={value}
          onChange={onChange}
          options={options}
          placeholder={placeholder || 'Select…'}
          error={error}
        />
      ) : (
        <TextField
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          dropdown={dropdown}
          error={error}
        />
      )}
      {error && (
        <div style={{ marginTop: 6, fontSize: 11, color: skin.error, fontFamily: t.fonts.body }}>
          {error}
        </div>
      )}
    </div>
  );
}

function TextField({ value, onChange, placeholder, dropdown, error }) {
  const skin = useInquirySkin();
  const t = skin.t;
  const filled = value && String(value).length > 0;
  return (
    <div style={{
      marginTop: 10, paddingBottom: 10,
      borderBottom: `1px solid ${error ? skin.error : t.fgMuted}`,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
    }}>
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange && onChange(e.target.value)}
        placeholder={placeholder || ''}
        style={{
          flex: 1, minWidth: 0,
          background: 'transparent', border: 'none', outline: 'none', padding: 0,
          fontFamily: filled ? t.fonts.display : t.fonts.body,
          fontStyle: filled ? 'italic' : 'normal',
          fontSize: filled ? 19 : 14,
          color: filled ? skin.valueColor : t.fgFaint,
        }}
      />
      {dropdown && (
        <span style={{ color: skin.accentLine, fontSize: 13, flexShrink: 0 }}>▾</span>
      )}
    </div>
  );
}

// Custom editorial dropdown: a styled control over a styled menu, both using
// the active theme's fonts and palette. Closes on outside click or Escape.
// Pass `multi` for a checkbox-style multi-select; otherwise behaves as a
// single picker that closes on selection.
function EditorialSelect({ value, onChange, options, placeholder, error, multi = false }) {
  const skin = useInquirySkin();
  const t = skin.t;
  const selectedList = multi ? (Array.isArray(value) ? value : []) : [];
  const filled = multi ? selectedList.length > 0 : (value && String(value).length > 0);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function pickSingle(opt) {
    onChange && onChange(opt);
    setOpen(false);
  }
  function toggleMulti(opt) {
    const next = selectedList.includes(opt)
      ? selectedList.filter(s => s !== opt)
      : [...selectedList, opt];
    onChange && onChange(next);
  }
  function clearAll() {
    onChange && onChange([]);
  }

  const summary = multi
    ? (!filled
        ? placeholder
        : (selectedList.length <= 2 ? selectedList.join(', ') : `${selectedList.length} selected`))
    : (filled ? value : placeholder);

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', marginTop: 10, paddingBottom: 10, padding: 0,
          background: 'transparent', border: 'none', outline: 'none',
          borderBottom: `1px solid ${error ? skin.error : t.fgMuted}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
          cursor: 'pointer', textAlign: 'left',
          fontFamily: filled ? t.fonts.display : t.fonts.body,
          fontStyle: filled ? 'italic' : 'normal',
          fontSize: filled ? 19 : 14,
          color: filled ? skin.valueColor : t.fgFaint,
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {summary}
        </span>
        <span style={{
          color: skin.accentLine, fontSize: 13, flexShrink: 0,
          transition: 'transform 0.2s ease',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>▾</span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable={multi ? 'true' : undefined}
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
            zIndex: 30,
            background: '#fff',
            border: `1px solid ${skin.accentLine}`,
            boxShadow: '0 24px 48px -16px rgba(0,0,0,0.22)',
            maxHeight: 320, overflowY: 'auto',
          }}
        >
          {options.map((opt, i) => {
            const isSelected = multi ? selectedList.includes(opt) : (opt === value);
            return (
              <SelectOption
                key={opt}
                option={opt}
                selected={isSelected}
                first={i === 0}
                multi={multi}
                onPick={multi ? toggleMulti : pickSingle}
              />
            );
          })}
          {multi && filled && (
            <button
              type="button"
              onClick={clearAll}
              style={{
                width: '100%', textAlign: 'left', padding: '12px 18px',
                background: t.bgPanel, border: 'none', borderTop: `1px solid ${t.line}`,
                fontFamily: t.eyebrowFont, fontSize: 10.5,
                letterSpacing: '0.22em', textTransform: 'uppercase',
                color: t.fgMuted, cursor: 'pointer',
              }}
            >Clear all</button>
          )}
        </div>
      )}
    </div>
  );
}

// Option row used by EditorialSelect. In `multi` mode, renders a checkbox
// affordance on the left and styles the row as a togglable item. In single
// mode, shows the centered dot accent on the right of the selected row.
function SelectOption({ option, selected, first, onPick, multi = false }) {
  const skin = useInquirySkin();
  const t = skin.t;
  const [hover, setHover] = useState(false);
  const active = hover || selected;
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={() => onPick(option)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center',
        justifyContent: multi ? 'flex-start' : 'space-between',
        gap: 12, width: '100%', textAlign: 'left',
        padding: '14px 18px',
        background: active ? t.bgPanel : '#fff',
        border: 'none', borderTop: first ? 'none' : `1px solid ${t.line}`,
        cursor: 'pointer',
        fontFamily: t.fonts.display,
        fontStyle: selected ? 'italic' : 'normal',
        fontSize: 17,
        color: active ? skin.selectionColor : t.fgPage,
        transition: 'background 0.12s ease, color 0.12s ease',
      }}
    >
      {multi && (
        <span style={{
          width: 16, height: 16, flexShrink: 0,
          border: `1px solid ${selected ? skin.accentLine : t.fgMuted}`,
          background: selected ? skin.accentLine : 'transparent',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 12, lineHeight: 1,
        }}>{selected ? '✓' : ''}</span>
      )}
      <span>{option}</span>
      {!multi && selected && (
        <span style={{ color: skin.accentLine, fontSize: 14, fontFamily: t.fonts.display }}>·</span>
      )}
    </button>
  );
}

// ─── Dual-thumb price slider ────────────────────────────────────────────────
function BudgetRange({ label, min, max, range, onChange }) {
  const skin = useInquirySkin();
  const t = skin.t;
  const minParsed = parseMoney(min);
  const maxParsed = parseMoney(max);
  const suffix = minParsed.suffix;
  const span = Math.max(1, maxParsed.value - minParsed.value);

  const lowVal  = Number.isFinite(range.low)  ? range.low  : minParsed.value;
  const highVal = Number.isFinite(range.high) ? range.high : maxParsed.value;

  // Thumb position is the dollar value mapped into [0, 1] of the visible
  // track; if the typed value is outside the slider's range the thumb just
  // sits at the edge while the typed number stays in state.
  const lowPct  = Math.max(0, Math.min(1, (lowVal  - minParsed.value) / span));
  const highPct = Math.max(0, Math.min(1, (highVal - minParsed.value) / span));

  // Local input strings so the user can type freely (commas, "$1.5M", etc.)
  // before committing to a parsed value.
  const [lowInput,  setLowInput]  = useState(formatMoney(lowVal,  suffix));
  const [highInput, setHighInput] = useState(formatMoney(highVal, suffix));
  const lowFocusedRef  = useRef(false);
  const highFocusedRef = useRef(false);

  useEffect(() => {
    if (!lowFocusedRef.current)  setLowInput(formatMoney(lowVal,  suffix));
    if (!highFocusedRef.current) setHighInput(formatMoney(highVal, suffix));
  }, [lowVal, highVal, suffix]);

  function commitLow(str) {
    const parsed = parseMoney(str);
    if (!isFinite(parsed.value) || parsed.value < 0) {
      setLowInput(formatMoney(lowVal, suffix));
      return;
    }
    // Keep ordering, but let the user push the band wider in either
    // direction (typed numbers may exceed the slider min/max).
    const high = parsed.value > highVal ? parsed.value : highVal;
    onChange({ low: parsed.value, high });
  }
  function commitHigh(str) {
    const parsed = parseMoney(str);
    if (!isFinite(parsed.value) || parsed.value < 0) {
      setHighInput(formatMoney(highVal, suffix));
      return;
    }
    const low = parsed.value < lowVal ? parsed.value : lowVal;
    onChange({ low, high: parsed.value });
  }

  const trackRef = useRef(null);
  const draggingRef = useRef(null); // 'low' | 'high' | null

  function pctFromClientX(clientX) {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const raw = (clientX - rect.left) / rect.width;
    return Math.min(1, Math.max(0, raw));
  }
  function valueFromPct(pct) {
    return minParsed.value + pct * span;
  }

  function startDrag(which) {
    return (e) => {
      e.preventDefault();
      draggingRef.current = which;
      const move = (ev) => {
        if (!draggingRef.current) return;
        const pct = pctFromClientX(ev.clientX);
        const val = valueFromPct(pct);
        if (draggingRef.current === 'low') {
          onChange({ low: Math.min(val, highVal - span * 0.02), high: highVal });
        } else {
          onChange({ low: lowVal, high: Math.max(val, lowVal + span * 0.02) });
        }
      };
      const stop = () => {
        draggingRef.current = null;
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', stop);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', stop);
    };
  }

  function onTrackPointerDown(e) {
    const pct = pctFromClientX(e.clientX);
    const distLow  = Math.abs(pct - lowPct);
    const distHigh = Math.abs(pct - highPct);
    const which = distLow <= distHigh ? 'low' : 'high';
    const val = valueFromPct(pct);
    if (which === 'low') {
      onChange({ low: Math.min(val, highVal - span * 0.02), high: highVal });
    } else {
      onChange({ low: lowVal, high: Math.max(val, lowVal + span * 0.02) });
    }
    startDrag(which)(e);
  }

  const valueInputStyle = {
    width: '5.6em', minWidth: 0,
    background: 'transparent', border: 0, outline: 'none',
    padding: 0,
    fontFamily: t.fonts.display, fontSize: 28,
    color: skin.valueColor,
    textAlign: 'inherit',
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <FormLabel>{label}</FormLabel>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginTop: 14, gap: 12, flexWrap: 'wrap',
      }}>
        <input
          type="text"
          inputMode="decimal"
          value={lowInput}
          onChange={e => setLowInput(e.target.value)}
          onFocus={() => { lowFocusedRef.current = true; }}
          onBlur={(e) => { lowFocusedRef.current = false; commitLow(e.target.value); }}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
          aria-label={`${label} — minimum`}
          style={valueInputStyle}
        />
        <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 14, color: t.fgFaint }}>to</span>
        <input
          type="text"
          inputMode="decimal"
          value={highInput}
          onChange={e => setHighInput(e.target.value)}
          onFocus={() => { highFocusedRef.current = true; }}
          onBlur={(e) => { highFocusedRef.current = false; commitHigh(e.target.value); }}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
          aria-label={`${label} — maximum`}
          style={{ ...valueInputStyle, textAlign: 'right' }}
        />
      </div>
      <div
        ref={trackRef}
        onPointerDown={onTrackPointerDown}
        style={{
          position: 'relative', height: 28, marginTop: 18,
          touchAction: 'none', userSelect: 'none', cursor: 'pointer',
        }}
      >
        {/* base track */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: '50%',
          height: 3, borderRadius: 2,
          transform: 'translateY(-50%)',
          background: t.fgFaint,
          opacity: 0.55,
          pointerEvents: 'none',
        }} />
        {/* selected range */}
        <div style={{
          position: 'absolute', top: '50%', transform: 'translateY(-50%)',
          height: 4, borderRadius: 2,
          left: `${lowPct * 100}%`,
          right: `${(1 - highPct) * 100}%`,
          background: skin.sliderEnd,
          pointerEvents: 'none',
        }} />
        {/* low thumb */}
        <Thumb
          pct={lowPct}
          onPointerDown={startDrag('low')}
          color={skin.sliderEnd}
        />
        {/* high thumb */}
        <Thumb
          pct={highPct}
          onPointerDown={startDrag('high')}
          color={skin.sliderEnd}
        />
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginTop: 10, gap: 12,
        fontFamily: t.eyebrowFont, fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: '0.24em',
        textTransform: 'uppercase', color: t.fgFaint,
      }}>
        <span>Min · {formatMoney(minParsed.value, suffix)}</span>
        <span>Max · {formatMoney(maxParsed.value, suffix)}</span>
      </div>
    </div>
  );
}

function Thumb({ pct, color, onPointerDown }) {
  return (
    <button
      type="button"
      onPointerDown={(e) => { e.stopPropagation(); onPointerDown(e); }}
      aria-label="Adjust"
      style={{
        position: 'absolute', top: '50%',
        left: `${pct * 100}%`,
        transform: 'translate(-50%, -50%)',
        width: 18, height: 18, borderRadius: '50%',
        background: color, border: '2px solid #fff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
        padding: 0, cursor: 'grab',
      }}
    />
  );
}

function RoleSection({ s, form, setForm, errors }) {
  const skin = useInquirySkin();
  const t = skin.t;

  const setField = (label) => (v) => {
    setForm(f => ({ ...f, fields: { ...f.fields, [label]: v } }));
  };
  const toggleChip = (sectionLabel, chip) => {
    setForm(f => {
      const current = f.chips[sectionLabel] || [];
      const next = current.includes(chip)
        ? current.filter(c => c !== chip)
        : [...current, chip];
      return { ...f, chips: { ...f.chips, [sectionLabel]: next } };
    });
  };
  const setNote = (label) => (v) => {
    setForm(f => ({ ...f, notes: { ...f.notes, [label]: v } }));
  };

  if (s.title && s.cols) {
    const gridCols = `repeat(${Math.max(1, s.cols.length)}, 1fr)`;
    return (
      <div style={{ marginBottom: 28 }}>
        <div style={{ marginBottom: 16, paddingBottom: 10, borderBottom: `1px solid ${t.line}` }}>
          <Eyebrow color={t.accent}>{s.title}</Eyebrow>
        </div>
        <div className="tw-form-pair" style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 32 }}>
          {s.cols.map((c, i) => (
            <InputField
              key={i} {...c}
              value={form.fields[c.label] || ''}
              onChange={setField(c.label)}
              required={NAME_LABELS.has(c.label) || CONTACT_LABELS.has(c.label)}
              error={errors[c.label]}
            />
          ))}
        </div>
      </div>
    );
  }
  if (s.type === 'pair') {
    const gridCols = `repeat(${Math.max(1, s.cols.length)}, 1fr)`;
    return (
      <div className="tw-form-pair" style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 32, marginBottom: 24 }}>
        {s.cols.map((c, i) => (
          <InputField
            key={i} {...c}
            value={form.fields[c.label] || ''}
            onChange={setField(c.label)}
            required={NAME_LABELS.has(c.label) || CONTACT_LABELS.has(c.label)}
            error={errors[c.label]}
          />
        ))}
      </div>
    );
  }
  if (s.type === 'dropdown') {
    if (s.multi) {
      const selected = form.chips[s.label] || [];
      const otherKey = `${s.label} — other`;
      const otherValue = form.fields[otherKey] || '';
      const hasOther = selected.includes('Other');
      const setSelected = (next) => {
        setForm(f => {
          const nextChips  = { ...f.chips,  [s.label]: next };
          const nextFields = { ...f.fields };
          if (!next.includes('Other')) nextFields[otherKey] = '';
          return { ...f, chips: nextChips, fields: nextFields };
        });
      };
      return (
        <div style={{ marginBottom: 26 }}>
          <FormLabel>{s.label}</FormLabel>
          <EditorialSelect
            multi
            value={selected}
            onChange={setSelected}
            options={s.options}
            placeholder="Select…"
          />
          {hasOther && (
            <div style={{ marginTop: 14 }}>
              <FormLabel>Other — please specify</FormLabel>
              <TextField
                value={otherValue}
                onChange={setField(otherKey)}
                placeholder="Type the neighborhood, city, or area…"
              />
            </div>
          )}
        </div>
      );
    }
    return (
      <div style={{ marginBottom: 26 }}>
        <InputField
          label={s.label}
          value={form.fields[s.label] || ''}
          onChange={setField(s.label)}
          dropdown
          options={s.options}
          error={errors[s.label]}
        />
      </div>
    );
  }
  if (s.type === 'chips') {
    const selected = form.chips[s.label] || [];
    const allOptions = [...new Set([...selected, ...s.options])];
    return (
      <div style={{ marginBottom: 26 }}>
        <FormLabel>{s.label}</FormLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {allOptions.map(opt => {
            const isOn = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggleChip(s.label, opt)}
                style={{
                  padding: '8px 14px',
                  background: isOn ? skin.chipBg : 'transparent',
                  color: isOn ? skin.chipFg : t.fgMuted,
                  border: isOn ? 'none' : `1px solid ${t.line}`,
                  fontFamily: t.eyebrowFont,
                  fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  cursor: 'pointer',
                }}>
                {opt} <span style={{ opacity: 0.5 }}>{isOn ? '×' : '+'}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  if (s.type === 'budget') {
    const range = form.budget[s.label] || { low: 0.2, high: 0.8 };
    const setRange = (next) => {
      setForm(f => ({ ...f, budget: { ...f.budget, [s.label]: next } }));
    };
    return (
      <BudgetRange
        label={s.label}
        min={s.min}
        max={s.max}
        range={range}
        onChange={setRange}
      />
    );
  }
  if (s.type === 'note') {
    return (
      <div style={{ marginBottom: 20 }}>
        <FormLabel>{s.label}</FormLabel>
        <textarea
          value={form.notes[s.label] ?? ''}
          onChange={e => setNote(s.label)(e.target.value)}
          placeholder={s.placeholder || "Add anything you'd like Tawny to know…"}
          rows={3}
          style={{
            marginTop: 12, width: '100%', padding: '14px 0',
            background: 'transparent',
            border: 'none', borderBottom: `1px solid ${t.fgMuted}`,
            outline: 'none', resize: 'vertical',
            fontFamily: t.fonts.display, fontStyle: 'italic',
            fontSize: 18, color: skin.valueColor, lineHeight: 1.55,
            boxSizing: 'border-box',
          }}
        />
      </div>
    );
  }
  return null;
}

function RoleForm({ role, form, setForm, errors, submitting, submitError, onSubmit }) {
  const skin = useInquirySkin();
  const t = skin.t;
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} style={{ marginTop: 48 }} noValidate>
      {role.sections.map((s, i) => (
        <RoleSection key={i} s={s} form={form} setForm={setForm} errors={errors} />
      ))}

      <div style={{
        marginTop: 48, paddingTop: 28, borderTop: `1px solid ${t.line}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: 24, flexWrap: 'wrap',
      }}>
        <p style={{ fontSize: 12, color: t.fgFaint, maxWidth: 380, margin: 0, lineHeight: 1.55 }}>
          Submitting shares your details with Tawny only. Never with a third party, never with a marketing list.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {submitError && (
            <span style={{ fontSize: 12, color: skin.error, fontFamily: t.fonts.body }}>
              {submitError}
            </span>
          )}
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '20px 36px',
              background: skin.submitBg, color: skin.submitFg, border: 'none',
              fontFamily: t.eyebrowFont,
              fontSize: 11.5, fontWeight: 600,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              cursor: submitting ? 'wait' : 'pointer',
              opacity: submitting ? 0.6 : 1,
            }}>
            {submitting ? 'Sending…' : 'Send to Tawny →'}
          </button>
        </div>
      </div>
    </form>
  );
}

function SuccessPanel({ role, onReset }) {
  const skin = useInquirySkin();
  const t = skin.t;
  return (
    <div style={{
      marginTop: 48, padding: 'clamp(28px, 4vw, 48px)',
      background: skin.t.bgPanel, border: `1px solid ${t.line}`,
    }}>
      <Eyebrow color={t.accent}>— Received</Eyebrow>
      <h3 style={{
        fontFamily: t.fonts.display, fontWeight: 400,
        fontSize: 'clamp(28px, 3vw, 40px)', margin: '14px 0 0',
        color: skin.selectionColor, letterSpacing: '-0.015em',
      }}>
        Thank you — it's in <em style={{ fontStyle: 'italic' }}>her hands</em>.
      </h3>
      <p style={{
        marginTop: 18, fontFamily: t.fonts.display, fontStyle: 'italic',
        fontSize: 19, color: t.fgMuted, lineHeight: 1.55, maxWidth: 560,
      }}>
        Tawny reads each {role.label.toLowerCase()} inquiry personally and replies within one business day.
        You'll hear from her at the contact you provided.
      </p>
      <button
        type="button"
        onClick={onReset}
        style={{
          marginTop: 24, padding: '14px 22px',
          background: 'transparent', border: `1px solid ${skin.accentLine}`,
          color: skin.selectionColor,
          fontFamily: t.eyebrowFont,
          fontSize: 11, fontWeight: 600,
          letterSpacing: '0.28em',
          textTransform: 'uppercase', cursor: 'pointer',
        }}>
        Send another inquiry
      </button>
    </div>
  );
}

function InteractiveDropdown({ state, selected, onToggle, onPick }) {
  const skin = useInquirySkin();
  const t = skin.t;
  const open = state === 'open';

  return (
    <div style={{ position: 'relative' }}>
      <div onClick={onToggle} style={{
        display: 'flex', alignItems: 'baseline', gap: 'clamp(8px, 2vw, 18px)',
        paddingBottom: 'clamp(16px, 2.5vw, 22px)',
        borderBottom: `2px solid ${skin.accentLine}`,
        cursor: 'pointer', userSelect: 'none',
      }}>
        <span style={{
          fontFamily: t.fonts.display, fontStyle: 'italic', fontWeight: 300,
          fontSize: 'clamp(22px, 5vw, 56px)', color: t.fgFaint, lineHeight: 1, flexShrink: 0,
        }}>I am a</span>
        <span style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <span style={{
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(24px, 5.5vw, 60px)',
            color: selected ? skin.selectionColor : skin.selectionFaint,
            lineHeight: 1, letterSpacing: '-0.012em',
            display: 'inline-block', whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
          }}>{selected ? selected.label : (open ? ' ' : 'choose…')}</span>
          {open && (
            <span style={{
              display: 'inline-block', width: 2, height: 'clamp(22px, 4.5vw, 52px)',
              background: skin.cursorColor, marginLeft: 2, verticalAlign: 'middle',
              transform: 'translateY(-4px)', animation: 'twBlink 1s steps(2, start) infinite',
            }} />
          )}
        </span>
        <span style={{
          fontFamily: t.fonts.display, fontSize: 'clamp(18px, 3vw, 32px)',
          color: open ? skin.arrowOpenColor : skin.arrowColor,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.25s ease', flexShrink: 0,
        }}>▾</span>
      </div>

      <div style={{
        marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: t.eyebrowFont, fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: '0.28em',
        textTransform: 'uppercase', color: t.fgFaint, gap: 12, flexWrap: 'wrap',
      }}>
        <span>{selected ? selected.sub : 'Required to begin'}</span>
        <span style={{ cursor: 'pointer' }} onClick={onToggle}>{selected ? 'Change selection' : '4 options'}</span>
      </div>

      {open && (
        <div style={{
          marginTop: 16,
          background: skin.rightBg, border: `1px solid ${skin.accentLine}`,
          boxShadow: '0 24px 48px -16px rgba(0,0,0,0.18)',
        }}>
          {ROLE_KEYS.map((k, i) => <DropdownOption key={k} k={k} first={i === 0} onPick={onPick} />)}
        </div>
      )}

      <style>{`@keyframes twBlink { 0%, 50% { opacity: 1 } 50.01%, 100% { opacity: 0 } }`}</style>
    </div>
  );
}

function DropdownOption({ k, first, onPick }) {
  const skin = useInquirySkin();
  const t = skin.t;
  const r = ROLES[k];
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onPick(k)}
      style={{
        display: 'grid', gridTemplateColumns: '40px 1fr auto',
        gap: 16, alignItems: 'center', padding: '20px 18px',
        borderTop: first ? 'none' : `1px solid ${t.line}`,
        background: hover ? t.bgPanel : 'transparent',
        cursor: 'pointer', transition: 'background 0.15s ease',
      }}
    >
      <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 24, color: t.accent, lineHeight: 1 }}>{r.roman}.</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(22px, 2.6vw, 28px)', color: skin.selectionColor, lineHeight: 1, letterSpacing: '-0.012em' }}>{r.label}</div>
        <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 15, color: t.fgMuted, marginTop: 6 }}>{r.sub}</div>
      </div>
      <span style={{
        fontFamily: t.eyebrowFont, fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: hover ? skin.selectionColor : t.fgFaint,
        whiteSpace: 'nowrap',
      }}>{hover ? 'Select →' : 'Select'}</span>
    </div>
  );
}

function InitialHint({ onPick }) {
  const skin = useInquirySkin();
  const t = skin.t;
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ marginTop: 'clamp(32px, 5vw, 56px)' }}>
      <div className="tw-initial-grid" style={{
        padding: 'clamp(28px, 5vw, 48px) 0', borderBottom: `1px dashed ${t.line}`,
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
      }}>
        {ROLE_KEYS.map(k => {
          const r = ROLES[k];
          const isHover = hovered === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => onPick && onPick(k)}
              onMouseEnter={() => setHovered(k)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: '22px 18px',
                background: isHover ? '#fff' : t.bgPanel,
                border: `1px solid ${isHover ? skin.accentLine : t.line}`,
                display: 'flex', flexDirection: 'column', minHeight: 168,
                cursor: 'pointer', textAlign: 'left',
                fontFamily: 'inherit', color: 'inherit',
                transition: 'background 0.15s ease, border-color 0.15s ease',
              }}
            >
              <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 18, color: t.accent }}>{r.roman}.</span>
              <div style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 22, color: skin.selectionColor, marginTop: 10, lineHeight: 1.05 }}>{r.label}</div>
              <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 14, color: t.fgMuted, marginTop: 6, lineHeight: 1.4, flex: 1 }}>{r.sub}</div>
              <div style={{
                marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontFamily: t.eyebrowFont, fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.26em',
                textTransform: 'uppercase', color: isHover ? skin.selectionColor : t.fgFaint,
              }}>
                <span>{isHover ? 'Select' : 'Begin'}</span>
                <span style={{ fontSize: 14 }}>→</span>
              </div>
            </button>
          );
        })}
      </div>
      <p style={{ marginTop: 28, fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 17, color: t.fgFaint, lineHeight: 1.55, maxWidth: 540 }}>
        Choose a path above, by tile or by dropdown. The form below tailors itself to what you select.
      </p>
    </div>
  );
}

// The menu is rendered inline (not absolutely positioned), so no placeholder
// space is needed below it — the container grows naturally around the menu.
function DropdownOpenBody() {
  return null;
}

// ─── The embeddable widget ──────────────────────────────────────────────────
export function InquiryWidget({ syncUrl = false, showHeading = true }) {
  const skin = useInquirySkin();
  const t = skin.t;
  const inq = useInquiryState({ syncUrl });
  const { state, selected, selectedKey, open, toggleOpen, pick } = inq;

  // Form lifecycle, per-role.
  const initialForm = useMemo(() => (selected ? buildInitial(selected) : null), [selected]);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [submitError, setSubmitError] = useState(null);

  // Reset form whenever the role changes.
  useEffect(() => {
    setForm(initialForm);
    setErrors({});
    setStatus('idle');
    setSubmitError(null);
  }, [initialForm]);

  async function handleSubmit() {
    if (!selected || !form) return;
    const errs = validate(selected, form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setSubmitError('Please fix the highlighted fields.');
      return;
    }
    setErrors({});
    setSubmitError(null);
    setStatus('submitting');

    // Find the universal contact fields.
    let name = '';
    let email = '';
    let phone = '';
    for (const [k, v] of Object.entries(form.fields)) {
      if (NAME_LABELS.has(k))   name = v;
      if (EMAIL_LABELS.has(k))  email = v;
      if (PHONE_LABELS.has(k))  phone = v;
    }
    // Budget state is already in absolute dollars; just round and label.
    const budgets = {};
    for (const s of selected.sections) {
      if (s.type !== 'budget') continue;
      const range = form.budget[s.label] || { low: 0, high: 0 };
      const suffix = parseMoney(s.min).suffix;
      budgets[s.label] = {
        low:  Math.round(range.low  || 0),
        high: Math.round(range.high || 0),
        display: `${formatMoney(range.low, suffix)} – ${formatMoney(range.high, suffix)}`,
      };
    }
    // Build a payload that captures every section's collected data.
    const payload = {
      role: selectedKey,
      fields: form.fields,
      chips: form.chips,
      notes: form.notes,
      budgets,
    };
    // Extract a "message" from any note section that has content.
    const message = Object.values(form.notes).filter(Boolean).join('\n\n').trim() || null;

    const { error } = await submitInquiry({
      role: selectedKey, name, email, phone, payload, message,
    });

    if (error) {
      setStatus('error');
      setSubmitError(error.message || 'Something went wrong. Please try again.');
    } else {
      setStatus('success');
      // Scroll the user to the top of the form so they see the success state.
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          const el = document.getElementById('inquiry');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
    }
  }

  function handleReset() {
    setForm(initialForm);
    setErrors({});
    setStatus('idle');
    setSubmitError(null);
  }

  return (
    <div id="inquiry">
      {showHeading && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48, flexWrap: 'wrap', gap: 12 }}>
          <Eyebrow>Intake · One form, four paths</Eyebrow>
          <div style={{
            fontFamily: t.eyebrowFont, fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: '0.28em',
            textTransform: 'uppercase', color: t.fgFaint,
          }}>
            {selected ? `${selected.roman} · ${selected.label.toUpperCase()}` : 'AWAITING SELECTION'}
          </div>
        </div>
      )}

      <InteractiveDropdown state={state} selected={selected} onToggle={toggleOpen} onPick={pick} />

      {!selected && !open && <InitialHint onPick={pick} />}
      {open && <DropdownOpenBody />}

      {selected && !open && status === 'success' && (
        <SuccessPanel role={selected} onReset={handleReset} />
      )}

      {selected && !open && status !== 'success' && form && (
        <RoleForm
          role={selected}
          form={form}
          setForm={setForm}
          errors={errors}
          submitting={status === 'submitting'}
          submitError={submitError}
          onSubmit={handleSubmit}
        />
      )}

      {/* Responsive rules baked in so the widget collapses correctly when
          embedded on the landing page (where the /inquiry page's <style> isn't
          mounted). */}
      <style>{`
        @media (max-width: 900px) {
          .tw-form-pair    { grid-template-columns: 1fr !important; }
          .tw-initial-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 540px) {
          .tw-initial-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ─── The full /inquiry page ─────────────────────────────────────────────────
export default function Inquiry() {
  const skin = useInquirySkin();
  const t = skin.t;
  // Read the selected role for the left panel's portrait tone and quote
  const inq = useInquiryState({ syncUrl: true });
  const tone = inq.selected ? inq.selected.tone : 'warm';

  return (
    <div style={{ background: t.bgPage, fontFamily: t.fonts.body, color: t.fgPage, minHeight: '100vh' }}>
      <TopNav active="" />

      <div className="tw-inquiry-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr' }}>
        {/* LEFT — editorial panel */}
        <div style={{
          background: skin.leftBg, color: skin.leftFg,
          padding: 'clamp(40px, 7vw, 96px) clamp(20px, 5vw, 64px)',
          display: 'flex', flexDirection: 'column',
        }}>
          <Eyebrow color={skin.leftAccent}>Begin a conversation · Confidential intake</Eyebrow>
          <h1 style={{
            fontFamily: t.fonts.display, fontWeight: 300,
            fontSize: 'clamp(40px, 6.5vw, 88px)', letterSpacing: '-0.022em',
            margin: '24px 0 0', lineHeight: 0.98, color: skin.leftFg,
          }}>
            Tell me how I <em style={{ fontStyle: 'italic' }}>can help.</em>
          </h1>
          <p style={{
            fontFamily: t.fonts.display,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 19,
            lineHeight: 1.6, color: skin.leftMuted, marginTop: 28, maxWidth: 460,
          }}>
            One short form, four kinds of conversation. Choose what you are: buyer, seller, investor, or agent. The intake tailors itself. Tawny reads each note personally and replies within one business day.
          </p>

          <div style={{ marginTop: 48, marginBottom: 36 }}>
            <Photo label="PORTRAIT — TAWNY WALKER, STUDIO" tone={tone} height={340} />
          </div>

          <div style={{ paddingTop: 28, borderTop: `1px solid ${skin.leftLine}` }}>
            <Eyebrow color={skin.leftAccent}>From the studio</Eyebrow>
            <p style={{
              fontFamily: t.fonts.display, fontStyle: 'italic',
              fontSize: 22, lineHeight: 1.5, color: skin.leftFg, marginTop: 14, fontWeight: 400,
            }}>
              {inq.selected ? inq.selected.note : '"Every good conversation in real estate begins with a single, honest sentence: I am a ___ . The rest follows." TW'}
            </p>
          </div>

          <div style={{
            marginTop: 'auto', paddingTop: 40,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontFamily: t.eyebrowFont, fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.55)',
            flexWrap: 'wrap', gap: 12,
          }}>
            <span>Replies within 1 business day</span>
            <span>Encrypted intake · TLS 1.3</span>
          </div>
        </div>

        {/* RIGHT — the interactive widget */}
        <div style={{
          padding: 'clamp(40px, 7vw, 96px) clamp(20px, 5vw, 72px)',
          background: skin.rightBg,
        }}>
          {/* This page uses InquiryWidget with URL sync so ?as=buyer deep-links work */}
          <InquiryPageWidget />
        </div>
      </div>

      <SiteFooter />

      <style>{`
        @media (max-width: 900px) {
          .tw-inquiry-grid { grid-template-columns: 1fr !important; }
          .tw-initial-grid { grid-template-columns: 1fr 1fr !important; }
          .tw-form-pair    { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 540px) {
          .tw-initial-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// Same widget but bound to URL params so ?as=buyer deep-links work on /inquiry.
function InquiryPageWidget() {
  return <InquiryWidget syncUrl={true} />;
}
