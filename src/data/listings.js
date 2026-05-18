// Shared listings data — used by both Direction A and Direction B.
// `tone` keys resolve into each direction's photo palette (see themes.js);
// `img` points at a real photo under /photos/ so the Photo primitive renders
// it on top of the colored fill.

import { PHOTOS } from '../components/Photo';

export const LISTINGS = [
  { id: 'meridian',        addr: 'Meridian House',     street: '980 Cranbrook Road',   loc: 'Bloomfield Hills, MI', price: '$5,200,000',  specs: '6 BD · 7.5 BA · 8,200 SF · 1.1 AC',  status: 'Active',  tone: 'dusk', tag: 'Cranbrook Estate',    img: PHOTOS.livingMarble,     blurb: 'A 1936 Cranbrook-era estate on 1.1 acres of mature grounds — restored by Studio Renata in 2023.' },
  { id: 'olive',           addr: 'The Olive Pavilion', street: '3201 Maple Road',      loc: 'Birmingham, MI',       price: '$4,250,000',  specs: '5 BD · 6 BA · 6,420 SF · 0.74 AC',   status: 'Active',  tone: 'warm', tag: 'Walled Garden',       img: PHOTOS.kitchenWhite,     blurb: 'A 1948 mission revival, fully reimagined last year. Walled gardens; west-facing pool.' },
  { id: 'penthouse-three', addr: 'Penthouse Three',    street: 'The Townsend',         loc: 'Birmingham, MI',       price: '$3,400,000',  specs: '4 BD · 5 BA · 4,180 SF',             status: 'Pending', tone: 'cool', tag: 'Downtown Penthouse',  img: PHOTOS.kitchenMarbleIsl, blurb: 'The last full-floor unit at The Townsend, with sightlines down Old Woodward and across the Birmingham rooftops.' },
  { id: 'linden',          addr: 'Linden Cottage',     street: '88 Quarton Lake Road', loc: 'Birmingham, MI',       price: '$2,950,000',  specs: '3 BD · 3 BA · 2,840 SF · 0.42 AC',   status: 'Active',  tone: 'sage', tag: 'Restored 1928',       img: PHOTOS.deck,             blurb: 'A restored 1928 cottage above Quarton Lake. Original stonework; new mechanicals throughout.' },
  { id: 'lakeside-reach',  addr: 'Lakeside Reach',     street: '7240 Long Lake Road',  loc: 'Bloomfield Hills, MI', price: '$4,800,000',  specs: '4 BD · 4.5 BA · 3,620 SF',           status: 'Active',  tone: 'cool', tag: 'Lakefront',           img: PHOTOS.kitchenModernWood, blurb: 'Direct lakefront frontage on Long Lake; a hundred feet of private shoreline and an outbuilding studio.' },
  { id: 'number-22',       addr: 'Number Twenty-Two',  street: '22 Lone Pine Road',    loc: 'Bloomfield Hills, MI', price: '$9,500,000',  specs: '8 BD · 11 BA · 14,200 SF · 1.4 AC',  status: 'Active',  tone: 'dusk', tag: 'Trophy Estate',       img: PHOTOS.livingMarble,     blurb: 'A trophy estate on 1.4 acres with formal grounds and a separate caretaker residence.' },
  { id: 'north-shore',     addr: 'The North Shore',    street: '1411 Pine Lake Road',  loc: 'West Bloomfield, MI',  price: '$6,200,000',  specs: '7 BD · 9 BA · 11,400 SF',            status: 'Sold',    tone: 'night',tag: 'Sold 2026',           img: PHOTOS.kitchenModernWood, blurb: 'A Pine Lake estate — sold off-market in eleven days.' },
  { id: 'mews-studio',     addr: 'Mews Studio',        street: '4 Old Woodward Mews',  loc: 'Birmingham, MI',       price: '$1,650,000',  specs: '2 BD · 2 BA · 1,620 SF',             status: 'Active',  tone: 'bone', tag: 'Pied-à-terre',        img: PHOTOS.kitchenWhite,     blurb: 'A compact pied-à-terre with a private rooftop terrace, half a block off Old Woodward.' },
  { id: 'fieldstone',      addr: 'Fieldstone House',   street: '660 Yorkshire Road',   loc: 'Birmingham, MI',       price: '$3,400,000',  specs: '5 BD · 5 BA · 5,100 SF · 0.5 AC',    status: 'Sold',    tone: 'warm', tag: 'Sold 2025',           img: PHOTOS.deck,             blurb: 'A 1936 fieldstone Tudor on half an acre — sold to its second viewer.' },
];

export const TESTIMONIALS = [
  { q: 'Tawny found us a house we did not know existed, in a neighborhood we had not considered, for a price that surprised us. The whole thing took six weeks.',           a: 'Lena & Idris Okafor', r: 'Buyers · Birmingham' },
  { q: 'She sold our place in eleven days, off-market, to the second person she showed it to. The photography alone was worth the commission.',                            a: 'David Hsu',           r: 'Seller · Bloomfield Hills' },
  { q: "I have worked with three of the biggest names in Michigan luxury. None of them returned my emails on a Saturday. Tawny does, and she is better.",                  a: 'Marisol Vega',        r: 'Investor · Family Office' },
];

// Three qualitative pillars of the practice — used on the landing intro and
// on the About credibility band.
export const PILLARS = [
  { h: 'Multi-million dollar',     s: 'annual sales volume' },
  { h: 'Investment & renovation',  s: 'hands-on, both sides' },
  { h: 'An extensive network',     s: 'on- and off-market' },
];

export const STUDIO = {
  phone: '248-860-6114',
  email: 'TAWNYwalker@WeAreDobi.com',
  address: ['2211 Cole Street', 'Birmingham, MI 48009'],
  brokeredBy: 'Brokered by DOBI Real Estate',
  totalSold: 184,
  inventoryCount: LISTINGS.length,
};
