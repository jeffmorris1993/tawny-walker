// Shared admin data. Both Direction A and Direction B render from these.

export const LEADS = [
  { id: 1, name: 'Marisol Vega',         type: 'Investor', tone: 'dusk', status: 'New',       when: 'Today · 9:42 AM',     summary: 'Family office · $25M deployable · 1031 ID period ends Sep 14.', stars: 3 },
  { id: 2, name: 'Lena & Idris Okafor',  type: 'Buyer',    tone: 'warm', status: 'New',       when: 'Today · 8:11 AM',     summary: 'Couple + two kids · $5–7M · Birmingham, Ann Arbor · interested in Linden Cottage.', stars: 2 },
  { id: 3, name: 'David Hsu',            type: 'Seller',   tone: 'bone', status: 'New',       when: 'Yesterday · 6:24 PM', summary: '3201 Maple Road, Birmingham · est. $6–10M · relocating Q3.', stars: 2 },
  { id: 4, name: 'Quentin Marsh',        type: 'Agent',    tone: 'sage', status: 'Contacted', when: 'May 11 · 2:08 PM',    summary: 'Coastal & Magnolia NYC · seasonal renter Nov–Apr · Grosse Pointe Shores.', stars: 1 },
  { id: 5, name: 'Rashida Whitlow',      type: 'Buyer',    tone: 'warm', status: 'Contacted', when: 'May 10 · 11:00 AM',   summary: 'Primary residence · $3–5M · Bloomfield Hills preferred · pre-approved.', stars: 1 },
  { id: 6, name: 'Brookmark Holdings',   type: 'Investor', tone: 'dusk', status: 'Qualified', when: 'May 9',               summary: 'Boutique hotel + mixed-use · $8M ready · prefers off-market.', stars: 3 },
  { id: 7, name: 'Catherine Pell',       type: 'Seller',   tone: 'bone', status: 'Cold',      when: 'May 3',               summary: '4 Old Woodward Mews studio · undecided on timing · price-curious.', stars: 0 },
];

export const LEAD_FILTERS = [
  { l: 'All',              n: 12, key: 'All' },
  { l: 'Buyers',           n: 5,  key: 'Buyer' },
  { l: 'Sellers',          n: 3,  key: 'Seller' },
  { l: 'Investors',        n: 2,  key: 'Investor' },
  { l: 'Agents / Renters', n: 2,  key: 'Agent' },
];

// Lead detail content for lead #1 (Marisol Vega). In production this would be
// fetched per :id; the demo only needs one shape.
export const LEAD_DETAIL = {
  id: 1,
  name: 'Marisol Vega',
  firstName: 'Marisol',
  lastName: 'Vega',
  entity: 'Vega Family Office, LLC',
  city: 'Birmingham',
  email: 'm.vega@vegafo.com',
  phone: '+1 248 555 0917',
  referredBy: 'Patrick Lee (photographer)',
  receivedAt: 'today 9:42 AM',
  status: 'New',
  type: 'Investor',
  number: '01',
  intake: [
    { q: 'Investor type',         a: '1031 Exchange · identifying replacement property' },
    { q: 'Decision speed',        a: 'Same-week with broker call' },
    { q: 'Asset class',           a: 'Small multi-family (4–20 units) · Mixed-use' },
    { q: 'Target geography',      a: 'Grosse Pointe Shores · Ann Arbor' },
    { q: 'Deployable capital',    a: '$16M (mid-range)' },
    { q: 'Target unlevered yield', a: '5.5 – 7.0%' },
    { q: 'Hold horizon',          a: '7+ years' },
    { q: 'Off-market?',           a: 'Preferred' },
  ],
  mandateNotes: '"Replacement property must close by Sep 14. Open to portfolios of 2–3 SFRs if combined basis fits. Will not consider new construction."',
  studioNote: 'Worth a 30-min call this week. Mention the Whitney penthouse comp — she does not see the basis on it yet. Bring Brookmark Holdings into the same conversation if 1031 timing aligns.',
  studioNoteSavedAt: 'May 16, 10:08 AM',
  activity: [
    { t: 'Intake received',         when: 'Today · 9:42 AM',  highlight: true },
    { t: 'Email opened from studio', when: 'Today · 9:46 AM' },
    { t: 'Note added by TW',         when: 'Today · 10:08 AM' },
  ],
  suggested: [
    { t: 'Penthouse Three',  sub: 'The Whitney', subStatus: 'Pending', price: '$12.4M' },
    { t: 'Lakeside Reach',   sub: '7240 Beach Drive', subStatus: 'Active', price: '$6.8M' },
  ],
};

// Default draft listing used on the AddListing composer.
export const DRAFT_LISTING = {
  number: '07',
  name: 'The Lakefront Mid-rise',
  address: '1888 Lakeshore Drive',
  city: 'Grosse Pointe Shores, MI',
  beds: '4',
  baths: '4.5',
  sqft: '3,840',
  lot: '—',
  price: '$7,400,000',
  status: 'Active',
  description: 'A four-story lakefront residence by Studio Renata — three living levels above a private moorage, with western-facing terraces and a small rooftop pool that overlooks Lake St. Clair.',
  tone: 'dusk',
};

// Sidebar nav config — labels are direction-aware via theme.adminNav.
export const ADMIN_NAV_KEYS = ['Leads', 'Listings', 'Sold Archive', 'Settings'];

export const ADMIN_NAV_COUNTS = {
  Leads: '12',
  Listings: '9',
  'Sold Archive': '184',
};

// Status filter rows for ListingsManager. Labels resolve via theme.statusLabels.
export const LISTING_FILTERS = ['All', 'Active', 'Pending', 'Sold', 'Draft'];
export const LISTING_FILTER_COUNTS = { All: 9, Active: 6, Pending: 1, Sold: 2, Draft: 1 };
