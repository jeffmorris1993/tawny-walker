// The Tawny & Co. list — static copy and options.
//
// Interests are optional and off by default; §5.2 (the home-page placement)
// doesn't show them. They're wired through to the `list_interests` column
// regardless, so a future placement can enable them without a schema change.
export const LIST_INTERESTS = [
  'New listings',
  'Off-market opportunities',
  'Buying insights',
  'Selling insights',
  'Investment opportunities',
  'Design and renovation inspiration',
];

// Placements a signup can come from. Must stay in step with the
// leads_list_source_check constraint — the RPC coerces anything unrecognised
// back to 'home-list' rather than rejecting the signup.
export const LIST_SOURCES = [
  'home-list', 'footer', 'listing-detail', 'about',
  'list-page', 'modal', 'inquiry', 'studio',
];
