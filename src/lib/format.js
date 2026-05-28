// Returns the value as a string, or an em-dash if it's null, undefined,
// or whitespace-only. Used everywhere we render a listing field that the
// studio might have left blank in the editor — DB returns '' for those,
// so a simple `??` defaults to the empty string rather than the dash.
export function dashIfBlank(value, dash = '—') {
  if (value === null || value === undefined) return dash;
  const s = String(value);
  if (s.trim() === '') return dash;
  return s;
}

// Each listing has four nullable date columns — one per status. The
// public detail page and admin row display the date that matches the
// current status (e.g. a Sold listing shows the sold date, an Active
// listing shows the listed date). Falls back to the legacy `listedAt`
// text for rows that predate the per-status columns.
const STATUS_DATE_FIELD = {
  'Coming Soon': 'comingSoonAt',
  Active:        'activeAt',
  Pending:       'pendingAt',
  Sold:          'soldAt',
};

export function listingStatusDate(listing) {
  if (!listing) return null;
  const key = STATUS_DATE_FIELD[listing.status];
  return (key && listing[key]) || listing.listedAt || null;
}

// Public-facing label that pairs with the date — "Coming Soon · listing",
// "Listed", "Pending since", "Sold". Draft listings never show a date.
export function listingStatusDateLabel(status) {
  switch (status) {
    case 'Coming Soon': return 'Listing';
    case 'Active':      return 'Listed';
    case 'Pending':     return 'Pending since';
    case 'Sold':        return 'Sold';
    default:            return null;
  }
}

// Lot sizes are stored as freeform text — sometimes "0.47", sometimes
// "0.6 acres". Normalize so the rendered value always carries the unit:
// a bare numeric gets " acres" appended (or " acre" if it's exactly 1).
// Values that already include any form of "acre" pass through untouched.
export function formatLot(value) {
  if (value === null || value === undefined) return '';
  const s = String(value).trim();
  if (!s) return '';
  if (/acre/i.test(s)) return s;
  if (/^\d+(\.\d+)?$/.test(s)) {
    return Number(s) === 1 ? `${s} acre` : `${s} acres`;
  }
  return s;
}

// Specs strings carry the lot as the trailing " · "-separated token, so
// historical rows with bare-numeric lots ("3 BD · 2 BA · 1980 SF · 0.6")
// also need the acres suffix. Any purely numeric token gets normalized;
// the BD / BA / SF tokens already carry their own units and are left alone.
export function formatSpecs(specs) {
  if (!specs) return '';
  return String(specs)
    .split(' · ')
    .map(token => {
      const trimmed = token.trim();
      if (/^\d+(\.\d+)?$/.test(trimmed)) return formatLot(trimmed);
      return token;
    })
    .join(' · ');
}

// Render a YYYY-MM-DD (the shape Supabase returns for `date`) as
// "Jun 15, 2026". Pass-through for any other shape so legacy `listed_at`
// text values still render verbatim.
export function formatListingDate(value) {
  if (!value) return '';
  const iso = String(value);
  if (!/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso;
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}
