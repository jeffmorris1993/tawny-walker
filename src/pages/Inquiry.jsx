import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../theme/DirectionContext';
import { ROLES, ROLE_KEYS } from '../data/inquiryRoles';
import { submitInquiry } from '../lib/queries';
import { required, isEmailOrPhone, firstError } from '../lib/validation';
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
  const isB = t.key === 'B';
  return {
    isB,
    leftBg: isB ? t.palette.emerald : t.bgPanel,
    leftFg: isB ? '#fff' : t.fgPage,
    leftMuted: isB ? 'rgba(255,255,255,0.78)' : t.fgMuted,
    leftLine: isB ? 'rgba(255,255,255,0.18)' : t.line,
    leftAccent: isB ? t.accentSoft : t.accent,
    rightBg: isB ? '#fff' : t.bgPage,
    accentLine: isB ? t.palette.emerald : t.palette.ink,
    headlineColor: isB ? '#fff' : t.fgPage,
    selectionColor: isB ? t.palette.emerald : t.palette.ink,
    selectionFaint: t.palette.ink4,
    arrowColor: isB ? t.palette.emerald : t.fgFaint,
    arrowOpenColor: t.accent,
    cursorColor: t.accent,
    submitBg: isB ? t.palette.emerald : t.palette.ink,
    submitFg: isB ? '#fff' : t.palette.bone,
    chipBg: isB ? t.palette.emerald : t.palette.ink,
    chipFg: isB ? '#fff' : t.palette.bone,
    sliderTrack: t.line,
    sliderEnd: isB ? t.palette.emerald : t.palette.ink,
    sliderMid: t.accent,
    valueColor: isB ? t.palette.emerald : t.fgPage,
    error: '#B5341F',
    t,
  };
}

// ─── Form state helpers ─────────────────────────────────────────────────────
// Identify the two universal contact fields by label.
const NAME_LABELS = new Set(['Name']);
const CONTACT_LABELS = new Set(['Best contact']);

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
      // Seed with the middle 50% of the range; the user drags from there.
      budget[s.label] = { low: 0.2, high: 0.8 };
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
  for (const s of role.sections) {
    if (!s.cols) continue;
    for (const c of s.cols) {
      if (NAME_LABELS.has(c.label)) {
        const err = required(form.fields[c.label], 'Name');
        if (err) errors[c.label] = err;
      } else if (CONTACT_LABELS.has(c.label)) {
        const err = firstError(
          required(form.fields[c.label], 'Best contact'),
          isEmailOrPhone(form.fields[c.label]),
        );
        if (err) errors[c.label] = err;
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
      fontSize: 10, fontWeight: skin.isB ? 600 : 400,
      letterSpacing: skin.isB ? '0.28em' : '0.22em',
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
function EditorialSelect({ value, onChange, options, placeholder, error }) {
  const skin = useInquirySkin();
  const t = skin.t;
  const filled = value && String(value).length > 0;
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

  function pick(opt) {
    onChange && onChange(opt);
    setOpen(false);
  }

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
          {filled ? value : placeholder}
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
            const selected = opt === value;
            return (
              <SelectOption
                key={opt}
                option={opt}
                selected={selected}
                first={i === 0}
                onPick={pick}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// Editorial multi-select: same look as EditorialSelect but each option is
// a togglable checkbox row. Selected items render as a comma-joined list
// in the trigger; long lists collapse to "{count} selected" so the field
// stays one line.
function EditorialMultiSelect({ value, onChange, options, placeholder }) {
  const skin = useInquirySkin();
  const t = skin.t;
  const selected = Array.isArray(value) ? value : [];
  const filled = selected.length > 0;
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

  function toggle(opt) {
    const next = selected.includes(opt)
      ? selected.filter(s => s !== opt)
      : [...selected, opt];
    onChange && onChange(next);
  }
  function clearAll() {
    onChange && onChange([]);
  }

  const summary = !filled
    ? placeholder
    : (selected.length <= 2 ? selected.join(', ') : `${selected.length} selected`);

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', marginTop: 10, paddingBottom: 10, padding: 0,
          background: 'transparent', border: 'none', outline: 'none',
          borderBottom: `1px solid ${t.fgMuted}`,
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
          aria-multiselectable="true"
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
            const isOn = selected.includes(opt);
            return (
              <MultiOption
                key={opt}
                option={opt}
                selected={isOn}
                first={i === 0}
                onToggle={toggle}
              />
            );
          })}
          {filled && (
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

function MultiOption({ option, selected, first, onToggle }) {
  const skin = useInquirySkin();
  const t = skin.t;
  const [hover, setHover] = useState(false);
  const active = hover || selected;
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={() => onToggle(option)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        width: '100%', textAlign: 'left',
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
      <span style={{
        width: 16, height: 16, flexShrink: 0,
        border: `1px solid ${selected ? skin.accentLine : t.fgMuted}`,
        background: selected ? skin.accentLine : 'transparent',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 12, lineHeight: 1,
      }}>{selected ? '✓' : ''}</span>
      <span>{option}</span>
    </button>
  );
}

function SelectOption({ option, selected, first, onPick }) {
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
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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
      <span>{option}</span>
      {selected && (
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
  const lowVal = minParsed.value + (maxParsed.value - minParsed.value) * range.low;
  const highVal = minParsed.value + (maxParsed.value - minParsed.value) * range.high;
  const suffix = minParsed.suffix;

  const trackRef = useRef(null);
  const draggingRef = useRef(null); // 'low' | 'high' | null

  function pctFromClientX(clientX) {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const raw = (clientX - rect.left) / rect.width;
    return Math.min(1, Math.max(0, raw));
  }

  function startDrag(which) {
    return (e) => {
      e.preventDefault();
      draggingRef.current = which;
      const move = (ev) => {
        if (!draggingRef.current) return;
        const pct = pctFromClientX(ev.clientX);
        if (draggingRef.current === 'low') {
          onChange({ low: Math.min(pct, range.high - 0.02), high: range.high });
        } else {
          onChange({ low: range.low, high: Math.max(pct, range.low + 0.02) });
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
    // Snap whichever thumb is closer.
    const distLow = Math.abs(pct - range.low);
    const distHigh = Math.abs(pct - range.high);
    const which = distLow <= distHigh ? 'low' : 'high';
    if (which === 'low') {
      onChange({ low: Math.min(pct, range.high - 0.02), high: range.high });
    } else {
      onChange({ low: range.low, high: Math.max(pct, range.low + 0.02) });
    }
    startDrag(which)(e);
  }

  return (
    <div style={{ marginBottom: 32 }}>
      <FormLabel>{label}</FormLabel>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginTop: 14, gap: 12, flexWrap: 'wrap',
      }}>
        <span style={{ fontFamily: t.fonts.display, fontSize: 28, color: skin.valueColor }}>
          {formatMoney(lowVal, suffix)}
        </span>
        <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 14, color: t.fgFaint }}>to</span>
        <span style={{ fontFamily: t.fonts.display, fontSize: 28, color: skin.valueColor }}>
          {formatMoney(highVal, suffix)}
        </span>
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
          left: `${range.low * 100}%`,
          right: `${(1 - range.high) * 100}%`,
          background: skin.sliderEnd,
          pointerEvents: 'none',
        }} />
        {/* low thumb */}
        <Thumb
          pct={range.low}
          onPointerDown={startDrag('low')}
          color={skin.sliderEnd}
        />
        {/* high thumb */}
        <Thumb
          pct={range.high}
          onPointerDown={startDrag('high')}
          color={skin.sliderEnd}
        />
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginTop: 10, gap: 12,
        fontFamily: t.eyebrowFont, fontSize: 9.5,
        fontWeight: skin.isB ? 600 : 400,
        letterSpacing: skin.isB ? '0.24em' : '0.2em',
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
    return (
      <div style={{ marginBottom: 28 }}>
        <div style={{ marginBottom: 16, paddingBottom: 10, borderBottom: `1px solid ${t.line}` }}>
          <Eyebrow color={t.accent}>{s.title}</Eyebrow>
        </div>
        <div className="tw-form-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
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
    return (
      <div className="tw-form-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 24 }}>
        {s.cols.map((c, i) => (
          <InputField
            key={i} {...c}
            value={form.fields[c.label] || ''}
            onChange={setField(c.label)}
            error={errors[c.label]}
          />
        ))}
      </div>
    );
  }
  if (s.type === 'dropdown') {
    if (s.multi) {
      const selected = form.chips[s.label] || [];
      const setSelected = (next) => {
        setForm(f => ({ ...f, chips: { ...f.chips, [s.label]: next } }));
      };
      return (
        <div style={{ marginBottom: 26 }}>
          <FormLabel>{s.label}</FormLabel>
          <EditorialMultiSelect
            value={selected}
            onChange={setSelected}
            options={s.options}
            placeholder="Select…"
          />
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
                  fontSize: 11, fontWeight: skin.isB ? 600 : 400,
                  letterSpacing: skin.isB ? '0.2em' : '0.16em',
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
              fontSize: 11.5, fontWeight: skin.isB ? 600 : 400,
              letterSpacing: skin.isB ? '0.28em' : '0.24em',
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
          fontSize: 11, fontWeight: skin.isB ? 600 : 400,
          letterSpacing: skin.isB ? '0.28em' : '0.24em',
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
        fontWeight: skin.isB ? 600 : 400,
        letterSpacing: skin.isB ? '0.28em' : '0.24em',
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
        fontWeight: skin.isB ? 600 : 400,
        letterSpacing: skin.isB ? '0.28em' : '0.24em',
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
                background: isHover ? (skin.isB ? '#fff' : t.bgPage) : t.bgPanel,
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
                fontWeight: skin.isB ? 600 : 400,
                letterSpacing: skin.isB ? '0.26em' : '0.22em',
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
  const initialForm = useMemo(() => (selected ? buildInitial(selected) : null), [selectedKey]);
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

    // Find the two universal fields.
    let name = '';
    let contact = '';
    for (const [k, v] of Object.entries(form.fields)) {
      if (NAME_LABELS.has(k)) name = v;
      else if (CONTACT_LABELS.has(k)) contact = v;
    }
    // Resolve budget percentages back to real dollar amounts for the payload.
    const budgets = {};
    for (const s of selected.sections) {
      if (s.type !== 'budget') continue;
      const range = form.budget[s.label] || { low: 0, high: 1 };
      const minP = parseMoney(s.min);
      const maxP = parseMoney(s.max);
      const lowVal = minP.value + (maxP.value - minP.value) * range.low;
      const highVal = minP.value + (maxP.value - minP.value) * range.high;
      budgets[s.label] = {
        low: Math.round(lowVal),
        high: Math.round(highVal),
        display: `${formatMoney(lowVal, minP.suffix)} – ${formatMoney(highVal, minP.suffix)}`,
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
      role: selectedKey, name, contact, payload, message,
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
            fontWeight: skin.isB ? 600 : 400,
            letterSpacing: skin.isB ? '0.28em' : '0.22em',
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
            fontFamily: skin.isB ? t.fonts.display : t.fonts.body,
            fontStyle: skin.isB ? 'italic' : 'normal',
            fontWeight: skin.isB ? 400 : 300,
            fontSize: skin.isB ? 19 : 16.5,
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
            fontWeight: skin.isB ? 600 : 400,
            letterSpacing: skin.isB ? '0.28em' : '0.22em',
            textTransform: 'uppercase',
            color: skin.isB ? 'rgba(255,255,255,0.55)' : t.fgFaint,
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
