// Static admin config used outside the database — segmented-control orders,
// nav keys, and the empty-form template the AddListing composer starts
// from. Live lead and listing data both come from Supabase.

// Default draft listing used on the AddListing composer.
export const DRAFT_LISTING = {
  number: '07',
  name: '',
  address: '',
  city: '',
  beds: '',
  baths: '',
  sqft: '',
  lot: '',
  price: '',
  status: 'Draft',
  description: '',
  tone: 'warm',
};

// Sidebar nav config — labels are direction-aware via theme.adminNav.
// Pared back to just the two screens that ship: Leads inbox + Listings/Residences.
export const ADMIN_NAV_KEYS = ['Leads', 'Listings'];

// The four statuses a lead can move through; rendered as a segmented control
// on the LeadDetail page.
export const LEAD_STATUS_SEQUENCE = ['New', 'Contacted', 'Qualified', 'Cold'];

// Status filter rows for ListingsManager. Labels resolve via theme.statusLabels.
export const LISTING_FILTERS = ['All', 'Active', 'Pending', 'Sold', 'Draft'];
