// Pure helpers over the inquiry schema. No React, no network — so the wizard,
// the review step, and the lead mapper all read the same rules.

import { SERVICES, SERVICE_KEYS, CONTACT_FIELDS } from '../data/inquiryServices';
import { isEmail, isPhone } from './validation';
import { formatMoney } from './money';

export const STEP_DIRECTION = 0;
export const STEP_ABOUT = 1;
export const STEP_DETAILS = 2;
export const STEP_REVIEW = 3;

// Suffix for the free-text companion a chips field reveals when 'Other' is
// selected. Kept here (not inlined) because the mapper has to fold it back
// into the chip answer — the two must agree or the typed value is lost.
export const OTHER_SUFFIX = ' (other)';

export function aboutFields(service) {
  return CONTACT_FIELDS.concat(service?.aboutExtra || []);
}

export function detailFields(service) {
  return (service?.groups || []).flatMap(g => g.fields);
}

export function allFields(service) {
  return aboutFields(service).concat(detailFields(service));
}

export function fieldsForStep(service, step) {
  if (step === STEP_ABOUT) return aboutFields(service);
  if (step === STEP_DETAILS) return detailFields(service);
  return [];
}

// Ranges open on the middle 60% of their span rather than the full width —
// a slider pinned to both ends reads as "no answer given" in the studio.
export function rangeDefault(field) {
  const span = field.max - field.min;
  const round = v => Math.round(v / field.step) * field.step;
  return [round(field.min + span * 0.2), round(field.min + span * 0.8)];
}

export function buildInitialValues(service) {
  const values = {};
  for (const f of allFields(service)) {
    if (f.type === 'chips') values[f.name] = [];
    else if (f.type === 'range') values[f.name] = rangeDefault(f);
    else values[f.name] = '';
  }
  return values;
}

function isEmpty(field, value) {
  if (field.type === 'chips') return !(value && value.length);
  if (field.type === 'range') return false;
  return !(value != null && String(value).trim());
}

// Per-step validation. Copy follows the design: a single consistent sentence
// shape so the error summary reads as a list rather than a jumble.
export function validateStep(service, step, values) {
  const errors = {};

  for (const f of fieldsForStep(service, step)) {
    if (f.required && isEmpty(f, values[f.name])) {
      errors[f.name] = f.type === 'chips'
        ? `Choose at least one for ${f.label.toLowerCase()}.`
        : `${f.label} is needed before we continue.`;
    }
  }

  if (step === STEP_ABOUT) {
    const email = String(values.email || '').trim();
    const phone = String(values.phone || '').trim();

    if (email) {
      const bad = isEmail(email, 'That email doesn’t look complete. Check for a typo.');
      if (bad) errors.email = bad;
    }
    if (phone && isPhone(phone)) {
      errors.phone = 'That phone number doesn’t look complete. Check for a typo.';
    }
    // Presence is handled by the `required` flags on CONTACT_FIELDS, so all
    // four are enforced and, more importantly, visibly tagged. The rule used
    // to be "an email or a phone", which was real but invisible: nothing on
    // screen said email mattered until you were blocked by it.
  }

  return errors;
}

// The display string for one answer. Also the `a` written into the intake
// JSON, so the studio sees exactly what the person saw on the review step.
export function answerText(field, value, values = {}) {
  if (!field) return '';

  if (field.type === 'range') {
    const [lo, hi] = value || rangeDefault(field);
    return `${formatMoney(lo)} to ${formatMoney(hi)}`;
  }

  if (field.type === 'chips') {
    const chosen = value || [];
    if (!chosen.length) return '';
    // Fold the 'Other' free text into the chip it belongs to, so the studio
    // reads one answer per question instead of a dangling extra row.
    const other = String(values[`${field.name}${OTHER_SUFFIX}`] || '').trim();
    return chosen
      .map(v => (v === 'Other' && other) ? `Other: ${other}` : v)
      .join(' · ');
  }

  return String(value ?? '').trim();
}

// One traversal, two consumers: the review step renders this, and the lead
// mapper builds the intake from it. Keeping them on the same function is what
// stops the studio's record from drifting from what the person confirmed.
export function visibleAnswers(service, values) {
  if (!service) return [];
  const rows = [];

  for (const f of aboutFields(service)) {
    rows.push({ step: STEP_ABOUT, field: f, name: f.name, label: f.label,
      answer: answerText(f, values[f.name], values) });
  }
  for (const f of detailFields(service)) {
    rows.push({ step: STEP_DETAILS, field: f, name: f.name, label: f.label,
      answer: answerText(f, values[f.name], values) });
  }
  return rows;
}

// The one-line inbox summary, assembled from fields marked with `summary`.
export function buildSummary(service, values) {
  const marked = allFields(service)
    .filter(f => f.summary)
    .sort((a, b) => a.summary - b.summary);

  const parts = [];
  for (const f of marked) {
    let text = answerText(f, values[f.name], values);
    if (!text) continue;
    // Chip lists can be long; the summary is one line in a table cell.
    if (f.type === 'chips') text = text.split(' · ').slice(0, 3).join(' · ');
    parts.push(text);
  }
  return parts.join(' · ').slice(0, 1000) || null;
}

// Dev-only invariant check. There is no test runner in this repo, and the
// failure modes here are silent (a duplicate name quietly shadows a field; a
// typo'd `crm` quietly drops a database column). This catches them at page
// load in `npm run dev` and compiles out of production entirely.
const ALLOWED_CRM = new Set([
  'first_name', 'last_name', 'email', 'phone', 'entity', 'city', 'notes',
]);

if (import.meta.env.DEV) {
  for (const key of SERVICE_KEYS) {
    const service = SERVICES[key];
    if (!service) { console.error(`[tw] SERVICE_KEYS lists "${key}" but SERVICES has no such entry`); continue; }

    const seen = new Set();
    for (const f of allFields(service)) {
      if (seen.has(f.name)) {
        console.error(`[tw] inquiry schema: duplicate field name "${f.name}" in "${key}", one shadows the other`);
      }
      seen.add(f.name);

      if (f.crm && !ALLOWED_CRM.has(f.crm)) {
        console.error(`[tw] inquiry schema: field "${key}.${f.name}" has unknown crm "${f.crm}"`);
      }
      if (f.type === 'range' && !(f.min < f.max && f.step > 0)) {
        console.error(`[tw] inquiry schema: range "${key}.${f.name}" has an invalid min/max/step`);
      }
      if ((f.type === 'select' || f.type === 'chips' || f.type === 'radio') && !f.options?.length) {
        console.error(`[tw] inquiry schema: "${key}.${f.name}" is a ${f.type} with no options`);
      }
    }
  }
}
