// Unified inquiry schema — one form, four paths.
// Shared between Direction A and Direction B; each direction supplies its own
// renderers (see Inquiry.jsx). Sections support these `type`s:
//   - (title + cols)  → titled section with paired inputs
//   - 'pair'          → ungrouped pair of inputs
//   - 'chips'         → selectable tags (value = selected, options = available)
//   - 'budget'        → min/max range with a midpoint dot
//   - 'note'          → free-form long-form prompt

export const ROLES = {
  buyer: {
    label: 'Buyer',
    sub: 'Find a home worth living in.',
    roman: 'I',
    tone: 'warm',
    title: 'Find a home worth living in.',
    fieldsEstimate: '~6 fields',
    note: '"I treat every buyer like they only get one shot at this. Many of them only do." — TW',
    sections: [
      { title: 'About you', cols: [
        { label: 'Name', placeholder: 'First and last' },
        { label: 'Best contact', placeholder: 'Email or mobile' },
      ]},
      { title: 'The search', cols: [
        { label: 'Household', value: 'Couple, two children', dropdown: true },
        { label: 'Primary or secondary home?', value: 'Primary residence', dropdown: true },
      ]},
      { type: 'chips', label: 'Neighborhoods of interest', value: ['Birmingham', 'Ann Arbor', 'Charlevoix'], options: ['Grosse Pointe Shores', 'Harbor Springs', 'Bloomfield Hills'] },
      { type: 'budget', label: 'Comfortable price range', min: '$2.5M', max: '$8M', center: 0.55 },
      { type: 'pair', cols: [
        { label: 'Ideal move date', value: 'Late summer 2026', dropdown: true },
        { label: 'Financing', value: 'Pre-approved · Conventional', dropdown: true },
      ]},
      { type: 'note', label: 'Anything she should know?', value: 'We saw the Linden Cottage on the Index and would love to start there. We have a dog and a slightly nervous teenager.' },
    ],
  },
  seller: {
    label: 'Seller',
    sub: 'List with intention, not urgency.',
    roman: 'II',
    tone: 'bone',
    title: 'List with intention, not urgency.',
    fieldsEstimate: '~7 fields',
    note: '"The best sales happen quietly. The second-best happen patiently." — TW',
    sections: [
      { title: 'About you', cols: [
        { label: 'Name', placeholder: 'First and last' },
        { label: 'Best contact', placeholder: 'Email or mobile' },
      ]},
      { title: 'The property', cols: [
        { label: 'Address', value: '3201 Maple Road, Birmingham' },
        { label: 'Property type', value: 'Single-family, restored', dropdown: true },
      ]},
      { type: 'pair', cols: [
        { label: 'Approx. square footage', value: '6,420 SF' },
        { label: 'Year acquired', value: '2014' },
      ]},
      { type: 'budget', label: 'Owner-estimated value (range)', min: '$6M', max: '$10M', center: 0.45 },
      { type: 'pair', cols: [
        { label: 'Condition', value: 'Restored 2023', dropdown: true },
        { label: 'Ideal listing window', value: 'Q3 2026 — quiet preferred', dropdown: true },
      ]},
      { type: 'note', label: 'Anything she should know?', value: 'We are open to an off-market introduction first. Photography matters to us — Patrick Lee shot the house last spring.' },
    ],
  },
  investor: {
    label: 'Investor',
    sub: 'Build a portfolio, quietly.',
    roman: 'III',
    tone: 'dusk',
    title: 'Build a portfolio, quietly.',
    fieldsEstimate: '~8 fields',
    note: '"I find buildings the rest of the market has misread, and I introduce them to people who recognize them." — TW',
    sections: [
      { title: 'Principal & vehicle', cols: [
        { label: 'Name', placeholder: 'First and last' },
        { label: 'Entity', value: 'Vega Family Office, LLC' },
      ]},
      { title: 'Mandate', cols: [
        { label: 'Investor type', value: '1031 Exchange · Identifying', dropdown: true },
        { label: 'Hold horizon', value: '7+ years', dropdown: true },
      ]},
      { type: 'chips', label: 'Asset class', value: ['Small multi-family', 'Mixed-use'], options: ['SFR rental', 'Boutique hotel', 'Trophy SFR'] },
      { type: 'budget', label: 'Deployable capital this cycle', min: '$3M', max: '$25M', center: 0.65 },
      { type: 'pair', cols: [
        { label: 'Target unlevered yield', value: '5.5 – 7.0%', dropdown: true },
        { label: 'Will consider off-market?', value: 'Preferred', dropdown: true },
      ]},
      { type: 'note', label: 'Mandate notes', value: 'Replacement property must close by Sep 14. Open to portfolios of 2–3 SFRs. Will not consider new construction.' },
    ],
  },
  agent: {
    label: 'Agent / Renter',
    sub: 'Refer, co-broke, or rent for a season.',
    roman: 'IV',
    tone: 'sage',
    title: 'Refer, co-broke, or rent for a season.',
    fieldsEstimate: '~6 fields',
    note: '"Co-brokes are honored, season rentals are easy, referrals are answered the same day." — TW',
    sections: [
      { title: 'About you', cols: [
        { label: 'Name', placeholder: 'First and last' },
        { label: 'Best contact', placeholder: 'Email or mobile' },
      ]},
      { title: 'Your role', cols: [
        { label: 'I am a…', value: 'Referring agent', dropdown: true },
        { label: 'Brokerage / org', value: 'Coastal & Magnolia, NYC' },
      ]},
      { type: 'pair', cols: [
        { label: 'Stay length (if renter)', value: 'Nov 2026 — Apr 2027', dropdown: true },
        { label: 'Beds preferred', value: '3 BD' },
      ]},
      { type: 'chips', label: 'Neighborhoods', value: ['Grosse Pointe Shores', 'Harbor Springs'], options: ['Grosse Ile', 'Ann Arbor', 'Charlevoix'] },
      { type: 'budget', label: 'Budget (monthly, furnished)', min: '$8K/mo', max: '$45K/mo', center: 0.4 },
      { type: 'note', label: 'Notes', value: 'Buyer is relocating from Brooklyn and will likely convert to purchase by spring. Open to a rent-then-buy structure.' },
    ],
  },
};

export const ROLE_KEYS = ['buyer', 'seller', 'investor', 'agent'];

export const AUDIENCE_CARDS = [
  { key: 'buyer',    n: 'I.',   t: 'Buyers',           sub: 'Find a home worth living in.',        body: 'For families, founders, and creative households searching for a primary residence between Grosse Pointe Shores and the lakefront north.', tone: 'warm' },
  { key: 'seller',   n: 'II.',  t: 'Sellers',          sub: 'List with intention, not urgency.',   body: 'For owners ready to part with a property and curious what an editorial sale looks like — photography, story, and a short list of qualified buyers.', tone: 'bone' },
  { key: 'investor', n: 'III.', t: 'Investors',        sub: 'Build a portfolio, quietly.',         body: 'For 1031 buyers, family offices, and individuals assembling income or appreciation holdings across Michigan.', tone: 'dusk' },
  { key: 'agent',    n: 'IV.',  t: 'Agents & Renters', sub: 'Refer, co-broke, or rent for a season.', body: 'For visiting agents, corporate seasonal renters, and the occasional referral partner. Direct and uncomplicated.', tone: 'sage' },
];
