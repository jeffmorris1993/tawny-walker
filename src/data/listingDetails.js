// Editorial detail content for individual listings, keyed by LISTINGS.id.
// Lakeside Reach is the worked example from the design; other listings get a
// generated fallback so /listings/:id never 404s for an id that exists in the
// public index.

import { LISTINGS } from './listings';

const NUMBER_BY_ID = Object.fromEntries(LISTINGS.map((l, i) => [l.id, String(i + 1).padStart(2, '0')]));

const LAKESIDE_REACH = {
  built: 1968,
  renovated: 2023,
  architect: 'Original · Saarinen & Associates · Renovation · Studio Renata',
  listedAt: 'Mar 22, 2026',
  tagline: 'A glass-and-cedar pavilion sitting low against the shoreline of Little Traverse Bay.',
  summary: [
    'Lakeside Reach was first drawn in 1968, a single-story modernist pavilion built into a south-facing dune above the western edge of Little Traverse Bay. Glass and cedar; a flat roof that floats above the dune grass; a sequence of rooms that step gently down to a private beach.',
    'Studio Renata\'s 2023 renovation kept the original architectural gesture entirely intact, restoring the cedar exterior, replacing the curtain wall with low-iron glazing, and rebuilding the kitchen and primary bath in warm Italian limestone. The mechanicals are new; the spirit is the same.',
    'Offered fully turn-keyed, including the original mid-century furniture, curated and reupholstered by the studio.',
  ],
  attributes: [
    { l: 'Architect',                v: 'Original by Saarinen & Associates · Renovation by Studio Renata' },
    { l: 'Year built · renovated',   v: '1968 · 2023' },
    { l: 'Construction',             v: 'Cedar over steel frame · low-iron curtain wall · standing-seam zinc roof' },
    { l: 'Heating · cooling',        v: 'Radiant in-floor (limestone) · two-zone heat pump · ERV' },
    { l: 'Kitchen',                  v: 'Italian limestone · custom oak · Lacanche range · two Sub-Zero refrigerators' },
    { l: 'Primary suite',            v: 'Lake-facing · dressing room · marble wet room with separate water closet' },
    { l: 'Outdoor',                  v: '0.62-acre dune lot · 142 ft of private beach · cedar deck (2,400 SF) · outdoor kitchen' },
    { l: 'Garage',                   v: 'Three bays · EV charging · separate workshop' },
    { l: 'Property taxes (2025)',    v: '$28,400 / yr' },
    { l: 'Furnishings',              v: 'Included · original Knoll and Saarinen pieces, reupholstered' },
  ],
  area: {
    name: 'Harbor Springs',
    body: 'A small, quiet town on the northern shoulder of Little Traverse Bay. Six minutes to the village, fifteen to the airport at Pellston, two hours to the Mackinac ferry. The house faces south-west; sun on the water in the evening.',
    coords: '45.43°N · 84.99°W',
    waterLabel: 'Little Traverse Bay · Michigan',
    nearby: [
      { l: 'Village',                  v: '6 min' },
      { l: 'Pellston Regional Airport', v: '15 min' },
      { l: 'Petoskey hospital',        v: '14 min' },
      { l: 'Boyne Highlands ski',      v: '22 min' },
    ],
  },
  // Gallery toneset, used to drive the mixed-scale grid on the detail page.
  gallery: {
    a: ['warm', 'bone', 'cool', 'dusk', 'cool', 'warm', 'dusk', 'cool'],
    b: ['moss', 'marble', 'bloom', 'forest', 'moss', 'bloom', 'olive', 'forest'],
  },
};

const DETAILS_BY_ID = {
  'lakeside-reach': LAKESIDE_REACH,
};

function fallback(listing) {
  const [city, state] = (listing.loc || '').split(',').map(s => s.trim());
  return {
    built: 1962,
    renovated: 2021,
    architect: 'Original architect unknown · last renovated by Studio Renata',
    listedAt: 'Spring 2026',
    tagline: `${listing.tag || 'A considered residence'} in ${city || 'Michigan'}, represented by the studio.`,
    summary: [
      listing.blurb || 'A privately held residence represented by the studio, available to interested buyers by appointment.',
      'The studio personally oversees photography, story, and inspection. Every house comes with a complete record.',
      'Reach out to the studio for a private viewing or to request the full set of disclosures.',
    ],
    attributes: [
      { l: 'Address',                v: `${listing.street}, ${listing.loc}` },
      { l: 'Year built · renovated', v: '1962 · 2021' },
      { l: 'Specifications',         v: listing.specs },
      { l: 'Heating · cooling',      v: 'High-efficiency forced air · ducted heat pump' },
      { l: 'Kitchen',                v: 'Custom millwork · stone counters · pro-grade appliances' },
      { l: 'Outdoor',                v: 'Landscaped grounds · mature plantings · stone terraces' },
      { l: 'Property taxes (2025)',  v: 'On request' },
      { l: 'Furnishings',            v: 'Available separately by inventory' },
    ],
    area: {
      name: city || 'Michigan',
      body: `Set in ${city || 'a quiet corner of Michigan'}, a community the studio knows well. The full neighborhood report is included with every viewing.`,
      coords: '— · —',
      waterLabel: `${city || 'Michigan'}`,
      nearby: [
        { l: 'Village center', v: '5 min' },
        { l: 'Regional airport', v: '20 min' },
        { l: 'Hospital',       v: '15 min' },
        { l: 'Skiing / lake',  v: '25 min' },
      ],
    },
    gallery: LAKESIDE_REACH.gallery,
  };
}

// Public API — returns a merged object suitable for the detail page.
export function getListingDetail(id) {
  const listing = LISTINGS.find(l => l.id === id);
  if (!listing) return null;
  const detail = DETAILS_BY_ID[id] || fallback(listing);
  return {
    ...listing,
    ...detail,
    number: NUMBER_BY_ID[id] || '—',
  };
}

// Three listings to surface in the "Continue through the Index" rail, skipping
// the one currently being viewed.
export function getRelatedListings(currentId, limit = 3) {
  return LISTINGS
    .filter(l => l.id !== currentId && l.status !== 'Sold')
    .slice(0, limit);
}
