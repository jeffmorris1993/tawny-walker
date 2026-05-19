// Small client-side validators. Each returns null when valid, or a short
// human-readable error string.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /[\d]/; // accept anything that has at least one digit
const PHONE_DIGITS_MIN = 7;

export function required(value, label = 'This field') {
  if (value == null || String(value).trim() === '') return `${label} is required.`;
  return null;
}

export function isEmail(value) {
  if (!value) return null;
  return EMAIL_RE.test(value) ? null : 'Enter a valid email address.';
}

export function isPhone(value) {
  if (!value) return null;
  const digits = String(value).replace(/[^\d]/g, '');
  if (!PHONE_RE.test(value)) return 'Enter a valid phone number.';
  if (digits.length < PHONE_DIGITS_MIN) return 'Enter a valid phone number.';
  return null;
}

// "Best contact" accepts either email or phone.
export function isEmailOrPhone(value) {
  if (!value) return null;
  if (EMAIL_RE.test(value)) return null;
  const digits = String(value).replace(/[^\d]/g, '');
  if (digits.length >= PHONE_DIGITS_MIN) return null;
  return 'Enter an email or phone number.';
}

export function maxLength(value, max, label = 'This field') {
  if (value == null) return null;
  return String(value).length <= max ? null : `${label} must be at most ${max} characters.`;
}

// Combine validators; returns first error.
export function firstError(...errors) {
  return errors.find(e => e != null) || null;
}
