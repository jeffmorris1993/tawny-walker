// Static site content used outside the database — studio metadata used by
// the nav, footer, About page, and Landing. Listing rows themselves live in
// Supabase (see src/lib/queries.js).

// Three qualitative pillars of the practice — used on the landing intro and
// on the About credibility band.
export const PILLARS = [
  { h: 'Multi-Million Dollar',     s: 'Annual Sales Volume' },
  { h: 'Investment & Renovation',  s: 'Hands-On, Both Sides' },
  { h: 'An Extensive Network',     s: 'On- And Off-Market' },
];

export const STUDIO = {
  phone: '248-860-6114',
  email: 'TAWNYwalker@WeAreDobi.com',
  address: ['2211 Cole Street', 'Birmingham, MI 48009'],
  brokeredBy: 'Brokered by DOBI Real Estate',
};
