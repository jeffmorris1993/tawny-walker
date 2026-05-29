import { Link, useParams, useLocation, Navigate } from 'react-router-dom';
import { useTheme } from '../theme/DirectionContext';
import Photo, { PHOTOS } from '../components/Photo';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import StatusChip from '../components/StatusChip';
import { useListing, useRelatedListings, usePreviewOverride } from '../lib/queries';
import { dashIfBlank, formatLot, listingStatusDate, listingStatusDateLabel, formatListingDate } from '../lib/format';
import { parseMoney } from '../lib/money';
import SEO from '../components/SEO';

// The detail page is the same content rendered in two visual directions.
// Section order: breadcrumb → hero → head (name, address, tagline subtitle,
// price, specs) → gallery → CTA → related rail.

function splitName(name) {
  const parts = name.split(' ');
  return [parts[0], parts.slice(1).join(' ')];
}

function ListingDetailB({ L, noindex = false }) {
  const t = useTheme();
  const related = useRelatedListings(L.id);
  const emerald = t.palette.emerald;

  const heroImage = (L.photos && L.photos[0]?.url) || L.img;
  const priceValue = parseMoney(L.price).value || undefined;
  const description = L.tagline || L.blurb
    || `${L.addr || 'Residence'}${L.street ? ` at ${L.street}` : ''}${L.loc ? `, ${L.loc}` : ''}.`;
  // RealEstateListing structured data — what Google + AI tools read to
  // understand the listing without rendering JS.
  const listingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: L.addr,
    description,
    url: `/listings/${L.id}`,
    image: heroImage ? [heroImage] : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: L.street || undefined,
      addressLocality: L.loc || undefined,
      addressRegion: 'MI',
      addressCountry: 'US',
    },
    offers: priceValue ? {
      '@type': 'Offer',
      price: priceValue,
      priceCurrency: 'USD',
      availability: L.status === 'Sold'
        ? 'https://schema.org/SoldOut'
        : 'https://schema.org/InStock',
    } : undefined,
    numberOfRooms: L.beds || undefined,
    numberOfBathroomsTotal: L.baths || undefined,
    floorSize: L.sqft
      ? { '@type': 'QuantitativeValue', value: String(L.sqft).replace(/[^\d]/g, '') || undefined, unitCode: 'FTK' }
      : undefined,
    datePosted: L.activeAt || L.listedAt || undefined,
  };

  const statusDateRaw = listingStatusDate(L);
  const statusDateLabel = listingStatusDateLabel(L.status);
  const statusDateText = statusDateRaw ? formatListingDate(statusDateRaw) : '';

  return (
    <div style={{ background: t.bgPage, fontFamily: t.fonts.body, color: t.fgPage }}>
      <SEO
        title={L.addr || 'Listing'}
        description={description}
        path={`/listings/${L.id}`}
        image={heroImage}
        jsonLd={noindex ? undefined : listingJsonLd}
        noindex={noindex}
      />
      <TopNav active="Listings" />

      {/* breadcrumb */}
      <div style={{
        padding: 'clamp(20px, 3vw, 32px) clamp(20px, 5vw, 72px) 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <span className="tw-detail-crumb" style={{
          fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 600,
          letterSpacing: '0.28em', textTransform: 'uppercase', color: t.fgFaint,
        }}>
          {t.indexNoun} / {t.statusLabels[L.status] || L.status} /{' '}
          <span style={{ color: emerald }}>{L.addr}</span>
        </span>
        <Link to="/listings" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 600,
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: emerald, borderBottom: `1px solid ${emerald}`, paddingBottom: 4, cursor: 'pointer',
          }}>← Return to {t.listingNoun}</span>
        </Link>
      </div>

      {/* HERO */}
      <div style={{ padding: '0 clamp(20px, 5vw, 72px)' }}>
        <Photo label="" tone={L.tone} height={'clamp(360px, 50vw, 720px)'} src={L.img || PHOTOS.livingMarble} width={1800} eager />
      </div>

      {/* HEAD */}
      <div style={{ padding: 'clamp(40px, 5vw, 64px) clamp(20px, 5vw, 72px) 80px' }}>
        <div className="tw-detail-head" style={{
          display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'clamp(28px, 5vw, 80px)', alignItems: 'flex-end',
        }}>
          <div>
            <h1 className="tw-detail-name" style={{
              fontFamily: t.fonts.display, fontWeight: 400,
              fontSize: 'clamp(36px, 6.7vw, 96px)', letterSpacing: '-0.022em', lineHeight: 0.95,
              color: emerald, margin: 0,
            }}>
              {splitName(L.addr)[0]} {splitName(L.addr)[1] && <em style={{ fontStyle: 'italic' }}>{splitName(L.addr)[1]}</em>}.
            </h1>
            <div style={{ marginTop: 18, display: 'flex', alignItems: 'baseline', gap: 18, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 'clamp(18px, 1.8vw, 24px)', color: t.fgMuted }}>
                {dashIfBlank(L.street)}
              </span>
              <span style={{
                fontFamily: t.eyebrowFont, fontSize: 10.5, fontWeight: 600,
                letterSpacing: '0.26em', textTransform: 'uppercase', color: t.fgFaint,
              }}>{dashIfBlank(L.loc)}</span>
            </div>
            {L.tagline && (
              <p style={{
                margin: '22px 0 0', maxWidth: 640,
                fontFamily: t.fonts.display, fontStyle: 'italic', fontWeight: 400,
                fontSize: 'clamp(20px, 2vw, 26px)', lineHeight: 1.35,
                color: emerald, letterSpacing: '-0.005em',
              }}>{L.tagline}</p>
            )}
          </div>
          <div className="tw-detail-offer" style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 600,
              letterSpacing: '0.32em', textTransform: 'uppercase', color: t.palette.gold,
            }}>Offered at</div>
            <div style={{
              fontFamily: t.fonts.display, fontWeight: 400,
              fontSize: 'clamp(40px, 4.8vw, 64px)', color: emerald,
              marginTop: 4, letterSpacing: '-0.01em',
            }}>{dashIfBlank(L.price)}</div>
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: 14, marginTop: 14,
              alignItems: 'center', flexWrap: 'wrap',
            }}>
              <StatusChip status={L.status} size="lg" />
              {statusDateText && statusDateLabel && (
                <>
                  <span style={{ color: t.fgFaint }}>·</span>
                  <span style={{
                    fontFamily: t.eyebrowFont, fontSize: 9.5, fontWeight: 600,
                    letterSpacing: '0.26em', textTransform: 'uppercase', color: t.fgFaint,
                  }}>{statusDateLabel} {statusDateText}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <SpecRow L={L} />
      </div>

      {/* GALLERY */}
      <Gallery L={L} />

      {/* CTA — emerald with motif. Hidden on sold listings. */}
      {L.status !== 'Sold' && (
        <div style={{ padding: '0 clamp(20px, 5vw, 72px) clamp(56px, 8vw, 120px)' }}>
          <div className="tw-detail-cta" style={{
            padding: 'clamp(40px, 6vw, 80px) clamp(28px, 6vw, 88px)',
            background: emerald, color: '#FFFFFF',
            display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'clamp(28px, 6vw, 80px)', alignItems: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -100, right: -100, width: 320, height: 320,
              border: `1px solid ${t.palette.gold}`, borderRadius: '50%', opacity: 0.15,
            }} />
            <div style={{ position: 'relative' }}>
              <span style={{
                fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 600,
                letterSpacing: '0.32em', textTransform: 'uppercase', color: t.palette.gold,
              }}>Continue</span>
              <h2 style={{
                fontFamily: t.fonts.display, fontWeight: 400,
                fontSize: 'clamp(36px, 4.5vw, 56px)', margin: '18px 0 0',
                lineHeight: 1.05, letterSpacing: '-0.015em',
              }}>
                Arrange a <em style={{ fontStyle: 'italic' }}>private viewing</em>.
              </h2>
              <p style={{
                marginTop: 16, fontFamily: t.fonts.display, fontStyle: 'italic',
                fontSize: 'clamp(17px, 1.7vw, 20px)', color: 'rgba(255,255,255,0.78)',
                maxWidth: 520, lineHeight: 1.5,
              }}>
                Shown by appointment with Tawny.
              </p>
            </div>
            <div style={{ position: 'relative' }}>
              <Link to="/#inquiry" style={{ textDecoration: 'none' }}>
                <span style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '24px 32px', background: '#FFFFFF', color: emerald,
                  fontFamily: t.eyebrowFont, fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.28em', textTransform: 'uppercase', cursor: 'pointer',
                }}>
                  Inquire
                  <span style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 24 }}>→</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}

      <RelatedRail related={related} />

      <SiteFooter />
      <DetailStyles />
    </div>
  );
}

// ─── Shared building blocks ─────────────────────────────────────────────────
function SpecRow({ L }) {
  const t = useTheme();
  // Run each through dashIfBlank so empty-string fields from the editor
  // render the same em-dash as missing values, rather than a blank slot.
  const interior = typeof L.sqft === 'string' && L.sqft.trim()
    ? `${L.sqft} sf`
    : (typeof L.sqft === 'number' ? L.sqft : null);
  const items = [
    { l: 'Bedrooms', v: dashIfBlank(L.beds) },
    { l: 'Baths',    v: dashIfBlank(L.baths) },
    { l: 'Interior', v: dashIfBlank(interior) },
    { l: 'Lot',      v: dashIfBlank(formatLot(L.lot)) },
  ];
  return (
    <div className="tw-detail-specs" style={{
      marginTop: 'clamp(40px, 5vw, 64px)', paddingTop: 32, paddingBottom: 32,
      borderTop: `1px solid ${t.palette.emerald}`,
      borderBottom: `1px solid ${t.line}`,
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    }}>
      {items.map((s, i, arr) => (
        <div key={s.l} style={{
          borderRight: i < arr.length - 1 ? `1px solid ${t.line}` : 'none',
          padding: '0 clamp(12px, 1.6vw, 24px)',
        }}>
          <div style={{
            fontFamily: t.eyebrowFont,
            fontSize: 10, fontWeight: 600,
            letterSpacing: '0.3em', textTransform: 'uppercase',
            color: t.palette.gold,
          }}>{s.l}</div>
          <div style={{
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(22px, 2.6vw, 36px)',
            color: t.palette.emerald,
            marginTop: 6, letterSpacing: '-0.01em',
          }}>{s.v}</div>
        </div>
      ))}
    </div>
  );
}

const GALLERY_PHOTOS = [
  PHOTOS.kitchenMarbleIsl,
  PHOTOS.kitchenWhite,
  PHOTOS.livingMarble,
  PHOTOS.kitchenModernWood,
  PHOTOS.deck,
  PHOTOS.kitchenWhite,
  PHOTOS.kitchenMarbleIsl,
  PHOTOS.deck,
];

function Gallery({ L }) {
  // Gallery prefers admin-uploaded photos (L.photos = [{ path, url }, ...]),
  // then any L.gallery photos persisted alongside the listing, falling back
  // to the studio catalogue so a freshly-added listing without a photo set
  // still renders a respectable detail page.
  const uploaded = Array.isArray(L.photos)
    ? L.photos.map(p => (typeof p === 'string' ? p : p?.url)).filter(Boolean)
    : [];
  const galleryPhotos = (L.gallery && Array.isArray(L.gallery.photos) && L.gallery.photos.length > 0)
    ? L.gallery.photos
    : null;
  const source = uploaded.length > 0 ? uploaded : (galleryPhotos || GALLERY_PHOTOS);
  const tones = (L.gallery && Array.isArray(L.gallery.a) && L.gallery.a.length >= 8)
    ? L.gallery.a
    : ['warm', 'bone', 'cool', 'dusk', 'cool', 'warm', 'dusk', 'cool'];

  // Number of tiles to render: at least 6 (so the section never looks
  // sparse), at most 12, but pinned to the actual upload count when uploads
  // exist so we don't repeat photos unnecessarily.
  const tileCount = uploaded.length > 0
    ? Math.min(uploaded.length, 12)
    : 8;
  const tiles = Array.from({ length: tileCount }, (_, i) => ({
    src: source[i % source.length],
    tone: tones[i % tones.length],
  }));

  return (
    <div style={{ padding: 'clamp(40px, 6vw, 80px) clamp(20px, 4.4vw, 64px) clamp(40px, 6vw, 80px)' }}>
      <div className="tw-gallery-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
      }}>
        {tiles.map((tile, i) => (
          <div key={i} style={{ aspectRatio: '3 / 2' }}>
            <Photo label="" tone={tile.tone} height="100%" src={tile.src} width={900} />
          </div>
        ))}
      </div>
    </div>
  );
}

function RelatedRail({ related }) {
  const t = useTheme();
  if (!related || related.length === 0) return null;
  return (
    <div style={{ padding: '0 clamp(20px, 4.4vw, 64px) clamp(56px, 8vw, 120px)' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 'clamp(24px, 3vw, 40px)', flexWrap: 'wrap', gap: 12,
      }}>
        <h3 style={{
          fontFamily: t.fonts.display, fontWeight: 400,
          fontSize: 'clamp(26px, 3vw, 36px)', margin: 0,
          color: t.palette.emerald,
        }}>
          Continue <em style={{ fontStyle: 'italic' }}>through the {t.listingNoun}</em>.
        </h3>
        <Link to="/listings" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: t.eyebrowFont,
            fontSize: 10.5, fontWeight: 600,
            letterSpacing: '0.26em', textTransform: 'uppercase',
            color: t.palette.emerald,
            borderBottom: `1px solid ${t.palette.emerald}`, paddingBottom: 4,
            cursor: 'pointer',
          }}>View all {t.listingNoun} →</span>
        </Link>
      </div>
      <div className="tw-detail-related" style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(20px, 3vw, 32px)',
      }}>
        {related.map(l => (
          <Link key={l.id} to={`/listings/${l.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Photo label="" tone={l.tone} height={'clamp(240px, 28vw, 340px)'} src={l.img} width={900} />
            <div style={{ marginTop: 18 }}>
              <div style={{
                fontFamily: t.fonts.display, fontSize: 26,
                color: t.palette.emerald,
              }}>{l.addr}</div>
              <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 15, color: t.fgMuted }}>{l.loc}</div>
              <div style={{
                marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.line}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{
                  fontFamily: t.fonts.display, fontSize: 18,
                  color: t.palette.emerald,
                }}>{l.price}</span>
                <StatusChip status={l.status} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function DetailStyles() {
  return (
    <style>{`
      @media (max-width: 1000px) {
        .tw-detail-head, .tw-detail-cta {
          grid-template-columns: 1fr !important;
        }
        .tw-detail-offer { text-align: left !important; }
        .tw-detail-offer > div:last-child { justify-content: flex-start !important; }
      }
      @media (max-width: 900px) {
        .tw-detail-specs    { grid-template-columns: 1fr 1fr !important; row-gap: 24px; }
        .tw-detail-specs > div { border-right: none !important; }
        .tw-detail-related  { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 600px) {
        .tw-detail-related  { grid-template-columns: 1fr !important; }
        .tw-gallery-grid { grid-template-columns: 1fr 1fr !important; }
        /* Breadcrumb path wraps awkwardly with long names — hide on phones
           and lean on the "Return to Listings" link for back nav. */
        .tw-detail-crumb { display: none !important; }
        /* Keep the listing name on a single line on phones. The scaled
           font (vw-based) already shrinks, white-space:nowrap is the
           guardrail in case a really long name shows up. */
        .tw-detail-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    `}</style>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function ListingDetail() {
  const t = useTheme();
  const { id } = useParams();
  const { pathname } = useLocation();
  const isPreview = pathname.startsWith('/studio/preview');
  const { data: dbListing, loading } = useListing(id);
  // Only consulted on the studio preview route — the editor mirrors the form
  // to localStorage so this tab updates live as the user types.
  const override = usePreviewOverride(isPreview ? id : null);

  if (loading) {
    return (
      <div style={{ background: t.bgPage, minHeight: '60vh', display: 'grid', placeItems: 'center', color: t.fgFaint, fontFamily: t.fonts.body, fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        Loading…
      </div>
    );
  }

  if (!dbListing) return <Navigate to="/listings" replace />;

  // Merge admin's in-progress edits over the DB row on the preview route.
  // The admin's "Short description" maps to the public tagline subtitle.
  const merged = isPreview && override ? { ...dbListing, ...override } : dbListing;
  const L = { ...merged, tagline: merged.tagline || merged.blurb || null };
  return <ListingDetailB L={L} noindex={isPreview} />;
}
