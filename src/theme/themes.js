// Direction themes — the single source of truth for both visual languages.
// Direction A: TAWNY & CO. (warm bone/bronze · Cormorant Garamond + Helvetica Neue)
// Direction B: TAWNY & CO. (deep emerald/gold · Playfair Display + Inter)

export const A_PALETTE = {
  paper: '#F6F2EA',
  bone: '#FBF9F5',
  white: '#FFFFFF',
  ink: '#1B1B1A',
  ink2: '#5B5852',
  ink3: '#9A968D',
  ink4: '#C8C3B6',
  line: '#E3DDD0',
  lineSoft: '#EDE8DC',
  bronze: '#6B5A3E',
  bronzeSoft: '#A8946E',
  green: '#4A6B4F',
  amber: '#9C7A3C',
  rose: '#8C4A4A',
};

export const B_PALETTE = {
  emerald: '#0B3D2E',
  emeraldDeep: '#082A20',
  emeraldMid: '#1F5641',
  moss: '#3A6A55',
  gold: '#B59568',
  goldSoft: '#D9C5A2',
  white: '#FFFFFF',
  paper: '#F4F6F2',
  ink: '#1B2820',
  ink2: '#5F6A62',
  ink3: '#97A095',
  ink4: '#C8CDC4',
  line: '#E5E7E1',
  lineSoft: '#EFF1EC',
};

// Photo gradient palettes — both directions ship complete sets so listings can
// keep their `tone` keys and resolve to whichever direction is active.
const A_PHOTO_PALETTES = {
  warm: ['#C7B999', '#A89674', '#7A6A4E'],
  cool: ['#9FA8AD', '#6F7B83', '#4A555E'],
  dusk: ['#A48D74', '#7A6856', '#3D332A'],
  night: ['#3B3A36', '#26251F', '#15140F'],
  bone: ['#E5DDC9', '#CFC4A8', '#A89A78'],
  sage: ['#B0B4A2', '#888C76', '#5A5E4E'],
};

const B_PHOTO_PALETTES = {
  // Direction B uses greener boutique palettes. We map A's tone keys onto
  // direction-B equivalents so shared listing data renders correctly in both.
  warm: ['#A89E84', '#6E6952', '#3D3A2E'],   // olive
  cool: ['#EDE7D9', '#C9C0AE', '#8C8472'],   // marble
  dusk: ['#2F5A48', '#1A3D30', '#0B221B'],   // forest
  night: ['#1F2A24', '#0F1813', '#06100B'],
  bone: ['#D8CFB7', '#B8AB8A', '#7A6E4F'],   // sand
  sage: ['#7B8C73', '#4F6053', '#2B3B33'],   // fern
  // Direction-B-native tones
  forest: ['#2F5A48', '#1A3D30', '#0B221B'],
  moss:   ['#5C7263', '#3F5448', '#243029'],
  fern:   ['#7B8C73', '#4F6053', '#2B3B33'],
  olive:  ['#A89E84', '#6E6952', '#3D3A2E'],
  sand:   ['#D8CFB7', '#B8AB8A', '#7A6E4F'],
  bloom:  ['#E2D6CB', '#A78B7A', '#5B4234'],
  marble: ['#EDE7D9', '#C9C0AE', '#8C8472'],
};

export const THEMES = {
  A: {
    key: 'A',
    name: 'Warm Editorial',
    sub: 'Bone & Bronze · Cormorant',
    palette: A_PALETTE,
    photoPalettes: A_PHOTO_PALETTES,
    photoLabelFont: '"JetBrains Mono", "Geist Mono", ui-monospace, monospace',
    fonts: {
      display: '"Cormorant Garamond", serif',
      body: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      accent: '"JetBrains Mono", "Geist Mono", ui-monospace, monospace',
    },
    bgPage: A_PALETTE.bone,
    bgPanel: A_PALETTE.paper,
    bgDark: A_PALETTE.ink,
    fgPage: A_PALETTE.ink,
    fgMuted: A_PALETTE.ink2,
    fgFaint: A_PALETTE.ink3,
    line: A_PALETTE.line,
    lineSoft: A_PALETTE.lineSoft,
    accent: A_PALETTE.bronze,        // editorial label color
    accentSoft: A_PALETTE.bronzeSoft,
    primary: A_PALETTE.ink,          // primary button bg
    primaryFg: A_PALETTE.bone,
    secondary: 'transparent',
    secondaryBorder: A_PALETTE.ink,
    eyebrowFont: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    eyebrowWeight: 400,
    eyebrowSpacing: '0.28em',
    eyebrowSize: 11,
    headlineWeight: 400,             // Cormorant 400 reads beautifully large
    statusLabels: {
      Active: 'Active', Pending: 'Pending', Sold: 'Sold',
    },
    statusDots: {
      Active: A_PALETTE.green, Pending: A_PALETTE.amber, Sold: A_PALETTE.ink2,
    },
    // Lead lifecycle uses its own labels/dots so it doesn't collide with
    // the listing statuses (which share keys like "Active" in some maps).
    leadStatusLabels: {
      New: 'New', Contacted: 'Contacted', Active: 'Active',
      Closed: 'Closed', Cold: 'Cold',
    },
    leadStatusDots: {
      New: A_PALETTE.bronze, Contacted: A_PALETTE.ink3,
      Active: A_PALETTE.green, Closed: A_PALETTE.ink2,
      Cold: A_PALETTE.ink4,
    },
    navItems: ['Listings', 'About'],
    indexNoun: 'Listings',           // "Current listings"
    indexNounSingular: 'Listing',
    listingNoun: 'listings',
    ctaPrimary: 'Start Your Inquiry',
    ctaSecondary: 'View Current Listings',
    ctaNav: 'Begin Inquiry',
    wordmark: {
      // Both directions share the "TAWNY & CO." mark, but A uses Cormorant for
      // all three parts while B mixes Playfair (TAWNY/CO.) with Cormorant italic (&).
      family: '"Cormorant Garamond", serif',
      ampersandFamily: '"Cormorant Garamond", serif',
    },
    rule: false,                     // B uses a centered '&' rule; A does not
    // Admin / studio chrome
    admin: {
      sidebarBg: A_PALETTE.paper,
      sidebarFg: A_PALETTE.ink,
      sidebarMuted: A_PALETTE.ink3,
      sidebarAccent: A_PALETTE.bronze,
      sidebarSubLabel: A_PALETTE.ink3,
      sidebarBorder: A_PALETTE.line,
      sidebarActiveBg: A_PALETTE.bone,
      sidebarActiveBorder: A_PALETTE.line,
      sidebarBadge: A_PALETTE.ink3,
      sidebarDivider: A_PALETTE.line,
      avatarBg: A_PALETTE.ink,
      avatarFg: A_PALETTE.bone,
      navLabels: { Leads: 'Leads', Listings: 'Listings' },
      indexNavKey: 'Listings',
      indexHeadline: 'Listings',
      addCta: '+ Add a Listing',
      composeHeadline: 'listing',
      attachedNoun: 'listing',
      attachedNounPlural: 'listings',
      // Segmented status changer (LeadDetail header)
      statusChangerBg: A_PALETTE.paper,
      statusChangerBorder: A_PALETTE.line,
      statusChangerActiveBg: A_PALETTE.ink,
      statusChangerActiveFg: A_PALETTE.bone,
      statusChangerIdleFg: A_PALETTE.ink2,
    },
  },

  B: {
    key: 'B',
    name: 'Emerald Couture',
    sub: 'Emerald & Gold · Playfair',
    palette: B_PALETTE,
    photoPalettes: B_PHOTO_PALETTES,
    photoLabelFont: 'Inter, sans-serif',
    fonts: {
      display: '"Playfair Display", serif',
      body: 'Inter, sans-serif',
      accent: '"Cormorant Garamond", serif', // for the italic ampersand
    },
    bgPage: B_PALETTE.white,
    bgPanel: B_PALETTE.paper,
    bgDark: B_PALETTE.emerald,
    fgPage: B_PALETTE.ink,
    fgMuted: B_PALETTE.ink2,
    fgFaint: B_PALETTE.ink3,
    line: B_PALETTE.line,
    lineSoft: B_PALETTE.lineSoft,
    accent: B_PALETTE.gold,
    accentSoft: B_PALETTE.goldSoft,
    primary: B_PALETTE.emerald,
    primaryFg: B_PALETTE.white,
    secondary: 'transparent',
    secondaryBorder: B_PALETTE.emerald,
    eyebrowFont: 'Inter, sans-serif',
    eyebrowWeight: 600,
    eyebrowSpacing: '0.34em',
    eyebrowSize: 10.5,
    headlineWeight: 400,
    statusLabels: {
      Active: 'Available', Pending: 'In Contract', Sold: 'Closed',
    },
    statusDots: {
      Active: B_PALETTE.moss, Pending: B_PALETTE.gold, Sold: B_PALETTE.ink3,
    },
    leadStatusLabels: {
      New: 'New', Contacted: 'Contacted', Active: 'Active',
      Closed: 'Closed', Cold: 'Cold',
    },
    leadStatusDots: {
      New: B_PALETTE.gold, Contacted: B_PALETTE.ink3,
      Active: B_PALETTE.moss, Closed: B_PALETTE.emerald,
      Cold: B_PALETTE.ink4,
    },
    navItems: ['Listings', 'About'],
    indexNoun: 'Listings',
    indexNounSingular: 'Listing',
    listingNoun: 'listings',
    ctaPrimary: 'Begin Your Inquiry',
    ctaSecondary: 'View Current Listings',
    ctaNav: 'Begin Inquiry',
    wordmark: {
      family: '"Playfair Display", serif',
      ampersandFamily: '"Cormorant Garamond", serif',
    },
    rule: true,
    admin: {
      sidebarBg: B_PALETTE.emerald,
      sidebarFg: '#FFFFFF',
      sidebarMuted: 'rgba(255,255,255,0.65)',
      sidebarAccent: B_PALETTE.gold,
      sidebarSubLabel: B_PALETTE.goldSoft,
      sidebarBorder: 'rgba(255,255,255,0.14)',
      sidebarActiveBg: 'rgba(255,255,255,0.08)',
      sidebarActiveBorder: 'rgba(255,255,255,0.15)',
      sidebarBadge: 'rgba(255,255,255,0.6)',
      sidebarDivider: 'rgba(255,255,255,0.14)',
      avatarBg: B_PALETTE.gold,
      avatarFg: B_PALETTE.emerald,
      navLabels: { Leads: 'Leads', Listings: 'Listings' },
      indexNavKey: 'Listings',
      indexHeadline: 'Listings',
      addCta: '+ Add a Listing',
      composeHeadline: 'listing',
      attachedNoun: 'listing',
      attachedNounPlural: 'listings',
      statusChangerBg: B_PALETTE.paper,
      statusChangerBorder: B_PALETTE.line,
      statusChangerActiveBg: B_PALETTE.emerald,
      statusChangerActiveFg: '#FFFFFF',
      statusChangerIdleFg: B_PALETTE.ink2,
    },
  },
};

export const DIRECTION_KEYS = ['A', 'B'];
