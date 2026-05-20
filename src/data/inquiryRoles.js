// Unified inquiry schema, one form per four paths.
// Shared between Direction A and Direction B; each direction supplies its own
// renderers (see Inquiry.jsx). Sections support these `type`s:
//   (title + cols)  titled section with paired inputs
//   'pair'          ungrouped pair of inputs
//   'chips'         selectable tags (`options` are the available choices)
//   'budget'        min/max range with a midpoint dot
//   'note'          free-form long-form prompt
//
// Field shape inside `cols`:
//   { label, placeholder?, dropdown?, options? }
// When `dropdown: true` and `options` is set, the field renders as a real
// <select>. When `dropdown: true` without `options`, it renders as a text
// input with a chevron decoration.

export const ROLES = {
  buyer: {
    label: 'Buyer',
    sub: 'Find a home worth living in.',
    roman: 'I',
    tone: 'warm',
    title: 'Find a home worth living in.',
    fieldsEstimate: '~7 fields',
    note: '"I treat every buyer like they only get one shot at this. Many of them only do." TW',
    sections: [
      { title: 'About you', cols: [
        { label: 'Name', placeholder: 'First and last' },
        { label: 'Best contact', placeholder: 'Email or mobile' },
      ]},
      { title: 'The search', cols: [
        { label: 'Household', dropdown: true, options: [
          'Single', 'Couple', 'Couple, one child', 'Couple, two children',
          'Family, three or more', 'Multi-generational',
        ]},
        { label: 'Primary or secondary home?', dropdown: true, options: [
          'Primary residence', 'Secondary residence', 'Investment property',
        ]},
      ]},
      { type: 'dropdown', label: 'Neighborhood of interest', options: ['Birmingham', 'Bloomfield Hills', 'Royal Oak', 'Ferndale', 'Novi', 'Northville', 'West Bloomfield', 'Farmington Hills', 'Grosse Pointe', 'Other'] },
      { type: 'budget', label: 'Comfortable price range', min: '$50K', max: '$1.42M', center: 0.55 },
      { type: 'pair', cols: [
        { label: 'Time frame to buy', dropdown: true, options: [
          'Now (under 3 months)', '3 to 6 months', '6 to 12 months',
          '12+ months', 'Just exploring',
        ]},
        { label: 'Are you pre-approved?', dropdown: true, options: [
          'Yes', 'No', 'In process', 'Cash buyer',
        ]},
      ]},
      { type: 'note', label: 'Anything she should know?', placeholder: 'Tell Tawny anything she should know about your search…' },
    ],
  },
  seller: {
    label: 'Seller',
    sub: 'List with intention, not urgency.',
    roman: 'II',
    tone: 'bone',
    title: 'List with intention, not urgency.',
    fieldsEstimate: '~7 fields',
    note: '"The best sales happen quietly. The second-best happen patiently." TW',
    sections: [
      { title: 'About you', cols: [
        { label: 'Name', placeholder: 'First and last' },
        { label: 'Best contact', placeholder: 'Email or mobile' },
      ]},
      { title: 'The property', cols: [
        { label: 'Address', placeholder: 'Street, city' },
        { label: 'Property type', dropdown: true, options: [
          'Single-family', 'Single-family, restored', 'Condo / townhouse',
          'Multi-family', 'Land', 'Commercial',
        ]},
      ]},
      { type: 'pair', cols: [
        { label: 'Approx. square footage', placeholder: 'e.g. 6,420' },
        { label: 'Year acquired', placeholder: 'e.g. 2014' },
      ]},
      { type: 'budget', label: 'Owner-estimated value (range)', min: '$50K', max: '$1.42M', center: 0.45 },
      { type: 'pair', cols: [
        { label: 'Condition', dropdown: true, options: [
          'New construction', 'Restored', 'Move-in ready', 'Needs cosmetic work',
          'Needs full renovation', 'Tear-down',
        ]},
        { label: 'Time frame to sell', dropdown: true, options: [
          'Now (under 3 months)', '3 to 6 months', '6 to 12 months',
          '12+ months', 'Exploring',
        ]},
      ]},
      { type: 'note', label: 'Anything she should know?', placeholder: 'Photography, off-market preferences, sentimental context…' },
    ],
  },
  investor: {
    label: 'Investor',
    sub: 'Build a portfolio, quietly.',
    roman: 'III',
    tone: 'dusk',
    title: 'Build a portfolio, quietly.',
    fieldsEstimate: '~10 fields',
    note: '"I find buildings the rest of the market has misread, and I introduce them to people who recognize them." TW',
    sections: [
      { title: 'Principal & vehicle', cols: [
        { label: 'Name', placeholder: 'First and last' },
        { label: 'Entity', placeholder: 'LLC, family office, or none' },
      ]},
      { title: 'Mandate', cols: [
        { label: 'Investor type', dropdown: true, options: [
          'Cash buyer', '1031 Exchange · identifying', 'Family office',
          'Syndicate', 'Fund', 'Owner-operator',
        ]},
        { label: 'Hold horizon', dropdown: true, options: [
          'Under 3 years (flip)', '3 to 5 years', '5 to 7 years', '7+ years',
        ]},
      ]},
      { type: 'pair', cols: [
        { label: 'Residential or commercial?', dropdown: true, options: [
          'Residential', 'Commercial', 'Mixed-use',
        ]},
        { label: 'Desired return strategy', dropdown: true, options: [
          'Cash flow', 'Appreciation', 'Flip / value-add', 'Mixed',
        ]},
      ]},
      { type: 'chips', label: 'Preferred markets / areas', options: ['Birmingham', 'Bloomfield Hills', 'Royal Oak', 'Ferndale', 'Novi', 'Northville', 'West Bloomfield'] },
      { type: 'budget', label: 'Budget to purchase', min: '$50K', max: '$1.42M', center: 0.65 },
      { type: 'pair', cols: [
        { label: 'Will consider off-market?', dropdown: true, options: [
          'Preferred', 'Yes', 'No', 'Either',
        ]},
        { label: 'Flips successfully completed', placeholder: 'e.g. 4' },
      ]},
      { type: 'note', label: 'Mandate notes', placeholder: 'Timelines, geographic constraints, basis preferences…' },
    ],
  },
  agent: {
    label: 'Agent / Renter',
    sub: 'Stay in the loop on upcoming listings and exclusive off-market opportunities.',
    roman: 'IV',
    tone: 'sage',
    title: 'Stay in the loop on upcoming listings and exclusive off-market opportunities.',
    fieldsEstimate: '~6 fields',
    note: '"Please add your info to stay in the loop with upcoming listings and exclusive off-market opportunities." TW',
    sections: [
      { title: 'About you', cols: [
        { label: 'Name', placeholder: 'First and last' },
        { label: 'Best contact', placeholder: 'Email or mobile' },
      ]},
      { title: 'Your role', cols: [
        { label: 'I am a…', dropdown: true, options: [
          'Referring agent', 'Co-broke', 'Renter', "Buyer's agent", 'Other',
        ]},
        { label: 'Brokerage / org', placeholder: 'e.g. Coastal & Magnolia, NYC' },
      ]},
      { type: 'pair', cols: [
        { label: 'Stay length (if renter)', dropdown: true, options: [
          'Under 1 month', '1 to 3 months', '3 to 6 months', '6+ months', 'Open / flexible',
        ]},
        { label: 'Beds preferred', placeholder: 'e.g. 3 BD' },
      ]},
      { type: 'dropdown', label: 'Neighborhood', options: ['Birmingham', 'Bloomfield Hills', 'Royal Oak', 'Ferndale', 'Novi', 'Northville', 'West Bloomfield', 'Farmington Hills', 'Grosse Pointe', 'Other'] },
      { type: 'budget', label: 'Budget (monthly, furnished)', min: '$8K/mo', max: '$45K/mo', center: 0.4 },
      { type: 'note', label: 'Notes', placeholder: 'Context on the client, timing, structure…' },
    ],
  },
};

export const ROLE_KEYS = ['buyer', 'seller', 'investor', 'agent'];

export const AUDIENCE_CARDS = [
  { key: 'buyer',    n: 'I.',   t: 'Buyers',           sub: 'Find a home worth living in.',                                                       body: 'For families and households searching for a primary residence across Birmingham, Bloomfield Hills, and the surrounding Metro Detroit communities.', tone: 'warm' },
  { key: 'seller',   n: 'II.',  t: 'Sellers',          sub: 'List with intention, not urgency.',                                                  body: 'For owners ready to part with a property and curious what a design-driven sale looks like: photography, story, and a short list of qualified buyers.', tone: 'bone' },
  { key: 'investor', n: 'III.', t: 'Investors',        sub: 'Build a portfolio, quietly.',                                                        body: 'For flippers, cash-flow buyers, and developers assembling residential or commercial holdings across Metro Detroit.', tone: 'dusk' },
  { key: 'agent',    n: 'IV.',  t: 'Agents & Renters', sub: 'Stay in the loop on upcoming listings and off-market opportunities.',                body: 'For referring agents, co-brokes, and anyone who wants early access to upcoming listings and exclusive off-market opportunities.', tone: 'sage' },
];
