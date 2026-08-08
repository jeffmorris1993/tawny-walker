// The guided inquiry — six directions, one schema.
//
// Replaces src/data/inquiryRoles.js. The four original paths keep their exact
// question sets and option lists; `design` and `exploring` are new.
//
// THE INVARIANT: every field is addressed by its `name`. Nothing anywhere may
// look a field up by its `label`. The previous schema was label-keyed, and the
// lead mapper matched on literal strings like 'Brokerage / org' — so renaming
// a question silently dropped a database column. Labels are display copy now
// and can be reworded freely.
//
// Field shape:
//   name        stable key — the only thing code may match on
//   label       display copy, also the `q` in the intake JSON
//   type        text | email | tel | select | textarea | chips | radio | range
//   options     select / chips / radio
//   required    blocks the step
//   optional    renders an OPTIONAL tag (purely cosmetic)
//   full        spans both columns
//   otherField  chips only — reveals a text input when 'Other' is picked
//   min/max     range only; the default band is derived, see buildInitialValues
//   crm         which leads column this feeds (see the mapper in queries.js)
//   summary     ordinal — builds the one-line inbox summary
//
// `crm` values: first_name | last_name | email | phone | entity | city | notes
// Anything without a `crm` lands in the intake Q&A list.

const TIMEFRAME_BUY = [
  'Now (under 3 months)', '3 to 6 months', '6 to 12 months',
  '12+ months', 'Just exploring',
];
const TIMEFRAME_SELL = [
  'Now (under 3 months)', '3 to 6 months', '6 to 12 months',
  '12+ months', 'Exploring',
];
// Deliberately kept as two lists. They differ only in the final option
// ('Just exploring' vs 'Exploring') and that wording predates this rewrite —
// normalising them would silently change what past leads' answers mean.

// The contact block every path opens with. All four are required, matching the
// Tawny & Co. list signup: it would read strangely for the low-commitment list
// to ask for more than a real inquiry does. This is stricter than the form it
// replaced, which took a name plus either an email or a phone.
export const CONTACT_FIELDS = [
  { name: 'firstName', label: 'First name', type: 'text', required: true,
    autoComplete: 'given-name', placeholder: 'First', crm: 'first_name' },
  { name: 'lastName', label: 'Last name', type: 'text', required: true,
    autoComplete: 'family-name', placeholder: 'Last', crm: 'last_name' },
  { name: 'email', label: 'Email', type: 'email', required: true,
    autoComplete: 'email', placeholder: 'name@example.com', crm: 'email' },
  { name: 'phone', label: 'Phone', type: 'tel', required: true,
    autoComplete: 'tel', placeholder: 'Mobile or office', crm: 'phone' },
];

export const SERVICES = {
  buy: {
    key: 'buy', param: 'buyer', numeral: 'I', role: 'Buyer', tone: 'warm',
    label: 'I’m looking to buy',
    short: 'Buying',
    tagline: 'Find a home worth living in.',
    desc: 'Find the right property based on your lifestyle, timing, and goals.',
    ctx: 'Most buyers begin with a neighborhood and a feeling. We work backwards from there, into timing, financing, and the handful of homes actually worth seeing.',
    quote: '“I treat every buyer like they only get one shot at this. Many of them only do.”',
    groups: [{
      title: 'The search',
      fields: [
        { name: 'household', label: 'Household', type: 'select', summary: 1,
          options: ['Single', 'Couple', 'Couple, one child', 'Couple, two children',
            'Family, three or more', 'Multi-generational'] },
        { name: 'residenceType', label: 'Primary or secondary home?', type: 'select',
          options: ['Primary residence', 'Secondary residence', 'Investment property'] },
        { name: 'neighborhoods', label: 'Neighborhoods of interest', type: 'chips',
          full: true, otherField: true, summary: 3,
          options: ['Birmingham', 'Bloomfield Hills', 'Beverly Hills', 'Royal Oak',
            'Troy', 'Novi', 'Northville', 'West Bloomfield', 'Grosse Pointe', 'Other'] },
        { name: 'priceRange', label: 'Comfortable price range', type: 'range',
          min: 50_000, max: 5_000_000, step: 10_000, full: true, summary: 4 },
        { name: 'timeframe', label: 'Time frame to buy', type: 'select',
          options: TIMEFRAME_BUY, summary: 2 },
        { name: 'preApproved', label: 'Are you pre-approved?', type: 'select',
          options: ['Yes', 'No', 'In process', 'Cash buyer'] },
        { name: 'notes', label: 'Anything she should know?', type: 'textarea',
          full: true, optional: true, crm: 'notes',
          placeholder: 'Tell Tawny anything she should know about your search…' },
      ],
    }],
  },

  sell: {
    key: 'sell', param: 'seller', numeral: 'II', role: 'Seller', tone: 'bone',
    label: 'I’m considering selling',
    short: 'Selling',
    tagline: 'List with intention, not urgency.',
    desc: 'Explore your property’s potential and the best strategy for your next move.',
    ctx: 'Selling well is mostly preparation. Tell me about the property and where you are in your thinking. There is no obligation in a valuation conversation.',
    quote: '“The best sales happen quietly. The second-best happen patiently.”',
    groups: [{
      title: 'The property',
      fields: [
        { name: 'address', label: 'Address', type: 'text', full: true,
          placeholder: 'Street, city' },
        { name: 'propertyType', label: 'Property type', type: 'select', summary: 1,
          options: ['Single-family', 'Single-family, restored', 'Condo / townhouse',
            'Multi-family', 'Land', 'Commercial'] },
        { name: 'sqft', label: 'Approx. square footage', type: 'text', placeholder: 'e.g. 6,420' },
        { name: 'yearAcquired', label: 'Year acquired', type: 'text', placeholder: 'e.g. 2014' },
        { name: 'valueRange', label: 'Owner-estimated value (range)', type: 'range',
          min: 50_000, max: 5_000_000, step: 10_000, full: true, summary: 3 },
        { name: 'condition', label: 'Condition', type: 'select',
          options: ['New construction', 'Restored', 'Move-in ready', 'Needs cosmetic work',
            'Needs full renovation', 'Tear-down'] },
        { name: 'timeframe', label: 'Time frame to sell', type: 'select',
          options: TIMEFRAME_SELL, summary: 2 },
        { name: 'alsoPurchasing', label: 'Are you also planning to purchase?', type: 'radio',
          full: true, options: ['Yes', 'No', 'Undecided'] },
        { name: 'notes', label: 'Anything she should know?', type: 'textarea',
          full: true, optional: true, crm: 'notes',
          placeholder: 'Photography, off-market preferences, sentimental context…' },
      ],
    }],
  },

  invest: {
    key: 'invest', param: 'investor', numeral: 'III', role: 'Investor', tone: 'dusk',
    label: 'I’m interested in investing',
    short: 'Investing',
    tagline: 'Build a portfolio, quietly.',
    desc: 'Identify opportunities aligned with your budget and investment strategy.',
    ctx: 'I keep a short list of buildings the market has misread. The more specific your mandate, the faster I can tell you whether something fits it.',
    quote: '“I find buildings the rest of the market has misread, then introduce them to people who recognize them.”',
    aboutTitle: 'Principal & vehicle',
    aboutExtra: [
      { name: 'entity', label: 'Entity', type: 'text', crm: 'entity',
        placeholder: 'LLC, family office, or none' },
    ],
    groups: [{
      title: 'Mandate',
      fields: [
        { name: 'flipOrRental', label: 'Flip or rental', type: 'select', summary: 1,
          options: ['Flip', 'Rental', 'Either'] },
        { name: 'propertyClass', label: 'Residential or commercial?', type: 'select', summary: 2,
          options: ['Residential', 'Commercial', 'Mixed-use'] },
        { name: 'returnStrategy', label: 'Desired return strategy', type: 'select',
          options: ['Cash flow', 'Appreciation', 'Flip / value-add', 'Mixed'] },
        { name: 'markets', label: 'Preferred markets / areas', type: 'text',
          placeholder: 'Birmingham, Bloomfield Hills, Royal Oak…' },
        { name: 'budget', label: 'Budget to purchase', type: 'range',
          min: 100_000, max: 2_000_000, step: 10_000, full: true, summary: 3 },
        { name: 'flipsCompleted', label: 'Flips successfully completed', type: 'text',
          placeholder: 'e.g. 4' },
        { name: 'financingMethod', label: 'Financing method', type: 'select',
          options: ['Cash', 'Conventional financing', 'Private lending', 'Hard money', 'Not sure yet'] },
        { name: 'mandateNotes', label: 'Mandate notes', type: 'textarea',
          full: true, optional: true, crm: 'notes',
          placeholder: 'Timelines, geographic constraints, basis preferences…' },
      ],
    }],
  },

  agent: {
    key: 'agent', param: 'agent', numeral: 'IV', role: 'Agent', tone: 'sage',
    label: 'I’m an agent or broker',
    short: 'Agent / broker',
    tagline: 'Stay in the loop on upcoming listings.',
    desc: 'Stay in the loop on upcoming listings and exclusive off-market opportunities.',
    ctx: 'Co-brokes are honored and referrals are answered the same day. Leave your brokerage and where you post, and you’ll hear about listings before they’re public.',
    quote: '“The agents I share early listings with are the ones who answer their phone.”',
    aboutExtra: [
      { name: 'brokerage', label: 'Brokerage / org', type: 'text', crm: 'entity', summary: 1,
        placeholder: 'e.g. Coastal & Magnolia, NYC' },
    ],
    groups: [{
      title: 'Social (optional)',
      fields: [
        { name: 'instagram', label: 'Instagram', type: 'text', optional: true,
          placeholder: '@handle or full URL' },
        { name: 'facebook', label: 'Facebook', type: 'text', optional: true,
          placeholder: 'facebook.com/yourpage' },
        { name: 'linkedin', label: 'LinkedIn', type: 'text', optional: true,
          placeholder: 'linkedin.com/in/yourname' },
      ],
    }],
  },

  design: {
    key: 'design', param: 'design', numeral: 'V', role: 'Design', tone: 'bloom',
    label: 'I’m looking for design or renovation support',
    short: 'Design & renovation',
    tagline: 'Make the house feel inevitable.',
    desc: 'Transform a property through thoughtful design, renovation, and planning.',
    ctx: 'Design work begins with the room you keep walking past. Tell me about the property and the outcome you want, and I’ll bring the right trades to it.',
    quote: '“A good renovation should feel inevitable when it’s finished, as if the house was always meant to be that way.”',
    groups: [{
      title: 'The project',
      fields: [
        { name: 'address', label: 'Property address', type: 'text', full: true,
          placeholder: 'Street, city' },
        { name: 'projectType', label: 'Project type', type: 'select', required: true, summary: 1,
          options: ['Interior design', 'Renovation planning', 'Property styling',
            'Pre-sale preparation', 'Full home transformation', 'Not sure yet'] },
        { name: 'budgetBand', label: 'Estimated budget', type: 'select', required: true, summary: 3,
          options: ['Under $50,000', '$50,000–$150,000', '$150,000–$350,000',
            '$350,000+', 'Not sure yet'] },
        { name: 'timeframe', label: 'Desired timeline', type: 'select', summary: 2,
          options: TIMEFRAME_BUY },
        { name: 'projectStage', label: 'Current project stage', type: 'select',
          options: ['Just considering it', 'Planning and gathering ideas',
            'Ready to begin', 'Already underway', 'Not sure yet'] },
        { name: 'notes', label: 'Anything she should know?', type: 'textarea',
          full: true, optional: true, crm: 'notes',
          placeholder: 'Rooms involved, inspiration, constraints…' },
      ],
    }],
  },

  unsure: {
    key: 'unsure', param: 'exploring', numeral: 'VI', role: 'Exploring', tone: 'moss',
    label: 'I’m not sure yet',
    short: 'Not sure yet',
    tagline: 'Start with a conversation.',
    desc: 'Start with a conversation and we’ll help you determine the right direction.',
    ctx: 'Not knowing yet is a perfectly good place to start. Two questions, and then we talk. No plan required on your end.',
    quote: '“Half of my favorite clients started by telling me they weren’t sure what they needed.”',
    groups: [{
      title: 'What you’re weighing',
      fields: [
        // Deliberately has no `crm` — this is the answer to a question, so it
        // belongs in the intake Q&A rather than being folded into the notes
        // column where it would lose its question.
        { name: 'goals', label: 'What are you hoping to accomplish?', type: 'textarea',
          required: true, full: true, summary: 1,
          placeholder: 'A sentence or two is plenty.' },
        { name: 'contactPreference', label: 'Preferred way to be contacted', type: 'radio',
          required: true, full: true, options: ['Email', 'Phone call', 'Text message'] },
        { name: 'notes', label: 'Anything she should know?', type: 'textarea',
          full: true, optional: true, crm: 'notes' },
      ],
    }],
  },
};

export const SERVICE_KEYS = ['buy', 'sell', 'invest', 'agent', 'design', 'unsure'];

export const SERVICE_BY_PARAM = SERVICE_KEYS.reduce((acc, k) => {
  acc[SERVICES[k].param] = SERVICES[k];
  return acc;
}, {});

// Step labels for the progress indicator.
export const STEPS = ['Your goals', 'About you', 'The details', 'Review'];
