// Shared listings data — used by both Direction A and Direction B.
// `tone` keys resolve into each direction's photo palette (see themes.js).

export const LISTINGS = [
  { id: 'meridian', addr: 'Meridian House', street: '411 Lakeshore Road', loc: 'Charlevoix, MI', price: '$14,750,000', specs: '6 BD · 7.5 BA · 8,200 SF · 1.1 AC', status: 'Active', tone: 'dusk', tag: 'Waterfront', blurb: 'A 2019 commission by Sebastián Jaramillo — three pavilions arranged around a courtyard, a private dock, and a saltwater pool that runs the length of the lot.' },
  { id: 'olive', addr: 'The Olive Pavilion', street: '3201 Maple Road', loc: 'Birmingham, MI', price: '$8,250,000', specs: '5 BD · 6 BA · 6,420 SF · 0.74 AC', status: 'Active', tone: 'warm', tag: 'Walled Garden', blurb: 'A 1948 mission revival, restored last year by Studio Renata. Walled gardens; west-facing pool.' },
  { id: 'penthouse-three', addr: 'Penthouse Three', street: 'The Whitney', loc: 'Grosse Pointe Shores, MI', price: '$12,400,000', specs: '4 BD · 5 BA · 4,180 SF', status: 'Pending', tone: 'cool', tag: 'New Construction', blurb: 'The last full-floor unit at The Whitney, with unbroken views from Belle Isle to Lake St. Clair.' },
  { id: 'linden', addr: 'Linden Cottage', street: '88 Hill Street', loc: 'Ann Arbor, MI', price: '$3,950,000', specs: '3 BD · 3 BA · 2,840 SF · 0.42 AC', status: 'Active', tone: 'sage', tag: 'Restored 1928', blurb: 'A restored 1928 cottage on a quiet block. Original stonework; new mechanicals throughout.' },
  { id: 'lakeside-reach', addr: 'Lakeside Reach', street: '7240 Beach Drive', loc: 'Harbor Springs, MI', price: '$6,800,000', specs: '4 BD · 4.5 BA · 3,620 SF', status: 'Active', tone: 'cool', tag: 'Lakefront', blurb: 'Direct lakefront frontage, a hundred feet of private beach, and an outbuilding studio.' },
  { id: 'number-22', addr: 'Number Twenty-Two', street: '22 Lake Shore Drive', loc: 'Grosse Pointe Shores, MI', price: '$28,500,000', specs: '8 BD · 11 BA · 14,200 SF · 1.4 AC', status: 'Active', tone: 'dusk', tag: 'Trophy', blurb: 'A trophy estate on the lakefront, with formal grounds and a separate caretaker residence.' },
  { id: 'north-shore', addr: 'The North Shore', street: '1411 Huron Road', loc: 'Mackinac Island, MI', price: '$22,000,000', specs: '7 BD · 9 BA · 11,400 SF', status: 'Sold', tone: 'night', tag: 'Sold 2026', blurb: 'A summer estate on Mackinac Island — sold off-market in eleven days.' },
  { id: 'lakeside-studio', addr: 'Lakeside Studio', street: '4 Old Woodward Mews', loc: 'Grosse Pointe Shores, MI', price: '$1,850,000', specs: '2 BD · 2 BA · 1,620 SF', status: 'Active', tone: 'bone', tag: 'Pied-à-terre', blurb: 'A compact pied-à-terre with lake views and a private rooftop terrace.' },
  { id: 'fieldstone', addr: 'Fieldstone House', street: '660 Yorkshire Road', loc: 'Birmingham, MI', price: '$5,400,000', specs: '5 BD · 5 BA · 5,100 SF · 0.5 AC', status: 'Sold', tone: 'warm', tag: 'Sold 2025', blurb: 'A 1936 fieldstone Tudor on half an acre — sold to its second viewer.' },
];

export const TESTIMONIALS = [
  { q: 'Tawny found us a house we did not know existed, in a neighborhood we had not considered, for a price that surprised us. The whole thing took six weeks.', a: 'Lena & Idris Okafor', r: 'Buyers · Ann Arbor' },
  { q: 'She sold our place in eleven days, off-market, to the second person she showed it to. The photography alone was worth the commission.', a: 'David Hsu', r: 'Seller · Harbor Springs' },
  { q: 'I have worked with three of the biggest names in Michigan luxury. None of them returned my emails on a Saturday. Tawny does, and she is better.', a: 'Marisol Vega', r: 'Investor · Family Office' },
];

export const STATS = [
  { n: '$184M', l: 'Lifetime Volume' },
  { n: '14 yrs', l: 'In Practice' },
  { n: '97%', l: 'At or above ask' },
];

export const STUDIO = {
  phone: '+1 248 555 0142',
  email: 'studio@tawnyandco.com',
  address: ['1242 Old Woodward Avenue', 'Birmingham, MI 48009'],
  license: '#6505398123',
  totalSold: 184,
  inventoryCount: LISTINGS.length,
};
