// Hard ceiling for any money field — keeps the editorial format readable
// (we don't want "$1.2B") and prevents accidental zero-spam (1000000000 by
// fat-fingering). Anything typed above this clamps down to this value.
export const MONEY_MAX = 999_000_000;
export const MONEY_MIN = 0;

// Clamp an arbitrary numeric to the legal money range. Negatives become 0,
// values over MONEY_MAX collapse to MONEY_MAX, NaN becomes 0.
export function clampMoney(value) {
  if (!isFinite(value)) return 0;
  if (value < MONEY_MIN) return MONEY_MIN;
  if (value > MONEY_MAX) return MONEY_MAX;
  return value;
}

// Used by onChange handlers: strip any minus signs the user typed, and
// refuse keystrokes that would push the parsed value past MONEY_MAX. When
// the keystroke would overflow, returns the previous input string instead
// so the visible value never exceeds the cap — even mid-typing. Otherwise
// returns the new string verbatim so the user can keep editing freely.
export function clampMoneyString(next, prev = '') {
  const sanitized = String(next).replace(/-/g, '');
  if (sanitized === '') return sanitized;
  const parsed = parseMoney(sanitized);
  if (isFinite(parsed.value) && parsed.value > MONEY_MAX) return prev;
  return sanitized;
}

// Parse loose dollar strings into a numeric value. Accepts plain numbers
// ("10400"), short-suffix amounts ("$10.4K", "1.2M"), comma-separated
// ("$1,200,000"), and trailing units ("$8K/mo"). Returns { value, suffix }
// where suffix is any "/foo" segment so the caller can re-attach it when
// re-formatting.
export function parseMoney(s) {
  const str = String(s ?? '').trim();
  if (!str) return { value: 0, suffix: '' };
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

// Format a number back to the editorial short form. "$1,200,000" → "$1.2M",
// "$10,400,000" → "$10.4M", "$10,400" → "$10.4K", "$520" → "$520". Pass a
// suffix ("/mo") to glue it back on after the dollar number.
export function formatMoney(value, suffix = '') {
  if (!isFinite(value)) return '—';
  let display;
  if (value >= 1_000_000) {
    // Pick precision by magnitude: under 10M keep two decimals (so $1.2M
    // doesn't collapse to "$1M"), 10–99M keep one decimal (so $10.4M
    // doesn't collapse to "$10M"), 100M+ round to integer. Trailing
    // zeros are stripped so we never write "$10.0M" or "$1.20M".
    const m = value / 1_000_000;
    let body;
    if (m >= 100)      body = `${Math.round(m)}`;
    else if (m >= 10)  body = m.toFixed(1).replace(/\.0$/, '');
    else               body = m.toFixed(2).replace(/\.?0+$/, '');
    display = `$${body}M`;
  } else if (value >= 1_000) {
    const k = value / 1_000;
    display = `$${k >= 100 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, '')}K`;
  } else {
    display = `$${Math.round(value)}`;
  }
  return suffix ? display + suffix : display;
}
