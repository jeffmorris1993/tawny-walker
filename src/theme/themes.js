// Direction theme — the single source of truth for the production look.
// Direction B: TAWNY & CO. (deep emerald/gold · Playfair Display + Inter).
// The legacy "warm bone/bronze" Direction A palette was retired when the
// studio committed to the emerald direction.

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

// Photo gradient palettes — used as a tone-key lookup so each listing can
// supply a tone (warm, dusk, sage, etc.) and resolve to the right gradient.
const B_PHOTO_PALETTES = {
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
      'Coming Soon': 'Coming Soon', Active: 'Active', Pending: 'Pending', Sold: 'Sold',
    },
    statusDots: {
      'Coming Soon': B_PALETTE.goldSoft, Active: B_PALETTE.moss, Pending: B_PALETTE.gold, Sold: B_PALETTE.ink3,
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

export const DIRECTION_KEYS = ['B'];
