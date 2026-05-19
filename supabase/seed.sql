-- Seed data. Run after schema.sql.
-- Mirrors src/data/listings.js + src/data/leads.js + src/data/listingDetails.js.

-- ─── Listings ───────────────────────────────────────────────────────────────
insert into public.listings (
  id, addr, street, loc, price, specs, status, tone, tag, img, blurb,
  beds, baths, sqft, lot, built, renovated, architect, listed_at, tagline,
  summary, attributes, area, sort_order
) values
(
  'meridian', 'Meridian House', '980 Cranbrook Road', 'Bloomfield Hills, MI',
  '$5,200,000', '6 BD · 7.5 BA · 8,200 SF · 1.1 AC', 'Active', 'dusk',
  'Cranbrook Estate', 'livingMarble',
  'A 1936 Cranbrook-era estate on 1.1 acres of mature grounds — restored by Studio Renata in 2023.',
  '6', '7.5', '8,200', '1.1 AC', 1936, 2023, NULL, 'Spring 2026',
  'A Cranbrook-era estate on mature grounds — represented by the studio.',
  array[
    'A 1936 Cranbrook-era estate on 1.1 acres of mature grounds — restored by Studio Renata in 2023.',
    'The studio personally oversees photography, story, and inspection — every house comes with a complete record.',
    'Reach out to the studio for a private viewing or to request the full set of disclosures.'
  ],
  '[]'::jsonb, '{}'::jsonb, 10
),
(
  'olive', 'The Olive Pavilion', '3201 Maple Road', 'Birmingham, MI',
  '$4,250,000', '5 BD · 6 BA · 6,420 SF · 0.74 AC', 'Active', 'warm',
  'Walled Garden', 'kitchenWhite',
  'A 1948 mission revival, fully reimagined last year. Walled gardens; west-facing pool.',
  '5', '6', '6,420', '0.74 AC', 1948, 2024, NULL, 'Spring 2026',
  'A mission revival with walled gardens — represented by the studio.',
  array[
    'A 1948 mission revival, fully reimagined last year. Walled gardens; west-facing pool.',
    'The studio personally oversees photography, story, and inspection — every house comes with a complete record.',
    'Reach out to the studio for a private viewing or to request the full set of disclosures.'
  ],
  '[]'::jsonb, '{}'::jsonb, 20
),
(
  'penthouse-three', 'Penthouse Three', 'The Townsend', 'Birmingham, MI',
  '$3,400,000', '4 BD · 5 BA · 4,180 SF', 'Pending', 'cool',
  'Downtown Penthouse', 'kitchenMarbleIsl',
  'The last full-floor unit at The Townsend, with sightlines down Old Woodward and across the Birmingham rooftops.',
  '4', '5', '4,180', '—', 2014, 2024, NULL, 'Spring 2026',
  'The last full-floor unit at The Townsend.',
  array[
    'The last full-floor unit at The Townsend, with sightlines down Old Woodward and across the Birmingham rooftops.',
    'The studio personally oversees photography, story, and inspection — every house comes with a complete record.',
    'Reach out to the studio for a private viewing or to request the full set of disclosures.'
  ],
  '[]'::jsonb, '{}'::jsonb, 30
),
(
  'linden', 'Linden Cottage', '88 Quarton Lake Road', 'Birmingham, MI',
  '$2,950,000', '3 BD · 3 BA · 2,840 SF · 0.42 AC', 'Active', 'sage',
  'Restored 1928', 'deck',
  'A restored 1928 cottage above Quarton Lake. Original stonework; new mechanicals throughout.',
  '3', '3', '2,840', '0.42 AC', 1928, 2022, NULL, 'Spring 2026',
  'A restored 1928 cottage above Quarton Lake.',
  array[
    'A restored 1928 cottage above Quarton Lake. Original stonework; new mechanicals throughout.',
    'The studio personally oversees photography, story, and inspection — every house comes with a complete record.',
    'Reach out to the studio for a private viewing or to request the full set of disclosures.'
  ],
  '[]'::jsonb, '{}'::jsonb, 40
),
(
  'lakeside-reach', 'Lakeside Reach', '7240 Long Lake Road', 'Bloomfield Hills, MI',
  '$4,800,000', '4 BD · 4.5 BA · 3,620 SF', 'Active', 'cool',
  'Lakefront', 'kitchenModernWood',
  'Direct lakefront frontage on Long Lake; a hundred feet of private shoreline and an outbuilding studio.',
  '4', '4.5', '3,620', '142 ft shoreline', 1968, 2023,
  'Original — Saarinen & Associates · Renovation — Studio Renata',
  'Mar 22, 2026',
  'A glass-and-cedar pavilion sitting low against the shoreline of Little Traverse Bay.',
  array[
    'Lakeside Reach was first drawn in 1968 — a single-story modernist pavilion built into a south-facing dune above the western edge of Little Traverse Bay. Glass and cedar; a flat roof that floats above the dune grass; a sequence of rooms that step gently down to a private beach.',
    'Studio Renata''s 2023 renovation kept the original architectural gesture entirely intact, restoring the cedar exterior, replacing the curtain wall with low-iron glazing, and rebuilding the kitchen and primary bath in warm Italian limestone. The mechanicals are new; the spirit is the same.',
    'Offered fully turn-keyed — including the original mid-century furniture, curated and reupholstered by the studio.'
  ],
  '[
    {"l":"Architect","v":"Original — Saarinen & Associates · Renovation — Studio Renata"},
    {"l":"Year built · renovated","v":"1968 · 2023"},
    {"l":"Construction","v":"Cedar over steel frame · low-iron curtain wall · standing-seam zinc roof"},
    {"l":"Heating · cooling","v":"Radiant in-floor (limestone) · two-zone heat pump · ERV"},
    {"l":"Kitchen","v":"Italian limestone · custom oak · Lacanche range · two Sub-Zero refrigerators"},
    {"l":"Primary suite","v":"Lake-facing · dressing room · marble wet room with separate water closet"},
    {"l":"Outdoor","v":"0.62-acre dune lot · 142 ft of private beach · cedar deck (2,400 SF) · outdoor kitchen"},
    {"l":"Garage","v":"Three bays · EV charging · separate workshop"},
    {"l":"Property taxes (2025)","v":"$28,400 / yr"},
    {"l":"Furnishings","v":"Included — original Knoll and Saarinen pieces, reupholstered"}
  ]'::jsonb,
  '{
    "name":"Harbor Springs",
    "body":"A small, quiet town on the northern shoulder of Little Traverse Bay — six minutes to the village, fifteen to the airport at Pellston, two hours to the Mackinac ferry. The house faces south-west; sun on the water in the evening.",
    "coords":"45.43°N · 84.99°W",
    "waterLabel":"Little Traverse Bay · Michigan",
    "nearby":[
      {"l":"Village","v":"6 min"},
      {"l":"Pellston Regional Airport","v":"15 min"},
      {"l":"Petoskey hospital","v":"14 min"},
      {"l":"Boyne Highlands ski","v":"22 min"}
    ]
  }'::jsonb,
  50
),
(
  'number-22', 'Number Twenty-Two', '22 Lone Pine Road', 'Bloomfield Hills, MI',
  '$9,500,000', '8 BD · 11 BA · 14,200 SF · 1.4 AC', 'Active', 'dusk',
  'Trophy Estate', 'livingMarble',
  'A trophy estate on 1.4 acres with formal grounds and a separate caretaker residence.',
  '8', '11', '14,200', '1.4 AC', 1925, 2020, NULL, 'Spring 2026',
  'A trophy estate on 1.4 acres of formal grounds.',
  array[
    'A trophy estate on 1.4 acres with formal grounds and a separate caretaker residence.',
    'The studio personally oversees photography, story, and inspection — every house comes with a complete record.',
    'Reach out to the studio for a private viewing or to request the full set of disclosures.'
  ],
  '[]'::jsonb, '{}'::jsonb, 60
),
(
  'north-shore', 'The North Shore', '1411 Pine Lake Road', 'West Bloomfield, MI',
  '$6,200,000', '7 BD · 9 BA · 11,400 SF', 'Sold', 'night',
  'Sold 2026', 'kitchenModernWood',
  'A Pine Lake estate — sold off-market in eleven days.',
  '7', '9', '11,400', '—', 2005, 2019, NULL, 'Sold January 2026',
  'A Pine Lake estate — sold off-market.',
  array[
    'A Pine Lake estate — sold off-market in eleven days.',
    'The studio personally oversees photography, story, and inspection — every house comes with a complete record.',
    'Reach out to the studio for a private viewing or to request the full set of disclosures.'
  ],
  '[]'::jsonb, '{}'::jsonb, 70
),
(
  'mews-studio', 'Mews Studio', '4 Old Woodward Mews', 'Birmingham, MI',
  '$1,650,000', '2 BD · 2 BA · 1,620 SF', 'Active', 'bone',
  'Pied-à-terre', 'kitchenWhite',
  'A compact pied-à-terre with a private rooftop terrace, half a block off Old Woodward.',
  '2', '2', '1,620', '—', 2018, 2022, NULL, 'Spring 2026',
  'A compact pied-à-terre off Old Woodward.',
  array[
    'A compact pied-à-terre with a private rooftop terrace, half a block off Old Woodward.',
    'The studio personally oversees photography, story, and inspection — every house comes with a complete record.',
    'Reach out to the studio for a private viewing or to request the full set of disclosures.'
  ],
  '[]'::jsonb, '{}'::jsonb, 80
),
(
  'fieldstone', 'Fieldstone House', '660 Yorkshire Road', 'Birmingham, MI',
  '$3,400,000', '5 BD · 5 BA · 5,100 SF · 0.5 AC', 'Sold', 'warm',
  'Sold 2025', 'deck',
  'A 1936 fieldstone Tudor on half an acre — sold to its second viewer.',
  '5', '5', '5,100', '0.5 AC', 1936, 2024, NULL, 'Sold August 2025',
  'A fieldstone Tudor on half an acre.',
  array[
    'A 1936 fieldstone Tudor on half an acre — sold to its second viewer.',
    'The studio personally oversees photography, story, and inspection — every house comes with a complete record.',
    'Reach out to the studio for a private viewing or to request the full set of disclosures.'
  ],
  '[]'::jsonb, '{}'::jsonb, 90
);

-- ─── Leads ──────────────────────────────────────────────────────────────────
-- Fixed UUIDs so attached_listings can reference them.
insert into public.leads (
  id, first_name, last_name, email, phone, role, entity, city, referred_by,
  status, tone, stars, summary, mandate_notes, studio_note, studio_note_saved_at,
  intake, created_at
) values
(
  '11111111-1111-1111-1111-111111111111',
  'Marisol', 'Vega', 'm.vega@vegafo.com', '+1 248 555 0917',
  'Investor', 'Vega Family Office, LLC', 'Birmingham', 'Patrick Lee (photographer)',
  'New', 'dusk', 3,
  'Family office · $25M deployable · 1031 ID period ends Sep 14.',
  '"Replacement property must close by Sep 14. Open to portfolios of 2–3 SFRs if combined basis fits. Will not consider new construction."',
  'Worth a 30-min call this week. Mention the Whitney penthouse comp — she does not see the basis on it yet. Bring Brookmark Holdings into the same conversation if 1031 timing aligns.',
  now() - interval '8 hours',
  '[
    {"q":"Investor type","a":"1031 Exchange · identifying replacement property"},
    {"q":"Decision speed","a":"Same-week with broker call"},
    {"q":"Asset class","a":"Small multi-family (4–20 units) · Mixed-use"},
    {"q":"Target geography","a":"Grosse Pointe Shores · Ann Arbor"},
    {"q":"Deployable capital","a":"$16M (mid-range)"},
    {"q":"Target unlevered yield","a":"5.5 – 7.0%"},
    {"q":"Hold horizon","a":"7+ years"},
    {"q":"Off-market?","a":"Preferred"}
  ]'::jsonb,
  now() - interval '9 hours'
),
(
  '22222222-2222-2222-2222-222222222222',
  'Lena & Idris', 'Okafor', 'lena.okafor@hey.com', '+1 248 555 0218',
  'Buyer', NULL, 'Birmingham', 'Self-referred',
  'New', 'warm', 2,
  'Couple + two kids · $5–7M · Birmingham, Ann Arbor · interested in Linden Cottage.',
  'Open to a 6-month timeline. Two children, dog, slightly nervous teenager.',
  'Schedule a Linden Cottage viewing — interest is real. Photography appointment for their current place could be useful next month.',
  now() - interval '4 hours',
  '[
    {"q":"Household","a":"Couple, two children"},
    {"q":"Primary or secondary","a":"Primary residence"},
    {"q":"Neighborhoods","a":"Birmingham · Bloomfield Hills"},
    {"q":"Budget","a":"$5M – $7M"},
    {"q":"Time frame","a":"3–6 months"},
    {"q":"Pre-approved","a":"Yes"}
  ]'::jsonb,
  now() - interval '11 hours'
),
(
  '33333333-3333-3333-3333-333333333333',
  'David', 'Hsu', 'dhsu@cornell.edu', '+1 248 555 0177',
  'Seller', NULL, 'Birmingham', 'Returning client',
  'New', 'bone', 2,
  '3201 Maple Road, Birmingham · est. $6–10M · relocating Q3.',
  'Owner wants off-market first. Photography by Patrick Lee already exists.',
  'Send a discreet introduction to the two interested investors. Patrick''s photos are quite good; no need to reshoot.',
  now() - interval '1 day',
  '[
    {"q":"Address","a":"3201 Maple Road, Birmingham"},
    {"q":"Property type","a":"Single-family, restored"},
    {"q":"Square footage","a":"6,420 SF"},
    {"q":"Year acquired","a":"2014"},
    {"q":"Owner-estimated value","a":"$6M – $10M"},
    {"q":"Condition","a":"Restored 2023"},
    {"q":"Time frame","a":"3–6 months"}
  ]'::jsonb,
  now() - interval '1 day 4 hours'
),
(
  '44444444-4444-4444-4444-444444444444',
  'Quentin', 'Marsh', 'q.marsh@coastalmag.com', '+1 917 555 0411',
  'Agent', 'Coastal & Magnolia NYC', 'Brooklyn', NULL,
  'Contacted', 'sage', 1,
  'Coastal & Magnolia NYC · seasonal renter Nov–Apr · Grosse Pointe Shores.',
  'Client is relocating from Brooklyn — likely to convert to purchase by spring.',
  'Coordinate with Anya on Grosse Pointe inventory. Quentin is reliable but slow to confirm; budget for two follow-ups.',
  now() - interval '5 days',
  '[
    {"q":"I am a","a":"Referring agent"},
    {"q":"Brokerage","a":"Coastal & Magnolia, NYC"},
    {"q":"Stay length","a":"Nov 2026 — Apr 2027"},
    {"q":"Beds preferred","a":"3 BD"},
    {"q":"Neighborhoods","a":"Birmingham · Bloomfield Hills"},
    {"q":"Budget","a":"$8K – $45K / mo furnished"}
  ]'::jsonb,
  now() - interval '5 days 3 hours'
),
(
  '55555555-5555-5555-5555-555555555555',
  'Rashida', 'Whitlow', 'rashida.whitlow@gmail.com', '+1 248 555 0244',
  'Buyer', NULL, 'Royal Oak', NULL,
  'Contacted', 'warm', 1,
  'Primary residence · $3–5M · Bloomfield Hills preferred · pre-approved.',
  'Pre-approval letter on file. Open to off-market.',
  'Send the Olive Pavilion brochure next Monday — she keeps asking about walled gardens.',
  now() - interval '6 days',
  '[
    {"q":"Household","a":"Couple"},
    {"q":"Primary or secondary","a":"Primary residence"},
    {"q":"Neighborhoods","a":"Bloomfield Hills"},
    {"q":"Budget","a":"$3M – $5M"},
    {"q":"Time frame","a":"Now"},
    {"q":"Pre-approved","a":"Yes"}
  ]'::jsonb,
  now() - interval '6 days 4 hours'
),
(
  '66666666-6666-6666-6666-666666666666',
  'Brookmark', 'Holdings', 'partners@brookmark.com', '+1 312 555 0900',
  'Investor', 'Brookmark Holdings', 'Chicago', 'Vega Family Office referral',
  'Qualified', 'dusk', 3,
  'Boutique hotel + mixed-use · $8M ready · prefers off-market.',
  'Hotel + mixed-use mandate. Cash buyer.',
  'Tee them up for the Townsend penthouse if it falls out of pending. Coordinate with Marisol on 1031.',
  now() - interval '7 days',
  '[
    {"q":"Investor type","a":"Cash buyer · mixed-use"},
    {"q":"Decision speed","a":"4 weeks"},
    {"q":"Asset class","a":"Boutique hotel · mixed-use"},
    {"q":"Target geography","a":"Detroit core · Birmingham"},
    {"q":"Deployable capital","a":"$8M ready"},
    {"q":"Hold horizon","a":"10+ years"},
    {"q":"Off-market?","a":"Preferred"}
  ]'::jsonb,
  now() - interval '7 days 6 hours'
),
(
  '77777777-7777-7777-7777-777777777777',
  'Catherine', 'Pell', 'cpell@aol.com', '+1 248 555 0019',
  'Seller', NULL, 'Birmingham', 'Listing inquiry',
  'Cold', 'bone', 0,
  '4 Old Woodward Mews studio · undecided on timing · price-curious.',
  NULL,
  'Owner is undecided. Send the annual review-of-market PDF in October.',
  now() - interval '13 days',
  '[
    {"q":"Address","a":"4 Old Woodward Mews"},
    {"q":"Property type","a":"Studio condo"},
    {"q":"Owner-estimated value","a":"$1.5M – $1.8M"},
    {"q":"Time frame","a":"Undecided"}
  ]'::jsonb,
  now() - interval '13 days'
);

-- ─── Attached listings ──────────────────────────────────────────────────────
insert into public.attached_listings (lead_id, listing_id, shared_at) values
('11111111-1111-1111-1111-111111111111', 'lakeside-reach', 'May 13'),
('22222222-2222-2222-2222-222222222222', 'linden', 'May 14'),
('66666666-6666-6666-6666-666666666666', 'penthouse-three', 'May 8');
