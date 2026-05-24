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
    fieldsEstimate: '~8 fields',
    note: '"I treat every buyer like they only get one shot at this. Many of them only do." TW',
    sections: [
      { title: 'About you', cols: [
        { label: 'Name', placeholder: 'First and last' },
        { label: 'Email', placeholder: 'name@example.com' },
        { label: 'Phone', placeholder: 'Mobile or office' },
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
      { type: 'dropdown', multi: true, label: 'Neighborhoods of interest', options: ['Birmingham', 'Bloomfield Hills', 'Beverly Hills', 'Royal Oak', 'Troy', 'Novi', 'Northville', 'West Bloomfield', 'Grosse Pointe', 'Other'] },
      { type: 'budget', label: 'Comfortable price range', min: '$50K', max: '$5M', center: 0.4 },
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
        { label: 'Email', placeholder: 'name@example.com' },
        { label: 'Phone', placeholder: 'Mobile or office' },
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
      { type: 'budget', label: 'Owner-estimated value (range)', min: '$50K', max: '$5M', center: 0.4 },
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
      { type: 'pair', cols: [
        { label: 'Email', placeholder: 'name@example.com' },
        { label: 'Phone', placeholder: 'Mobile or office' },
      ]},
      { title: 'Mandate', cols: [
        { label: 'Flip or rental', dropdown: true, options: [
          'Flip', 'Rental', 'Either',
        ]},
        { label: 'Residential or commercial?', dropdown: true, options: [
          'Residential', 'Commercial', 'Mixed-use',
        ]},
      ]},
      { type: 'pair', cols: [
        { label: 'Desired return strategy', dropdown: true, options: [
          'Cash flow', 'Appreciation', 'Flip / value-add', 'Mixed',
        ]},
        { label: 'Preferred markets / areas', placeholder: 'Birmingham, Bloomfield Hills, Royal Oak…' },
      ]},
      { type: 'budget', label: 'Budget to purchase', min: '$100K', max: '$2M', center: 0.45 },
      { type: 'pair', cols: [
        { label: 'Flips successfully completed', placeholder: 'e.g. 4' },
      ]},
      { type: 'note', label: 'Mandate notes', placeholder: 'Timelines, geographic constraints, basis preferences…' },
    ],
  },
  agent: {
    label: 'Agent / Broker',
    sub: 'Stay in the loop on upcoming listings and exclusive off-market opportunities.',
    roman: 'IV',
    tone: 'sage',
    title: 'Stay in the loop on upcoming listings and exclusive off-market opportunities.',
    fieldsEstimate: '~4 fields',
    note: '"Please add your info to stay in the loop with upcoming listings and exclusive off-market opportunities." TW',
    sections: [
      { title: 'About you', cols: [
        { label: 'Name', placeholder: 'First and last' },
        { label: 'Email', placeholder: 'name@example.com' },
        { label: 'Phone', placeholder: 'Mobile or office' },
      ]},
      { type: 'pair', cols: [
        { label: 'Brokerage / org', placeholder: 'e.g. Coastal & Magnolia, NYC' },
      ]},
      { title: 'Social (optional)', cols: [
        { label: 'Instagram', placeholder: '@handle or full URL' },
        { label: 'Facebook',  placeholder: 'facebook.com/yourpage' },
        { label: 'LinkedIn',  placeholder: 'linkedin.com/in/yourname' },
      ]},
    ],
  },
};

export const ROLE_KEYS = ['buyer', 'seller', 'investor', 'agent'];

export const AUDIENCE_CARDS = [
  { key: 'buyer',    n: 'I.',   t: 'Buyers',           sub: 'Find a home worth living in.',                                                       body: 'For families and households searching for a primary residence across Birmingham, Bloomfield Hills, and the surrounding Metro Detroit communities.', tone: 'warm' },
  { key: 'seller',   n: 'II.',  t: 'Sellers',          sub: 'List with intention, not urgency.',                                                  body: 'For owners ready to part with a property and curious what a design-driven sale looks like: photography, story, and a short list of qualified buyers.', tone: 'bone' },
  { key: 'investor', n: 'III.', t: 'Investors',        sub: 'Build a portfolio, quietly.',                                                        body: 'For flippers, cash-flow buyers, and developers assembling residential or commercial holdings across Metro Detroit.', tone: 'dusk' },
  { key: 'agent',    n: 'IV.',  t: 'Agents & Brokers', sub: 'Stay in the loop on upcoming listings and off-market opportunities.',                body: 'For referring agents, co-brokes, and brokers who want early access to upcoming listings and exclusive off-market opportunities.', tone: 'sage' },
];
